import json
import os
import re
from datetime import datetime

from bson import ObjectId
from django.conf import settings
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from authentication.permissions import is_admin
from models.mongo import crops_collection, soils_collection


def _save_uploaded_image(image, subdir: str) -> str:
    """
    Save an uploaded image under BASE_DIR/uploads/<subdir>/ and return a portable
    relative path like 'uploads/soil_images/<filename>'.
    """
    upload_dir = os.path.join(settings.BASE_DIR, "uploads", subdir)
    os.makedirs(upload_dir, exist_ok=True)

    filename = os.path.basename(image.name)
    relative_path = f"uploads/{subdir}/{filename}"
    full_path = os.path.join(settings.BASE_DIR, *relative_path.split("/"))

    with open(full_path, "wb+") as f:
        for chunk in image.chunks():
            f.write(chunk)

    return relative_path


def _delete_stored_file(relative_path: str) -> None:
    if not relative_path:
        return
    try:
        normalized = str(relative_path).replace("\\", "/").lstrip("/")
        full_path = os.path.join(settings.BASE_DIR, *normalized.split("/"))
        if os.path.exists(full_path):
            os.remove(full_path)
    except Exception:
        # Best-effort cleanup; do not block API on filesystem errors.
        pass


def _safe_object_id(value: str):
    try:
        return ObjectId(value)
    except Exception:
        return None


def _normalize_relative_path(path_value):
    if not path_value:
        return ""
    return str(path_value).replace("\\", "/").lstrip("/")


def _as_text(value):
    if value is None:
        return ""
    if isinstance(value, list):
        return ", ".join(str(item) for item in value if item is not None)
    return str(value)


def _normalize_for_json(value):
    if isinstance(value, ObjectId):
        return str(value)
    if isinstance(value, datetime):
        return value.isoformat()
    if isinstance(value, list):
        return [_normalize_for_json(item) for item in value]
    if isinstance(value, dict):
        return {key: _normalize_for_json(val) for key, val in value.items()}
    return value


def _parse_json_field(value, default):
    if value in ("", None):
        return default
    if isinstance(value, (dict, list)):
        return value
    try:
        parsed = json.loads(value)
    except (TypeError, ValueError):
        return default

    if isinstance(default, dict) and isinstance(parsed, dict):
        return parsed
    if isinstance(default, list) and isinstance(parsed, list):
        return parsed
    return default


def _serialize_crop(doc: dict) -> dict:
    payload = _normalize_for_json(doc)
    payload["_id"] = str(doc.get("_id")) if doc.get("_id") else ""
    payload["crop_name"] = _as_text(doc.get("crop_name"))
    payload["image"] = _normalize_relative_path(doc.get("image"))
    payload["description"] = _as_text(doc.get("description"))
    payload["season"] = _as_text(doc.get("season"))
    payload["crop_duration_days"] = int(doc.get("crop_duration_days") or 0)
    payload["soil_type"] = _as_text(doc.get("soil_type"))
    payload["temperature_celsius"] = _as_text(doc.get("temperature_celsius"))
    payload["ph_range"] = _as_text(doc.get("ph_range"))
    payload["humidity_percent"] = _as_text(doc.get("humidity_percent"))
    payload["rainfall_mm"] = _as_text(doc.get("rainfall_mm"))
    return payload


def _serialize_soil(doc: dict) -> dict:
    payload = _normalize_for_json(doc)
    payload["_id"] = str(doc.get("_id")) if doc.get("_id") else ""
    payload["image"] = _normalize_relative_path(doc.get("image"))
    payload["soil_name"] = _as_text(doc.get("soil_name"))
    payload["description"] = _as_text(doc.get("description"))
    payload["soil_type"] = _as_text(doc.get("soil_type"))
    payload["ph_level"] = _as_text(doc.get("ph_level") or doc.get("ph_range"))
    nutrient_content = doc.get("nutrient_content")
    if not isinstance(nutrient_content, dict):
        nutrient_content = doc.get("nutrients", {}) if isinstance(doc.get("nutrients"), dict) else {}
    payload["nutrient_content"] = {
        "nitrogen": _as_text(nutrient_content.get("nitrogen")),
        "phosphorus": _as_text(nutrient_content.get("phosphorus")),
        "potassium": _as_text(nutrient_content.get("potassium")),
    }
    payload["suitable_crops"] = _as_text(doc.get("suitable_crops"))
    return payload


# ==================================================
# PUBLIC APIs (USER + ADMIN)
# ==================================================

@api_view(["GET"])
def get_all_crops(request):
    crops = list(crops_collection.find({}))
    return Response([_serialize_crop(crop) for crop in crops])


