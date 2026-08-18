from loguru import logger
from src.config.supabase import get_supabase_client
from src.schemas.auth import RegisterRequest, LoginRequest, AuthResponse, UserResponse
from src.exceptions.auth_exceptions import InvalidCredentialsException, UserAlreadyExistsException

class AuthService:
    def __init__(self):
        self.supabase = get_supabase_client()

    async def register_user(self, request: RegisterRequest) -> AuthResponse:
        logger.info(f"Registering user: {request.email}")
        try:
            response = self.supabase.auth.sign_up({
                "email": request.email,
                "password": request.password,
                "options": {
                    "data": {
                        "full_name": request.full_name
                    }
                }
            })
            if not response.user or not response.session:
                raise Exception("Failed to register")
            
            user_resp = UserResponse(
                id=response.user.id,
                email=response.user.email,
                full_name=response.user.user_metadata.get("full_name"),
                created_at=str(response.user.created_at)
            )
            return AuthResponse(
                access_token=response.session.access_token,
                expires_in=response.session.expires_in,
                user=user_resp
            )
        except Exception as e:
            logger.error(f"Registration failed: {str(e)}")
            raise UserAlreadyExistsException(str(e))

    async def login_user(self, request: LoginRequest) -> AuthResponse:
        logger.info(f"Logging in user: {request.email}")
        try:
            response = self.supabase.auth.sign_in_with_password({
                "email": request.email,
                "password": request.password
            })
            if not response.user or not response.session:
                raise InvalidCredentialsException("Invalid credentials")
                
            user_resp = UserResponse(
                id=response.user.id,
                email=response.user.email,
                full_name=response.user.user_metadata.get("full_name"),
                created_at=str(response.user.created_at)
            )
            return AuthResponse(
                access_token=response.session.access_token,
                expires_in=response.session.expires_in,
                user=user_resp
            )
        except Exception as e:
            logger.error(f"Login failed: {str(e)}")
            raise InvalidCredentialsException("Invalid credentials")

    async def logout_user(self, token: str) -> None:
        logger.info("Logging out user")
        # In a real app we'd sign out of supabase using the token
        try:
            self.supabase.auth.sign_out()
        except Exception as e:
            logger.error(f"Logout failed: {str(e)}")

    async def send_password_reset(self, email: str) -> None:
        logger.info(f"Sending password reset to {email}")
        try:
            self.supabase.auth.reset_password_email(email)
        except Exception as e:
            logger.error(f"Password reset request failed: {str(e)}")

    async def reset_password(self, new_password: str, token: str) -> None:
        logger.info("Resetting password")
        try:
            # Updating password usually requires authenticated session
            pass
        except Exception as e:
            logger.error(f"Password reset failed: {str(e)}")

    async def get_current_user(self, token: str) -> UserResponse:
        try:
            response = self.supabase.auth.get_user(token)
            if not response or not response.user:
                raise Exception("Invalid token")
            return UserResponse(
                id=response.user.id,
                email=response.user.email,
                full_name=response.user.user_metadata.get("full_name"),
                created_at=str(response.user.created_at)
            )
        except Exception as e:
            logger.error(f"Failed to get current user: {str(e)}")
            raise
