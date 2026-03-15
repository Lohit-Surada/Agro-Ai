# # search_app/urls.py
# from django.urls import path
# from .views import (
#     get_all_crops,
#     search_crop,
#     add_crop,
#     update_crop,
#     delete_crop
# )

# urlpatterns = [
#     path('crops/', get_all_crops),
#     path('crop/', search_crop),
#     path('admin/crops/', add_crop),
#     path('admin/crops/<str:crop_id>/', update_crop),
#     path('admin/crops/<str:crop_id>/delete/', delete_crop),
# ]

from django.urls import path
from .views import (
    get_all_crops, get_crop_by_id, get_all_soils, get_soil_by_id, search_all,
    add_crop, update_crop, delete_crop,
    add_soil, update_soil, delete_soil
)

urlpatterns = [
    # Public
    path("crops/", get_all_crops),
    path("crops/<str:crop_id>/", get_crop_by_id),
    path("soils/", get_all_soils),
    path("soils/<str:soil_id>/", get_soil_by_id),
    path("", search_all),

    # Admin - Crop
    path("admin/crops/", add_crop),
    path("admin/crops/<str:crop_id>/", update_crop),
    path("admin/crops/<str:crop_id>/delete/", delete_crop),

    # Admin - Soil
    path("admin/soils/", add_soil),
    path("admin/soils/<str:soil_id>/", update_soil),
    path("admin/soils/<str:soil_id>/delete/", delete_soil),
]
