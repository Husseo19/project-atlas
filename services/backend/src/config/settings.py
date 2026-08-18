from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    supabase_url: str
    supabase_anon_key: str
    supabase_service_role_key: str
    jwt_secret: str
    cors_origins: List[str] = ["http://localhost:3000"]
    environment: str = "development"
    log_level: str = "INFO"
    api_version: str = "v1"
    openai_api_key: str
    postgres_url: str
    
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

settings = Settings()
