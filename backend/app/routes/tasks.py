from flask import Blueprint
from app.utils.responses import success_response

tasks_bp = Blueprint("tasks", __name__)

@tasks_bp.route("", methods=["GET"])
def get_tasks():
    return success_response([])

@tasks_bp.route("/<task_id>", methods=["GET"])
def get_task(task_id):
    return success_response({"id": task_id})

@tasks_bp.route("", methods=["POST"])
def create_task():
    return success_response({"message": "Task creation initialized"}, 201)

@tasks_bp.route("/<task_id>", methods=["PATCH"])
def update_task(task_id):
    return success_response({"message": "Task update initialized"})

@tasks_bp.route("/<task_id>", methods=["DELETE"])
def delete_task(task_id):
    return success_response({"message": "Task deletion initialized"})
