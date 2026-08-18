from loguru import logger
from src.schemas.user import UpdateProfileRequest
from src.schemas.auth import UserResponse
from src.config.supabase import get_supabase_admin_client

class UserService:
    def __init__(self):
        self.supabase_admin = get_supabase_admin_client()
        
    async def get_profile(self, user_id: str) -> UserResponse:
        try:
            response = self.supabase_admin.auth.admin.get_user_by_id(user_id)
            user = response.user
            return UserResponse(
                id=user.id,
                email=user.email,
                full_name=user.user_metadata.get("full_name") if user.user_metadata else None,
                created_at=str(user.created_at)
            )
        except Exception as e:
            logger.error(f"Failed to get user profile: {str(e)}")
            raise

    async def update_profile(self, user_id: str, request: UpdateProfileRequest) -> UserResponse:
        try:
            response = self.supabase_admin.auth.admin.update_user_by_id(user_id, {
                "user_metadata": {
                    "full_name": request.full_name
                }
            })
            user = response.user
            return UserResponse(
                id=user.id,
                email=user.email,
                full_name=user.user_metadata.get("full_name") if user.user_metadata else None,
                created_at=str(user.created_at)
            )
        except Exception as e:
            logger.error(f"Failed to update user profile: {str(e)}")
            raise
