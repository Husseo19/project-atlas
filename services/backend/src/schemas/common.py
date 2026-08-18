from typing import Generic, TypeVar, Optional, List
from pydantic import BaseModel

T = TypeVar('T')

class HealthResponse(BaseModel):
    status: str
    version: str
    environment: str

class ErrorResponse(BaseModel):
    code: str
    message: str
    details: Optional[dict] = None
    trace_id: Optional[str] = None

class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int
    page: int
    page_size: int
    has_next: bool
