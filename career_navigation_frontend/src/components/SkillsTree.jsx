import React, { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import colors from "../theme/colors";
import { getRole } from "../api";

/**
 * PUBLIC_INTERFACE
 * SkillsTree
 * Renders a structured, readable hierarchy (accordion-style) of skills and sub-skills
 * for a selected role. Includes loading/empty/error states and Ocean Professional styling.
 *
 * Props:
 * - roleId: number | string (required) - the role ID to fetch skills for
 * - title?: string - optional title to show above the tree
 *
 * Behavior:
 * - Fetches role detail via getRole(roleId) and reads required_skills array.
 * - Groups skills by a derived domain if available (skill_name may include "Domain: Skill").
 * - Allows expanding/collapsing groups and individual skills to reveal sub-skills when provided.
 */
export default function SkillsTree({ roleId, title = "Skills & Requirements" }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [roleDetail, setRoleDetail] = useState(null);

  // Expand state for domains and skills
  const [openGroups, setOpenGroups] = useState(() => new Set());
  const [openSkills, setOpenSkills] = useState(() => new Set());

  // Load role detail
  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!roleId) {
        setRoleDetail(null);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const data = await getRole(roleId);
        if (!ignore) {
          setRoleDetail(data);
          // Initialize groups expanded by default
          const groups = new Set();
          const grouped = groupByDomain(data?.required_skills || []);
          Object.keys(grouped).forEach((g) => groups.add(g));
          setOpenGroups(groups);
        }
      } catch (e) {
        if (!ignore) setError(e?.uiMessage || e?.message || "Failed to load role skills");
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [roleId]);

  // Helpers to group skills and derive sub-skills if the data contains it
  function parseDomainAndName(skillName) {
    // If skill uses "Domain: Skill Name" pattern, split; else domain = "General"
    if (typeof skillName === "string" && skillName.includes(":")) {
      const [d, ...rest] = skillName.split(":");
      return { domain: d.trim() || "General", name: rest.join(":").trim() || skillName.trim() };
    }
    return { domain: "General", name: skillName || "Skill" };
  }

  function groupByDomain(required_skills) {
    const groups = {};
    for (const s of required_skills || []) {
      const { domain, name } = parseDomainAndName(s.skill_name);
      const entry = {
        ...s,
        display_name: name,
        // sub_skills optional: backend may not provide; keep compatible
        sub_skills: Array.isArray(s.sub_skills) ? s.sub_skills : [],
      };
      if (!groups[domain]) groups[domain] = [];
      groups[domain].push(entry);
    }
    return groups;
  }

  const grouped = useMemo(() => groupByDomain(roleDetail?.required_skills || []), [roleDetail?.required_skills]);

  const card = {
    background: colors.surface,
    border: `1px solid ${colors.border}`,
    borderRadius: 12,
    boxShadow: colors.shadow,
    padding: 16,
  };
  const header = { marginTop: 0, color: colors.primary };

  const groupHeaderStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "linear-gradient(90deg, rgba(30,58,138,0.05), rgba(245,158,11,0.05))",
    border: `1px solid ${colors.border}`,
    borderRadius: 10,
    padding: "10px 12px",
    fontWeight: 700,
    color: colors.text,
    cursor: "pointer",
  };

  const skillRow = {
    display: "grid",
    gridTemplateColumns: "1fr auto",
    alignItems: "center",
    gap: 8,
    padding: "8px 10px",
    borderRadius: 8,
    border: `1px solid ${colors.border}`,
    background: "#fff",
  };

  const badge = {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    background: "rgba(30,58,138,0.06)",
    color: colors.primary,
    padding: "2px 8px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
    boxShadow: "inset 0 0 0 1px rgba(30,58,138,0.12)",
  };

  const subList = {
    listStyle: "disc",
    margin: "6px 0 0 22px",
    color: colors.textMuted,
  };

  const toggleGroup = (group) => {
    const next = new Set(openGroups);
    next.has(group) ? next.delete(group) : next.add(group);
    setOpenGroups(next);
  };

  const toggleSkill = (sid) => {
    const next = new Set(openSkills);
    next.has(sid) ? next.delete(sid) : next.add(sid);
    setOpenSkills(next);
  };

  return (
    <section style={card} aria-label="Skills Tree">
      <h3 style={header}>{title}</h3>
      <p style={{ color: colors.textMuted, marginTop: -8 }}>
        Explore all skills and nested sub-skills required for this role. Click a section to expand or collapse.
      </p>

      {loading && <div>Loading skills…</div>}
      {error && (
        <div role="alert" style={{ color: colors.error, marginBottom: 8 }}>
          {error}
        </div>
      )}
      {!loading && !error && (!roleDetail || !Array.isArray(roleDetail.required_skills) || roleDetail.required_skills.length === 0) && (
        <div style={{ color: colors.textMuted }}>No skills to display for this role.</div>
      )}

      {Object.keys(grouped).map((group) => {
        const open = openGroups.has(group);
        return (
          <div key={group} style={{ marginTop: 10 }}>
            <div
              role="button"
              tabIndex={0}
              aria-expanded={open}
              onClick={() => toggleGroup(group)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.keyCode === 13) toggleGroup(group);
              }}
              style={groupHeaderStyle}
            >
              <span>{group}</span>
              <span aria-hidden="true" style={{ color: colors.primary }}>{open ? "▾" : "▸"}</span>
            </div>

            {open && (
              <div style={{ marginTop: 8, display: "grid", gap: 8 }}>
                {(grouped[group] || []).map((s) => {
                  const sid = Number(s.skill_id ?? s.id ?? Math.random());
                  const hasSub = Array.isArray(s.sub_skills) && s.sub_skills.length > 0;
                  const expanded = hasSub && openSkills.has(sid);

                  return (
                    <div key={sid} style={skillRow}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          <strong>{s.display_name}</strong>
                          <span style={badge} title="Required level">
                            <span aria-hidden="true">⬤</span> req {s.level_required ?? s.requiredLevel ?? "-"}
                          </span>
                          {hasSub && (
                            <button
                              type="button"
                              onClick={() => toggleSkill(sid)}
                              aria-expanded={expanded}
                              style={{
                                background: colors.secondary,
                                color: "#111827",
                                padding: "2px 8px",
                                borderRadius: 999,
                                border: "none",
                                fontWeight: 700,
                                fontSize: 12,
                                cursor: "pointer",
                                boxShadow: "0 2px 8px rgba(245,158,11,0.20)",
                              }}
                            >
                              {expanded ? "Hide sub-skills" : "Show sub-skills"}
                            </button>
                          )}
                        </div>
                        {expanded && (
                          <ul style={subList} aria-label={`Sub-skills for ${s.display_name}`}>
                            {s.sub_skills.map((ss, i) => (
                              <li key={`${sid}-ss-${i}`}>{typeof ss === "string" ? ss : ss?.name || JSON.stringify(ss)}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <div style={{ textAlign: "right", color: colors.textMuted, fontSize: 12 }}>
                        ID: {s.skill_id ?? "—"}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
}

SkillsTree.propTypes = {
  roleId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  title: PropTypes.string,
};
