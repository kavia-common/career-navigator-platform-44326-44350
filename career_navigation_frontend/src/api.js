import { getBackendUrl, getRecommenderUrl, getApiBase } from "./config";

/**
 * REST client with diagnostics and graceful mock fallbacks.
 *
 * Features:
 * - Detailed console.error logs on failures (status, body, CORS hints, URL).
 * - Auto "mock mode" when API base is empty or network fails:
 *   - getRoles(): returns realistic role list
 *   - postGapAnalysis(): returns strengths/gaps/recommendations structure
 *   - postRecommend(): returns steps/resources/projects arrays
 * - Friendly error objects for UI with guidance.
 */

// In-memory flag toggled when we detect backend unreachable
let mockMode = false;

// PUBLIC_INTERFACE
export function isMockMode() {
  /** Whether the client is serving mock responses due to connectivity issues. */
  return mockMode || !getApiBase();
}

// Shape a user-friendly error with diagnostics logged to console
function userFacingError(message, detail) {
  const err = new Error(message);
  err.uiMessage = message;
  err.detail = detail;
  return err;
}

// Low-level request with rich diagnostics
async function requestJson(url, options = {}) {
  const start = Date.now();
  try {
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
      // eslint-disable-next-line no-console
      console.error("[API] HTTP error", {
        url,
        method: options.method || "GET",
        status: res.status,
        statusText: res.statusText,
        headers: Object.fromEntries(res.headers.entries()),
        body,
        durationMs: Date.now() - start,
      });
      throw userFacingError(
        `Request failed (HTTP ${res.status}). Check backend URL and CORS.`,
        { url, status: res.status, statusText: res.statusText, body }
      );
    }
    return body;
  } catch (e) {
    // Network/CORS or other unexpected failure
    // eslint-disable-next-line no-console
    console.error("[API] Network or CORS error", {
      url,
      method: options.method || "GET",
      error: e && (e.stack || e.message || String(e)),
      durationMs: Date.now() - start,
      hint:
        "If this is a CORS error, ensure backend allows http://localhost:3000 or use a dev proxy.",
    });
    // Switch to mock mode on fetch failure
    mockMode = true;
    throw userFacingError(
      "Unable to reach backend service. Using mock data when possible.",
      { url, originalError: e }
    );
  }
}

/** Mock payloads used when backend is unreachable */
const mocks = {
  roles: [
    { id: 1, name: "Senior Engineer", description: "Experienced engineer driving delivery." },
    { id: 2, name: "Staff Engineer", description: "Technical leader across teams." },
    { id: 3, name: "Data Analyst", description: "Insights from data for decision making." },
    { id: 4, name: "Product Manager", description: "Owns roadmap and product outcomes." },
  ],
  gapAnalysis: {
    strengths: [
      { id: 101, name: "Python", requiredLevel: 3 },
      { id: 102, name: "APIs", requiredLevel: 3 },
    ],
    gaps: [
      { id: 201, name: "System Design", requiredLevel: 4 },
      { id: 202, name: "Cloud (AWS/GCP/Azure)", requiredLevel: 3 },
    ],
    recommendations: [
      {
        skillId: 201,
        skillName: "System Design",
        suggestion:
          "Study scaling patterns; design a URL shortener with caching and rate limiting.",
      },
      {
        skillId: 202,
        skillName: "Cloud (AWS/GCP/Azure)",
        suggestion:
          "Complete a hands-on module on IAM, networking, and managed databases.",
      },
    ],
  },
  recommend: {
    steps: [
      "Outline core concepts and weak spots; set a 2-week plan.",
      "Take one focused course and practice daily with small drills.",
      "Build a mini feature; get feedback and iterate twice.",
    ],
    resources: [
      "Official docs or guide for intermediate learners.",
      "One curated course matching your level.",
      "Community best-practices repo or blog.",
    ],
    projects: [
      "Implement a small app showcasing fundamentals.",
      "Create a portfolio-ready demo with tests.",
    ],
  },
};

