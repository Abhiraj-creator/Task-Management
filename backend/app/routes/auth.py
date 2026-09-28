from flask import Blueprint
from app.utils.responses import success_response

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/google", methods=["GET"])
def google_login():
    return success_response({"message": "OAuth endpoint initialized"})

@auth_bp.route("/google/callback", methods=["GET"])
def google_callback():
    return success_response({"message": "OAuth callback initialized"})

@auth_bp.route("/me", methods=["GET"])
def get_me():
    return success_response({"user": None})

@auth_bp.route("/logout", methods=["POST"])
def logout():
    return success_response({"message": "Logged out successfully"})
