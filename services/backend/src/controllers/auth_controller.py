from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from src.schemas.auth import RegisterRequest, LoginRequest, AuthResponse, UserResponse
from src.services.auth_service import AuthService
from src.middleware.auth import get_current_user
from src.exceptions.auth_exceptions import InvalidCredentialsException, UserAlreadyExistsException

router = APIRouter(prefix="/auth", tags=["auth"])
security = HTTPBearer()

def get_auth_service() -> AuthService:
    return AuthService()

@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def register(request: RegisterRequest, service: AuthService = Depends(get_auth_service)):
    try:
        return await service.register_user(request)
    except UserAlreadyExistsException as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login", response_model=AuthResponse)
async def login(request: LoginRequest, service: AuthService = Depends(get_auth_service)):
    try:
        return await service.login_user(request)
    except InvalidCredentialsException:
        raise HTTPException(status_code=401, detail="Invalid credentials")

@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(credentials: HTTPAuthorizationCredentials = Depends(security), service: AuthService = Depends(get_auth_service)):
    await service.logout_user(credentials.credentials)
    return None

@router.post("/forgot-password", status_code=status.HTTP_204_NO_CONTENT)
async def forgot_password(email: str, service: AuthService = Depends(get_auth_service)):
    await service.send_password_reset(email)
    return None

@router.post("/reset-password", status_code=status.HTTP_204_NO_CONTENT)
async def reset_password(new_password: str, token: str, service: AuthService = Depends(get_auth_service)):
    await service.reset_password(new_password, token)
    return None

@router.get("/me", response_model=UserResponse)
async def get_me(user: UserResponse = Depends(get_current_user)):
    return user
