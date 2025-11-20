import React from "react";
import RoleSelector from "../components/RoleSelector";
import { useNavigate } from "react-router-dom";
import { useAppState } from "../context/AppStateContext";

/**
 * PUBLIC_INTERFACE
 * RoleSelectorPage: Page for users to choose current and target roles.
 * Navigates to /analysis when both roles are selected.
 */
export default function RoleSelectorPage() {
  const navigate = useNavigate();
  const { selectedCurrentRole, selectedTargetRole } = useAppState();

  const header = { marginTop: 0, color: "#1E3A8A" };
  const card = {
    background: "#FFFFFF",
    border: "1px solid rgba(17, 24, 39, 0.08)",
    borderRadius: 12,
    boxShadow: "0 6px 18px rgba(17,24,39,0.06)",
    padding: 16,
  };

  return (
    <section>
      <div style={card}>
        <h2 style={header}>Select your roles</h2>
        <p style={{ color: "rgba(17,24,39,0.7)", marginTop: -8 }}>
          Choose your current and target roles to begin the gap analysis.
        </p>
        <RoleSelector onProceed={() => navigate("/mind-map")} />
      </div>

      <div style={{ marginTop: 12, ...card }}>
        <strong>Summary</strong>
        <div style={{ color: "rgba(17,24,39,0.7)" }}>
          Current: {selectedCurrentRole ? selectedCurrentRole.name : "—"} | Target:{" "}
          {selectedTargetRole ? selectedTargetRole.name : "—"}
        </div>
      </div>
    </section>
  );
}
