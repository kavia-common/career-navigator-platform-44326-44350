from typing import List

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .databases.db import engine, get_db
from .models.models import Base
from .services.seed import seed_roles_and_skills
from .settings import get_settings
from .routers import roles as roles_router
from .routers import analysis as analysis_router
from .routers import progress as progress_router

# Initialize settings first
settings = get_settings()

app = FastAPI(
    title="Career Navigator Backend API",
    description="Backend API for roles, skills, gap analysis, roadmaps, and progress tracking.",
    version="0.1.0",
    openapi_tags=[
        {"name": "health", "description": "Health and readiness checks"},
        {"name": "roles", "description": "Role and skill framework access"},
        {"name": "analysis", "description": "Gap analysis and roadmap generation"},
        {"name": "progress", "description": "User progress tracking"},
    ],
)

# Enable CORS based on settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    """Create database tables and seed data on service startup.

    This will:
    - Create all tables defined by SQLAlchemy models.
    - Run idempotent seeding for roles and skills (15 roles with 10–20 skills each).
    """
    # Create all tables
    Base.metadata.create_all(bind=engine)
    # Seed data
    from .databases.db import SessionLocal  # local import to avoid circular
    db = SessionLocal()
    try:
        seed_roles_and_skills(db)
    finally:
        db.close()


# PUBLIC_INTERFACE
@app.get("/health", tags=["health"], summary="Service health check")
def health() -> dict:
    """Simple liveness endpoint.

    Returns:
        dict: {"status": "ok"} if the service is up.
    """
    return {"status": "ok"}


# Mount routers
app.include_router(roles_router.router, prefix="")
app.include_router(analysis_router.router, prefix="")
app.include_router(progress_router.router, prefix="")
