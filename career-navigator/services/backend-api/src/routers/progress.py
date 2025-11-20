from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..databases.db import get_db
from ..schemas.progress_schemas import ProgressUpdateInput, ProgressUpdateResult
from ..services.progress_service import upsert_progress

router = APIRouter(tags=["progress"])


# PUBLIC_INTERFACE
@router.post(
    "/progress/update",
    response_model=ProgressUpdateResult,
    summary="Update user progress",
    description="Create or update a user skill progress record.",
)
def progress_update(payload: ProgressUpdateInput, db: Session = Depends(get_db)) -> ProgressUpdateResult:
    """Update a user's progress for a skill."""
    upsert_progress(db, payload.userId, payload.skillId, payload.level)
    return ProgressUpdateResult(success=True, message="Progress updated")