// PUBLIC_INTERFACE
export async function getRoles() {
  /** Fetch the list of roles from the backend or mock when unreachable. */
  const base = getBackendUrl().replace(/\/*$/, "");
  const url = `${base}/roles`;

  // Serve mock if mockMode or api base is empty
  if (isMockMode()) {
    return Promise.resolve(mocks.roles);
  }

  try {
    return await requestJson(url, { method: "GET" });
  } catch (_e) {
    // Fall back to mock data
    return mocks.roles;
  }
}

// PUBLIC_INTERFACE
export async function getRole(id) {
  /** Fetch detailed role information by id, including required skills. */
  const base = getBackendUrl().replace(/\/*$/, "");
  const url = `${base}/roles/${encodeURIComponent(id)}`;
  if (isMockMode()) {
    // Lightweight mock detail with empty required_skills
    return { id, name: "Role (mock)", description: "Mock role detail", required_skills: [] };
  }
  return requestJson(url, { method: "GET" });
}

// PUBLIC_INTERFACE
export async function postGapAnalysis(payload) {
  /**
   * Run gap analysis.
   * payload: { currentRoleId: number, targetRoleId: number }
   */
  const base = getBackendUrl().replace(/\/*$/, "");
  const url = `${base}/gap-analysis`;

  if (isMockMode()) {
    return Promise.resolve(mocks.gapAnalysis);
  }

  try {
    return await requestJson(url, { method: "POST", body: JSON.stringify(payload) });
  } catch (_e) {
    return mocks.gapAnalysis;
  }
}

// PUBLIC_INTERFACE
export async function postRoadmap(payload) {
  /**
   * Generate roadmap for given gaps.
   * payload: { gaps: [{ id, name, requiredLevel }] }
   */
  const base = getBackendUrl().replace(/\/*$/, "");
  const url = `${base}/roadmap`;
  if (isMockMode()) {
    // Simple static mind-map using provided gaps
    const nodes = [
      { data: { id: "current", label: "Current" } },
      { data: { id: "target", label: "Target" } },
      ...(Array.isArray(payload?.gaps)
        ? payload.gaps.map((g) => ({ data: { id: `skill-${g.id}`, label: `${g.name} (req ${g.requiredLevel})` } }))
        : []),
    ];
    const edges = [{ data: { source: "current", target: "target" } }].concat(
      (payload?.gaps || []).map((g) => ({ data: { source: "target", target: `skill-${g.id}` } }))
    );
    return { nodes, edges };
  }
  return requestJson(url, { method: "POST", body: JSON.stringify(payload) });
}

// PUBLIC_INTERFACE
export async function postProgressUpdate(payload) {
  /**
   * Update user progress for a skill.
   * payload: { userId: string, skillId: number, level: number }
   */
  const base = getBackendUrl().replace(/\/*$/, "");
  const url = `${base}/progress/update`;
  if (isMockMode()) {
    return Promise.resolve({ success: true, message: "Progress updated (mock)" });
  }
  return requestJson(url, { method: "POST", body: JSON.stringify(payload) });
}

// PUBLIC_INTERFACE
export async function postRecommend(payload) {
  /**
   * Request LLM-based recommendations.
   * payload: { skillName: string, skillDescription: string, requiredLevel: number }
   */
  const base = getRecommenderUrl().replace(/\/*$/, "");
  const url = `${base}/recommend`;
  if (isMockMode()) {
    return Promise.resolve(mocks.recommend);
  }

  try {
    return await requestJson(url, { method: "POST", body: JSON.stringify(payload) });
  } catch (_e) {
    return mocks.recommend;
  }
}

const api = {
  getRoles,
  getRole,
  postGapAnalysis,
  postRoadmap,
  postProgressUpdate,
  postRecommend,
  isMockMode,
};

export default api;
