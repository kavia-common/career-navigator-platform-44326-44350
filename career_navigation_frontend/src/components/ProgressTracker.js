import React, { useEffect, useMemo, useState } from "react";
import { postProgressUpdate, getRole } from "../api";
import { useAppState } from "../context/AppStateContext";

/**
 * PUBLIC_INTERFACE
 * ProgressTracker
 * Renders a list of required skills for the selected target role with 0–5 sliders to track user progress.
 *
 * Props:
 * - userId: string (default "anonymous")
 * - onProgressChanged?: (updatedMap) => void  // called after a change is persisted
 *
 * Behavior:
 * - Loads selected target role requirements from backend (or mock via api.js).
 * - Shows each skill with a 0–5 range input and the required level.
 * - Calls postProgressUpdate(userId, skillId, level) on slider change (debounced).
 * - Keeps local map of userProgress for immediate UI feedback.
 */
export default function ProgressTracker({ userId = "anonymous", onProgressChanged }) {
  const { selectedTargetRole } = useAppState();
  const [requirements, setRequirements] = useState([]);
  const [loadingReqs, setLoadingReqs] = useState(false);
  const [error, setError] = useState(null);

  // In-memory progress map: { [skillId]: level }
  const [userProgress, setUserProgress] = useState({});

  const colors = {
    primary: "#1E3A8A",
    secondary: "#F59E0B",
    text: "#111827",
    textMuted: "rgba(17,24,39,0.7)",
    border: "rgba(17, 24, 39, 0.10)",
    surface: "#FFFFFF",
    shadow: "0 6px 18px rgba(17,24,39,0.06)",
    success: "#059669",
    error: "#DC2626",
  };

  const card = { background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: 12, boxShadow: colors.shadow, padding: 16 };
  const header = { marginTop: 0, color: colors.primary };
  const row = { display: "grid", gridTemplateColumns: "1fr 120px 200px", gap: 8, alignItems: "center" };
  const list = { listStyle: "none", paddingLeft: 0, margin: 0, display: "grid", gap: 12 };
  const item = { background: "#fff", border: `1px solid ${colors.border}`, borderRadius: 10, padding: 12 };

  // Load requirements for selected target role
  useEffect(() => {
    let ignore = false;
    (async () => {
      setError(null);
      setRequirements([]);
      setLoadingReqs(true);
      try {
        const rid = selectedTargetRole?.id;
        if (!rid) {
          setLoadingReqs(false);
          return;
        }
        const detail = await getRole(rid);
        const reqs = Array.isArray(detail?.required_skills) ? detail.required_skills : [];
        if (!ignore) {
          setRequirements(reqs);
          // Initialize userProgress for listed skills to 0 if not present
          setUserProgress((prev) => {
            const next = { ...prev };
            for (const s of reqs) {
              const sid = Number(s.skill_id);
              if (!(sid in next)) next[sid] = 0;
            }
            return next;
          });
        }
      } catch (e) {
        if (!ignore) setError(e?.uiMessage || e?.message || "Failed to load role requirements");
      } finally {
        if (!ignore) setLoadingReqs(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [selectedTargetRole?.id]);

  // Debounce updates to avoid spamming the backend when sliding
  const [pending, setPending] = useState(null); // { skillId, level }
  useEffect(() => {
    if (!pending) return;
    const t = setTimeout(async () => {
      try {
        await postProgressUpdate({ userId, skillId: Number(pending.skillId), level: Number(pending.level) });
        if (typeof onProgressChanged === "function") {
          onProgressChanged({ ...userProgress, [pending.skillId]: pending.level });
        }
      } catch {
        // swallow errors; UI remains responsive and mock fallback is supported in api.js
      }
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending]);

  function handleChange(skillId, value) {
    const level = Math.max(0, Math.min(5, Number(value)));
    setUserProgress((prev) => ({ ...prev, [skillId]: level }));
    setPending({ skillId, level });
  }

  const total = requirements.length;
  const filled = useMemo(
    () =>
      requirements.reduce((acc, s) => {
        const lvl = userProgress[Number(s.skill_id)] ?? 0;
        return acc + (lvl > 0 ? 1 : 0);
      }, 0),
    [requirements, userProgress]
  );

  return (
    <div style={card}>
      <h3 style={header}>Progress Tracker</h3>
      <p style={{ color: colors.textMuted, marginTop: -8 }}>
        Track your current proficiency for each required skill of the target role using the sliders below. Changes are saved automatically.
      </p>

      <div style={{ margin: "8px 0 12px", color: colors.textMuted, fontSize: 13 }}>
        Skills with progress set: <strong>{filled}</strong> / {total}
      </div>

      {loadingReqs && <div>Loading role requirements…</div>}
      {error && (
        <div role="alert" style={{ color: colors.error, marginBottom: 8 }}>
          {error}
        </div>
      )}

      <ul style={list} aria-label="Required skills">
        {requirements.length === 0 && !loadingReqs && (
          <li style={{ color: colors.textMuted }}>No requirements to display. Select a target role first.</li>
        )}
        {requirements.map((s) => {
          const sid = Number(s.skill_id);
          const curr = userProgress[sid] ?? 0;
          return (
            <li key={sid} style={item}>
              <div style={row}>
                <div>
                  <div style={{ fontWeight: 600 }}>{s.skill_name}</div>
                  <div style={{ color: colors.textMuted, fontSize: 12 }}>Required level: {s.level_required}</div>
                </div>
                <div style={{ textAlign: "right", fontSize: 13, color: colors.textMuted }}>Level: {curr}</div>
                <div>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="1"
                    value={curr}
                    aria-label={`Set your level for ${s.skill_name}`}
                    onChange={(e) => handleChange(sid, e.target.value)}
                    style={{ width: "100%" }}
                  />
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
