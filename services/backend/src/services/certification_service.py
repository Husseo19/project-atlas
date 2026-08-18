from typing import List, Optional
from src.schemas.certification import CertificationResponse
from src.repositories.certification_repository import CertificationRepository

class CertificationService:
    def __init__(self, repo: CertificationRepository):
        self.repo = repo

    async def get_all_certifications(self) -> List[CertificationResponse]:
        return await self.repo.get_all()

    async def get_certification(self, cert_id: str) -> Optional[CertificationResponse]:
        return await self.repo.get_by_id(cert_id)
