from django.urls import path
from .views import (
    admin_recovery_setup,
    admin_reset_password,
    admin_verify_recovery_answers,
    create_admin,
    dashboard_stats,
    delete_admin,
    delete_user,
    list_admins,
    list_users,
    login,
    logout,
    session_status,
    signup,
)

urlpatterns = [
    path("signup/", signup),
    path("login/", login),
    path("logout/", logout),
    path("session/", session_status),
    path("admin/recovery-setup/", admin_recovery_setup),
    path("admin/verify-recovery/", admin_verify_recovery_answers),
    path("admin/reset-password/", admin_reset_password),
    path("users/", list_users),
    path("users/<str:username>/", delete_user),
    path("admins/", list_admins),
    path("admins/create/", create_admin),
    path("admins/<str:username>/", delete_admin),
    path("stats/", dashboard_stats),
]
