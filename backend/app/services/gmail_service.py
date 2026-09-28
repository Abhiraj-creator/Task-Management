import os
import base64
from email.mime.text import MIMEText
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from app.config import Config

def _build_gmail_service():
    """Attempts to build Gmail API client service if credentials exist."""
    refresh_token = os.getenv("GMAIL_REFRESH_TOKEN")
    client_id = Config.GOOGLE_CLIENT_ID
    client_secret = Config.GOOGLE_CLIENT_SECRET

    if not (refresh_token and client_id and client_secret):
        return None

    try:
        creds = Credentials(
            token=None,
            refresh_token=refresh_token,
            token_uri="https://oauth2.googleapis.com/token",
            client_id=client_id,
            client_secret=client_secret,
            scopes=["https://www.googleapis.com/auth/gmail.send"]
        )
        service = build("gmail", "v1", credentials=creds)
        return service
    except Exception as e:
        print(f"[GmailService] Failed to initialize Gmail API service: {e}")
        return None

def send_task_created_email(assignee_email: str, assignee_name: str, creator_name: str, task_title: str, task_description: str | None = None) -> bool:
    """
    Sends notification to assignee when a new task is created.
    Isolates errors so task creation never fails even if email sending fails.
    """
    try:
        subject = "You have been assigned a new task"
        body = (
            f"Hi {assignee_name},\n\n"
            f"{creator_name} assigned you a new task.\n\n"
            f"Task:\n{task_title}\n\n"
            f"Description:\n{task_description or 'No description provided'}\n\n"
            f"Please log in to Task Manager to view the task."
        )

        sender_email = Config.GMAIL_SENDER_EMAIL or "noreply@taskmanager.com"

        message = MIMEText(body)
        message["to"] = assignee_email
        message["from"] = sender_email
        message["subject"] = subject

        raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode("utf-8")

        service = _build_gmail_service()
        if service:
            service.users().messages().send(userId="me", body={"raw": raw_message}).execute()
            print(f"[GmailService] Task creation email sent successfully to {assignee_email}")
            return True
        else:
            print(f"[GmailService Simulator] Gmail API credentials not fully configured. Email payload logged:\nTO: {assignee_email}\nSUBJECT: {subject}\nBODY:\n{body}")
            return True
    except Exception as e:
        print(f"[GmailService Error] Failed to send task created email: {e}")
        return False

def send_task_completed_email(creator_email: str, creator_name: str, assignee_name: str, task_title: str) -> bool:
    """
    Sends notification to creator when task is marked completed by assignee.
    Isolates errors so task completion never fails even if email sending fails.
    """
    try:
        subject = f"Task completed: {task_title}"
        body = (
            f"Hi {creator_name},\n\n"
            f"{assignee_name} has completed the task:\n\n"
            f"{task_title}\n\n"
            f"The task has been marked as completed."
        )

        sender_email = Config.GMAIL_SENDER_EMAIL or "noreply@taskmanager.com"

        message = MIMEText(body)
        message["to"] = creator_email
        message["from"] = sender_email
        message["subject"] = subject

        raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode("utf-8")

        service = _build_gmail_service()
        if service:
            service.users().messages().send(userId="me", body={"raw": raw_message}).execute()
            print(f"[GmailService] Task completion email sent successfully to {creator_email}")
            return True
        else:
            print(f"[GmailService Simulator] Gmail API credentials not fully configured. Email payload logged:\nTO: {creator_email}\nSUBJECT: {subject}\nBODY:\n{body}")
            return True
    except Exception as e:
        print(f"[GmailService Error] Failed to send task completed email: {e}")
        return False
