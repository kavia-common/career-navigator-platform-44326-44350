import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import RoleSelector from '../components/RoleSelector';
import MindMapView from '../components/MindMapView.jsx';
import { useAppState } from '../context/AppStateContext';
import colors from '../theme/colors';

/**
 * PUBLIC_INTERFACE
 * MindMapPage
 * Page to select roles (or use previously selected) and render the interactive Mind Map.
 */
export default function MindMapPage() {
  const navigate = useNavigate();
  const { selectedCurrentRole, selectedTargetRole } = useAppState();

  const card = {
    background: colors.surface,
    border: `1px solid ${colors.border}`,
    borderRadius: 12,
    boxShadow: colors.shadow,
    padding: 16,
  };

  const header = { marginTop: 0, color: colors.primary };

  const canShow = useMemo(
    () => !!selectedCurrentRole && !!selectedTargetRole,
    [selectedCurrentRole, selectedTargetRole]
  );

  return (
    <section>
      <div style={card}>
        <h2 style={header}>Mind Map</h2>
        <p style={{ color: colors.textMuted, marginTop: -8 }}>
          Choose your current and target roles, then explore the interactive skill map with gaps and recommendations.
        </p>
        <RoleSelector
          onProceed={() => {
            // If this page was reached directly, Continue does nothing; keep selection in context.
            // Optionally navigate to self to trigger rerender.
            navigate('/mind-map');
          }}
          compact
        />
      </div>

      {canShow ? (
        <div style={{ marginTop: 12, ...card }}>
          <MindMapView currentRole={selectedCurrentRole} targetRole={selectedTargetRole} />
        </div>
      ) : (
        <div style={{ marginTop: 12, ...card, color: colors.textMuted }}>
          Select both roles to visualize the mind map.
        </div>
      )}
    </section>
  );
}
