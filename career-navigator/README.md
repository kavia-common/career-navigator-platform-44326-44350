# Career Navigator Platform — Full Stack Quick Start

## Overview
This repository contains the complete Career Navigator MVP stack:
- Backend API (FastAPI + Postgres): role/skill framework, gap analysis, roadmap generation, and progress tracking.
- LLM Recommendation Microservice (FastAPI): generates structured learning recommendations per skill.
- Frontend Web App (React): dev-friendly container for local development and verification.
- Infrastructure: docker-compose wiring for local, end-to-end runs.

This guide explains how to run the full stack with Docker Compose, configure environment variables, access services, and verify the system health.

## Prerequisites
- Docker (latest stable)
- Docker Compose (v2+; included with recent Docker Desktop versions)

## Quick Start
1) Start the stack:
- From the repository root:
  cd career-navigator/infra && docker compose up --build

2) Access the services:
- Frontend (React dev server): http://localhost:3000
- Backend API (FastAPI): http://localhost:8000
  - Health: http://localhost:8000/health
- LLM Recommendation Service (FastAPI): http://localhost:8081
  - Health: http://localhost:8081/health

The first boot will build images and start all services. The backend automatically creates tables and seeds data on startup (15+ roles with skills).

## Environment Variables
You can run with the defaults baked into docker-compose.yaml. To override, export variables in your shell before running docker compose up, or edit the compose file’s environment sections.

### Backend API
- DATABASE_URL (optional)
  - Full SQLAlchemy URL (e.g., postgresql+psycopg2://user:pass@host:5432/db).
  - If not provided, the app constructs a URL from the POSTGRES_* variables below.
- POSTGRES_HOST, POSTGRES_PORT, POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD
  - Used to construct the database connection when DATABASE_URL is not set.
  - docker-compose provides defaults: host=postgres, port=5432, db=career_navigator, user=postgres, password=postgres.
- CORS_ALLOW_ORIGINS
  - Comma-separated list of allowed origins. In compose it’s set to http://localhost:3000 for local dev.

### LLM Recommendation Service
- OPENAI_API_KEY (optional)
  - When set, the service uses OpenAI’s Chat Completions API (SDK v1). When absent, it returns deterministic stub recommendations.
- OPENAI_MODEL (optional)
  - Overrides the default model (defaults to gpt-4o-mini).

### Frontend (React dev server)
- REACT_APP_BACKEND_URL
  - Backend API base URL (default in compose: http://localhost:8000).
- REACT_APP_RECOMMENDER_URL
  - LLM Recommendation service base URL (default in compose: http://localhost:8081).

Additional frontend variables present in the container environment (for completeness):
- REACT_APP_API_BASE, REACT_APP_FRONTEND_URL, REACT_APP_WS_URL, REACT_APP_NODE_ENV, REACT_APP_NEXT_TELEMETRY_DISABLED, REACT_APP_ENABLE_SOURCE_MAPS, REACT_APP_PORT, REACT_APP_TRUST_PROXY, REACT_APP_LOG_LEVEL, REACT_APP_HEALTHCHECK_PATH, REACT_APP_FEATURE_FLAGS, REACT_APP_EXPERIMENTS_ENABLED, REACT_APP_OPENAI_API_KEY

## Service URLs and Health Endpoints
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
  - Health: GET /health → http://localhost:8000/health (returns {"status":"ok"})
- LLM Recommendation: http://localhost:8081
  - Health: GET /health → http://localhost:8081/health (returns {"status":"ok"})

## Verification Steps
After docker compose up --build:

1) Verify backend health:
- curl -s http://localhost:8000/health
  Expected: {"status":"ok"}

2) Verify recommender health:
- curl -s http://localhost:8081/health
  Expected: {"status":"ok"}

3) Verify frontend and basic connectivity:
- Open http://localhost:3000 in your browser.
- Use the “Connectivity” panel:
  - Click “Fetch Roles” to confirm the frontend can reach the backend /roles endpoint.
  - Click “Sample Gap Analysis” to trigger POST /gap-analysis.
  - Click “Sample Recommend” to trigger POST /recommend against the LLM service.
  - If OPENAI_API_KEY is not set, the recommender returns a deterministic stub that still satisfies the expected schema.

## Data Persistence and Seeding
- Postgres data is persisted in the Docker volume pgdata.
- On backend startup, tables are created (if not present) and seed data for roles/skills is applied idempotently.
- Stopping and restarting the stack preserves data; remove the pgdata volume to reset.

## Compose Topology (summary)
- postgres: official Postgres 15, exposes 5432, healthchecked, volume-backed.
- backend-api: FastAPI app on port 8000; depends_on healthy postgres; seeds data at startup.
- llm-recommendation: FastAPI app on port 8081; optional OPENAI_API_KEY; falls back to stub if no key is set.
- frontend-dev: Node 18 container running React dev server on port 3000; mounts local frontend sources for live development.

## Troubleshooting
- Ports already in use:
  - Change host port mappings in career-navigator/infra/docker-compose.yaml or stop the process using those ports.
- Frontend cannot fetch roles/recommendations:
  - Ensure backend (8000) and recommender (8081) are healthy (see health checks).
  - Confirm the environment variables REACT_APP_BACKEND_URL and REACT_APP_RECOMMENDER_URL are correct.
- OpenAI-backed recommendations not returning:
  - Export OPENAI_API_KEY in your shell prior to docker compose up, or set it in the compose service environment, then rebuild/restart:
    export OPENAI_API_KEY=sk-...
    cd career-navigator/infra && docker compose up --build

## Project Structure (excerpt)
- career-navigator/
  - infra/
    - docker-compose.yaml
  - services/
    - backend-api/ (FastAPI + Postgres)
    - llm-recommendation/ (FastAPI; OpenAI optional)
    - frontend-web/ (dev-friendly React container)

## Notes
- The backend automatically sets up schema and seed data on first run; no manual migration step is required for the MVP.
- The frontend template includes a Connectivity panel to simplify end-to-end verification during development.
