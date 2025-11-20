import React from "react";
import { useAppState } from "../context/AppStateContext";

/**
 * PUBLIC_INTERFACE
 * RoleSelector: Component to select current and target roles.
 * Props:
 * - onProceed?: function called when user clicks "Continue"
 * - compact?: boolean reduces padding/layout
 */
import { useNavigate } from "react-router-dom";
export default function RoleSelector({ onProceed, compact = false }) {
  const {
    roles,
    loadingRoles,
    selectedCurrentRole,
    selectedTargetRole,
    setSelectedCurrentRole,
    setSelectedTargetRole,
    refreshRoles,
  } = useAppState();

  const containerStyle = {
    background: "#FFFFFF",
    border: "1px solid rgba(17, 24, 39, 0.08)",
    borderRadius: 12,
    boxShadow: "0 6px 18px rgba(17,24,39,0.06)",
    padding: compact ? 12 : 16,
  };

  const labelStyle = { fontWeight: 600, marginBottom: 6 };
  const selectStyle = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid rgba(17, 24, 39, 0.12)",
    outline: "none",
  };

  const btn = {
    background: "#1E3A8A",
    color: "#fff",
    padding: "10px 14px",
    borderRadius: 10,
    border: "none",
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "0 3px 10px rgba(30,58,138,0.18)",
  };
  const btnAlt = {
    background: "#F59E0B",
    color: "#111827",
    padding: "10px 14px",
    borderRadius: 10,
    border: "none",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 3px 10px rgba(245,158,11,0.22)",
  };

  const navigate = useNavigate();
  return (
    <div style={containerStyle}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <div style={labelStyle}>Your current role</div>
          <select
            aria-label="Current role"
            style={selectStyle}
            disabled={loadingRoles}
            value={selectedCurrentRole?.id ?? ""}
            onChange={(e) => {
              const id = e.target.value;
              const r = roles.find((x) => String(x.id) === String(id));
              if (r) setSelectedCurrentRole(r);
            }}
          >
            <option value="" disabled>
              {loadingRoles ? "Loading…" : "Select current role"}
            </option>
            {[...roles]
              .sort((a, b) => {
                const ta = (a.track || '').localeCompare(b.track || '');
                if (ta !== 0) return ta;
                const sa = Number.isFinite(a.seq) ? a.seq : 9999;
                const sb = Number.isFinite(b.seq) ? b.seq : 9999;
                if (sa !== sb) return sa - sb;
                return String(a.name).localeCompare(String(b.name));
              })
              .map((r) => (
                <option key={r.id} value={r.id}>
                  {r.track ? `[${r.track}] ` : ''}{r.name}
                </option>
              ))}
          </select>
        </div>
        <div>
          <div style={labelStyle}>Target role</div>
          <select
            aria-label="Target role"
            style={selectStyle}
            disabled={loadingRoles}
            value={selectedTargetRole?.id ?? ""}
            onChange={(e) => {
              const id = e.target.value;
              const r = roles.find((x) => String(x.id) === String(id));
              if (r) setSelectedTargetRole(r);
            }}
          >
            <option value="" disabled>
              {loadingRoles ? "Loading…" : "Select target role"}
            </option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
        <button type="button" style={btnAlt} onClick={refreshRoles} disabled={loadingRoles}>
          {loadingRoles ? "Refreshing…" : "Refresh roles"}
        </button>
        {onProceed && (
          <button
            type="button"
            style={btn}
            onClick={() => {
              const payload = { current: selectedCurrentRole, target: selectedTargetRole };
              if (typeof onProceed === 'function') onProceed(payload);
              else navigate('/mind-map');
            }}
            disabled={!selectedCurrentRole || !selectedTargetRole}
          >
            Continue
          </button>
        )}
      </div>

      <div style={{ marginTop: 8, fontSize: 13, color: "rgba(17,24,39,0.7)" }}>
        Tip: If backend is unreachable, roles are loaded from local taxonomy.
      </div>
    </div>
  );
}
