import unittest
import json
from app import create_app

class TaskManagerApiTestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app()
        self.app.config["TESTING"] = True
        self.client = self.app.test_client()

    def test_01_health_check(self):
        res = self.client.get("/api/health")
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertTrue(data["success"])
        self.assertEqual(data["data"]["status"], "ok")

    def test_02_unauthenticated_requests(self):
        res = self.client.get("/api/auth/me")
        self.assertEqual(res.status_code, 401)

        res = self.client.get("/api/tasks")
        self.assertEqual(res.status_code, 401)

    def test_03_dev_login_and_me(self):
        res = self.client.post("/api/auth/dev-login", json={
            "name": "Alice Tester",
            "email": "alice@example.com"
        })
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertTrue(data["success"])
        user1 = data["data"]
        self.assertEqual(user1["email"], "alice@example.com")

        # Check /api/auth/me
        res_me = self.client.get("/api/auth/me")
        self.assertEqual(res_me.status_code, 200)
        data_me = json.loads(res_me.data)
        self.assertEqual(data_me["data"]["email"], "alice@example.com")

    def test_04_user_list_and_task_lifecycle(self):
        # Login as User 1 (Alice)
        res_u1 = self.client.post("/api/auth/dev-login", json={
            "name": "Alice Creator",
            "email": "alice@example.com"
        })
        u1 = json.loads(res_u1.data)["data"]

        # Create second client for Bob
        client_bob = self.app.test_client()
        res_u2 = client_bob.post("/api/auth/dev-login", json={
            "name": "Bob Assignee",
            "email": "bob@example.com"
        })
        u2 = json.loads(res_u2.data)["data"]

        # Check /api/users
        res_users = self.client.get("/api/users")
        self.assertEqual(res_users.status_code, 200)
        users = json.loads(res_users.data)["data"]
        self.assertTrue(len(users) >= 2)

        # Alice creates a task assigned to Bob
        res_create = self.client.post("/api/tasks", json={
            "title": "Implement Gmail Notification Flow",
            "description": "Ensure email triggers execute safely on status update",
            "assigned_to": u2["id"]
        })
        self.assertEqual(res_create.status_code, 201)
        task = json.loads(res_create.data)["data"]
        task_id = task["id"]
        self.assertEqual(task["status"], "pending")
        self.assertEqual(task["created_by"], u1["id"])
        self.assertEqual(task["assigned_to"], u2["id"])

        # Bob views task list and sees the assigned task
        res_bob_tasks = client_bob.get("/api/tasks")
        self.assertEqual(res_bob_tasks.status_code, 200)
        bob_tasks = json.loads(res_bob_tasks.data)["data"]
        self.assertTrue(any(t["id"] == task_id for t in bob_tasks))

        # Bob marks task completed
        res_complete = client_bob.patch(f"/api/tasks/{task_id}", json={
            "status": "completed"
        })
        self.assertEqual(res_complete.status_code, 200)
        updated_task = json.loads(res_complete.data)["data"]
        self.assertEqual(updated_task["status"], "completed")
        self.assertIsNotNone(updated_task["completed_at"])

        # Bob tries to delete task created by Alice -> Should fail 403 Forbidden
        res_unauth_delete = client_bob.delete(f"/api/tasks/{task_id}")
        self.assertEqual(res_unauth_delete.status_code, 403)

        # Alice (creator) deletes task -> Should succeed
        res_delete = self.client.delete(f"/api/tasks/{task_id}")
        self.assertEqual(res_delete.status_code, 200)

    def test_05_logout(self):
        self.client.post("/api/auth/dev-login", json={"name": "Log User", "email": "log@test.com"})
        res_logout = self.client.post("/api/auth/logout")
        self.assertEqual(res_logout.status_code, 200)

        # Verify no longer authenticated
        res_me = self.client.get("/api/auth/me")
        self.assertEqual(res_me.status_code, 401)

if __name__ == "__main__":
    unittest.main()
