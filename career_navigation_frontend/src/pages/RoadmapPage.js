import React, { useEffect, useMemo, useState } from "react";
import { useAppState } from "../context/AppStateContext";
import useMindMap from "../hooks/useMindMap";
import MindMapView from "../components/MindMapView";
import { postGapAnalysis } from "../api";

/**
 * PUBLIC_INTERFACE
 * RoadmapPage
 * Displays a roadmap generated from the most recent gap analysis result.
 * If no gap result is available, the page attempts to run analysis using selected roles.
 */
export default function RoadmapPage() {
  const { selectedCurrentRole, selectedTargetRole } = useAppState();
  const [lastGapResult, setLastGapResult] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);

  const colors = {
    primary: "#1E3A8A",
    secondary: "#F59E0B",
    text: "#111827",
    textMuted: "rgba(17,24,39,0.7)",
    border: "rgba(17, 24, 39, 0.10)",
    surface: "#FFFFFF",
    shadow: "0 6px 18px rgba(17,24,39,0.06)",
    error: "#DC2626",
  };
  const card = { background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: 12, boxShadow: colors.shadow, padding: 16 };
  const header = { marginTop: 0, color: colors.primary };
  const btn = { background: colors.primary, color: "#fff", padding: "10px 14px", borderRadius: 10, border: "none", fontWeight: 600, cursor: "pointer", boxShadow: "0 3px 10px rgba(30,58,138,0.18)" };

  const currentRoleId = selectedCurrentRole?.id ?? null;
  const targetRoleId = selectedTargetRole?.id ?? null;

  const { gaps, roadmap, loading: roadmapLoading, error: roadmapError, ensureFromAnalysis } = useMindMap();

  // Attempt to auto-run analysis and build roadmap when both roles are selected
  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!currentRoleId || !targetRoleId) return;
      setAnalysisError(null);
      setAnalysisLoading(true);
      try {
        const ga = await postGapAnalysis({ currentRoleId: Number(currentRoleId), targetRoleId: Number(targetRoleId) });
        if (!ignore) {
          setLastGapResult(ga);
          await ensureFromAnalysis({ currentRoleId, targetRoleId, runIfMissing: false, lastGapResult: ga });
        }
      } catch (e) {
        if (!ignore) setAnalysisError(e?.uiMessage || e?.message || "Failed to run gap analysis");
      } finally {
        if (!ignore) setAnalysisLoading(false);
      }
    })();
    return () => { ignore = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentRoleId, targetRoleId]);

  const hasRoles = !!currentRoleId && !!targetRoleId;
  const autoMessage = useMemo(() => {
    if (!hasRoles) return "Select your current and target roles first to generate a roadmap.";
    if (analysisLoading || roadmapLoading) return "Generating roadmap…";
    return null;
  }, [hasRoles, analysisLoading, roadmapLoading]);

  return (
    <section>
      <div style={card}>
        <h2 style={header}>Roadmap</h2>
        <p style={{ color: colors.textMuted, marginTop: -8 }}>
          A structured view of how to progress from your current role to the target role. This preview lists nodes and edges; a visual graph can be connected later.
        </p>
        <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
          <div style={{ alignSelf: "center", color: colors.textMuted, fontSize: 13 }}>
            Current: {selectedCurrentRole?.name || "—"} | Target: {selectedTargetRole?.name || "—"}
          </div>
          <button
            type="button"
            style={btn}
            onClick={() => ensureFromAnalysis({ currentRoleId, targetRoleId, runIfMissing: true, lastGapResult })}
            disabled={!hasRoles || analysisLoading || roadmapLoading}
          >
            {analysisLoading || roadmapLoading ? "Building…" : "Rebuild Roadmap"}
          </button>
        </div>
        {(!hasRoles || autoMessage) && (
          <div style={{ marginTop: 10, color: colors.textMuted, fontSize: 14 }}>
            {autoMessage || "Ready to build when roles are selected."}
          </div>
        )}
        {(analysisError || roadmapError) && (
          <div role="alert" style={{ marginTop: 10, color: colors.error }}>
            {analysisError || roadmapError}
          </div>
        )}
      </div>

      <div style={{ marginTop: 12 }}>
        <MindMapView nodes={roadmap?.nodes || []} edges={roadmap?.edges || []} />
      </div>
    </section>
  );
}
