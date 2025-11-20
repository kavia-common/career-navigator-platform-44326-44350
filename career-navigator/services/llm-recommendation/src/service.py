import json
import os
import re
from typing import Dict, Any

from .schemas import RecommendInput, RecommendOutput


def _coerce_to_output(data: Dict[str, Any]) -> RecommendOutput:
    """Ensure dict has exactly the required fields and sizes, filling with defaults if needed."""
    def _list_of_strings(name: str, want: int) -> list[str]:
        items = data.get(name) or []
        items = [str(x).strip() for x in items if str(x).strip()]
        # pad deterministically if shorter
        while len(items) < want:
            items.append(f"{name.capitalize()} item {len(items)+1}")
        # trim to exact size
        return items[:want]

    return RecommendOutput(
        steps=_list_of_strings("steps", 3),
        resources=_list_of_strings("resources", 3),
        projects=_list_of_strings("projects", 2),
    )


def _build_prompt(payload: RecommendInput) -> str:
    """Return strict system+user instruction content guiding the model to JSON only."""
    return (
        "You are a precise career coach. Respond with STRICT JSON only, no commentary.\n"
        "Schema:\n"
        "{\n"
        '  "steps": string[3],\n'
        '  "resources": string[3],\n'
        '  "projects": string[2]\n'
        "}\n"
        "Rules:\n"
        "- Output must be valid JSON. No code fences. No keys other than steps, resources, projects.\n"
        "- Each item must be concise, actionable, and specific.\n"
        f"- Skill: {payload.skillName}\n"
        f"- Description: {payload.skillDescription}\n"
        f"- Target level (1-5): {payload.requiredLevel}\n"
    )


def _try_parse_json(text: str) -> Dict[str, Any]:
    """Attempt to parse JSON from model output, stripping any accidental code fences or extra text."""
    # Strip common code fences/backticks
    cleaned = re.sub(r"^```(?:json)?\s*|\s*```$", "", text.strip(), flags=re.IGNORECASE | re.MULTILINE)
    # Attempt direct parse
    try:
        return json.loads(cleaned)
    except Exception:
        # Try to locate the first and last curly brace block as a fallback
        m = re.search(r"\{.*\}", cleaned, flags=re.DOTALL)
        if m:
            try:
                return json.loads(m.group(0))
            except Exception:
                pass
        # Fallback empty dict
        return {}


def _stub_response(payload: RecommendInput) -> RecommendOutput:
    """Deterministic stub output when OPENAI_API_KEY is not configured."""
    base = payload.skillName
    level = payload.requiredLevel
    steps = [
        f"Study the {base} core concepts aligned to level {level}. Summarize key principles in your own words.",
        f"Practice {base} with 30–60 minutes daily drills focusing on weak areas relevant to level {level}.",
        f"Build a small {base}-focused feature and solicit feedback; iterate twice to improve quality."
    ]
    resources = [
        f"Official {base} documentation or guide (start-to-advanced sections focused on level {level}).",
        f"One curated course/tutorial on {base} targeting intermediate learners.",
        f"Community resource: a reputable blog or GitHub repo with {base} best practices."
    ]
    projects = [
        f"Implement a mini project demonstrating {base} fundamentals and one advanced concept.",
        f"Create a portfolio-ready demo that showcases {base} at level {level} with tests and docs."
    ]
    return RecommendOutput(steps=steps, resources=resources, projects=projects)


# PUBLIC_INTERFACE
def generate_recommendations(payload: RecommendInput) -> RecommendOutput:
    """Generate recommendations using OpenAI if configured; otherwise return deterministic stubs.

    Uses environment variable:
      - OPENAI_API_KEY: If set, calls OpenAI Chat Completions API (SDK v1) with JSON-only guardrails.

    Returns:
        RecommendOutput: structured steps, resources, projects
    """
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return _stub_response(payload)

    try:
        # Lazy import to avoid dependency overhead if not used
        from openai import OpenAI  # type: ignore
        client = OpenAI(api_key=api_key)

        system_content = (
            "You are a precise career coach who ONLY returns valid JSON per the user's schema. "
            "No explanations or extra keys. Keep items brief and actionable."
        )
        user_content = _build_prompt(payload)

        resp = client.chat.completions.create(
            model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
            temperature=0.2,
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": system_content},
                {"role": "user", "content": user_content},
            ],
        )
        text = resp.choices[0].message.content or "{}"
        data = _try_parse_json(text)
        return _coerce_to_output(data)
    except Exception:
        # Never fail the request due to LLM issues; provide graceful fallback.
        return _stub_response(payload)
