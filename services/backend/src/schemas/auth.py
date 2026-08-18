from typing import Optional
from pydantic import BaseModel, EmailStr

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: Optional[str]
    created_at: str

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str  # min 8 chars
    full_name: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse
