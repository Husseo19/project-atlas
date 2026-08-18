from typing import Optional
from pydantic import BaseModel

class UpdateProfileRequest(BaseModel):
    full_name: Optional[str] = None
