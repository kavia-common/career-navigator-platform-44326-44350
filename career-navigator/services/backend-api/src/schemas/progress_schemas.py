from pydantic import BaseModel, Field


# PUBLIC_INTERFACE
class ProgressUpdateInput(BaseModel):
    """Input for updating user skill progress."""
    userId: str = Field(..., description="User identifier")
    skillId: int = Field(..., description="Skill identifier")
    level: int = Field(..., ge=0, le=5, description="Current proficiency level (0-5)")


# PUBLIC_INTERFACE
class ProgressUpdateResult(BaseModel):
    """Result of a progress update operation."""
    success: bool = Field(..., description="Whether update succeeded")
    message: str = Field(..., description="Human readable message")
