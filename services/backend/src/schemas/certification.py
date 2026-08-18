from pydantic import BaseModel

class CertificationResponse(BaseModel):
    id: str
    code: str
    name: str
    provider: str
    level: str
    description: str
