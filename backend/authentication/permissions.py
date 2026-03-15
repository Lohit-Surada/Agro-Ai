# import jwt
# from functools import wraps
# from django.conf import settings
# from rest_framework.response import Response

# SECRET_KEY = settings.SECRET_KEY


# def admin_required(view_func):
#     """Decorator that checks for a valid admin JWT token in the Authorization header.
#     Attaches admin_id to request if valid, otherwise returns an error response.
#     """
#     @wraps(view_func)
#     def wrapper(request, *args, **kwargs):
#         auth_header = request.headers.get("Authorization", "")

#         if not auth_header.startswith("Bearer "):
#             return Response({"error": "Token missing"}, status=401)

#         token = auth_header.split(" ")[1]

#         try:
#             decoded = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])

#             if decoded.get("role") != "admin":
#                 return Response({"error": "Admin access required"}, status=403)

#             # Attach admin_id to request so views can use request.admin_id
#             request.admin_id = decoded.get("user_id")
#             return view_func(request, *args, **kwargs)

#         except jwt.ExpiredSignatureError:
#             return Response({"error": "Token expired"}, status=401)
#         except jwt.InvalidTokenError:
#             return Response({"error": "Invalid token"}, status=401)
#         except Exception:
#             return Response({"error": "Invalid token"}, status=401)

#     return wrapper

import jwt
from django.conf import settings
from rest_framework.response import Response


def _decode_session_from_request(request):
    username = request.session.get("auth_username")
    role = request.session.get("auth_role")
    if not username or not role:
        return False, None

    return True, {"user_id": username, "role": role}


def decode_token_from_request(request):
    has_session, session_payload = _decode_session_from_request(request)
    if has_session:
        return True, session_payload

    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return False, Response({"error": "Authentication required"}, status=401)

    token = auth_header.split(" ", 1)[1]
    try:
        decoded = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        return True, decoded
    except jwt.ExpiredSignatureError:
        return False, Response({"error": "Token expired"}, status=401)
    except jwt.InvalidTokenError:
        return False, Response({"error": "Invalid token"}, status=401)
    except Exception:
        return False, Response({"error": "Invalid token"}, status=401)


def is_admin(request):
    allowed, decoded_or_response = decode_token_from_request(request)
    if not allowed:
        return False, decoded_or_response

    role = decoded_or_response.get("role")
    if role != "admin":
        return False, Response({"error": "Admin access required"}, status=403)

    return True, decoded_or_response
