from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from src.schemas.session import SessionResponse, StartSessionRequest, SubmitAnswersRequest
from src.services.session_service import SessionService
from src.repositories.session_repository import SessionRepository
from src.repositories.question_repository import QuestionRepository
from src.middleware.auth import get_current_user
from src.schemas.auth import UserResponse
from src.config.database import get_db

router = APIRouter(prefix="/sessions", tags=["sessions"])

def get_session_service(db: AsyncSession = Depends(get_db)) -> SessionService:
    repo = SessionRepository(db)
    question_repo = QuestionRepository(db)
    return SessionService(repo, question_repo)

@router.post("/start", response_model=SessionResponse)
async def start_session(
    request: StartSessionRequest,
    user: UserResponse = Depends(get_current_user),
    service: SessionService = Depends(get_session_service)
):
    return await service.start_session(user.id, request.certification_id)

@router.post("/{session_id}/submit", response_model=SessionResponse)
async def submit_answers(
    session_id: str,
    request: SubmitAnswersRequest,
    user: UserResponse = Depends(get_current_user),
    service: SessionService = Depends(get_session_service)
):
    session = await service.submit_answers(session_id, request)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session

@router.get("/{session_id}", response_model=SessionResponse)
async def get_session(
    session_id: str,
    user: UserResponse = Depends(get_current_user),
    service: SessionService = Depends(get_session_service)
):
    session = await service.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    if session.user_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this session")
    return session
