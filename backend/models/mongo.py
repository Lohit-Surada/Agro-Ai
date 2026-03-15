from pymongo import MongoClient
from pymongo.server_api import ServerApi
from urllib.parse import quote_plus
import os
import certifi


username = os.getenv("MONGO_USERNAME", "Lohit")
password = quote_plus(os.getenv("MONGO_PASSWORD", "Lohit@8019"))
default_uri = (
    f"mongodb+srv://{username}:{password}@agrodb.yxv6oxo.mongodb.net/?appName=Agrodb"
)
uri = os.getenv("MONGO_URI", default_uri)

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
)
#
# # Send a ping to confirm a successful connection
try:
    client.admin.command("ping")
    print("Pinged your deployment. You successfully connected to MongoDB!")
except Exception as e:
    print(
        "MongoDB Atlas connection failed. Check: "
        "1) Atlas Network Access IP allowlist, "
        "2) DB user/password, "
        "3) outbound port 27017/firewall/VPN/proxy."
    )
    print(e)
#
db = client[db_name]
#
# # Collections
users_collection = db["users"]
admins_collection = db["admins"]
crops_collection = db["crops_info"]
soils_collection = db["soils_info"]










