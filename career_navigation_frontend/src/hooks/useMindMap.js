import { useCallback, useEffect, useMemo, useState } from "react";
import { postRoadmap, postGapAnalysis } from "../api";

/**
 * PUBLIC_INTERFACE
 * useMindMap
 * Hook to construct a roadmap (nodes/edges for Cytoscape-style graphs) from the current gap analysis.
 *
 * API:
 * const {
 *   gaps,               // the gaps array used for roadmap generation
 *   roadmap,            // { nodes, edges } or null
 *   loading,            // boolean
 *   error,              // string or null
 *   buildFromGaps,      // (gaps) => Promise<void>
 *   ensureFromAnalysis, // ({currentRoleId, targetRoleId, runIfMissing}) => Promise<void>
 * } = useMindMap({ initialGaps })
 *
 * Behavior:
 * - If initialGaps are provided, the hook will build a roadmap automatically on mount.
 * - ensureFromAnalysis(...) can be used to trigger a gap-analysis (if not already done by the page)
 *   and then generate a roadmap from the resulting gaps.
 */
export default function useMindMap({ initialGaps = null } = {}) {
  const [gaps, setGaps] = useState(() => (Array.isArray(initialGaps) ? initialGaps : null));
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // PUBLIC_INTERFACE
  const buildFromGaps = useCallback(async (gapList) => {
    /**
     * Build a roadmap from a given gaps array by calling postRoadmap with mock fallback handled by api.js.
     */
    if (!Array.isArray(gapList) || gapList.length === 0) {
      setRoadmap({ nodes: [], edges: [] });
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const payload = { gaps: gapList.map((g) => ({ id: g.id, name: g.name, requiredLevel: g.requiredLevel })) };
      const data = await postRoadmap(payload);
      setRoadmap({
        nodes: Array.isArray(data?.nodes) ? data.nodes : [],
        edges: Array.isArray(data?.edges) ? data.edges : [],
      });
      setGaps(gapList);
    } catch (e) {
      setError(e?.uiMessage || e?.message || "Failed to build roadmap");
    } finally {
      setLoading(false);
    }
  }, []);

  // PUBLIC_INTERFACE
  const ensureFromAnalysis = useCallback(async ({ currentRoleId, targetRoleId, runIfMissing = true, lastGapResult = null } = {}) => {
    /**
     * Ensure a roadmap exists by:
     * - Using provided lastGapResult (if has gaps), or
     * - If runIfMissing, triggering a gap-analysis and using its gaps.
     */
    const existingGaps =
      (Array.isArray(lastGapResult?.gaps) && lastGapResult.gaps.length ? lastGapResult.gaps : null) ||
      (Array.isArray(gaps) && gaps.length ? gaps : null);

    if (existingGaps) {
      await buildFromGaps(existingGaps);
      return;
    }

    if (!runIfMissing) return;

    if (!currentRoleId || !targetRoleId) {
      setError("Missing role selection to build roadmap.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const ga = await postGapAnalysis({ currentRoleId: Number(currentRoleId), targetRoleId: Number(targetRoleId) });
      const list = Array.isArray(ga?.gaps) ? ga.gaps : [];
      await buildFromGaps(list);
    } catch (e) {
      setError(e?.uiMessage || e?.message || "Failed to compute gaps for roadmap");
    } finally {
      setLoading(false);
    }
  }, [buildFromGaps, gaps]);

  // Auto-build when initialGaps are given
  useEffect(() => {
    if (Array.isArray(initialGaps) && initialGaps.length) {
      buildFromGaps(initialGaps);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const state = useMemo(() => ({ gaps, roadmap, loading, error, buildFromGaps, ensureFromAnalysis }), [
    gaps,
    roadmap,
    loading,
    error,
    buildFromGaps,
    ensureFromAnalysis,
  ]);

  return state;
}