@api_view(["GET"])
def get_crop_by_id(request, crop_id):
    object_id = _safe_object_id(crop_id)
    if not object_id:
        return Response({"error": "Invalid crop id"}, status=status.HTTP_400_BAD_REQUEST)

    crop = crops_collection.find_one({"_id": object_id})
    if not crop:
        return Response({"error": "Crop not found"}, status=status.HTTP_404_NOT_FOUND)

    return Response(_serialize_crop(crop))


@api_view(["GET"])
def get_all_soils(request):
    soils = list(soils_collection.find({}))
    return Response([_serialize_soil(soil) for soil in soils])


@api_view(["GET"])
def get_soil_by_id(request, soil_id):
    object_id = _safe_object_id(soil_id)
    if not object_id:
        return Response({"error": "Invalid soil id"}, status=status.HTTP_400_BAD_REQUEST)

    soil = soils_collection.find_one({"_id": object_id})
    if not soil:
        return Response({"error": "Soil not found"}, status=status.HTTP_404_NOT_FOUND)

    return Response(_serialize_soil(soil))


@api_view(["GET"])
def search_all(request):
    query = request.GET.get("q", "").strip()
    if not query:
        return Response({"crops": [], "soils": []})

    safe_query = re.escape(query)

    crops = list(
        crops_collection.find(
            {
                "crop_name": {"$regex": safe_query, "$options": "i"}
            }
        )
    )

    soils = list(
        soils_collection.find(
            {
                "soil_name": {"$regex": safe_query, "$options": "i"}
            }
        )
    )

    return Response({
        "crops": [_serialize_crop(crop) for crop in crops],
        "soils": [_serialize_soil(soil) for soil in soils],
    })


# ==================================================
# ADMIN-ONLY APIs (CROP)
# ==================================================

