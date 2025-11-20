import os
from typing import List

from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session

from .databases.db import engine, get_db
from .models.models import Base, Role
from .services.seed import seed_roles_and_skills

app = FastAPI(
    title="Career Navigator Backend API",
    description="Backend API for roles, skills, gap analysis, roadmaps, and progress tracking.",
    version="0.1.0",
    openapi_tags=[
        {"name": "health", "description": "Health and readiness checks"},
        {"name": "roles", "description": "Role and skill framework access"},
    ],
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


# PUBLIC_INTERFACE
@app.get("/roles", tags=["roles"], summary="List all roles")
def list_roles(db: Session = Depends(get_db)) -> List[dict]:
    """Return all roles with id, name, and description.

    Args:
        db (Session): Injected SQLAlchemy session.

    Returns:
        List[dict]: Array of role objects.
    """
    roles = db.query(Role).order_by(Role.name.asc()).all()
    return [{"id": r.id, "name": r.name, "description": r.description} for r in roles]
