from fastapi import APIRouter, Depends
from src.schemas.user import UpdateProfileRequest
from src.schemas.auth import UserResponse
from src.services.user_service import UserService
from src.middleware.auth import get_current_user

router = APIRouter(prefix="/users", tags=["users"])

def get_user_service() -> UserService:
    return UserService()

@router.get("/me", response_model=UserResponse)
async def get_my_profile(user: UserResponse = Depends(get_current_user), service: UserService = Depends(get_user_service)):
    return await service.get_profile(user.id)

@router.patch("/me", response_model=UserResponse)
async def update_my_profile(request: UpdateProfileRequest, user: UserResponse = Depends(get_current_user), service: UserService = Depends(get_user_service)):
    return await service.update_profile(user.id, request)
