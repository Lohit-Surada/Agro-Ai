import os
from urllib.parse import quote_plus

import certifi
from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.server_api import ServerApi


load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), '..', '.env'))


def _build_default_uri(username: str, password: str) -> str:
    quoted_password = quote_plus(password)
    return f"mongodb+srv://{username}:{quoted_password}@agrodb.yxv6oxo.mongodb.net/?appName=Agrodb"


def _resolve_mongo_uri() -> str:
    username = os.getenv("MONGO_USERNAME", "Lohit")
    password = os.getenv("MONGO_PASSWORD", "Lohit@8019")
    env_uri = (os.getenv("MONGO_URI") or "").strip()

    if not env_uri:
        return _build_default_uri(username, password)

    resolved_uri = env_uri
    if "<db_password>" in resolved_uri:
        resolved_uri = resolved_uri.replace("<db_password>", quote_plus(password))
    if "<db_username>" in resolved_uri:
        resolved_uri = resolved_uri.replace("<db_username>", username)

    return resolved_uri


uri = _resolve_mongo_uri()

server_selection_timeout_ms = int(os.getenv("MONGO_SERVER_SELECTION_TIMEOUT_MS", "8000"))
connect_timeout_ms = int(os.getenv("MONGO_CONNECT_TIMEOUT_MS", "8000"))
socket_timeout_ms = int(os.getenv("MONGO_SOCKET_TIMEOUT_MS", "8000"))
db_name = os.getenv("MONGO_DB_NAME", "Agrodb")


client = MongoClient(
    uri,
    server_api=ServerApi("1"),
    tls=True,
    tlsCAFile=certifi.where(),
    serverSelectionTimeoutMS=server_selection_timeout_ms,
    connectTimeoutMS=connect_timeout_ms,
    socketTimeoutMS=socket_timeout_ms,
    connect=False,
)

run_startup_ping = os.getenv("MONGO_RUN_STARTUP_PING", "true").strip().lower() in {"1", "true", "yes", "on"}
if run_startup_ping:
    try:
        client.admin.command("ping")
        print("MongoDB connected successfully (startup ping ok).")
    except Exception as exc:
        print(
            "MongoDB Atlas startup ping failed. Check: "
            "1) Atlas Network Access IP allowlist, "
            "2) DB user/password, "
            "3) outbound port 27017/firewall/VPN/proxy."
        )
        print(exc)

db = client[db_name]
#
# # Collections
users_collection = db["users"]
admins_collection = db["admins"]
crops_collection = db["crops_info"]
soils_collection = db["soils_info"]