@api_view(["POST"])
def add_crop(request):
    allowed, admin = is_admin(request)
    if not allowed:
        return admin

    data = request.data
    image = request.FILES.get("image")
    admin_id = admin.get("user_id") or admin.get("id")

    crop_name = _as_text(data.get("crop_name")).strip()
    if not crop_name:
        return Response({"error": "crop_name is required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        crop_duration_days = int(data.get("crop_duration_days", 0) or 0)
    except (TypeError, ValueError):
        crop_duration_days = 0

    crop = {
        "crop_name": crop_name,
        "image": _save_uploaded_image(image, "crop_images") if image else "",
        "description": _as_text(data.get("description", "")),
        "season": _as_text(data.get("season", "")),
        "crop_duration_days": crop_duration_days,
        "soil_type": _as_text(data.get("soil_type", "")),
        "temperature_celsius": _as_text(data.get("temperature_celsius", "")),
        "ph_range": _as_text(data.get("ph_range", "")),
        "humidity_percent": _as_text(data.get("humidity_percent", "")),
        "rainfall_mm": _as_text(data.get("rainfall_mm", "")),
        "created_by": admin_id,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }

    result = crops_collection.insert_one(crop)

    return Response({
        "message": "Crop added successfully",
        "crop_id": str(result.inserted_id),
    })


@api_view(["PUT"])
def update_crop(request, crop_id):
    allowed, admin = is_admin(request)
    if not allowed:
        return admin

    object_id = _safe_object_id(crop_id)
    if not object_id:
        return Response({"error": "Invalid crop id"}, status=status.HTTP_400_BAD_REQUEST)

    data = request.data
    image = request.FILES.get("image")

    existing = crops_collection.find_one({"_id": object_id}, {"image": 1})
    update = {
        "updated_at": datetime.utcnow(),
    }
    if "crop_name" in data:
        update["crop_name"] = _as_text(data.get("crop_name")).strip()
    if "description" in data:
        update["description"] = _as_text(data.get("description", ""))
    if "season" in data:
        update["season"] = _as_text(data.get("season", ""))
    if "crop_duration_days" in data:
        try:
            update["crop_duration_days"] = int(data.get("crop_duration_days", 0) or 0)
        except (TypeError, ValueError):
            update["crop_duration_days"] = 0
    if "soil_type" in data:
        update["soil_type"] = _as_text(data.get("soil_type", ""))
    if "temperature_celsius" in data:
        update["temperature_celsius"] = _as_text(data.get("temperature_celsius", ""))
    if "ph_range" in data:
        update["ph_range"] = _as_text(data.get("ph_range", ""))
    if "humidity_percent" in data:
        update["humidity_percent"] = _as_text(data.get("humidity_percent", ""))
    if "rainfall_mm" in data:
        update["rainfall_mm"] = _as_text(data.get("rainfall_mm", ""))
    if image:
        update["image"] = _save_uploaded_image(image, "crop_images")
        if existing and existing.get("image"):
            _delete_stored_file(existing.get("image"))

    crops_collection.update_one(
        {"_id": object_id},
        {"$set": update}
    )

    return Response({"message": "Crop updated successfully"})


@api_view(["DELETE"])
def delete_crop(request, crop_id):
    allowed, admin = is_admin(request)
    if not allowed:
        return admin

    object_id = _safe_object_id(crop_id)
    if not object_id:
        return Response({"error": "Invalid crop id"}, status=status.HTTP_400_BAD_REQUEST)

    existing = crops_collection.find_one({"_id": object_id}, {"image": 1})
    crops_collection.delete_one({"_id": object_id})
    if existing and existing.get("image"):
        _delete_stored_file(existing.get("image"))

    return Response({"message": "Crop deleted successfully"})


# ==================================================
# ADMIN-ONLY APIs (SOIL)
# ==================================================

@api_view(["POST"])
def add_soil(request):
    allowed, admin = is_admin(request)
    if not allowed:
        return admin

    data = request.data
    image = request.FILES.get("image")
    admin_id = admin.get("user_id") or admin.get("id")

    soil_name = _as_text(data.get("soil_name")).strip()
    if not soil_name:
        return Response({"error": "soil_name is required"}, status=status.HTTP_400_BAD_REQUEST)

    nutrient_content = _parse_json_field(data.get("nutrient_content"), {})
    if not isinstance(nutrient_content, dict):
        nutrient_content = {}
    nutrient_content = {
        "nitrogen": _as_text(nutrient_content.get("nitrogen")),
        "phosphorus": _as_text(nutrient_content.get("phosphorus")),
        "potassium": _as_text(nutrient_content.get("potassium")),
    }

    soil = {
        "image": _save_uploaded_image(image, "soil_images") if image else "",
        "soil_name": soil_name,
        "description": _as_text(data.get("description", "")),
        "soil_type": _as_text(data.get("soil_type", "")),
        "ph_level": _as_text(data.get("ph_level", "")),
        "nutrient_content": nutrient_content,
        "suitable_crops": _as_text(data.get("suitable_crops", "")),
        "created_by": admin_id,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }

    result = soils_collection.insert_one(soil)

    return Response({
        "message": "Soil added successfully",
        "soil_id": str(result.inserted_id),
    })


@api_view(["PUT"])
def update_soil(request, soil_id):
    allowed, admin = is_admin(request)
    if not allowed:
        return admin

    object_id = _safe_object_id(soil_id)
    if not object_id:
        return Response({"error": "Invalid soil id"}, status=status.HTTP_400_BAD_REQUEST)

    data = request.data
    image = request.FILES.get("image")
    existing = soils_collection.find_one({"_id": object_id}, {"image": 1})

    update = {"updated_at": datetime.utcnow()}
    if "soil_name" in data:
        update["soil_name"] = _as_text(data.get("soil_name")).strip()
    if "description" in data:
        update["description"] = _as_text(data.get("description"))
    if "soil_type" in data:
        update["soil_type"] = _as_text(data.get("soil_type"))
    if "ph_level" in data:
        update["ph_level"] = _as_text(data.get("ph_level"))
    if "nutrient_content" in data:
        nutrient_content = _parse_json_field(data.get("nutrient_content"), {})
        if not isinstance(nutrient_content, dict):
            nutrient_content = {}
        update["nutrient_content"] = {
            "nitrogen": _as_text(nutrient_content.get("nitrogen")),
            "phosphorus": _as_text(nutrient_content.get("phosphorus")),
            "potassium": _as_text(nutrient_content.get("potassium")),
        }
    if "suitable_crops" in data:
        update["suitable_crops"] = _as_text(data.get("suitable_crops"))
    if image:
        update["image"] = _save_uploaded_image(image, "soil_images")
        if existing and existing.get("image"):
            _delete_stored_file(existing.get("image"))

    soils_collection.update_one(
        {"_id": object_id},
        {"$set": update}
    )

    return Response({"message": "Soil updated successfully"})


@api_view(["DELETE"])
def delete_soil(request, soil_id):
    allowed, admin = is_admin(request)
    if not allowed:
        return admin

    object_id = _safe_object_id(soil_id)
    if not object_id:
        return Response({"error": "Invalid soil id"}, status=status.HTTP_400_BAD_REQUEST)

    existing = soils_collection.find_one({"_id": object_id}, {"image": 1})
    soils_collection.delete_one({"_id": object_id})

    if existing and existing.get("image"):
        _delete_stored_file(existing.get("image"))

    return Response({"message": "Soil deleted successfully"})
