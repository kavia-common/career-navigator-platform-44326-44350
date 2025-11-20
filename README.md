# career-navigator-platform-44326-44350

## Frontend Env Quick Start

Set one of the following for live backend connectivity:
- REACT_APP_API_BASE=http://localhost:8000
- or REACT_APP_BACKEND_URL=http://localhost:8000

If left empty or unreachable, the frontend automatically switches to mock mode so the UI remains interactive. The console logs the resolved endpoints at startup for troubleshooting. For CORS issues, ensure the backend allows http://localhost:3000.

## End-to-End Flow A–E: Usage Guide

This project’s React frontend implements an end-to-end flow that remains usable even if the backend is not running, thanks to mock fallbacks.

- A) Role Selection
  - Navigate to “Role Selector” or any page with the role selector widget.
  - Choose your current and target roles. Selections are saved to localStorage and used across pages.
  - Source: career_navigation_frontend/src/components/RoleSelector.js, context/AppStateContext.js

- B) Skill Gap Analysis
  - Go to “Gap Analysis” to compute strengths and gaps for the chosen roles.
  - Click “Run Analysis” or rely on the auto-run when both roles are selected.
  - The frontend calls POST /gap-analysis. If the backend is unreachable, a realistic mock result is returned.
  - Source: src/pages/GapAnalysisPage.js, src/api.js (postGapAnalysis)

- C) Mind Map (Roadmap) Preview
  - Open “Roadmap” to generate a roadmap from the latest gap result. The page builds a set of nodes/edges for a Cytoscape-style graph and renders a textual preview.
  - The visual graph is deliberately deferred; current UI lists nodes and edges clearly as a seam for future Cytoscape.js.
  - Source: src/hooks/useMindMap.js, src/components/MindMapView.js, src/pages/RoadmapPage.js

- D) Recommendations
  - Visit “Recommendations”, enter a skill and level, and request guidance. The frontend calls the LLM recommender service (POST /recommend).
  - When OPENAI is not configured for the service, the recommender returns a deterministic stub so the app stays functional.
  - Source: src/hooks/useRecommendations.js, src/api.js (postRecommend), llm-recommendation service

- E) Progress Tracking
  - Go to “Progress” to adjust your current proficiency for skills of the target role using 0–5 sliders. Click “Re-run Analysis” to refresh strengths/gaps using your latest levels.
  - Source: src/components/ProgressTracker.js, src/pages/ProgressPage.js, backend progress routes

The Dashboard’s “Connectivity” panel provides quick checks to confirm the backend and recommender URLs are reachable and shows whether the app is in mock mode.

## Mock vs Live Backend

- Live mode:
  - Set REACT_APP_BACKEND_URL (or REACT_APP_API_BASE) to the FastAPI backend URL (e.g., http://localhost:8000).
  - Optionally set REACT_APP_RECOMMENDER_URL for the LLM recommendation service (e.g., http://localhost:8081).
  - The app logs resolved endpoints in the browser console at startup.

- Mock mode:
  - If the backend is unreachable or no URL is configured, the app switches to mock mode automatically.
  - getRoles, gap analysis, roadmap, progress update, and recommender calls return realistic fallback data so the UI remains fully usable.
  - A visible notice appears in the Connectivity panel indicating mock mode.

## Environment Variables

Frontend (Create React App requires the REACT_APP_ prefix):
- REACT_APP_API_BASE (optional)
- REACT_APP_BACKEND_URL (preferred; optional)
- REACT_APP_RECOMMENDER_URL (optional; defaults to http://localhost:8081)
- REACT_APP_FRONTEND_URL (optional)
- REACT_APP_WS_URL (optional)
- REACT_APP_NODE_ENV (optional)
- REACT_APP_NEXT_TELEMETRY_DISABLED (optional)
- REACT_APP_ENABLE_SOURCE_MAPS (optional)
- REACT_APP_PORT (optional)
- REACT_APP_TRUST_PROXY (optional)
- REACT_APP_LOG_LEVEL (optional)
- REACT_APP_HEALTHCHECK_PATH (optional)
- REACT_APP_FEATURE_FLAGS (optional; JSON or CSV)
- REACT_APP_EXPERIMENTS_ENABLED (optional)
- REACT_APP_OPENAI_API_KEY (not used directly by the browser app; do not expose API keys to the client)

Backend and Recommender
- See career-navigator/README.md for the full stack Compose setup.
- Recommender supports OPENAI_API_KEY and OPENAI_MODEL; without a key it returns deterministic stub recommendations.

## Future Integration Notes

- Cytoscape.js Visualization
  - The roadmap preview intentionally uses a simple textual renderer (MindMapView) while exposing a Cytoscape-style data shape: { nodes: [{data: {...}}], edges: [{data: {...}}] }.
  - To integrate Cytoscape.js later, swap MindMapView with a Cytoscape component and pass the same nodes/edges props. No API changes required.
  - Source references: src/hooks/useMindMap.js, src/components/MindMapView.js

- O*NET (or external taxonomy) Enrichment
  - The role and skill taxonomy currently loads from backend or local JSON fallback.
  - Future work can fetch O*NET-aligned descriptors and levels to enrich both analysis and recommendations.
  - Add a backend adapter to import/normalize O*NET data and expose it via /roles and /skills endpoints; the existing frontend API client will consume the enriched schema without breaking mock mode.