from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from src.schemas.question import QuestionResponse, OptionSchema
from src.models.question import Question

def map_db_to_question(model: Question) -> QuestionResponse:
    options_data = model.options or []
    if isinstance(options_data, list):
        options = [OptionSchema(**opt) for opt in options_data]
    else:
        options = []
        
    return QuestionResponse(
        id=str(model.id),
        content=model.content or "",
        type=model.type or "MultipleChoice",
        options=options,
        correctAnswer=model.correct_answers or [],
        explanation=model.explanation or "",
        difficulty=model.difficulty or 1,
        tags=model.tags or [],
        certification_id=str(model.certification_id) if model.certification_id else "",
        objective_id=str(model.objective_id) if model.objective_id else None,
        is_adaptive=model.is_adaptive or False,
        misconception_tag=model.misconception_tag or None
    )

class QuestionRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_certification(self, certification_id: str) -> List[QuestionResponse]:
        import uuid
        from src.models.certification import Certification
        try:
            uuid_val = uuid.UUID(certification_id)
            cert_id = str(uuid_val)
        except ValueError:
            # It might be an exam code like SC-300
            cert_result = await self.db.execute(select(Certification).where(Certification.exam_code == certification_id))
            cert = cert_result.scalars().first()
            if not cert:
                return []
            cert_id = str(cert.id)

        result = await self.db.execute(select(Question).where(Question.certification_id == cert_id))
        models = result.scalars().all()
        return [map_db_to_question(q) for q in models]

    async def create(self, question_data: dict) -> QuestionResponse:
        new_question = Question(**question_data)
        self.db.add(new_question)
        await self.db.commit()
        await self.db.refresh(new_question)
        return map_db_to_question(new_question)

    async def get_by_objective(self, objective_id: str, limit: int = 10) -> List[QuestionResponse]:
        result = await self.db.execute(
            select(Question)
            .where(Question.objective_id == objective_id)
            .limit(limit)
        )
        models = result.scalars().all()
        return [map_db_to_question(q) for q in models]
