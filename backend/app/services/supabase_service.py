import uuid
from datetime import datetime, timezone
from supabase import create_client, Client
from app.config import Config

class SupabaseService:
    def __init__(self):
        self.url = Config.SUPABASE_URL
        self.key = Config.SUPABASE_SERVICE_ROLE_KEY
        self.client: Client | None = None

        if self.url and self.key:
            try:
                self.client = create_client(self.url, self.key)
            except Exception as e:
                print(f"[SupabaseService] Error initializing Supabase client: {e}")
                self.client = None
        
        # Fallback local in-memory storage for development without live Supabase credentials
        self._mock_users = {}
        self._mock_tasks = {}

    def is_configured(self) -> bool:
        return self.client is not None

    # --- USER OPERATIONS ---

    def get_user_by_google_id(self, google_id: str) -> dict | None:
        if self.client:
            try:
                res = self.client.table("users").select("*").eq("google_id", google_id).execute()
                if res.data and len(res.data) > 0:
                    return res.data[0]
            except Exception:
                pass
        
        # Fallback
        for u in self._mock_users.values():
            if u.get("google_id") == google_id:
                return u
        return None

    def get_user_by_email(self, email: str) -> dict | None:
        if self.client:
            try:
                res = self.client.table("users").select("*").eq("email", email).execute()
                if res.data and len(res.data) > 0:
                    return res.data[0]
            except Exception:
                pass

        # Fallback
        for u in self._mock_users.values():
            if u.get("email") == email:
                return u
        return None

    def get_user_by_id(self, user_id: str) -> dict | None:
        if self.client:
            try:
                res = self.client.table("users").select("*").eq("id", user_id).execute()
                if res.data and len(res.data) > 0:
                    return res.data[0]
            except Exception:
                pass

        return self._mock_users.get(user_id)

    def upsert_user(self, google_id: str, name: str, email: str, avatar_url: str | None = None) -> dict:
        now_str = datetime.now(timezone.utc).isoformat()
        
        if self.client:
            try:
                existing = self.get_user_by_google_id(google_id)
                user_data = {
                    "google_id": google_id,
                    "name": name,
                    "email": email,
                    "avatar_url": avatar_url,
                }
                if existing:
                    res = self.client.table("users").update(user_data).eq("google_id", google_id).execute()
                    if res.data and len(res.data) > 0:
                        return res.data[0]
                else:
                    user_data["created_at"] = now_str
                    res = self.client.table("users").insert(user_data).execute()
                    if res.data and len(res.data) > 0:
                        return res.data[0]
            except Exception:
                pass

        # Fallback
        existing = self.get_user_by_google_id(google_id)
        if existing:
            existing["name"] = name
            existing["email"] = email
            existing["avatar_url"] = avatar_url
            return existing
        else:
            new_id = str(uuid.uuid4())
            user = {
                "id": new_id,
                "google_id": google_id,
                "name": name,
                "email": email,
                "avatar_url": avatar_url,
                "created_at": now_str,
            }
            self._mock_users[new_id] = user
            return user

    def get_all_users(self) -> list[dict]:
        if self.client:
            try:
                res = self.client.table("users").select("id, name, email, avatar_url").execute()
                if res.data and len(res.data) > 0:
                    return res.data
            except Exception:
                pass

        return [
            {
                "id": u["id"],
                "name": u["name"],
                "email": u["email"],
                "avatar_url": u.get("avatar_url"),
            }
            for u in self._mock_users.values()
        ]

    # --- TASK OPERATIONS ---

    def create_task(self, title: str, description: str | None, created_by: str, assigned_to: str) -> dict:
        now_str = datetime.now(timezone.utc).isoformat()

        if self.client:
            try:
                task_data = {
                    "title": title,
                    "description": description,
                    "status": "pending",
                    "created_by": created_by,
                    "assigned_to": assigned_to,
                    "created_at": now_str,
                }
                res = self.client.table("tasks").insert(task_data).execute()
                if res.data and len(res.data) > 0:
                    return res.data[0]
            except Exception:
                pass

        # Fallback
        task_id = str(uuid.uuid4())
        task = {
            "id": task_id,
            "title": title,
            "description": description,
            "status": "pending",
            "created_by": created_by,
            "assigned_to": assigned_to,
            "created_at": now_str,
            "completed_at": None,
        }
        self._mock_tasks[task_id] = task
        return task

    def get_tasks_for_user(self, user_id: str) -> list[dict]:
        tasks = []
        if self.client:
            try:
                res = self.client.table("tasks").select("*").or_(f"created_by.eq.{user_id},assigned_to.eq.{user_id}").order("created_at", desc=True).execute()
                if res.data:
                    tasks = res.data
            except Exception:
                pass

        if not tasks:
            tasks = [
                t for t in self._mock_tasks.values()
                if t["created_by"] == user_id or t["assigned_to"] == user_id
            ]
            tasks.sort(key=lambda x: x["created_at"], reverse=True)

        # Populate creator and assignee details
        for t in tasks:
            t["creator"] = self.get_user_by_id(t["created_by"])
            t["assignee"] = self.get_user_by_id(t["assigned_to"])

        return tasks

    def get_task_by_id(self, task_id: str) -> dict | None:
        task = None
        if self.client:
            try:
                res = self.client.table("tasks").select("*").eq("id", task_id).execute()
                if res.data and len(res.data) > 0:
                    task = res.data[0]
            except Exception:
                pass

        if not task:
            task = self._mock_tasks.get(task_id)

        if task:
            task["creator"] = self.get_user_by_id(task["created_by"])
            task["assignee"] = self.get_user_by_id(task["assigned_to"])

        return task

    def update_task_status(self, task_id: str, status: str) -> dict | None:
        now_str = datetime.now(timezone.utc).isoformat() if status == "completed" else None

        if self.client:
            try:
                update_data = {"status": status}
                if status == "completed":
                    update_data["completed_at"] = now_str
                
                res = self.client.table("tasks").update(update_data).eq("id", task_id).execute()
                if res.data and len(res.data) > 0:
                    task = res.data[0]
                    task["creator"] = self.get_user_by_id(task["created_by"])
                    task["assignee"] = self.get_user_by_id(task["assigned_to"])
                    return task
            except Exception:
                pass

        # Fallback
        task = self._mock_tasks.get(task_id)
        if task:
            task["status"] = status
            if status == "completed":
                task["completed_at"] = now_str
            task["creator"] = self.get_user_by_id(task["created_by"])
            task["assignee"] = self.get_user_by_id(task["assigned_to"])
            return task

        return None

    def delete_task(self, task_id: str) -> bool:
        if self.client:
            try:
                res = self.client.table("tasks").delete().eq("id", task_id).execute()
                return True
            except Exception:
                pass

        if task_id in self._mock_tasks:
            del self._mock_tasks[task_id]
            return True
        return False

# Global singleton instance
supabase_service = SupabaseService()
