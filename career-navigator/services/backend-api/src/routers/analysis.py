from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..databases.db import get_db
from ..schemas.analysis_schemas import (
    GapAnalysisInput,
    GapAnalysisOutput,
    RoadmapInput,
    RoadmapOutput,
)
from ..services.analysis_service import compute_gap_analysis, build_roadmap

router = APIRouter(tags=["analysis"])


# PUBLIC_INTERFACE
@router.post(
    "/gap-analysis",
    response_model=GapAnalysisOutput,
    summary="Run gap analysis",
    description="Compute strengths and gaps between current and target roles using user progress (anonymous if not provided).",
)
def gap_analysis(payload: GapAnalysisInput, db: Session = Depends(get_db)) -> GapAnalysisOutput:
    """Run the gap analysis and return strengths, gaps, and simple recommendations."""
    # For MVP we use a static 'anonymous' user identifier; frontend can extend later.
    return compute_gap_analysis(db, payload, user_id="anonymous")


# PUBLIC_INTERFACE
@router.post(
    "/roadmap",
    response_model=RoadmapOutput,
    summary="Generate roadmap mind map",
    description="Create a Cytoscape.js compliant graph with nodes and edges to address the given gaps.",
)
def roadmap(payload: RoadmapInput) -> RoadmapOutput:
    """Generate a mind-map graph for the provided gaps."""
    return build_roadmap(payload)
