from django.shortcuts import render

# Create your views here.
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .utils.predict_crop import predict_crop


@api_view(['POST'])
def crop_recommendation_api(request):
    try:
        data = request.data

        N = float(data.get("N"))
        P = float(data.get("P"))
        K = float(data.get("K"))
        temperature = float(data.get("temperature"))
        humidity = float(data.get("humidity"))
        ph = float(data.get("ph"))
        rainfall = float(data.get("rainfall"))

        input_data = {
            "N": N,
            "P": P,
            "K": K,
            "temperature": temperature,
            "humidity": humidity,
            "ph": ph,
            "rainfall": rainfall
        }

        crop = predict_crop(input_data)

        return Response({
            "recommended_crop": crop
        })

    except Exception as e:
        return Response({
            "error": str(e)
        }, status=400)