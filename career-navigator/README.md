# Career Navigator Platform — Full Stack Quick Start

## Overview
This repository contains the complete Career Navigator MVP stack:
- Backend API (FastAPI + Postgres): role/skill framework, gap analysis, roadmap generation, and progress tracking.
- LLM Recommendation Microservice (FastAPI): generates structured learning recommendations per skill.
- Frontend Web App (React): dev-friendly container for local development and verification.
- Infrastructure: docker-compose wiring for local, end-to-end runs.

This guide explains how to run the full stack with Docker Compose, configure environment variables, access services, verify the system health, and use the A–E flows in the UI.

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

## Using the A–E Flows

- A) Role Selection
  - Use the Role Selector widget on pages like Gap Analysis and Progress, or open the “Role Selector” page.
  - Choices persist in localStorage and drive analysis and roadmap generation.

- B) Skill Gap Analysis
  - Go to “Gap Analysis” and run the analysis for your selected roles.
  - The UI shows strengths, gaps, and inline recommendation placeholders.
  - Backend route: POST /gap-analysis (mock fallback enabled on the frontend).

- C) Mind Map (Roadmap) Preview
  - Open “Roadmap” to build a roadmap based on the latest gap analysis.
  - The page renders nodes and edges in a textual preview compatible with future Cytoscape.js integration.

- D) Recommendations
  - Open “Recommendations,” enter a skill and level, and request steps/resources/projects.
  - Calls the recommender service at POST /recommend. If OPENAI_API_KEY is not set on the service, it returns deterministic stubs.

- E) Progress Tracking
  - Go to “Progress” to record your current proficiency using sliders for the target role’s skills.
  - Click “Re-run Analysis” to refresh strengths/gaps based on your latest levels.

The “Connectivity” panel on the Dashboard provides quick checks and indicates whether the app is using mock data.

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
- Additional variables that may appear in the container environment:
  - REACT_APP_API_BASE, REACT_APP_FRONTEND_URL, REACT_APP_WS_URL, REACT_APP_NODE_ENV, REACT_APP_NEXT_TELEMETRY_DISABLED, REACT_APP_ENABLE_SOURCE_MAPS, REACT_APP_PORT, REACT_APP_TRUST_PROXY, REACT_APP_LOG_LEVEL, REACT_APP_HEALTHCHECK_PATH, REACT_APP_FEATURE_FLAGS, REACT_APP_EXPERIMENTS_ENABLED, REACT_APP_OPENAI_API_KEY

## Mock vs Live Behavior

- Live mode:
  - Ensure REACT_APP_BACKEND_URL (or REACT_APP_API_BASE) points to the backend (http://localhost:8000).
  - Ensure REACT_APP_RECOMMENDER_URL points to the recommender (http://localhost:8081).
  - The frontend logs resolved endpoints to the console. If CORS errors occur, allow http://localhost:3000 in the backend.

- Mock mode:
  - If the backend is unreachable or variables are unset, the frontend auto-switches to mock mode.
  - All critical UI flows continue to work with realistic fallback data.

## Service URLs and Health Endpoints
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
  - Health: GET /health → http://localhost:8000/health (returns {"status":"ok"})
- LLM Recommendation: http://localhost:8081
  - Health: GET /health → http://localhost:8081/health (returns {"status":"ok"})

All URLs/ports above match the default mappings in career-navigator/infra/docker-compose.yaml:
- backend-api → "8000:8000"
- llm-recommendation → "8081:8081"
- frontend-dev → "3000:3000"

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
  - Click “Fetch Roles” for GET /roles.
  - Click “Sample Gap Analysis” for POST /gap-analysis.
  - Click “Sample Recommend” for POST /recommend to the LLM service.

## Future Integration Notes

- Cytoscape.js Visualization
  - The frontend already shapes roadmap data as Cytoscape elements (nodes/edges).
  - Replace MindMapView with a Cytoscape.js component to display an interactive graph using the same props.

- O*NET Enrichment
  - Future backends can import O*NET-aligned skills and descriptors.
  - Expose enriched role/skill data via existing endpoints so the current frontend consumes it transparently, with mock mode as fallback.

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
- The frontend includes a Connectivity panel to simplify end-to-end verification during development.
