from functools import wraps
from flask import request, session
from app.utils.responses import error_response

def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        user = session.get("user")
        if not user:
            return error_response("UNAUTHORIZED", "Authentication required", 401)
        return f(*args, **kwargs)
    return decorated
