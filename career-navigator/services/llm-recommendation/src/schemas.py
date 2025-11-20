from typing import List, Optional
from pydantic import BaseModel, Field


# PUBLIC_INTERFACE
class RecommendInput(BaseModel):
    """Input payload for recommendation generation."""
    skillName: str = Field(..., description="Name of the skill to get recommendations for")
    skillDescription: str = Field(..., description="Description/context for the skill")
    requiredLevel: int = Field(..., ge=1, le=5, description="Target proficiency level (1-5)")


# PUBLIC_INTERFACE
class RecommendOutput(BaseModel):
    """Output payload for recommendations with steps, resources, and project ideas."""
    steps: List[str] = Field(..., min_items=3, max_items=3, description="Three actionable steps")
    resources: List[str] = Field(..., min_items=3, max_items=3, description="Three learning resources")
    projects: List[str] = Field(..., min_items=2, max_items=2, description="Two practice project ideas")
