import { getBackendUrl, getRecommenderUrl } from "./config";

/**
 * Minimal REST client for the Career Navigator frontend.
 * Uses window.fetch, no extra dependencies. Endpoints derive from src/config.js.
 * All functions throw on HTTP errors and return parsed JSON.
 */

// Shared helper to handle fetch and JSON parsing with basic error handling
async function requestJson(url, options = {}) {
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });
  const ct = res.headers.get("content-type") || "";
  const isJson = ct.includes("application/json");
  const body = isJson ? await res.json().catch(() => ({})) : await res.text();
  if (!res.ok) {
    const message = isJson ? (body?.detail || JSON.stringify(body)) : String(body);
    throw new Error(`HTTP ${res.status} ${res.statusText}: ${message}`);
  }
  return body;
}

// PUBLIC_INTERFACE
export async function getRoles() {
  /** Fetch the list of roles from the backend. */
  const base = getBackendUrl().replace(/\/+$/, "");
  const url = `${base}/roles`;
  return requestJson(url, { method: "GET" });
}

// PUBLIC_INTERFACE
export async function getRole(id) {
  /** Fetch detailed role information by id, including required skills. */
  const base = getBackendUrl().replace(/\/+$/, "");
  const url = `${base}/roles/${encodeURIComponent(id)}`;
  return requestJson(url, { method: "GET" });
}

// PUBLIC_INTERFACE
export async function postGapAnalysis(payload) {
  /**
   * Run gap analysis.
   * payload: { currentRoleId: number, targetRoleId: number }
   */
  const base = getBackendUrl().replace(/\/+$/, "");
  const url = `${base}/gap-analysis`;
  return requestJson(url, { method: "POST", body: JSON.stringify(payload) });
}

// PUBLIC_INTERFACE
export async function postRoadmap(payload) {
  /**
   * Generate roadmap for given gaps.
   * payload: { gaps: [{ id, name, requiredLevel }] }
   */
  const base = getBackendUrl().replace(/\/+$/, "");
  const url = `${base}/roadmap`;
  return requestJson(url, { method: "POST", body: JSON.stringify(payload) });
}

// PUBLIC_INTERFACE
export async function postProgressUpdate(payload) {
  /**
   * Update user progress for a skill.
   * payload: { userId: string, skillId: number, level: number }
   */
  const base = getBackendUrl().replace(/\/+$/, "");
  const url = `${base}/progress/update`;
  return requestJson(url, { method: "POST", body: JSON.stringify(payload) });
}

// PUBLIC_INTERFACE
export async function postRecommend(payload) {
  /**
   * Request LLM-based recommendations.
   * payload: { skillName: string, skillDescription: string, requiredLevel: number }
   */
  const base = getRecommenderUrl().replace(/\/+$/, "");
  const url = `${base}/recommend`;
  return requestJson(url, { method: "POST", body: JSON.stringify(payload) });
}

const api = {
  getRoles,
  getRole,
  postGapAnalysis,
  postRoadmap,
  postProgressUpdate,
  postRecommend,
};

export default api;
