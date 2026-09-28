from flask import Blueprint, request, session
from app.utils.responses import success_response, error_response
from app.middleware.auth import require_auth
from app.services.supabase_service import supabase_service
from app.services import gmail_service

tasks_bp = Blueprint("tasks", __name__)

@tasks_bp.route("", methods=["GET"])
@require_auth
def get_tasks():
    """Returns tasks relevant to the authenticated user."""
    current_user = session["user"]
    tasks = supabase_service.get_tasks_for_user(current_user["id"])
    return success_response(tasks)

@tasks_bp.route("/<task_id>", methods=["GET"])
@require_auth
def get_task(task_id):
    """Returns details for a single task if user is authorized."""
    current_user = session["user"]
    task = supabase_service.get_task_by_id(task_id)
    if not task:
        return error_response("TASK_NOT_FOUND", "Task not found", 404)
    
    # Check authorization
    if task["created_by"] != current_user["id"] and task["assigned_to"] != current_user["id"]:
        return error_response("FORBIDDEN", "You do not have permission to view this task", 403)
        
    return success_response(task)

@tasks_bp.route("", methods=["POST"])
@require_auth
def create_task():
    """Creates a task and triggers an email notification to the assignee."""
    current_user = session["user"]
    data = request.get_json() or {}

    title = data.get("title", "").strip()
    description = data.get("description", "").strip() if data.get("description") else None
    assigned_to = data.get("assigned_to")

    if not title:
        return error_response("VALIDATION_ERROR", "Task title is required", 400)
    
    if not assigned_to:
        return error_response("VALIDATION_ERROR", "Assignee (assigned_to) is required", 400)

    assignee_user = supabase_service.get_user_by_id(assigned_to)
    if not assignee_user:
        return error_response("USER_NOT_FOUND", "Assigned user does not exist", 400)

    # Always enforce created_by comes from authenticated identity
    created_by = current_user["id"]

    task = supabase_service.create_task(
        title=title,
        description=description,
        created_by=created_by,
        assigned_to=assigned_to
    )

    # Enrich task with user objects
    task["creator"] = current_user
    task["assignee"] = assignee_user

    # Trigger email notification to assignee (isolated error handling)
    if assignee_user.get("email"):
        gmail_service.send_task_created_email(
            assignee_email=assignee_user["email"],
            assignee_name=assignee_user["name"],
            creator_name=current_user["name"],
            task_title=title,
            task_description=description
        )

    return success_response(task, 201)

@tasks_bp.route("/<task_id>", methods=["PATCH"])
@require_auth
def update_task(task_id):
    """Updates a task status and triggers an email notification upon completion."""
    current_user = session["user"]
    data = request.get_json() or {}

    task = supabase_service.get_task_by_id(task_id)
    if not task:
        return error_response("TASK_NOT_FOUND", "Task not found", 404)

    # Authorization check: user must be either creator or assignee to update
    if task["created_by"] != current_user["id"] and task["assigned_to"] != current_user["id"]:
        return error_response("FORBIDDEN", "You do not have permission to update this task", 403)

    new_status = data.get("status")
    if new_status and new_status not in ["pending", "completed"]:
        return error_response("INVALID_STATUS", "Status must be 'pending' or 'completed'", 400)

    if new_status:
        updated_task = supabase_service.update_task_status(task_id, new_status)
        if not updated_task:
            return error_response("UPDATE_FAILED", "Failed to update task", 500)
        
        # If status changed to completed, trigger notification to creator
        if new_status == "completed":
            creator = updated_task.get("creator") or supabase_service.get_user_by_id(updated_task["created_by"])
            assignee = updated_task.get("assignee") or supabase_service.get_user_by_id(updated_task["assigned_to"])
            
            if creator and creator.get("email"):
                gmail_service.send_task_completed_email(
                    creator_email=creator["email"],
                    creator_name=creator["name"],
                    assignee_name=assignee["name"] if assignee else "Assignee",
                    task_title=updated_task["title"]
                )

        return success_response(updated_task)

    return success_response(task)

@tasks_bp.route("/<task_id>", methods=["DELETE"])
@require_auth
def delete_task(task_id):
    """Deletes a task. Enforces that only the creator can delete their task."""
    current_user = session["user"]
    task = supabase_service.get_task_by_id(task_id)
    if not task:
        return error_response("TASK_NOT_FOUND", "Task not found", 404)

    # Strict authorization: Only task creator can delete
    if task["created_by"] != current_user["id"]:
        return error_response("FORBIDDEN", "Only the task creator can delete this task", 403)

    success = supabase_service.delete_task(task_id)
    if not success:
        return error_response("DELETE_FAILED", "Failed to delete task", 500)

    return success_response({"message": "Task deleted successfully"})
