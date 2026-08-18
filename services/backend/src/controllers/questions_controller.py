from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from src.schemas.question import QuestionResponse
from src.services.question_service import QuestionService
from src.repositories.question_repository import QuestionRepository
from src.config.database import get_db

router = APIRouter(prefix="/questions", tags=["questions"])

def get_question_service(db: AsyncSession = Depends(get_db)) -> QuestionService:
    repo = QuestionRepository(db)
    return QuestionService(repo)

@router.get("", response_model=List[QuestionResponse])
async def list_questions(certification_id: str, service: QuestionService = Depends(get_question_service)):
    return await service.get_questions_by_certification(certification_id)
