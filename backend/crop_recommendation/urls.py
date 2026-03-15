from django.urls import path
from .views import crop_recommendation_api

urlpatterns = [
    path('predict/', crop_recommendation_api),
]