from sqlalchemy.orm import Session

from ..models.models import UserProgress


# PUBLIC_INTERFACE
def upsert_progress(db: Session, user_id: str, skill_id: int, level: int) -> None:
    """Insert or update a user's skill progress entry."""
    rec = (
        db.query(UserProgress)
        .filter(UserProgress.user_id == user_id, UserProgress.skill_id == skill_id)
        .first()
    )
    if rec:
        rec.level = level
    else:
        rec = UserProgress(user_id=user_id, skill_id=skill_id, level=level)
        db.add(rec)
    db.commit()
