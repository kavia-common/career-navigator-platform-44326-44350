import React, { useMemo, useState } from "react";

/**
 * PUBLIC_INTERFACE
 * GapAnalysisView
 * Renders strengths and gaps columns from a gap-analysis result and shows inline
 * expandable RecommendationCard placeholders for each gap.
 *
 * Props:
 * - result: {
 *     strengths: [{ id, name, requiredLevel }],
 *     gaps: [{ id, name, requiredLevel }],
 *     recommendations?: [{ skillId, skillName, suggestion }]
 *   }
 * - onRecommendClick?: (skill) => void // optional callback when expanding a recommendation
 */
export default function GapAnalysisView({ result, onRecommendClick }) {
  const strengths = useMemo(() => Array.isArray(result?.strengths) ? result.strengths : [], [result]);
  const gaps = useMemo(() => Array.isArray(result?.gaps) ? result.gaps : [], [result]);
  const recs = useMemo(
    () => (Array.isArray(result?.recommendations) ? result.recommendations : []),
    [result]
  );

  // Track expand state per gap skill id
  const [expanded, setExpanded] = useState({});

  const colors = {
    primary: '#1E3A8A',
    secondary: '#F59E0B',
    success: '#059669',
    error: '#DC2626',
    text: '#111827',
    textMuted: 'rgba(17,24,39,0.7)',
    border: 'rgba(17, 24, 39, 0.10)',
    surface: '#FFFFFF',
    shadow: '0 6px 18px rgba(17,24,39,0.06)',
  };

  const wrap = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 };
  const col = { background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: 12, boxShadow: colors.shadow, padding: 16 };
  const header = { marginTop: 0, color: colors.primary };
  const tag = (bg, color) => ({ display: 'inline-block', padding: '2px 8px', borderRadius: 999, fontSize: 12, background: bg, color });
  const list = { listStyle: 'none', paddingLeft: 0, margin: 0, display: 'grid', gap: 8 };

  const item = { border: `1px solid ${colors.border}`, borderRadius: 10, padding: 12, background: '#fff' };
  const gapHeader = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 };
  const btnSmall = { background: colors.secondary, color: '#111827', padding: '6px 10px', borderRadius: 10, border: 'none', fontWeight: 700, fontSize: 12, cursor: 'pointer', boxShadow: '0 2px 8px rgba(245,158,11,0.25)' };

  function toggleExpand(id) {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function findRecForSkill(skillId) {
    return recs.find((r) => String(r.skillId) === String(skillId));
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
        <div style={tag('rgba(5,150,105,0.10)', '#065F46')}>Strengths: {strengths.length}</div>
        <div style={tag('rgba(220,38,38,0.08)', '#991B1B')}>Gaps: {gaps.length}</div>
      </div>

      <div style={wrap}>
        <section style={col} aria-label="Strengths">
          <h3 style={header}>Strengths</h3>
          <ul style={list}>
            {strengths.length === 0 && <li style={{ color: colors.textMuted }}>No strengths detected yet.</li>}
            {strengths.map((s) => (
              <li key={s.id} style={item}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                  <strong>{s.name}</strong>
                  <span style={{ color: colors.textMuted, fontSize: 12 }}>Req: {s.requiredLevel}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section style={col} aria-label="Gaps">
          <h3 style={header}>Gaps</h3>
          <ul style={list}>
            {gaps.length === 0 && <li style={{ color: colors.textMuted }}>No gaps detected — great job!</li>}
            {gaps.map((g) => {
              const isOpen = !!expanded[g.id];
              const rec = findRecForSkill(g.id);
              return (
                <li key={g.id} style={item}>
                  <div style={gapHeader}>
                    <div>
                      <strong>{g.name}</strong>
                      <div style={{ color: colors.textMuted, fontSize: 12 }}>Required level: {g.requiredLevel}</div>
                    </div>
                    <button
                      type="button"
                      style={btnSmall}
                      onClick={() => {
                        toggleExpand(g.id);
                        if (!isOpen && typeof onRecommendClick === 'function') onRecommendClick(g);
                      }}
                      aria-expanded={isOpen}
                      aria-controls={`rec-${g.id}`}
                    >
                      {isOpen ? 'Hide' : 'Show'} Recommendation
                    </button>
                  </div>
                  {isOpen && (
                    <div
                      id={`rec-${g.id}`}
                      style={{
                        marginTop: 10,
                        background: 'rgba(245,158,11,0.06)',
                        border: '1px dashed rgba(245,158,11,0.35)',
                        borderRadius: 10,
                        padding: 10,
                      }}
                    >
                      {/* Placeholder RecommendationCard */}
                      <div style={{ fontWeight: 600, color: colors.primary, marginBottom: 6 }}>
                        Recommendation
                      </div>
                      <div style={{ color: colors.textMuted, fontSize: 14 }}>
                        {rec?.suggestion
                          ? rec.suggestion
                          : `Explore curated learning steps and a practice project to raise your ${g.name} competency.`}
                      </div>
                      <div style={{ marginTop: 8, fontSize: 12, color: colors.textMuted }}>
                        Tip: This is a placeholder card. In Milestone 3, hook it to the LLM Recommendations service for full details.
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      <style>
        {`
          @media (max-width: 900px) {
            div[style*="grid-template-columns: 1fr 1fr"] {
              grid-template-columns: 1fr !important;
            }
          }
        `}
      </style>
    </div>
  );
}
