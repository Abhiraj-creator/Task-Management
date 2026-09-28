from flask import Flask
from flask_cors import CORS
from app.config import Config
from app.utils.responses import success_response, error_response

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Configure CORS
    CORS(app, supports_credentials=True, origins=[Config.FRONTEND_URL])
    
    # Register Health Check Endpoint
    @app.route("/api/health", methods=["GET"])
    def health_check():
        return success_response({"status": "ok"})
        
    # Global Error Handlers
    @app.errorhandler(404)
    def not_found(e):
        return error_response("NOT_FOUND", "Requested resource not found", 404)

    @app.errorhandler(500)
    def server_error(e):
        return error_response("INTERNAL_SERVER_ERROR", "An internal error occurred", 500)
        
    # Register Blueprints
    from app.routes.auth import auth_bp
    from app.routes.users import users_bp
    from app.routes.tasks import tasks_bp
    
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(users_bp, url_prefix="/api/users")
    app.register_blueprint(tasks_bp, url_prefix="/api/tasks")
    
    return app
