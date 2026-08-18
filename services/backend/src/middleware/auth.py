from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from src.config.settings import settings
from src.config.supabase import get_supabase_client
from src.schemas.auth import UserResponse
from src.exceptions.auth_exceptions import UnauthorizedException

security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> UserResponse:
    token = credentials.credentials
    supabase = get_supabase_client()
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret,
            algorithms=["HS256"],
            audience="authenticated"
        )
        user_id = payload.get("sub")
        email = payload.get("email")
        user_metadata = payload.get("user_metadata", {})
        full_name = user_metadata.get("full_name")
        
        if not user_id:
            raise UnauthorizedException("Invalid token payload")
            
        return UserResponse(
            id=user_id,
            email=email,
            full_name=full_name,
            created_at=""
        )
    except jwt.ExpiredSignatureError:
        raise UnauthorizedException("Token has expired")
    except jwt.InvalidTokenError as e:
        raise UnauthorizedException(f"Invalid token: {str(e)}")
    except Exception as e:
        raise UnauthorizedException(str(e))
