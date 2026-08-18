from pydantic import BaseModel
from typing import List, Dict, Optional
from datetime import datetime

class StartSessionRequest(BaseModel):
    certification_id: str

class SessionResponse(BaseModel):
    id: str
    user_id: str
    certification_id: str
    questions: List[str]
    answers: Dict[str, List[str]]
    start_time: datetime
    end_time: Optional[datetime] = None
    score: Optional[float] = None
    passed: Optional[bool] = None
    mode: str = "exam"

class SubmitAnswersRequest(BaseModel):
    answers: Dict[str, List[str]]
