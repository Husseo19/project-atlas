from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from src.schemas.certification import CertificationResponse
from src.models.certification import Certification

def map_db_to_certification(model: Certification) -> CertificationResponse:
    code = model.exam_code or ""
    # Infer level from code
    level = "Fundamental"
    if "104" in code:
        level = "Associate"
    elif "305" in code:
        level = "Expert"

    return CertificationResponse(
        id=str(model.id),
        code=code,
        name=model.name,
        provider=model.provider,
        level=level,
        description=f"Official {code} certification by {model.provider}."
    )

class CertificationRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all(self) -> List[CertificationResponse]:
        result = await self.db.execute(select(Certification))
        models = result.scalars().all()
        return [map_db_to_certification(c) for c in models]

    async def get_by_id(self, cert_id: str) -> Optional[CertificationResponse]:
        result = await self.db.execute(select(Certification).where(Certification.id == cert_id))
        model = result.scalars().first()
        if not model:
            return None
        return map_db_to_certification(model)

    async def get_by_code_or_name(self, code: str, name: str) -> Optional[CertificationResponse]:
        result = await self.db.execute(
            select(Certification).where(
                or_(Certification.exam_code == code, Certification.name == name)
            )
        )
        model = result.scalars().first()
        if not model:
            return None
        return map_db_to_certification(model)

    async def create(self, code: str, name: str, provider: str = "Unknown", version: str = "latest") -> CertificationResponse:
        new_cert = Certification(
            exam_code=code,
            name=name,
            provider=provider,
            version=version
        )
        self.db.add(new_cert)
        await self.db.commit()
        await self.db.refresh(new_cert)
        return map_db_to_certification(new_cert)
