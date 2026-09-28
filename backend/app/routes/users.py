from flask import Blueprint
from app.utils.responses import success_response

users_bp = Blueprint("users", __name__)

@users_bp.route("", methods=["GET"])
def get_users():
    return success_response([])
