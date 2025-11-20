import React, { useEffect, useState } from "react";
import { useAppState } from "../context/AppStateContext";
import RoleSelector from "../components/RoleSelector";
import GapAnalysisView from "../components/GapAnalysisView";
import { postGapAnalysis } from "../api";

/**
 * PUBLIC_INTERFACE
 * GapAnalysisPage
 * Page composing RoleSelector and GapAnalysisView.
 * Uses existing postGapAnalysis (with automatic mock fallback via api.js)
 * to fetch strengths/gaps and renders inline expandable recommendation placeholders.
 */
export default function GapAnalysisPage() {
  const { selectedCurrentRole, selectedTargetRole } = useAppState();
  const [currentId, setCurrentId] = useState(selectedCurrentRole?.id ?? null);
  const [targetId, setTargetId] = useState(selectedTargetRole?.id ?? null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (selectedCurrentRole?.id) setCurrentId(selectedCurrentRole.id);
  }, [selectedCurrentRole?.id]);
  useEffect(() => {
    if (selectedTargetRole?.id) setTargetId(selectedTargetRole.id);
  }, [selectedTargetRole?.id]);

  const colors = {
    primary: '#1E3A8A',
    secondary: '#F59E0B',
    text: '#111827',
    textMuted: 'rgba(17,24,39,0.7)',
    border: 'rgba(17, 24, 39, 0.10)',
    surface: '#FFFFFF',
    shadow: '0 6px 18px rgba(17,24,39,0.06)',
    error: '#DC2626',
  };

  const card = { background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: 12, boxShadow: colors.shadow, padding: 16 };
  const header = { marginTop: 0, color: colors.primary };
  const btn = { background: colors.primary, color: '#fff', padding: '10px 14px', borderRadius: 10, border: 'none', fontWeight: 600, cursor: 'pointer', boxShadow: '0 3px 10px rgba(30,58,138,0.18)' };
  const lite = { color: colors.textMuted };

  async function runAnalysis() {
    if (!currentId || !targetId) return;
    setLoading(true);
    setErr(null);
    setResult(null);
    try {
      const data = await postGapAnalysis({
        currentRoleId: Number(currentId),
        targetRoleId: Number(targetId),
      });
      setResult(data);
    } catch (e) {
      setErr(e?.uiMessage || e?.message || "Failed to run gap analysis");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Auto-run when both roles are selected
    if (currentId && targetId) {
      runAnalysis();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentId, targetId]);

  return (
    <section>
      <div style={card}>
        <h2 style={header}>Gap Analysis</h2>
        <p style={lite}>
          Choose your roles and run the gap analysis to see strengths and gaps. Recommendations are shown inline per gap.
        </p>
        <div style={{ marginTop: 8 }}>
          <RoleSelector compact />
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
          <button type="button" style={btn} onClick={runAnalysis} disabled={loading || !currentId || !targetId}>
            {loading ? "Running…" : "Run Analysis"}
          </button>
          <div style={{ alignSelf: 'center', color: colors.textMuted, fontSize: 13 }}>
            Current ID: {currentId || '—'} | Target ID: {targetId || '—'}
          </div>
        </div>
        {err && (
          <div role="alert" style={{ marginTop: 10, color: colors.error }}>
            {err}
          </div>
        )}
      </div>

      {result && (
        <div style={{ marginTop: 12, ...card }}>
          <GapAnalysisView
            result={result}
            onRecommendClick={(skill) => {
              // Placeholder for milestone 3: could call recommender service here
              // eslint-disable-next-line no-console
              console.info("Recommend clicked for skill:", skill);
            }}
          />
        </div>
      )}
    </section>
  );
}
