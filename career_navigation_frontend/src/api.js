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
    // IC: Software Engineering track
    { id: 1, name: "Junior Software Engineer", description: "Entry-level engineer focusing on feature implementation and learning best practices.", track: "IC: Software Engineering", seq: 1 },
    { id: 2, name: "Software Engineer", description: "Builds features, writes tests, and participates in code reviews.", track: "IC: Software Engineering", seq: 2 },
    { id: 3, name: "Senior Software Engineer", description: "Experienced engineer driving delivery and mentoring others.", track: "IC: Software Engineering", seq: 3 },
    { id: 4, name: "Staff Engineer", description: "Technical leader across teams and complex initiatives.", track: "IC: Software Engineering", seq: 4 },
    { id: 5, name: "Principal Engineer", description: "Sets technical direction, standards, and cross-org architecture.", track: "IC: Software Engineering", seq: 5 },

    // Leadership: Engineering track
    { id: 101, name: "Software Engineer", description: "Builds features, writes tests, and participates in code reviews.", track: "Leadership: Engineering", seq: 1 },
    { id: 102, name: "Senior Software Engineer", description: "Experienced engineer driving delivery and mentoring others.", track: "Leadership: Engineering", seq: 2 },
    { id: 103, name: "Tech Lead", description: "Owns technical delivery, quality, and cross-team coordination.", track: "Leadership: Engineering", seq: 3 },
    { id: 104, name: "Engineering Manager", description: "Leads teams and delivery; grows people and processes.", track: "Leadership: Engineering", seq: 4 },
    { id: 105, name: "Director of Engineering", description: "Owns a group/portfolio; strategy, planning, and outcomes.", track: "Leadership: Engineering", seq: 5 },

    // IC: Advanced Engineering
    { id: 201, name: "Senior Software Engineer", description: "Experienced engineer driving delivery and mentoring others.", track: "IC: Advanced Engineering", seq: 1 },
    { id: 202, name: "Staff Engineer", description: "Technical leader across teams and complex initiatives.", track: "IC: Advanced Engineering", seq: 2 },
    { id: 203, name: "Principal Engineer", description: "Sets technical direction, standards, and cross-org architecture.", track: "IC: Advanced Engineering", seq: 3 },
    { id: 204, name: "Distinguished Engineer / Fellow", description: "Rare expert setting long-term technical vision and innovation.", track: "IC: Advanced Engineering", seq: 4 },

     // Frontend
    { id: 301, name: "Frontend Developer", description: "Builds UI components, accessibility, and frontend features.", track: "Frontend", seq: 1 },
    { id: 302, name: "Senior Frontend Developer", description: "Leads complex UI delivery and frontend best practices.", track: "Frontend", seq: 2 },
    { id: 303, name: "Frontend Lead", description: "Owns frontend architecture and team practices.", track: "Frontend", seq: 3 },
    { id: 304, name: "UI Engineering Manager", description: "Leads UI engineering team and cross-functional delivery.", track: "Frontend", seq: 4 },

    // Backend
    { id: 401, name: "Backend Developer", description: "Builds APIs, services, and scalable backend systems.", track: "Backend", seq: 1 },
    { id: 402, name: "Senior Backend Developer", description: "Leads backend delivery and reliability improvements.", track: "Backend", seq: 2 },
    { id: 403, name: "Backend Lead", description: "Owns backend architecture and platform direction.", track: "Backend", seq: 3 },
    { id: 404, name: "Platform Architect", description: "Designs platform capabilities, standards, and evolution.", track: "Backend", seq: 4 },

    // Full-Stack
    { id: 501, name: "Full-Stack Developer", description: "Delivers across frontend and backend with quality.", track: "Full-Stack", seq: 1 },
    { id: 502, name: "Senior Full-Stack Developer", description: "Leads end-to-end delivery and system-level decisions.", track: "Full-Stack", seq: 2 },
    { id: 503, name: "Solutions Architect", description: "Designs cross-system solutions aligned to business needs.", track: "Full-Stack", seq: 3 },
    { id: 504, name: "Engineering Manager", description: "Leads teams and delivery; grows people and processes.", track: "Full-Stack", seq: 4 },

    // DevOps / Cloud
    { id: 601, name: "DevOps Engineer", description: "Automates pipelines, observability, and platform operations.", track: "DevOps/Cloud", seq: 1 },
    { id: 602, name: "Senior DevOps Engineer", description: "Leads DevOps practices, reliability, and scalability.", track: "DevOps/Cloud", seq: 2 },
    { id: 603, name: "DevOps Lead", description: "Owns DevOps strategy and platform direction.", track: "DevOps/Cloud", seq: 3 },
    { id: 604, name: "Head of Cloud / Cloud Architect", description: "Directs cloud strategy, architecture, and operations.", track: "DevOps/Cloud", seq: 4 },

    // Cloud
    { id: 701, name: "Cloud Engineer", description: "Implements infra as code, CI/CD, and cloud services.", track: "Cloud", seq: 1 },
    { id: 702, name: "Senior Cloud Engineer", description: "Leads cloud migrations, scaling, and reliability.", track: "Cloud", seq: 2 },
    { id: 703, name: "Cloud Architect", description: "Owns cloud architecture and governance.", track: "Cloud", seq: 3 },
    { id: 704, name: "Chief Cloud Officer (CCO)", description: "Exec-level leadership for cloud strategy and operations.", track: "Cloud", seq: 4 },

    // Data Engineering
    { id: 801, name: "Data Engineer", description: "Builds data pipelines, warehousing, and reliability.", track: "Data Engineering", seq: 1 },
    { id: 802, name: "Senior Data Engineer", description: "Leads data platform capabilities and scalability.", track: "Data Engineering", seq: 2 },
    { id: 803, name: "Data Architect", description: "Owns data architecture, modeling, and governance.", track: "Data Engineering", seq: 3 },
    { id: 804, name: "Head of Data Engineering", description: "Leads data engineering org and portfolio.", track: "Data Engineering", seq: 4 },

    // Data Science
    { id: 901, name: "Data Scientist", description: "Builds models, experiments, and decision support.", track: "Data Science", seq: 1 },
    { id: 902, name: "Senior Data Scientist", description: "Leads DS projects; MLOps, experimentation at scale.", track: "Data Science", seq: 2 },
    { id: 903, name: "Lead Data Scientist", description: "Owns DS practice area and technical direction.", track: "Data Science", seq: 3 },
    { id: 904, name: "Director of Data Science / Chief Data Officer", description: "Exec ownership of data science strategy and outcomes.", track: "Data Science", seq: 4 },

    // Machine Learning
    { id: 1001, name: "Machine Learning Engineer", description: "Productionizes ML models; pipelines, serving, monitoring.", track: "Machine Learning", seq: 1 },
    { id: 1002, name: "Senior ML Engineer", description: "Leads ML engineering and reliability improvements.", track: "Machine Learning", seq: 2 },
    { id: 1003, name: "ML Architect", description: "Owns ML architecture and platform direction.", track: "Machine Learning", seq: 3 },
    { id: 1004, name: "AI Director / Head of AI", description: "Directs AI strategy, initiatives, and operations.", track: "Machine Learning", seq: 4 },

    // Quality Engineering
    { id: 1101, name: "QA Engineer", description: "Designs test cases, executes manual/automation tests.", track: "Quality Engineering", seq: 1 },
    { id: 1102, name: "Senior QA Engineer", description: "Leads quality strategy and automation frameworks.", track: "Quality Engineering", seq: 2 },
    { id: 1103, name: "QA Lead", description: "Owns quality for a product area; coordinates releases.", track: "Quality Engineering", seq: 3 },
    { id: 1104, name: "QA Manager / Director of Quality Engineering", description: "Leads QE organization, strategy, and outcomes.", track: "Quality Engineering", seq: 4 },

    // Security
    { id: 1201, name: "Security Engineer", description: "Builds security controls, tooling, and remediation.", track: "Security", seq: 1 },
    { id: 1202, name: "Senior Security Engineer", description: "Leads security initiatives and cross-team risk reduction.", track: "Security", seq: 2 },
    { id: 1203, name: "Security Architect", description: "Defines security architecture and governance.", track: "Security", seq: 3 },
    { id: 1204, name: "CISO (Chief Information Security Officer)", description: "Exec-level security leadership and risk management.", track: "Security", seq: 4 },

    // Architecture
    { id: 1301, name: "Solutions Architect", description: "Designs solutions aligning with business needs and constraints.", track: "Architecture", seq: 1 },
    { id: 1302, name: "Lead Solutions Architect", description: "Leads solution design across programs.", track: "Architecture", seq: 2 },
    { id: 1303, name: "Enterprise Architect", description: "Owns enterprise architecture and standards.", track: "Architecture", seq: 3 },
    { id: 1304, name: "Chief Architect", description: "Sets org-wide architecture vision and governance.", track: "Architecture", seq: 4 },
    { id: 1305, name: "CTO", description: "Exec-level technology strategy, innovation, and org alignment.", track: "Architecture", seq: 5 },

    // Product Management
    { id: 1401, name: "Product Manager", description: "Owns roadmap, discovery, and outcomes.", track: "Product Management", seq: 1 },
    { id: 1402, name: "Senior PM", description: "Leads product strategy and cross-functional delivery.", track: "Product Management", seq: 2 },
    { id: 1403, name: "Lead PM", description: "Owns a product area and leads PM practices.", track: "Product Management", seq: 3 },
    { id: 1404, name: "Director of Product", description: "Owns product portfolio strategy and outcomes.", track: "Product Management", seq: 4 },
    { id: 1405, name: "VP Product", description: "Leads product org and multi-portfolio strategy.", track: "Product Management", seq: 5 },
    { id: 1406, name: "CPO", description: "Exec-level product leadership and vision.", track: "Product Management", seq: 6 }
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
    // Rich mock detail with representative required_skills and nested sub_skills
    const mockDetail = {
      id,
      name: "Senior Software Engineer (mock)",
      description:
        "Experienced engineer responsible for end-to-end feature delivery, code quality, and mentoring.",
      required_skills: [
        {
          skill_id: 100,
          skill_name: "Programming: JavaScript/TypeScript",
          level_required: 3,
          sub_skills: [
            "ES2020+ features",
            "TypeScript generics and utility types",
            "Async patterns (Promises, async/await)",
            "Linting and formatting workflows",
          ],
        },
        {
          skill_id: 101,
          skill_name: "Frontend: React Ecosystem",
          level_required: 3,
          sub_skills: [
            "React hooks and context",
            "Performance optimizations (memo, suspense basics)",
            "State management patterns",
            "Accessibility (ARIA, keyboard nav)",
          ],
        },
        {
          skill_id: 102,
          skill_name: "Backend: APIs",
          level_required: 3,
          sub_skills: [
            "REST design and pagination",
            "Authentication and authorization basics",
            "Error handling and observability",
          ],
        },
        {
          skill_id: 103,
          skill_name: "Architecture: System Design",
          level_required: 4,
          sub_skills: [
            "Caching, rate limiting",
            "Scalability and reliability patterns",
            "Data modeling and trade-offs",
          ],
        },
        {
          skill_id: 104,
          skill_name: "Cloud: AWS/GCP/Azure",
          level_required: 3,
          sub_skills: [
            "IAM and networking fundamentals",
            "Managed databases and storage",
            "CI/CD pipelines",
          ],
        },
        {
          skill_id: 105,
          skill_name: "Collaboration: Communication & Mentoring",
          level_required: 3,
          sub_skills: [
            "Code reviews and feedback",
            "Technical documentation",
            "Pairing and mentoring juniors",
          ],
        },
      ],
    };
    return mockDetail;
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
