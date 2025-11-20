import React from "react";
import RoleSelector from "../components/RoleSelector";
import { useNavigate } from "react-router-dom";
import { useAppState } from "../context/AppStateContext";
import SkillsTree from "../components/SkillsTree.jsx";
import colors from "../theme/colors";

/**
 * PUBLIC_INTERFACE
 * RoleSelectorPage: Page for users to choose current and target roles.
 * Navigates to /analysis when both roles are selected.
 * Also reveals a full skills tree for whichever role is selected (target prioritized, else current).
 */
export default function RoleSelectorPage() {
  const navigate = useNavigate();
  const { selectedCurrentRole, selectedTargetRole } = useAppState();

  const header = { marginTop: 0, color: colors.primary };
  const card = {
    background: colors.surface,
    border: `1px solid ${colors.border}`,
    borderRadius: 12,
    boxShadow: colors.shadow,
    padding: 16,
  };

  const chosen = selectedTargetRole?.id ?? selectedCurrentRole?.id ?? null;

  return (
    <section>
      <div style={card}>
        <h2 style={header}>Select your roles</h2>
        <p style={{ color: colors.textMuted, marginTop: -8 }}>
          Choose your current and target roles to begin the gap analysis.
        </p>
        <RoleSelector onProceed={() => navigate("/mind-map")} />
      </div>

      <div style={{ marginTop: 12, ...card }}>
        <strong>Summary</strong>
        <div style={{ color: colors.textMuted }}>
          Current: {selectedCurrentRole ? selectedCurrentRole.name : "—"} | Target{" "}
          {selectedTargetRole ? selectedTargetRole.name : "—"} ·
          {' '}Select a role to preview its skills below. When both are selected, visit the Roadmap section to see your milestone plan.
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <SkillsTree
          roleId={chosen}
          title={
            selectedTargetRole
              ? `Skills & Sub-skills for Target Role: ${selectedTargetRole.name}`
              : selectedCurrentRole
              ? `Skills & Sub-skills for Current Role: ${selectedCurrentRole.name}`
              : "Skills & Requirements"
          }
        />
        {!chosen && (
          <div style={{ ...card, marginTop: 8, color: colors.textMuted }}>
            Select a role to reveal its full skills tree.
          </div>
        )}
      </div>
    </section>
  );
}
