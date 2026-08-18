from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse, RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger
import sys

from src.config.settings import settings
from src.middleware.logging import LoggingMiddleware
from src.middleware.rate_limit import limiter
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from src.controllers.auth_controller import router as auth_router
from src.controllers.certifications_controller import router as cert_router
from src.controllers.users_controller import router as user_router
from src.controllers.questions_controller import router as questions_router
from src.controllers.sessions_controller import router as sessions_router
from src.controllers.admin_controller import router as admin_router
from src.controllers.training_controller import router as training_router
from src.controllers.analytics_controller import router as analytics_router
from src.controllers.community_controller import router as community_router
from src.schemas.common import HealthResponse, ErrorResponse
from src.exceptions.auth_exceptions import AuthException, UnauthorizedException

# Configure Loguru
logger.remove()
logger.add(sys.stdout, format="{time} {level} {message}", level=settings.log_level)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting up FastAPI application...")
    yield
    logger.info("Shutting down FastAPI application...")

app = FastAPI(
    title="Project Atlas API",
    version="0.1.0",
    description="Backend for Microsoft Certification Exam preparation platform",
    lifespan=lifespan
)

# Middleware
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(LoggingMiddleware)

# Exception Handlers
@app.exception_handler(AuthException)
async def auth_exception_handler(request: Request, exc: AuthException):
    status_code = 401 if isinstance(exc, UnauthorizedException) else 400
    return JSONResponse(
        status_code=status_code,
        content=ErrorResponse(
            code="AUTH_ERROR",
            message=str(exc)
        ).model_dump()
    )

@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content=ErrorResponse(
            code="INTERNAL_SERVER_ERROR",
            message="An unexpected error occurred."
        ).model_dump()
    )

# Routers
app.include_router(auth_router, prefix=f"/api/{settings.api_version}")
app.include_router(cert_router, prefix=f"/api/{settings.api_version}")
app.include_router(user_router, prefix=f"/api/{settings.api_version}")
app.include_router(questions_router, prefix=f"/api/{settings.api_version}")
app.include_router(sessions_router, prefix=f"/api/{settings.api_version}")
app.include_router(admin_router, prefix=f"/api/{settings.api_version}")
app.include_router(training_router, prefix=f"/api/{settings.api_version}")
app.include_router(analytics_router, prefix=f"/api/{settings.api_version}")
app.include_router(community_router, prefix=f"/api/{settings.api_version}")

@app.get("/health", response_model=HealthResponse, tags=["system"])
@limiter.limit("5/minute")
async def health_check(request: Request):
    return HealthResponse(
        status="healthy",
        version="0.1.0",
        environment=settings.environment
    )

@app.get("/", include_in_schema=False)
async def root():
    return RedirectResponse(url="/docs")
