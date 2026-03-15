import re

def validate_user_id(user_id):
    pattern = r"^23341A0[1-5][A-Z][0-9]$"
    return re.match(pattern, user_id)

def validate_admin_id(admin_id):
    pattern = r"^ADM([0-2][0-9][0-9]|300|00[1-9]|0[1-9][0-9])$"
    return re.match(pattern, admin_id)