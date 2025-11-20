import React from "react";

/**
 * PUBLIC_INTERFACE
 * MindMapView
 * Textual preview of a Cytoscape-like graph: lists nodes and edges.
 * This serves as a seam for future Cytoscape integration without adding dependencies now.
 *
 * Props:
 * - nodes: [{ data: { id: string, label?: string, ... } }]
 * - edges: [{ data: { source: string, target: string, ... } }]
 * - title?: string
 */
export default function MindMapView({ nodes = [], edges = [], title = "Roadmap (Preview)" }) {
  const colors = {
    primary: "#1E3A8A",
    secondary: "#F59E0B",
    text: "#111827",
    textMuted: "rgba(17,24,39,0.7)",
    border: "rgba(17, 24, 39, 0.10)",
    surface: "#FFFFFF",
    shadow: "0 6px 18px rgba(17,24,39,0.06)",
  };

  const card = { background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: 12, boxShadow: colors.shadow, padding: 16 };
  const section = { background: "#fff", border: `1px solid ${colors.border}`, borderRadius: 10, padding: 12 };
  const header = { marginTop: 0, color: colors.primary };

  return (
    <div style={card}>
      <h3 style={header}>{title}</h3>
      <p style={{ color: colors.textMuted, marginTop: -6 }}>
        This is a textual preview of the roadmap nodes and edges. A visual mind map can be wired later via Cytoscape.js using the same data shape.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <section style={section} aria-label="Nodes">
          <strong>Nodes</strong>
          <ul style={{ margin: "8px 0 0 18px" }}>
            {nodes.length === 0 && <li style={{ color: colors.textMuted }}>No nodes</li>}
            {nodes.map((n, idx) => (
              <li key={n?.data?.id || idx}>
                <code>{n?.data?.id}</code>
                {n?.data?.label ? <> — {n.data.label}</> : null}
              </li>
            ))}
          </ul>
        </section>

        <section style={section} aria-label="Edges">
          <strong>Edges</strong>
          <ul style={{ margin: "8px 0 0 18px" }}>
            {edges.length === 0 && <li style={{ color: colors.textMuted }}>No edges</li>}
            {edges.map((e, idx) => (
              <li key={`${e?.data?.source || "s"}-${e?.data?.target || "t"}-${idx}`}>
                <code>{e?.data?.source}</code> → <code>{e?.data?.target}</code>
              </li>
            ))}
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
