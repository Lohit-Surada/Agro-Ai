import re
from datetime import datetime, timedelta

import bcrypt
import jwt
from django.conf import settings
from pymongo.errors import PyMongoError
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .db import (
    admins_collection,
    recovery_collection,
    users_collection,
)
from .permissions import is_admin

SECRET_KEY = settings.SECRET_KEY

RECOVERY_QUESTIONS = {
    "favorite_place": "what is your favourite place?",
    "favorite_actor": "who is your favourite actor?",
    "favorite_car": "what is you favourite car model?",
}


def _normalize(value):
    return str(value or "").strip()


def _normalize_answer(value):
    return _normalize(value).lower()


def _is_email(value):
    return re.match(r"^[^\s@]+@[^\s@]+\.[^\s@]+$", value or "") is not None


def _slug_username(name: str):
    cleaned = re.sub(r"[^a-z0-9]+", "", _normalize(name).lower())
    return cleaned[:30] if cleaned else ""


def _generate_unique_username(name: str):
    base = _slug_username(name)
    if not base:
        return ""

    candidate = base
    index = 1
    while _username_exists(candidate):
        candidate = f"{base}{index}"
        index += 1
    return candidate


def _username_exists(username: str):
    if not username:
        return False
    query = {"username": {"$regex": f"^{re.escape(username)}$", "$options": "i"}}
    return any(
        [
            users_collection.find_one(query),
            admins_collection.find_one(query),
        ]
    )


def _username_exists_exact(username: str):
    if not username:
        return False
    query = {"username": username}
    return any(
        [
            users_collection.find_one(query),
            admins_collection.find_one(query),
        ]
    )


def _email_exists(email: str):
    if not email:
        return False
    query = {"email": {"$regex": f"^{re.escape(email)}$", "$options": "i"}}
    return any(
        [
            users_collection.find_one(query),
            admins_collection.find_one(query),
        ]
    )


def _total_accounts():
    return (
        users_collection.count_documents({})
        + admins_collection.count_documents({})
    )


