import os
import requests
from app.config import Config

class GoogleAuthService:
    @staticmethod
    def get_authorization_url() -> str:
        client_id = Config.GOOGLE_CLIENT_ID
        redirect_uri = Config.GOOGLE_REDIRECT_URI
        scope = "openid email profile"
        
        url = (
            f"https://accounts.google.com/o/oauth2/v2/auth?"
            f"client_id={client_id}&"
            f"redirect_uri={redirect_uri}&"
            f"response_type=code&"
            f"scope={scope}&"
            f"access_type=offline&"
            f"prompt=consent"
        )
        return url

    @staticmethod
    def get_tokens_and_user_info(code: str) -> dict | None:
        token_url = "https://oauth2.googleapis.com/token"
        data = {
            "code": code,
            "client_id": Config.GOOGLE_CLIENT_ID,
            "client_secret": Config.GOOGLE_CLIENT_SECRET,
            "redirect_uri": Config.GOOGLE_REDIRECT_URI,
            "grant_type": "authorization_code",
        }

        try:
            token_res = requests.post(token_url, data=data, timeout=10)
            if not token_res.ok:
                print(f"[GoogleAuthService] Token exchange failed: {token_res.text}")
                return None
            
            tokens = token_res.json()
            access_token = tokens.get("access_token")

            # Fetch user info
            user_info_res = requests.get(
                "https://www.googleapis.com/oauth2/v2/userinfo",
                headers={"Authorization": f"Bearer {access_token}"},
                timeout=10,
            )
            if not user_info_res.ok:
                print(f"[GoogleAuthService] User info request failed: {user_info_res.text}")
                return None
            
            user_info = user_info_res.json()
            return {
                "google_id": user_info.get("id"),
                "email": user_info.get("email"),
                "name": user_info.get("name", user_info.get("email")),
                "picture": user_info.get("picture"),
                "access_token": access_token,
            }
        except Exception as e:
            print(f"[GoogleAuthService] OAuth error: {e}")
            return None

google_auth_service = GoogleAuthService()
