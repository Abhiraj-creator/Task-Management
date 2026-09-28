from flask import Blueprint
from app.utils.responses import success_response
from app.middleware.auth import require_auth
from app.services.supabase_service import supabase_service

users_bp = Blueprint("users", __name__)

@users_bp.route("", methods=["GET"])
@require_auth
def get_users():
    """Returns list of assignable users."""
    users = supabase_service.get_all_users()
    return success_response(users)
