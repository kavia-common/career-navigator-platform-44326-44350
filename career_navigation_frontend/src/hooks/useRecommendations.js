import { useCallback, useMemo, useRef, useState } from "react";
import { postRecommend, isMockMode } from "../api";

/**
 * PUBLIC_INTERFACE
 * useRecommendations
 * Hook to fetch and cache LLM recommendations for a given skill.
 *
 * Caching key:
 * - Prefer {skillId}:{level} when skillId is provided
 * - Else uses {skillName.toLowerCase().trim()}:{level}
 *
 * API:
 * const {
 *   data,         // { steps, resources, projects } | null
 *   loading,      // boolean
 *   error,        // string | null
 *   getForSkill,  // (params) => Promise<{steps,resources,projects}>
 *   getCached,    // (params) => cached result or null (no network)
 *   hasCached,    // (params) => boolean
 *   clearCache,   // () => void
 * } = useRecommendations();
 */
export default function useRecommendations() {
  const cacheRef = useRef(new Map()); // key -> { data, timestamp }
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  function makeKey({ skillId, skillName, level }) {
    const lvl = Number(level) || 1;
    if (skillId != null) return `id:${String(skillId)}:lvl:${lvl}`;
    const name = (skillName || "").toString().toLowerCase().trim();
    return `name:${name}:lvl:${lvl}`;
  }

  // PUBLIC_INTERFACE
  const hasCached = useCallback((params) => {
    /** Return true if the cache has an entry for the given params. */
    const key = makeKey(params);
    return cacheRef.current.has(key);
  }, []);

  // PUBLIC_INTERFACE
  const getCached = useCallback((params) => {
    /** Return cached data only (no network). */
    const key = makeKey(params);
    const entry = cacheRef.current.get(key);
    return entry ? entry.data : null;
  }, []);

  // PUBLIC_INTERFACE
  const clearCache = useCallback(() => {
    /** Clear all cached recommendation entries. */
    cacheRef.current.clear();
  }, []);

  // PUBLIC_INTERFACE
  const getForSkill = useCallback(
    async ({ skillId = null, skillName, skillDescription = "", level = 1 }) => {
      /**
       * Fetch recommendations for a skill using postRecommend with mock fallback.
       * Returns a normalized object with arrays: steps[3], resources[3], projects[2]
       * Uses cache to avoid duplicate calls for the same skill+level.
       */
      setError(null);
      const key = makeKey({ skillId, skillName, level });

      // Serve from cache if available
      const cached = cacheRef.current.get(key);
      if (cached?.data) {
        setData(cached.data);
        return cached.data;
      }

      // Prepare payload
      const name = skillName || `Skill ${skillId ?? "unknown"}`;
      const payload = {
        skillName: name,
        skillDescription: skillDescription || `Recommendations to reach level ${Number(level) || 1} in ${name}.`,
        requiredLevel: Number(level) || 1,
      };

      setLoading(true);
      try {
        const res = await postRecommend(payload);
        const normalized = {
          steps: Array.isArray(res?.steps) ? res.steps.slice(0, 3) : [],
          resources: Array.isArray(res?.resources) ? res.resources.slice(0, 3) : [],
          projects: Array.isArray(res?.projects) ? res.projects.slice(0, 2) : [],
        };

        // If responses are shorter, pad deterministically (useful in extreme mock states)
        while (normalized.steps.length < 3) {
          normalized.steps.push(`Step ${normalized.steps.length + 1}`);
        }
        while (normalized.resources.length < 3) {
          normalized.resources.push(`Resource ${normalized.resources.length + 1}`);
        }
        while (normalized.projects.length < 2) {
          normalized.projects.push(`Project ${normalized.projects.length + 1}`);
        }

        cacheRef.current.set(key, { data: normalized, timestamp: Date.now() });
        setData(normalized);
        return normalized;
      } catch (e) {
        const message =
          e?.uiMessage ||
          e?.message ||
          (isMockMode() ? "Using mock recommender; failed to resolve response." : "Failed to fetch recommendations");
        setError(message);
        throw e;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const state = useMemo(
    () => ({ data, loading, error, getForSkill, getCached, hasCached, clearCache }),
    [data, loading, error, getForSkill, getCached, hasCached, clearCache]
  );

  return state;
}