def _generate_jwt_token(username, role):
    payload = {
        "user_id": username,
        "role": role,
        "iat": datetime.utcnow(),
        "exp": datetime.utcnow() + timedelta(days=7),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")


def _set_session_auth(request, username, role):
    request.session["auth_username"] = username
    request.session["auth_role"] = role
    request.session.set_expiry(0)
    request.session.modified = True


def _clear_session_auth(request):
    request.session.flush()


def _session_auth_payload(request):
    username = request.session.get("auth_username")
    role = request.session.get("auth_role")
    if not username or not role:
        return None

    return {
        "username": username,
        "role": role,
        "token": _generate_jwt_token(username, role),
    }


def _public_user(doc):
    return {
        "name": doc.get("name", ""),
        "username": doc.get("username", ""),
        "email": doc.get("email", ""),
        "role": doc.get("role", ""),
    }


def _find_account_by_login_key(login_key: str):
    key = _normalize(login_key)
    if not key:
        return None, None

    if _is_email(key):
        query = {"email": {"$regex": f"^{re.escape(key)}$", "$options": "i"}}
    else:
        query = {"username": {"$regex": f"^{re.escape(key)}$", "$options": "i"}}

    for collection in (admins_collection, users_collection):
        found = collection.find_one(query)
        if found:
            return collection, found

    return None, None


def _password_matches(raw_password: str, hashed_password):
    try:
        return bcrypt.checkpw(raw_password.encode("utf-8"), hashed_password)
    except Exception:
        return False


@api_view(["POST"])
def signup(request):
    data = request.data
    name = _normalize(data.get("name"))
    email = _normalize(data.get("email")).lower()
    password = str(data.get("password") or "")

    if not name or not email or not password:
        return Response({"error": "name, email and password are required"}, status=400)
    if not _is_email(email):
        return Response({"error": "Invalid email format"}, status=400)
    if len(password) < 6:
        return Response({"error": "Password must be at least 6 characters"}, status=400)
    if _email_exists(email):
        return Response({"error": "Email is already registered"}, status=400)

    username = name
    if _username_exists_exact(username):
        return Response({"error": "Username already exists"}, status=400)

    hashed_password = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
    now = datetime.utcnow()

    # First signup ever becomes the admin
    if admins_collection.count_documents({}) == 0:
        admins_collection.insert_one(
            {
                "name": name,
                "username": username,
                "email": email,
                "password": hashed_password,
                "role": "admin",
                "created_at": now,
            }
        )
        setup_token = jwt.encode(
            {
                "username": username,
                "email": email,
                "purpose": "recovery_setup",
                "exp": datetime.utcnow() + timedelta(minutes=20),
            },
            SECRET_KEY,
            algorithm="HS256",
        )
        return Response(
            {
                "message": "Admin created. Complete recovery setup.",
                "role": "admin",
                "username": username,
                "requires_recovery_setup": True,
                "setup_token": setup_token,
                "questions": RECOVERY_QUESTIONS,
            },
            status=201,
        )

    users_collection.insert_one(
        {
            "name": name,
            "username": username,
            "email": email,
            "password": hashed_password,
            "role": "user",
            "created_at": now,
        }
    )
    token = _generate_jwt_token(username, "user")
    return Response(
        {
            "message": "User registered successfully",
            "role": "user",
            "username": username,
            "token": token,
        },
        status=201,
    )


@api_view(["POST"])
def admin_recovery_setup(request):
    data = request.data
    setup_token = data.get("setup_token")
    if not setup_token:
        return Response({"error": "setup_token is required"}, status=400)

    try:
        setup_payload = jwt.decode(setup_token, SECRET_KEY, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        return Response({"error": "Setup token expired. Signup again."}, status=401)
    except jwt.InvalidTokenError:
        return Response({"error": "Invalid setup token"}, status=401)

    if setup_payload.get("purpose") != "recovery_setup":
        return Response({"error": "Invalid setup token purpose"}, status=401)

    username = setup_payload.get("username")
    email = setup_payload.get("email")
    admin = admins_collection.find_one(
        {
            "username": {"$regex": f"^{re.escape(username)}$", "$options": "i"},
            "email": {"$regex": f"^{re.escape(email)}$", "$options": "i"},
        }
    )
    if not admin:
        return Response({"error": "Admin account not found"}, status=404)

    place = _normalize_answer(data.get("favorite_place"))
    actor = _normalize_answer(data.get("favorite_actor"))
    car = _normalize_answer(data.get("favorite_car"))
    if not place or not actor or not car:
        return Response({"error": "All three recovery answers are required"}, status=400)

    recovery_collection.update_one(
        {"username": admin["username"]},
        {
            "$set": {
                "username": admin["username"],
                "email": admin["email"],
                "answers": {
                    "favorite_place": bcrypt.hashpw(place.encode("utf-8"), bcrypt.gensalt()),
                    "favorite_actor": bcrypt.hashpw(actor.encode("utf-8"), bcrypt.gensalt()),
                    "favorite_car": bcrypt.hashpw(car.encode("utf-8"), bcrypt.gensalt()),
                },
                "updated_at": datetime.utcnow(),
            }
        },
        upsert=True,
    )

    return Response(
        {
            "message": "Recovery setup completed",
            "username": admin["username"],
        }
    )


@api_view(["POST"])
def login(request):
    data = request.data
    login_key = _normalize(data.get("username"))
    password = str(data.get("password") or "")

    if not login_key or not password:
        return Response({"error": "username and password are required"}, status=400)

    try:
        _collection, account = _find_account_by_login_key(login_key)
    except PyMongoError:
        return Response(
            {"error": "Authentication service temporarily unavailable. Please try again shortly."},
            status=503,
        )

    if not account:
        return Response({"error": "Invalid credentials"}, status=401)

    if not _password_matches(password, account.get("password")):
        if account.get("role") == "admin":
            return Response(
                {
                    "error": "Invalid password",
                    "show_reset_password": True,
                    "is_admin": True,
                },
                status=401,
            )
        return Response({"error": "Invalid credentials"}, status=401)

    role = account.get("role", "user")
    token = _generate_jwt_token(account.get("username"), role)
    _set_session_auth(request, account.get("username"), role)

    return Response(
        {
            "message": "Login successful",
            "role": role,
            "username": account.get("username"),
            "token": token,
        }
    )


@api_view(["GET"])
def session_status(request):
    auth_payload = _session_auth_payload(request)
    if not auth_payload:
        return Response(
            {
                "authenticated": False,
                "role": None,
                "username": None,
                "token": None,
            }
        )

    return Response(
        {
            "authenticated": True,
            **auth_payload,
        }
    )


@api_view(["POST"])
def logout(request):
    _clear_session_auth(request)
    return Response({"message": "Logout successful"})


@api_view(["GET"])
def list_users(request):
    allowed, decoded_or_response = is_admin(request)
    if not allowed:
        return decoded_or_response

    users = [
        _public_user(doc)
        for doc in users_collection.find({}, {"_id": 0, "password": 0})
    ]
    return Response({"users": users})


@api_view(["DELETE"])
def delete_user(request, username):
    allowed, decoded_or_response = is_admin(request)
    if not allowed:
        return decoded_or_response

    result = users_collection.delete_one(
        {"username": {"$regex": f"^{re.escape(username)}$", "$options": "i"}}
    )
    if result.deleted_count == 0:
        return Response({"error": "User not found"}, status=404)
    return Response({"message": "User deleted"})


@api_view(["GET"])
def list_admins(request):
    allowed, decoded_or_response = is_admin(request)
    if not allowed:
        return decoded_or_response

    admins = [
        _public_user(doc)
        for doc in admins_collection.find({}, {"_id": 0, "password": 0})
    ]
    return Response({"admins": admins})


@api_view(["POST"])
def create_admin(request):
    allowed, decoded_or_response = is_admin(request)
    if not allowed:
        return decoded_or_response

    data = request.data
    name = _normalize(data.get("name"))
    email = _normalize(data.get("email")).lower()
    password = str(data.get("password") or "")

    if not name or not email or not password:
        return Response({"error": "name, email and password are required"}, status=400)
    if not _is_email(email):
        return Response({"error": "Invalid email format"}, status=400)
    if len(password) < 6:
        return Response({"error": "Password must be at least 6 characters"}, status=400)
    if _email_exists(email):
        return Response({"error": "Email is already registered"}, status=400)

    username = name
    if _username_exists_exact(username):
        return Response({"error": "Username already exists"}, status=400)

    admins_collection.insert_one(
        {
            "name": name,
            "username": username,
            "email": email,
            "password": bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()),
            "role": "admin",
            "created_at": datetime.utcnow(),
        }
    )

    return Response(
        {
            "message": "Admin created successfully",
            "admin": {
                "name": name,
                "username": username,
                "email": email,
                "role": "admin",
            },
        },
        status=201,
    )


@api_view(["DELETE"])
def delete_admin(request, username):
    allowed, decoded_or_response = is_admin(request)
    if not allowed:
        return decoded_or_response

    requester_username = _normalize(decoded_or_response.get("user_id"))
    if requester_username.lower() == _normalize(username).lower():
        return Response({"error": "Admin cannot delete self"}, status=400)

    result = admins_collection.delete_one(
        {"username": {"$regex": f"^{re.escape(username)}$", "$options": "i"}}
    )
    if result.deleted_count == 0:
        return Response({"error": "Admin not found"}, status=404)
    return Response({"message": "Admin deleted"})


@api_view(["POST"])
def admin_reset_password(request):
    data = request.data
    reset_token = data.get("reset_token")
    new_password = str(data.get("new_password") or "")
    if not reset_token or not new_password:
        return Response({"error": "reset_token and new_password are required"}, status=400)
    if len(new_password) < 6:
        return Response({"error": "Password must be at least 6 characters"}, status=400)

    try:
        token_payload = jwt.decode(reset_token, SECRET_KEY, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        return Response({"error": "Reset token expired"}, status=401)
    except jwt.InvalidTokenError:
        return Response({"error": "Invalid reset token"}, status=401)

    if token_payload.get("purpose") != "admin_password_reset":
        return Response({"error": "Invalid reset token purpose"}, status=401)

    username = _normalize(token_payload.get("username"))
    if not username:
        return Response({"error": "Invalid reset token payload"}, status=401)

    account = admins_collection.find_one(
        {"username": {"$regex": f"^{re.escape(username)}$", "$options": "i"}}
    )
    if not account:
        return Response({"error": "Admin account not found"}, status=404)

    admins_collection.update_one(
        {"username": {"$regex": f"^{re.escape(account['username'])}$", "$options": "i"}},
        {
            "$set": {
                "password": bcrypt.hashpw(new_password.encode("utf-8"), bcrypt.gensalt()),
                "updated_at": datetime.utcnow(),
            }
        },
    )

    return Response({"message": "Admin password reset successful"})


@api_view(["POST"])
def admin_verify_recovery_answers(request):
    data = request.data
    login_key = _normalize(data.get("username"))
    place = _normalize_answer(data.get("favorite_place"))
    actor = _normalize_answer(data.get("favorite_actor"))
    car = _normalize_answer(data.get("favorite_car"))

    if not login_key:
        return Response({"error": "username is required"}, status=400)
    if not place or not actor or not car:
        return Response({"error": "All three recovery answers are required"}, status=400)

    _collection, account = _find_account_by_login_key(login_key)
    if not account or account.get("role") != "admin":
        return Response({"error": "Admin account not found"}, status=404)

    recovery = recovery_collection.find_one(
        {"username": {"$regex": f"^{re.escape(account['username'])}$", "$options": "i"}}
    )
    if not recovery or "answers" not in recovery:
        return Response({"error": "Recovery not set up for this admin"}, status=404)

    answers = recovery.get("answers", {})
    checks = [
        _password_matches(place, answers.get("favorite_place")),
        _password_matches(actor, answers.get("favorite_actor")),
        _password_matches(car, answers.get("favorite_car")),
    ]
    if not all(checks):
        return Response({"error": "Recovery answers are incorrect"}, status=401)

    reset_token = jwt.encode(
        {
            "username": account["username"],
            "purpose": "admin_password_reset",
            "exp": datetime.utcnow() + timedelta(minutes=15),
        },
        SECRET_KEY,
        algorithm="HS256",
    )

    return Response({"message": "Recovery answers verified", "reset_token": reset_token})


@api_view(["GET"])
def dashboard_stats(request):
    try:
        user_count = users_collection.count_documents({})
        admin_count = admins_collection.count_documents({})
    except Exception as exc:
        return Response(
            {"error": "Failed to query counts", "details": str(exc)},
            status=500,
        )

    return Response({"users": user_count, "admins": admin_count})
