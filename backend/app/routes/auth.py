from flask import Blueprint, request, redirect, session
from app.config import Config
from app.utils.responses import success_response, error_response
from app.services.google_auth_service import google_auth_service
from app.services.supabase_service import supabase_service

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/google", methods=["GET"])
def google_login():
    """Starts Google OAuth 2.0 redirect flow."""
    if not Config.GOOGLE_CLIENT_ID:
        # If client ID is missing, fall back to dev login or notify user
        return redirect(f"{Config.FRONTEND_URL}/login?error=OAUTH_NOT_CONFIGURED")
    
    auth_url = google_auth_service.get_authorization_url()
    return redirect(auth_url)

@auth_bp.route("/google/callback", methods=["GET"])
def google_callback():
    """Handles Google OAuth callback code exchange."""
    code = request.args.get("code")
    error = request.args.get("error")

    if error or not code:
        return redirect(f"{Config.FRONTEND_URL}/login?error=OAUTH_CANCELLED")

    user_info = google_auth_service.get_tokens_and_user_info(code)
    if not user_info:
        return redirect(f"{Config.FRONTEND_URL}/login?error=OAUTH_FAILED")

    # Upsert user into Supabase
    db_user = supabase_service.upsert_user(
        google_id=user_info["google_id"],
        name=user_info["name"],
        email=user_info["email"],
        avatar_url=user_info.get("picture"),
    )

    # Establish authenticated session
    session["user"] = db_user
    session.permanent = True

    return redirect(f"{Config.FRONTEND_URL}/dashboard")

@auth_bp.route("/me", methods=["GET"])
def get_me():
    """Returns the currently authenticated user session."""
    user = session.get("user")
    if not user:
        return error_response("UNAUTHORIZED", "Not authenticated", 401)
    
    # Refresh user data from DB
    latest_user = supabase_service.get_user_by_id(user["id"])
    if latest_user:
        session["user"] = latest_user
        return success_response(latest_user)
    
    return success_response(user)

@auth_bp.route("/logout", methods=["POST"])
def logout():
    """Clears authenticated session."""
    session.clear()
    return success_response({"message": "Logged out successfully"})

@auth_bp.route("/dev-login", methods=["POST"])
def dev_login():
    """
    Development login endpoint to create/authenticate a user session 
    instantly when testing API / UI locally.
    """
    data = request.get_json() or {}
    email = data.get("email", "demo@taskmanager.com")
    name = data.get("name", "Demo User")
    google_id = data.get("google_id", f"dev-google-id-{email}")
    avatar_url = data.get("avatar_url", "https://lh3.googleusercontent.com/a/default-user=s96-c")

    user = supabase_service.upsert_user(
        google_id=google_id,
        name=name,
        email=email,
        avatar_url=avatar_url
    )

    session["user"] = user
    session.permanent = True
    return success_response(user)
