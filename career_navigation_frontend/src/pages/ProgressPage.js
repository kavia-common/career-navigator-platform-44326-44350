import React, { useCallback, useEffect, useState } from "react";
import { useAppState } from "../context/AppStateContext";
import RoleSelector from "../components/RoleSelector";
import ProgressTracker from "../components/ProgressTracker";
import { postGapAnalysis } from "../api";

/**
 * PUBLIC_INTERFACE
 * ProgressPage
 * Page that presents the skills for the selected target role with 0–5 sliders and a "Re-run Analysis" CTA.
 * Persists userProgress by calling postProgressUpdate via ProgressTracker and can refresh the last gap analysis result.
 */
export default function ProgressPage() {
  const { selectedCurrentRole, selectedTargetRole } = useAppState();
  const [userId, setUserId] = useState("anonymous");

  const [lastGapResult, setLastGapResult] = useState(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
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
    success: "#059669",
  };
  const card = { background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: 12, boxShadow: colors.shadow, padding: 16 };
  const header = { marginTop: 0, color: colors.primary };
  const btn = { background: colors.primary, color: "#fff", padding: "10px 14px", borderRadius: 10, border: "none", fontWeight: 600, cursor: "pointer", boxShadow: "0 3px 10px rgba(30,58,138,0.18)" };
  const btnAlt = { background: colors.secondary, color: "#111827", padding: "10px 14px", borderRadius: 10, border: "none", fontWeight: 700, cursor: "pointer", boxShadow: "0 3px 10px rgba(245,158,11,0.22)" };

  const currentRoleId = selectedCurrentRole?.id ?? null;
  const targetRoleId = selectedTargetRole?.id ?? null;

  const runAnalysis = useCallback(async () => {
    if (!currentRoleId || !targetRoleId) return;
    setLoadingAnalysis(true);
    setAnalysisError(null);
    try {
      const result = await postGapAnalysis({
        currentRoleId: Number(currentRoleId),
        targetRoleId: Number(targetRoleId),
      });
      setLastGapResult(result);
    } catch (e) {
      setAnalysisError(e?.uiMessage || e?.message || "Failed to run gap analysis");
    } finally {
      setLoadingAnalysis(false);
    }
  }, [currentRoleId, targetRoleId]);

  // Auto-run once when both roles are set, to have an initial baseline
  useEffect(() => {
    if (currentRoleId && targetRoleId && !lastGapResult) {
      runAnalysis();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentRoleId, targetRoleId]);

  return (
    <section>
      <div style={card}>
        <h2 style={header}>Progress Tracking</h2>
        <p style={{ color: colors.textMuted, marginTop: -8 }}>
          Adjust your current skill levels for your chosen target role. Use "Re-run Analysis" to refresh your strengths and gaps based on the latest progress.
        </p>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
          <div style={{ alignSelf: "center", color: colors.textMuted, fontSize: 13 }}>
            Current: {selectedCurrentRole?.name || "—"} | Target: {selectedTargetRole?.name || "—"}
          </div>
          <label style={{ alignSelf: "center", fontSize: 13, color: colors.textMuted }}>
            User ID:{" "}
            <input
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              style={{ marginLeft: 6, padding: "6px 8px", borderRadius: 8, border: `1px solid ${colors.border}` }}
            />
          </label>
          <button type="button" style={btn} onClick={runAnalysis} disabled={!currentRoleId || !targetRoleId || loadingAnalysis}>
            {loadingAnalysis ? "Analyzing…" : "Re-run Analysis"}
          </button>
        </div>

        <RoleSelector compact />

        {analysisError && (
          <div role="alert" style={{ color: colors.error, marginTop: 8 }}>
            {analysisError}
          </div>
        )}
      </div>

      <div style={{ marginTop: 12 }}>
        <ProgressTracker
          userId={userId}
          onProgressChanged={() => {
            // Optionally we could auto-run analysis on each change; keep it manual to avoid noise.
          }}
        />
      </div>

      <div style={{ marginTop: 12, ...card }}>
        <h3 style={header}>Latest Gap Summary</h3>
        {loadingAnalysis && <div>Computing analysis…</div>}
        {!loadingAnalysis && lastGapResult && (
          <div style={{ color: colors.textMuted }}>
            <div>Strengths: <strong>{Array.isArray(lastGapResult?.strengths) ? lastGapResult.strengths.length : 0}</strong></div>
            <div>Gaps: <strong>{Array.isArray(lastGapResult?.gaps) ? lastGapResult.gaps.length : 0}</strong></div>
            <div style={{ marginTop: 6, fontSize: 13 }}>
              Sample recommendations:
              <ul style={{ margin: "6px 0 0 18px" }}>
                {(lastGapResult?.recommendations || []).slice(0, 3).map((r, i) => (
                  <li key={i}>{r?.suggestion || JSON.stringify(r)}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
        {!loadingAnalysis && !lastGapResult && (
          <div style={{ color: colors.textMuted }}>Run the analysis to see an updated summary of your progress.</div>
        )}
        <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
          <button type="button" style={btnAlt} onClick={runAnalysis} disabled={!currentRoleId || !targetRoleId || loadingAnalysis}>
            {loadingAnalysis ? "Refreshing…" : "Re-run Analysis"}
          </button>
        </div>
      </div>
    </section>
  );
}
