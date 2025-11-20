# LLM Recommendation Service

## Overview
This FastAPI microservice generates structured learning recommendations for a given skill. It returns three actionable steps, three resources, and two practice projects. When an OpenAI API key is configured, the service uses the OpenAI Chat Completions API (SDK v1) to produce tailored content with strict JSON responses. If no key is provided, it returns a deterministic, non-LLM stub output so the platform remains fully functional in offline or air‑gapped environments.

- Service port: 8081
- Health endpoint: GET /health
- Recommendation endpoint: POST /recommend

## Configuration

### Environment Variables
- OPENAI_API_KEY (optional)
  - When set, the service calls OpenAI’s Chat Completions API.
  - When absent, the service returns a deterministic stub response (no external calls).
- OPENAI_MODEL (optional)
  - Overrides the default OpenAI model used for chat completions.
  - Default: gpt-4o-mini

You can set these in your shell or via docker-compose environment configuration.

### Default and Fallback Behavior
- With OPENAI_API_KEY configured:
  - The service uses OpenAI’s SDK v1 to call the Chat Completions API.
  - It instructs the model to return strict JSON and coerces the output to match the exact schema.
  - If the OpenAI call fails for any reason, the service gracefully falls back to the deterministic stub output.
- Without OPENAI_API_KEY:
  - The service generates deterministic content based on the request (no network calls).
  - This ensures local development, demos, and CI environments work without secrets.

## API

### Health Check
- Method: GET
- Path: /health
- Response:
  - 200 OK
  - Body: {"status": "ok"}

Example:
curl -s http://localhost:8081/health

### Generate Recommendations
- Method: POST
- Path: /recommend
- Request Body:
  - skillName: string
  - skillDescription: string
  - requiredLevel: integer (1–5)
- Successful Response (200):
  - JSON object with fixed sizes:
    - steps: string[3]
    - resources: string[3]
    - projects: string[2]

Example Request:
curl -s -X POST http://localhost:8081/recommend \
  -H "Content-Type: application/json" \
  -d '{
    "skillName": "System Design",
    "skillDescription": "Architecting scalable web services with high availability.",
    "requiredLevel": 4
  }'

Example Response (shape shown; content varies):
{
  "steps": [
    "Map core system components and constraints; define SLAs and data flows.",
    "Practice designing services with caching, queues, and consistent data models.",
    "Review trade-offs (availability, consistency, partitioning) with worked examples."
  ],
  "resources": [
    "System Design Primer (GitHub) — key patterns and case studies",
    "Designing Data-Intensive Applications — chapters on data models and scaling",
    "High Scalability blog — patterns for resilience and performance"
  ],
  "projects": [
    "Design a URL shortener with analytics and rate limiting.",
    "Architect a feed system with fan-out strategies and caching tiers."
  ]
}

Note: If OPENAI_API_KEY is not set, the response will be a deterministic stub following the same schema and fixed list sizes.

## Running with Docker Compose
The infra/docker-compose.yaml already includes a service block for this microservice. You can set environment variables directly there or in your shell before starting.

Snippet from infra/docker-compose.yaml:
llm-recommendation:
  build:
    context: ../services/llm-recommendation
    dockerfile: Dockerfile
  container_name: cn_llm_recommendation
  environment:
    # Optional: set this in your shell or .env before `docker compose up`
    # OPENAI_API_KEY: your_api_key_here
    OPENAI_API_KEY:
    # Optional model override:
    # OPENAI_MODEL: gpt-4o-mini
  ports:
    - "8081:8081"
  networks:
    - appnet

Examples:
- Without OpenAI (stub mode):
  docker compose -f career-navigator/infra/docker-compose.yaml up --build

- With OpenAI:
  export OPENAI_API_KEY=sk-...    # set in your terminal session
  docker compose -f career-navigator/infra/docker-compose.yaml up --build

- With explicit model override:
  export OPENAI_API_KEY=sk-...
  export OPENAI_MODEL=gpt-4o-mini
  docker compose -f career-navigator/infra/docker-compose.yaml up --build

## Local Development (without Docker)
- Install dependencies:
  pip install -r requirements.txt

- Run:
  uvicorn src.main:app --host 0.0.0.0 --port 8081

- Optional:
  export OPENAI_API_KEY=sk-...      # to enable OpenAI-backed responses
  export OPENAI_MODEL=gpt-4o-mini   # to override model

## Frontend Environment Reference
The frontend container declares several REACT_APP_* variables. For this service, the important link is the URL that the frontend uses to call recommendations. In the provided docker compose, the frontend service sets:
- REACT_APP_RECOMMENDER_URL: http://localhost:8081

Ensure the frontend points to this URL for POST /recommend requests.

## Security Notes: Handling API Keys
- Never commit API keys to source control.
- Prefer using environment variables, secrets managers, or Docker/Kubernetes secrets.
- In local development, use a non-committed .env file or shell export. Verify .env is in .gitignore if you create one.
- In CI/CD, store OPENAI_API_KEY as a secret in your pipeline or orchestration platform and inject it at runtime.
- Rotate keys regularly and use per-environment keys where possible.
- Do not expose OPENAI_API_KEY to the browser. The microservice should be the only component that reads this value.

## Implementation Details (for maintainers)
- Language/Framework: Python 3.11, FastAPI, Uvicorn
- LLM client: openai==1.x (SDK v1)
- Model default: gpt-4o-mini (override with OPENAI_MODEL)
- Strict JSON handling:
  - response_format={"type": "json_object"}
  - Additional parsing and coercion to ensure exact schema sizes
- Graceful fallback:
  - Any exception in the OpenAI call returns a deterministic stub
  - If no OPENAI_API_KEY is set, the stub is used by default

## Files of Interest
- src/main.py: FastAPI app and routes
- src/schemas.py: Pydantic models for input/output
- src/service.py: LLM integration, prompt, parsing, and fallback logic
- kavia.yaml: Service definition and optional envs
- Dockerfile: Production-ready image
