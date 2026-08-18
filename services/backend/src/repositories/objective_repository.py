from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from src.models.certification import StudyObjective

class ObjectiveRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_certification(self, certification_id: str) -> List[Dict[str, Any]]:
        result = await self.db.execute(
            select(StudyObjective).where(StudyObjective.certification_id == certification_id)
        )
        models = result.scalars().all()
        return [
            {
                "id": str(m.id),
                "certification_id": str(m.certification_id),
                "code": m.code,
                "description": m.description,
                "weight": m.weight
            } for m in models
        ]

    async def delete_by_certification(self, certification_id: str) -> None:
        await self.db.execute(
            delete(StudyObjective).where(StudyObjective.certification_id == certification_id)
        )
        await self.db.commit()

    async def create(self, certification_id: str, code: str, description: str, weight: float) -> Dict[str, Any]:
        new_objective = StudyObjective(
            certification_id=certification_id,
            code=code,
            description=description,
            weight=weight
        )
        self.db.add(new_objective)
        await self.db.commit()
        await self.db.refresh(new_objective)
        return {
            "id": str(new_objective.id),
            "certification_id": str(new_objective.certification_id),
            "code": new_objective.code,
            "description": new_objective.description,
            "weight": new_objective.weight
        }

    async def create_many(self, objectives: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        new_models = []
        for obj in objectives:
            model = StudyObjective(
                certification_id=obj["certification_id"],
                code=obj["code"],
                description=obj["description"],
                weight=obj.get("weight")
            )
            self.db.add(model)
            new_models.append(model)
            
        await self.db.commit()
        
        return [
            {
                "id": str(m.id),
                "certification_id": str(m.certification_id),
                "code": m.code,
                "description": m.description,
                "weight": m.weight
            } for m in new_models
        ]
