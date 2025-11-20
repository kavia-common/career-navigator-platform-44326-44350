from typing import List
from pydantic import BaseModel, Field


class GapAnalysisInput(BaseModel):
    """Input payload for gap analysis.

    Compares current role to a target role to derive strengths and gaps.
    """
    currentRoleId: int = Field(..., description="Current role id")
    targetRoleId: int = Field(..., description="Target role id")


class SkillItem(BaseModel):
    """Represents a skill with an associated required or current level."""
    id: int = Field(..., description="Skill id")
    name: str = Field(..., description="Skill name")
    requiredLevel: int = Field(..., ge=1, le=5, description="Required level for this skill")


class Recommendation(BaseModel):
    """Lightweight recommendation item for addressing a skill gap."""
    skillId: int = Field(..., description="Skill id")
    skillName: str = Field(..., description="Skill name")
    suggestion: str = Field(..., description="Simple suggestion to close the gap")


# PUBLIC_INTERFACE
class GapAnalysisOutput(BaseModel):
    """Output payload for gap analysis."""
    strengths: List[SkillItem] = Field(default_factory=list, description="Skills already meeting or exceeding requirement")
    gaps: List[SkillItem] = Field(default_factory=list, description="Skills missing or below required level")
    recommendations: List[Recommendation] = Field(default_factory=list, description="Auto-generated simple recommendations")


class RoadmapInput(BaseModel):
    """Input payload for roadmap generation based on gaps."""
    gaps: List[SkillItem] = Field(..., description="List of gap skills to generate a roadmap for")


# PUBLIC_INTERFACE
class CytoscapeElement(BaseModel):
    """Cytoscape element representation."""
    data: dict = Field(..., description="Element data block")


# PUBLIC_INTERFACE
class RoadmapOutput(BaseModel):
    """Cytoscape compliant graph output."""
    nodes: List[CytoscapeElement] = Field(..., description="Cytoscape nodes")
    edges: List[CytoscapeElement] = Field(..., description="Cytoscape edges")
