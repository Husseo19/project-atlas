from typing import Optional, List, Dict
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from src.schemas.session import SessionResponse
from src.models.session import Session
from datetime import datetime, timezone

def map_db_to_session(model: Session) -> SessionResponse:
    return SessionResponse(
        id=str(model.id),
        user_id=str(model.user_id),
        certification_id=str(model.certification_id),
        questions=model.questions or [],
        answers=model.answers or {},
        start_time=model.start_time.isoformat() if model.start_time else "",
        end_time=model.end_time.isoformat() if model.end_time else None,
        score=model.score,
        passed=model.passed,
        mode=model.type or "exam"
    )

class SessionRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, user_id: str, certification_id: str, questions: List[str], mode: str = "exam") -> SessionResponse:
        new_session = Session(
            user_id=user_id,
            certification_id=certification_id,
            questions=questions,
            answers={},
            start_time=datetime.now(timezone.utc),
            type=mode
        )
        self.db.add(new_session)
        await self.db.commit()
        await self.db.refresh(new_session)
        return map_db_to_session(new_session)

    async def get_by_id(self, session_id: str) -> Optional[SessionResponse]:
        result = await self.db.execute(select(Session).where(Session.id == session_id))
        model = result.scalars().first()
        if not model:
            return None
        return map_db_to_session(model)

    async def update(self, session_id: str, updates: dict) -> SessionResponse:
        result = await self.db.execute(select(Session).where(Session.id == session_id))
        model = result.scalars().first()
        if not model:
            raise Exception("Session not found")
            
        for key, value in updates.items():
            setattr(model, key, value)
            
        await self.db.commit()
        await self.db.refresh(model)
        return map_db_to_session(model)
