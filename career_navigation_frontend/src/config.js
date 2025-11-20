"use strict";

/**
 * Minimal configuration module for the Career Navigator Frontend.
 * Reads environment variables (CRA requires REACT_APP_* prefix) and provides
 * sensible defaults when variables are not set.
 *
 * Enhancements:
 * - getApiBase(): pick first non-empty of REACT_APP_API_BASE, REACT_APP_BACKEND_URL, falling back to window.location.origin.
 * - getWsBase(): resolve REACT_APP_WS_URL or derive from API origin.
 * - Logs resolved values at module load to aid diagnosing "Failed to fetch".
 */

// Normalize base URL by removing trailing slashes
function normalizeBase(u) {
  if (!u) return "";
  return String(u).replace(/\/*$/, "");
}

function safeEnv(name) {
  const v = process.env[name];
  return typeof v === "string" ? v.trim() : "";
}

// PUBLIC_INTERFACE
export function getApiBase() {
  /** Returns resolved Backend API base URL with sane default. */
  const fromApiBase = safeEnv("REACT_APP_API_BASE");
  const fromBackend = safeEnv("REACT_APP_BACKEND_URL");
  const resolved =
    fromApiBase ||
    fromBackend ||
    (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");
  return normalizeBase(resolved);
}

// PUBLIC_INTERFACE
export function getBackendUrl() {
  /** Back-compat alias for API base. */
  return getApiBase();
}

// PUBLIC_INTERFACE
export function getRecommenderUrl() {
  /** Returns the configured LLM Recommendation service base URL. */
  const recommender = safeEnv("REACT_APP_RECOMMENDER_URL") || "http://localhost:8081";
  return normalizeBase(recommender);
}

// PUBLIC_INTERFACE
export function getWsBase() {
  /** Returns the configured WebSocket URL base (if any). */
  const fromEnv = safeEnv("REACT_APP_WS_URL");
  if (fromEnv) return normalizeBase(fromEnv);
  try {
    const api = new URL(getApiBase());
    const wsProto = api.protocol === "https:" ? "wss:" : "ws:";
    return normalizeBase(`${wsProto}//${api.host}`);
  } catch {
    return "";
  }
}

// Log resolved runtime configuration once for diagnostics
(function logRuntimeConfig() {
  const info = {
    NODE_ENV: process.env.NODE_ENV,
    REACT_APP_NODE_ENV: safeEnv("REACT_APP_NODE_ENV"),
    REACT_APP_API_BASE: safeEnv("REACT_APP_API_BASE") || "(empty)",
    REACT_APP_BACKEND_URL: safeEnv("REACT_APP_BACKEND_URL") || "(empty)",
    REACT_APP_RECOMMENDER_URL: safeEnv("REACT_APP_RECOMMENDER_URL") || "(empty)",
    REACT_APP_WS_URL: safeEnv("REACT_APP_WS_URL") || "(empty)",
    resolvedApiBase: getApiBase(),
    resolvedRecommenderBase: getRecommenderUrl(),
    resolvedWsBase: getWsBase() || "(empty)",
    sameOrigin: typeof window !== "undefined" ? window.location.origin : "(no window)",
  };
  // eslint-disable-next-line no-console
  console.info("[RuntimeConfig] Resolved API endpoints:", info);
  // eslint-disable-next-line no-console
  console.info("[RuntimeConfig] Active API base:", info.resolvedApiBase);
})();

// PUBLIC_INTERFACE
export const config = {
  /** Backend API base URL */
  BACKEND_URL: getApiBase(),
  /** LLM Recommendation service base URL */
  RECOMMENDER_URL: getRecommenderUrl(),
  /** WS base (if used) */
  WS_BASE: getWsBase(),
};

export default config;
