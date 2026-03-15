# search_app/db.py
from models.mongo import db

# Single collection for crop data (keep `crops_info`)
crops_info_collection = db["crops_info"]
