from .validators import validate_user_id, validate_admin_id

def validate_user(data):
    if not validate_user_id(data["userId"]):
        return False, "Invalid User ID format"
    return True, None


def validate_admin(data):
    if not validate_admin_id(data["adminId"]):
        return False, "Invalid Admin ID format"
    return True, None