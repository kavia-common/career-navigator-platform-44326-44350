from typing import List, Tuple

from sqlalchemy.orm import Session

from ..models.models import Role, RoleSkill, Skill, UserProgress
from ..schemas.analysis_schemas import (
    GapAnalysisInput,
    GapAnalysisOutput,
    SkillItem,
    Recommendation,
    RoadmapInput,
    RoadmapOutput,
    CytoscapeElement,
)


def _role_required_skill_map(db: Session, role_id: int) -> List[Tuple[Skill, int]]:
    """Return list of (Skill, required_level) for a role."""
    rows = (
        db.query(Skill, RoleSkill.level_required)
        .join(RoleSkill, RoleSkill.skill_id == Skill.id)
        .filter(RoleSkill.role_id == role_id)
        .all()
    )
    return rows


def _user_skill_level(db: Session, user_id: str, skill_id: int) -> int:
    """Return current user level for skill if exists, else 0."""
    up = (
        db.query(UserProgress)
        .filter(UserProgress.user_id == user_id, UserProgress.skill_id == skill_id)
        .first()
    )
    return up.level if up else 0


# PUBLIC_INTERFACE
def compute_gap_analysis(db: Session, payload: GapAnalysisInput, user_id: str = "anonymous") -> GapAnalysisOutput:
    """Compute skill strengths and gaps comparing current role to target role.

    Algorithm:
    For each skill required by target role:
      - if user level (from progress) < required -> gap
      - else -> strength
    Note: If user has no progress record, level defaults to 0 (gap).
    """
    # Validate roles exist
    _ = db.query(Role).filter(Role.id == payload.currentRoleId).first()
    target = db.query(Role).filter(Role.id == payload.targetRoleId).first()
    if target is None:
        return GapAnalysisOutput()  # empty if invalid

    strengths: List[SkillItem] = []
    gaps: List[SkillItem] = []
    recommendations: List[Recommendation] = []

    for skill, required in _role_required_skill_map(db, target.id):
        user_level = _user_skill_level(db, user_id, skill.id)
        item = SkillItem(id=skill.id, name=skill.name, requiredLevel=required)
        if user_level >= required:
            strengths.append(item)
        else:
            gaps.append(item)
            recommendations.append(
                Recommendation(
                    skillId=skill.id,
                    skillName=skill.name,
                    suggestion=f"Increase '{skill.name}' from {user_level} to {required}. Study core concepts and practice projects.",
                )
            )

    return GapAnalysisOutput(strengths=strengths, gaps=gaps, recommendations=recommendations)


# PUBLIC_INTERFACE
def build_roadmap(payload: RoadmapInput, current_label: str = "Current", target_label: str = "Target") -> RoadmapOutput:
    """Generate a simple Cytoscape mind-map based on provided gaps.

    Nodes:
      - current node
      - target node
      - one node per gap skill

    Edges:
      - current -> target
      - target -> each gap skill
    """
    nodes: List[CytoscapeElement] = [
        CytoscapeElement(data={"id": "current", "label": current_label}),
        CytoscapeElement(data={"id": "target", "label": target_label}),
    ]
    edges: List[CytoscapeElement] = [
        CytoscapeElement(data={"source": "current", "target": "target"}),
    ]
    for gap in payload.gaps:
        nid = f"skill-{gap.id}"
        nodes.append(CytoscapeElement(data={"id": nid, "label": f"{gap.name} (req {gap.requiredLevel})"}))
        edges.append(CytoscapeElement(data={"source": "target", "target": nid}))

    return RoadmapOutput(nodes=nodes, edges=edges)
