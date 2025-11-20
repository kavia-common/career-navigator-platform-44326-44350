from typing import List, Optional
from pydantic import BaseModel, Field


class RoleBase(BaseModel):
    """Base role schema with shared fields."""
    name: str = Field(..., description="Role name")
    description: Optional[str] = Field(None, description="Optional role description")


# PUBLIC_INTERFACE
class RoleOut(RoleBase):
    """Role response schema."""
    id: int = Field(..., description="Role identifier")

    class Config:
        from_attributes = True


class SkillRequirement(BaseModel):
    """Required skill for a role with the required level on a 1–5 scale."""
    skill_id: int = Field(..., description="Skill identifier")
    skill_name: str = Field(..., description="Human readable skill name")
    level_required: int = Field(..., ge=1, le=5, description="Required level (1-5)")


# PUBLIC_INTERFACE
class RoleDetail(RoleOut):
    """Detailed role schema including required skills."""
    required_skills: List[SkillRequirement] = Field(default_factory=list, description="List of required skills for the role")
