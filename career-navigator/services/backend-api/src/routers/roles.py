from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..databases.db import get_db
from ..models.models import Role, RoleSkill, Skill
from ..schemas.role_schemas import RoleOut, RoleDetail, SkillRequirement

router = APIRouter(tags=["roles"])


# PUBLIC_INTERFACE
@router.get("/roles", response_model=List[RoleOut], summary="List all roles", description="Return all roles with id, name, and description.")
def list_roles(db: Session = Depends(get_db)) -> List[RoleOut]:
    """List all roles."""
    roles = db.query(Role).order_by(Role.name.asc()).all()
    return [RoleOut.model_validate(r, from_attributes=True) for r in roles]


# PUBLIC_INTERFACE
@router.get(
    "/roles/{role_id}",
    response_model=RoleDetail,
    summary="Get role by id",
    description="Return a role and its required skills with levels.",
)
def get_role(role_id: int, db: Session = Depends(get_db)) -> RoleDetail:
    """Return a role by id with required skill details."""
    role: Optional[Role] = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")

    mappings = (
        db.query(RoleSkill, Skill)
        .join(Skill, Skill.id == RoleSkill.skill_id)
        .filter(RoleSkill.role_id == role.id)
        .all()
    )
    reqs = [
        SkillRequirement(
            skill_id=s.id, skill_name=s.name, level_required=rs.level_required
        )
        for rs, s in mappings
    ]
    return RoleDetail(id=role.id, name=role.name, description=role.description, required_skills=reqs)
