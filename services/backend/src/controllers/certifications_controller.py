from typing import List
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from src.schemas.certification import CertificationResponse
from src.services.certification_service import CertificationService
from src.repositories.certification_repository import CertificationRepository
from src.config.database import get_db

router = APIRouter(prefix="/certifications", tags=["certifications"])

def get_certification_service(db: AsyncSession = Depends(get_db)) -> CertificationService:
    repo = CertificationRepository(db)
    return CertificationService(repo)

@router.get("", response_model=List[CertificationResponse])
async def list_certifications(service: CertificationService = Depends(get_certification_service)):
    return await service.get_all_certifications()

@router.get("/{cert_id}", response_model=CertificationResponse)
async def get_certification(cert_id: str, service: CertificationService = Depends(get_certification_service)):
    cert = await service.get_certification(cert_id)
    if not cert:
        raise HTTPException(status_code=404, detail="Certification not found")
    return cert
