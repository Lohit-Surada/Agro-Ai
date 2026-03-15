from django.urls import path
from .views import detect_soil

urlpatterns = [
    path('detect/', detect_soil),
]