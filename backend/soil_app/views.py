from django.shortcuts import render

# Create your views here.
import os
import uuid
import numpy as np
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.conf import settings
from .model_loader import get_soil_model, soil_classes
from .utils import preprocess_image
from models.mongo import soils_collection


UPLOAD_DIR = os.path.join(settings.MEDIA_ROOT, "soil_images")

@api_view(['POST'])
def detect_soil(request):

    if 'image' not in request.FILES:
        return Response({"error": "No image uploaded"}, status=400)

    file = request.FILES['image']

    # Save image with a unique name to avoid collisions between requests
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    ext = os.path.splitext(file.name)[1]
    unique_filename = f"{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    with open(file_path, 'wb+') as destination:
        for chunk in file.chunks():
            destination.write(chunk)

    # Preprocess image
    img = preprocess_image(file_path)

    # Predict
    model = get_soil_model()
    if model is None:
        return Response({"error": "Model unavailable"}, status=503)

    prediction = model.predict(img)
    probs = prediction[0]

    # Top prediction
    result_index = int(np.argmax(probs))
    soil_type = soil_classes[result_index]
    confidence = round(float(probs[result_index]) * 100, 2)

    # Top 3 predictions sorted by confidence descending
    top3_indices = np.argsort(probs)[::-1][:3]
    top3 = [
        {"soil_type": soil_classes[int(i)], "confidence": round(float(probs[i]) * 100, 2)}
        for i in top3_indices
    ]

    # Fetch recommended crops from MongoDB soils collection
    recommended_crops = []
    try:
        soil_doc = soils_collection.find_one({"soil_name": {"$regex": f"^{soil_type}$", "$options": "i"}})
        if soil_doc:
            raw = soil_doc.get("suitable_crops", "")
            if isinstance(raw, list):
                recommended_crops = [str(c).strip() for c in raw if str(c).strip()]
            elif isinstance(raw, str) and raw.strip():
                recommended_crops = [c.strip() for c in raw.split(",") if c.strip()]
    except Exception:
        pass  # Non-critical; return empty list if DB unavailable

    return Response({
        "soil_type": soil_type,
        "confidence": confidence,
        "top3": top3,
        "recommended_crops": recommended_crops,
    })