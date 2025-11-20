import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import colors from '../theme/colors';
import { getRole, isMockMode } from '../api';
import { transformRoleToRoadmap, calculateProgress, buildMockRoleDetail, coerceStatus } from '../utils/roadmapUtils';

/**
 * PUBLIC_INTERFACE
 * RoadmapView
 * Renders a sequenced, collapsible roadmap for a given roleId using its required_skills and sub_skills.
 * Shows milestone statuses, optional durations, dependencies, and an overall progress indicator.
 *
 * Props:
 * - roleId: number|string | null - target role id whose skills form the roadmap (if missing: show empty state)
 * - title?: string
 */
export default function RoadmapView({ roleId, title = 'Role Roadmap' }) {
  const [loading, setLoading] = useState(false);
  const [roleDetail, setRoleDetail] = useState(null);
  const [error, setError] = useState(null);

  const [openMilestones, setOpenMilestones] = useState(() => new Set());

  // Load role detail or mock
  useEffect(() => {
    let ignore = false;
    (async () => {
      setError(null);
      setRoleDetail(null);
      if (!roleId) return;

      setLoading(true);
      try {
        if (isMockMode()) {
          const mock = buildMockRoleDetail('Target Role (mock)');
          if (!ignore) setRoleDetail(mock);
        } else {
          const detail = await getRole(roleId);
          if (!ignore) setRoleDetail(detail);
        }
      } catch (e) {
        if (!ignore) {
          // Use a mock fallback even if fetch fails
          setRoleDetail(buildMockRoleDetail('Target Role (fallback)'));
          setError(e?.uiMessage || e?.message || 'Unable to load role details; using fallback.');
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [roleId]);

  const roadmap = useMemo(() => transformRoleToRoadmap(roleDetail || { required_skills: [] }), [roleDetail]);
  const progress = useMemo(() => calculateProgress(roadmap), [roadmap]);

  // UI styles
  const wrap = { background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: 12, boxShadow: colors.shadow, padding: 16 };
  const header = { margin: 0, color: colors.primary };
  const lite = { color: colors.textMuted };
  const milestoneRow = {
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    gap: 8,
    border: `1px solid ${colors.border}`,
    borderRadius: 10,
    background: '#fff',
    padding: '10px 12px',
  };
  const chip = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '2px 8px',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
    border: `1px solid ${colors.border}`,
    background: 'rgba(30,58,138,0.04)',
    color: colors.primary,
  };
  const statusColors = {
    'Not Started': { bg: 'rgba(17,24,39,0.06)', fg: colors.text },
    'In Progress': { bg: 'rgba(245,158,11,0.15)', fg: '#92400E' },
    'Completed': { bg: 'rgba(5,150,105,0.18)', fg: '#065F46' },
  };

  function toggleMilestone(id) {
    const next = new Set(openMilestones);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setOpenMilestones(next);
  }

  return (
    <section style={wrap} aria-label="Roadmap">
      <h3 style={header}>{title}</h3>
      <p style={{ ...lite, marginTop: -6 }}>
        A timeline-style roadmap built from the role’s required skills. Expand milestones to see sub-skills. Dependencies and durations are shown when available.
      </p>

      {!roleId && <div style={lite}>Select a target role to generate your roadmap.</div>}
      {loading && <div>Loading roadmap…</div>}
      {error && <div role="alert" style={{ color: colors.error, marginBottom: 8 }}>{error}</div>}

      {!loading && roleId && (
        <>
          <div style={{ margin: '8px 0 12px' }}>
            <strong>Overall Progress: {(progress * 100).toFixed(0)}%</strong>
            <div
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progress * 100)}
              style={{
                marginTop: 6,
                height: 10,
                borderRadius: 999,
                background: 'rgba(17,24,39,0.08)',
                overflow: 'hidden',
                boxShadow: 'inset 0 1px 2px rgba(17,24,39,0.06)',
              }}
            >
              <div
                style={{
                  width: `${Math.max(0, Math.min(100, Math.round(progress * 100)))}%`,
                  height: '100%',
                  background: `linear-gradient(90deg, ${colors.primary}, ${colors.secondary})`,
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gap: 10, marginTop: 8 }}>
            {roadmap.milestones.length === 0 && (
              <div style={lite}>No milestones found for this role yet.</div>
            )}

            {roadmap.milestones.map((m) => {
              const opened = openMilestones.has(m.id);
              const s = statusColors[coerceStatus(m.status)] || statusColors['Not Started'];
              return (
                <div key={m.id} style={milestoneRow}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        aria-expanded={opened}
                        onClick={() => toggleMilestone(m.id)}
                        style={{
                          border: `1px solid ${colors.border}`,
                          background: '#fff',
                          borderRadius: 8,
                          width: 26,
                          height: 26,
                          display: 'grid',
                          placeItems: 'center',
                          cursor: 'pointer',
                        }}
                        title={opened ? 'Collapse' : 'Expand'}
                      >
                        <span aria-hidden="true" style={{ color: colors.primary }}>{opened ? '▾' : '▸'}</span>
                      </button>

                      <strong>{m.title}</strong>
                      <span style={{ ...chip, background: s.bg, color: s.fg }}>Status: {coerceStatus(m.status)}</span>
                      <span style={chip}>Req Lvl: {m.requiredLevel}</span>
                      {Number.isFinite(m.estimatedWeeks) && <span style={chip}>~{m.estimatedWeeks}w</span>}
                      {Array.isArray(m.dependsOn) && m.dependsOn.length > 0 && (
                        <span style={chip} title={`Depends on ${m.dependsOn.join(', ')}`}>Depends on {m.dependsOn.length}</span>
                      )}
                    </div>

                    {opened && m.subMilestones?.length > 0 && (
                      <ul style={{ margin: '8px 0 0 28px', color: colors.textMuted }}>
                        {m.subMilestones.map((ss) => {
                          const ssS = statusColors[coerceStatus(ss.status)] || statusColors['Not Started'];
                          return (
                            <li key={ss.id} style={{ marginTop: 6 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                <span>{ss.title}</span>
                                <span style={{ ...chip, background: ssS.bg, color: ssS.fg }}>{coerceStatus(ss.status)}</span>
                                {Number.isFinite(ss.estimatedWeeks) && <span style={chip}>~{ss.estimatedWeeks}w</span>}
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>

                  <div style={{ textAlign: 'right', alignSelf: 'center', color: colors.textMuted, fontSize: 12 }}>
                    {m.id}
                  </div>
                </div>
              );
            })}
          </div>

          {roadmap.dependencies.length > 0 && (
            <div style={{ marginTop: 12, borderTop: `1px solid ${colors.border}`, paddingTop: 10 }}>
              <div style={{ fontWeight: 700, color: colors.primary, marginBottom: 6 }}>Dependencies</div>
              <ul style={{ margin: '6px 0 0 18px', color: colors.textMuted }}>
                {roadmap.dependencies.map((d, i) => (
                  <li key={`${d.from}-${d.to}-${i}`}>
                    {d.from} → {d.to}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </section>
  );
}

RoadmapView.propTypes = {
  roleId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  title: PropTypes.string,
};
