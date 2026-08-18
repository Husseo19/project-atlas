from typing import List
from src.schemas.question import QuestionResponse
from src.repositories.question_repository import QuestionRepository

class QuestionService:
    def __init__(self, repo: QuestionRepository):
        self.repo = repo

    async def get_questions_by_certification(self, certification_id: str) -> List[QuestionResponse]:
        return await self.repo.get_by_certification(certification_id)
