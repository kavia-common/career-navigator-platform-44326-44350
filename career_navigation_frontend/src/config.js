/**
 * Minimal configuration module for the Career Navigator Frontend.
 * Reads environment variables (CRA requires REACT_APP_* prefix) and provides
 * sensible localhost defaults when variables are not set.
 */

// Resolve values from process.env with fallback defaults
const BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL?.trim() ||
  process.env.REACT_APP_API_BASE?.trim() ||
  "http://localhost:8000";

const RECOMMENDER_URL =
  process.env.REACT_APP_RECOMMENDER_URL?.trim() || "http://localhost:8081";

// PUBLIC_INTERFACE
export function getBackendUrl() {
  /** Returns the configured Backend API base URL. */
  return BACKEND_URL;
}

// PUBLIC_INTERFACE
export function getRecommenderUrl() {
  /** Returns the configured LLM Recommendation service base URL. */
  return RECOMMENDER_URL;
}

// PUBLIC_INTERFACE
export const config = {
  /** Backend API base URL */
  BACKEND_URL,
  /** LLM Recommendation service base URL */
  RECOMMENDER_URL,
};

export default config;
