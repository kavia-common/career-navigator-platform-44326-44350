from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from .schemas import RecommendInput, RecommendOutput
from .service import generate_recommendations

app = FastAPI(
    title="Career Navigator - LLM Recommendation Service",
    description=(
        "Generates actionable steps, resources, and practice project ideas for a given skill.\n\n"
        "If OPENAI_API_KEY is provided, integrates with OpenAI Chat Completions API (SDK v1) "
        "and enforces JSON output. Otherwise returns deterministic stub content."
    ),
    version="0.1.0",
    openapi_tags=[
        {"name": "health", "description": "Health and readiness checks"},
        {"name": "recommendations", "description": "LLM-powered recommendations"},
    ],
)

# Enable permissive CORS by default; can be restricted via reverse proxy
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# PUBLIC_INTERFACE
@app.get("/health", tags=["health"], summary="Service health check")
def health() -> dict:
    """Simple liveness endpoint.

    Returns:
        dict: {"status": "ok"} if the service is up.
    """
    return {"status": "ok"}


# PUBLIC_INTERFACE
@app.post(
    "/recommend",
    tags=["recommendations"],
    response_model=RecommendOutput,
    summary="Generate recommendations for a skill",
    description=(
        "Given a skill name, description, and required level (1-5), returns:\n"
        "- 3 actionable steps\n"
        "- 3 learning resources\n"
        "- 2 practice projects\n\n"
        "If OPENAI_API_KEY is set, calls OpenAI for content; otherwise returns deterministic stubs."
    ),
    responses={
        200: {"description": "Structured recommendations JSON."},
        422: {"description": "Validation error."},
    },
)
def recommend(payload: RecommendInput) -> RecommendOutput:
    """Generate structured learning recommendations for the given skill.

    Parameters:
        payload (RecommendInput): Includes skillName, skillDescription, requiredLevel (1-5)

    Returns:
        RecommendOutput: {steps: string[3], resources: string[3], projects: string[2]}
    """
    return generate_recommendations(payload)
