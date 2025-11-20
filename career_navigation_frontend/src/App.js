import React, { useMemo, useState, useEffect } from 'react';
import { Link, NavLink, Routes, Route, useNavigate, useLocation, useParams } from 'react-router-dom';
import { getRoles, getRole, postGapAnalysis, postRecommend, postRoadmap, postProgressUpdate, isMockMode } from './api';

/**
 * PUBLIC_INTERFACE
 * App root component with Ocean Professional styling, sidebar/topnav, and React Router pages:
 * - Dashboard (preserves existing preview/hero behavior with Connectivity panel)
 * - Roles (list) and Role Detail
 * - Analysis (run gap analysis)
 * - Paths (browse roles as paths)
 * - Recommendations (LLM or stub)
 * - Progress (basic tracker)
 * Pages load via api.js using live backend or mock fallbacks automatically.
 */

// Theme tokens
const colors = {
  primary: '#1E3A8A',
  secondary: '#F59E0B',
  success: '#059669',
  error: '#DC2626',
  background: '#F3F4F6',
  surface: '#FFFFFF',
  text: '#111827',
  textMuted: 'rgba(17,24,39,0.7)',
  border: 'rgba(17, 24, 39, 0.08)',
  shadow: '0 6px 18px rgba(17,24,39,0.06)',
};

// Layout styles
const styles = {
  app:{background:colors.background,color:colors.text,minHeight:'100vh',display:'flex',flexDirection:'column'},
  topNav:{position:'sticky',top:0,zIndex:10,background:colors.surface,borderBottom:`1px solid ${colors.border}`,boxShadow:'0 2px 8px rgba(17,24,39,0.04)'},
  topNavInner:{maxWidth:1280,margin:'0 auto',padding:'12px 20px',display:'flex',alignItems:'center',gap:16},
  brand:{display:'flex',alignItems:'center',gap:10,fontWeight:700,color:colors.primary,letterSpacing:'0.2px'},
  logoDot:{width:12,height:12,borderRadius:'50%',background:colors.secondary,boxShadow:'0 0 0 3px rgba(245, 158, 11, 0.2)'},
  grow:{flex:1},
  searchWrap:{position:'relative',minWidth:240,maxWidth:420,width:'100%'},
  searchInput:{width:'100%',padding:'10px 14px 10px 38px',borderRadius:10,border:`1px solid ${colors.border}`,background:'#fff',outline:'none',color:colors.text,fontSize:14,boxShadow:'inset 0 1px 2px rgba(17,24,39,0.03)'},
  searchIcon:{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',color:colors.textMuted,fontSize:16},
  layout:{display:'grid',gridTemplateColumns:'260px 1fr',gap:24,maxWidth:1280,width:'100%',margin:'20px auto',padding:'0 20px'},
  sidebar:{background:colors.surface,border:`1px solid ${colors.border}`,borderRadius:12,boxShadow:colors.shadow,overflow:'hidden',height:'fit-content'},
  sidebarHeader:{padding:'14px 16px',borderBottom:`1px solid ${colors.border}`,background:'linear-gradient(90deg, rgba(30,58,138,0.06), rgba(245,158,11,0.06))',fontWeight:600,color:colors.primary,letterSpacing:'0.2px'},
  navList:{listStyle:'none',margin:0,padding:'10px 8px'},
  navItem:{display:'flex',alignItems:'center',gap:10,padding:'10px 10px',margin:'4px 6px',borderRadius:10,color:colors.text,textDecoration:'none',cursor:'pointer',transition:'background 160ms ease, transform 80ms ease',outline:'none'},
  navItemHover:{background:'rgba(30,58,138,0.06)'},
  navItemActive:{background:'rgba(30,58,138,0.12)',boxShadow:'inset 0 0 0 1px rgba(30,58,138,0.18)'},
  navIcon:{width:28,height:28,borderRadius:8,background:'rgba(30,58,138,0.08)',display:'grid',placeItems:'center',fontSize:16,color:colors.primary},
  main:{display:'flex',flexDirection:'column',gap:20},
  hero:{background:colors.surface,border:`1px solid ${colors.border}`,borderRadius:14,boxShadow:colors.shadow,padding:'28px 26px',position:'relative',overflow:'hidden'},
  heroAccent:{position:'absolute',right:-40,top:-40,width:200,height:200,borderRadius:'50%',background:'radial-gradient(circle at 30% 30%, rgba(30,58,138,0.12), rgba(245,158,11,0.10) 40%, rgba(255,255,255,0) 65%)',pointerEvents:'none'},
  heroTitle:{margin:0,fontSize:28,lineHeight:1.2,color:colors.primary,letterSpacing:'0.2px'},
  heroSubtitle:{margin:'10px 0 0',fontSize:15,color:colors.textMuted,maxWidth:760},
  heroCtas:{marginTop:16,display:'flex',gap:12,flexWrap:'wrap'},
  btnPrimary:{background:colors.primary,color:'#fff',padding:'10px 14px',borderRadius:10,border:'none',fontWeight:600,fontSize:14,cursor:'pointer',boxShadow:'0 4px 12px rgba(30,58,138,0.20)'},
  btnSecondary:{background:colors.secondary,color:'#111827',padding:'10px 14px',borderRadius:10,border:'none',fontWeight:700,fontSize:14,cursor:'pointer',boxShadow:'0 4px 12px rgba(245,158,11,0.25)'},
  cardsGrid:{display:'grid',gridTemplateColumns:'repeat(3, minmax(0, 1fr))',gap:16},
  card:{background:colors.surface,border:`1px solid ${colors.border}`,borderRadius:12,boxShadow:colors.shadow,padding:18,display:'flex',flexDirection:'column',gap:10,transition:'transform 120ms ease',cursor:'pointer',outline:'none'},
  cardHeader:{display:'flex',alignItems:'center',gap:12},
  cardIcon:{width:34,height:34,borderRadius:10,background:'rgba(245,158,11,0.12)',color:'#92400E',display:'grid',placeItems:'center',fontSize:18},
  cardTitle:{margin:0,fontSize:16,fontWeight:700,color:colors.text},
  cardDesc:{margin:0,fontSize:14,color:colors.textMuted,flex:1},
  cardCta:{alignSelf:'flex-start',marginTop:6,background:colors.secondary,color:'#111827',padding:'8px 12px',borderRadius:10,border:'none',fontWeight:700,fontSize:13,cursor:'pointer',boxShadow:'0 2px 8px rgba(245,158,11,0.25)'},
  footer:{marginTop:'auto',borderTop:`1px solid ${colors.border}`,background:colors.surface},
  footerInner:{maxWidth:1280,margin:'0 auto',padding:'14px 20px',color:colors.textMuted,fontSize:13},
};

// Utilities
function hoverStyle(base, hover) {
  return { onMouseEnter: (e) => Object.assign(e.currentTarget.style, hover), onMouseLeave: (e) => Object.assign(e.currentTarget.style, {}), style: base };
}
function keyActivate(handler) {
  return (e) => { if (e.key === 'Enter' || e.keyCode === 13) handler(e); };
}

// Sidebar items
const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: '🏠' },
  { to: '/roles', label: 'Roles', icon: '📋' },
  { to: '/analysis', label: 'Analysis', icon: '🧪' },
  { to: '/paths', label: 'Paths', icon: '🧭' },
  { to: '/recommendations', label: 'Recommendations', icon: '💼' },
  { to: '/progress', label: 'Progress', icon: '📈' },
];

// Pages

// PUBLIC_INTERFACE
function Dashboard() {
  const navigate = useNavigate();
  return (
    <>
      <section style={styles.hero} aria-labelledby="hero-title">
        <div style={styles.heroAccent} aria-hidden="true" />
        <h1 id="hero-title" style={styles.heroTitle}>Chart Your Path with Confidence</h1>
        <p style={styles.heroSubtitle}>
          Discover tailored career paths, get role-based recommendations, and track your growth —
          all in one elegant workspace designed for professionals.
        </p>
        <div style={styles.heroCtas}>
          <button type="button" style={styles.btnPrimary} onClick={() => navigate('/roles')} aria-label="Explore Roles → /roles">Explore Roles</button>
          <button type="button" style={styles.btnSecondary} onClick={() => navigate('/analysis')} aria-label="Start Analysis → /analysis">Start Analysis</button>
          <button type="button" style={styles.btnPrimary} onClick={() => navigate('/paths')} aria-label="View Paths → /paths">View Paths</button>
          <button type="button" style={styles.btnSecondary} onClick={() => navigate('/recommendations')} aria-label="See Recommendations → /recommendations">See Recommendations</button>
          <button type="button" style={styles.btnPrimary} onClick={() => navigate('/progress')} aria-label="Track Progress → /progress">Track Progress</button>
        </div>
      </section>
      <ConnectivityPanel />
    </>
  );
}

// PUBLIC_INTERFACE
function RolesList() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const data = await getRoles();
        if (!ignore) setRoles(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!ignore) setErr(e?.uiMessage || e?.message || String(e));
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, []);
  if (loading) return <div>Loading roles…</div>;
  if (err) return <div role="alert" style={{ color: colors.error }}>Error: {err}</div>;
  return (
    <section style={{ background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: 12, boxShadow: colors.shadow, padding: 16 }}>
      <h2 style={{ marginTop: 0, color: colors.primary }}>Roles</h2>
      <ul style={{ listStyle: 'none', paddingLeft: 0, margin: 0, display: 'grid', gap: 8 }}>
        {roles.map((r) => (
          <li key={r.id} style={{ border: `1px solid ${colors.border}`, borderRadius: 10, padding: 12, background: '#fff' }}>
            <NavLink to={`/roles/${r.id}`} style={{ textDecoration: 'none', color: colors.text }}>
              <strong>{r.name}</strong>
              <div style={{ color: colors.textMuted, fontSize: 13 }}>{r.description}</div>
            </NavLink>
          </li>
        ))}
      </ul>
    </section>
  );
}

// PUBLIC_INTERFACE
function RoleDetail() {
  const params = useParams();
  const roleId = params.id;
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const data = await getRole(roleId);
        if (!ignore) setRole(data);
      } catch (e) {
        if (!ignore) setErr(e?.uiMessage || e?.message || String(e));
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, [roleId]);
  if (loading) return <div>Loading role…</div>;
  if (err) return <div role="alert" style={{ color: colors.error }}>Error: {err}</div>;
  if (!role) return <div>Role not found.</div>;
  return (
    <section style={{ background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: 12, boxShadow: colors.shadow, padding: 16 }}>
      <h2 style={{ marginTop: 0, color: colors.primary }}>{role.name}</h2>
      <p style={{ color: colors.textMuted }}>{role.description}</p>
      <h3>Required Skills</h3>
      <ul>
        {(role.required_skills || []).map((s) => (
          <li key={s.skill_id}>
            {s.skill_name} — level {s.level_required}
          </li>
        ))}
      </ul>
      <Link to="/roles" style={{ color: colors.primary }}>← Back to Roles</Link>
    </section>
  );
}

// PUBLIC_INTERFACE
function AnalysisPage() {
  const [currentId, setCurrentId] = useState(1);
  const [targetId, setTargetId] = useState(2);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const run = async () => {
    setLoading(true);
    setResult(null);
    try {
      const data = await postGapAnalysis({ currentRoleId: Number(currentId), targetRoleId: Number(targetId) });
      setResult(data);
    } finally {
      setLoading(false);
    }
  };
  return (
    <section style={{ background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: 12, boxShadow: colors.shadow, padding: 16 }}>
      <h2 style={{ marginTop: 0, color: colors.primary }}>Gap Analysis</h2>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <label>
          Current Role ID:
          <input type="number" value={currentId} onChange={(e) => setCurrentId(e.target.value)} style={{ marginLeft: 6 }} />
        </label>
        <label>
          Target Role ID:
          <input type="number" value={targetId} onChange={(e) => setTargetId(e.target.value)} style={{ marginLeft: 6 }} />
        </label>
        <button style={styles.btnPrimary} onClick={run} disabled={loading}>{loading ? 'Running…' : 'Run Analysis'}</button>
      </div>
      {result && (
        <div style={{ marginTop: 12 }}>
          <div>Strengths: {result.strengths?.length || 0}</div>
          <div>Gaps: {result.gaps?.length || 0}</div>
          <div>
            Recommendations:
            <ul>
              {(result.recommendations || []).slice(0, 5).map((r, i) => (
                <li key={i}>{r.suggestion}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}

// PUBLIC_INTERFACE
function PathsPage() {
  const [roles, setRoles] = useState([]);
  useEffect(() => { (async () => setRoles(await getRoles()))(); }, []);
  return (
    <section style={{ background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: 12, boxShadow: colors.shadow, padding: 16 }}>
      <h2 style={{ marginTop: 0, color: colors.primary }}>Career Paths</h2>
      <p style={{ color: colors.textMuted }}>Start by exploring roles. Pick a target role to build your path.</p>
      <ul>
        {roles.map((r) => (
          <li key={r.id}><Link to={`/roles/${r.id}`}>{r.name}</Link></li>
        ))}
      </ul>
    </section>
  );
}

// PUBLIC_INTERFACE
function RecommendationsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const run = async () => {
    setLoading(true);
    setData(null);
    try {
      const res = await postRecommend({ skillName: 'System Design', skillDescription: 'Scalable services', requiredLevel: 4 });
      setData(res);
    } finally {
      setLoading(false);
    }
  };
  return (
    <section style={{ background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: 12, boxShadow: colors.shadow, padding: 16 }}>
      <h2 style={{ marginTop: 0, color: colors.primary }}>Recommendations</h2>
      <button style={styles.btnPrimary} onClick={run} disabled={loading}>{loading ? 'Requesting…' : 'Generate for "System Design"'}</button>
      {data && (
        <div style={{ display: 'grid', gap: 8, marginTop: 12 }}>
          <div>
            <strong>Steps</strong>
            <ul>{data.steps.map((s, i) => <li key={i}>{s}</li>)}</ul>
          </div>
          <div>
            <strong>Resources</strong>
            <ul>{data.resources.map((s, i) => <li key={i}>{s}</li>)}</ul>
          </div>
          <div>
            <strong>Projects</strong>
            <ul>{data.projects.map((s, i) => <li key={i}>{s}</li>)}</ul>
          </div>
        </div>
      )}
    </section>
  );
}

// PUBLIC_INTERFACE
function ProgressPage() {
  const [userId, setUserId] = useState('anonymous');
  const [skillId, setSkillId] = useState(101);
  const [level, setLevel] = useState(1);
  const [msg, setMsg] = useState('');
  const update = async () => {
    const res = await postProgressUpdate({ userId, skillId: Number(skillId), level: Number(level) });
    setMsg(res?.message || 'Updated');
  };
  return (
    <section style={{ background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: 12, boxShadow: colors.shadow, padding: 16 }}>
      <h2 style={{ marginTop: 0, color: colors.primary }}>Progress</h2>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <label>User ID: <input value={userId} onChange={(e) => setUserId(e.target.value)} /></label>
        <label>Skill ID: <input type="number" value={skillId} onChange={(e) => setSkillId(e.target.value)} /></label>
        <label>Level (0-5): <input type="number" min="0" max="5" value={level} onChange={(e) => setLevel(e.target.value)} /></label>
        <button style={styles.btnPrimary} onClick={update}>Update</button>
      </div>
      {msg && <div style={{ marginTop: 8, color: colors.success }}>{msg}</div>}
    </section>
  );
}

// Connectivity Panel preserved
function ConnectivityPanel() {
  const [rolesCount, setRolesCount] = useState(null);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [gaResult, setGaResult] = useState(null);
  const [gaLoading, setGaLoading] = useState(false);
  const [recResult, setRecResult] = useState(null);
  const [recLoading, setRecLoading] = useState(false);
  const [connError, setConnError] = useState(null);

  const smallBtn = { background: colors.primary, color: '#fff', padding: '8px 12px', borderRadius: 10, border: 'none', fontWeight: 600, fontSize: 13, cursor: 'pointer', boxShadow: '0 3px 10px rgba(30,58,138,0.18)' };
  const smallBtnAlt = { ...smallBtn, background: colors.secondary, color: '#111827', boxShadow: '0 3px 10px rgba(245,158,11,0.22)' };
  const panelBoxStyle = { background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: 12, boxShadow: colors.shadow, padding: 16 };

  const handleFetchRoles = async () => {
    setConnError(null); setRolesLoading(true); setRolesCount(null);
    try { const data = await getRoles(); setRolesCount(Array.isArray(data) ? data.length : 0); }
    catch (e) { setConnError(e.message || String(e)); }
    finally { setRolesLoading(false); }
  };
  const handleSampleGapAnalysis = async () => {
    setConnError(null); setGaLoading(true); setGaResult(null);
    try {
      const data = await postGapAnalysis({ currentRoleId: 1, targetRoleId: 2 });
      setGaResult({ strengths: data?.strengths?.length ?? 0, gaps: data?.gaps?.length ?? 0, recommendations: data?.recommendations?.slice(0, 2) ?? [] });
    } catch (e) { setConnError(e.message || String(e)); } finally { setGaLoading(false); }
  };
  const handleSampleRecommend = async () => {
    setConnError(null); setRecLoading(true); setRecResult(null);
    try {
      const data = await postRecommend({ skillName: 'System Design', skillDescription: 'Architecting scalable and reliable web services.', requiredLevel: 4 });
      setRecResult({ stepsCount: data?.steps?.length ?? 0, resourcesCount: data?.resources?.length ?? 0, projectsCount: data?.projects?.length ?? 0, sampleStep: data?.steps?.[0] ?? '' });
    } catch (e) { setConnError(e.message || String(e)); } finally { setRecLoading(false); }
  };

  return (
    <section aria-label="Connectivity" style={panelBoxStyle}>
      <h2 style={{ margin: '0 0 8px', fontSize: 18, color: colors.primary }}>Connectivity</h2>
      <p style={{ margin: '0 0 12px', color: colors.textMuted, fontSize: 14 }}>
        Quick checks to verify backend and recommender services are reachable. Mock mode: {isMockMode() ? 'ON' : 'OFF'}
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <button type="button" style={smallBtn} onClick={handleFetchRoles} disabled={rolesLoading}>{rolesLoading ? 'Fetching roles…' : 'Fetch Roles'}</button>
        <button type="button" style={smallBtnAlt} onClick={handleSampleGapAnalysis} disabled={gaLoading}>{gaLoading ? 'Running gap-analysis…' : 'Sample Gap Analysis'}</button>
        <button type="button" style={smallBtn} onClick={handleSampleRecommend} disabled={recLoading}>{recLoading ? 'Requesting recommendations…' : 'Sample Recommend'}</button>
      </div>
      <div style={{ marginTop: 12, display: 'grid', gap: 8 }}>
        {rolesCount !== null && <div style={{ background: '#fff', border: `1px solid ${colors.border}`, borderRadius: 10, padding: '10px 12px', fontSize: 14 }}>Roles count: <strong>{rolesCount}</strong></div>}
        {gaResult && (
          <div style={{ background: '#fff', border: `1px solid ${colors.border}`, borderRadius: 10, padding: '10px 12px', fontSize: 14 }}>
            Gap analysis — strengths: <strong>{gaResult.strengths}</strong>, gaps <strong>{gaResult.gaps}</strong>
            {gaResult.recommendations?.length ? (
              <div style={{ marginTop: 6, color: colors.textMuted }}>
                Sample recommendations:
                <ul style={{ margin: '6px 0 0 18px' }}>
                  {gaResult.recommendations.map((r, idx) => (<li key={idx}>{r.suggestion || JSON.stringify(r)}</li>))}
                </ul>
              </div>
            ) : null}
          </div>
        )}
        {recResult && (
          <div style={{ background: '#fff', border: `1px solid ${colors.border}`, borderRadius: 10, padding: '10px 12px', fontSize: 14 }}>
            Recommendations — steps: <strong>{recResult.stepsCount}</strong>, resources <strong>{recResult.resourcesCount}</strong>, projects <strong>{recResult.projectsCount}</strong>
            {recResult.sampleStep ? (<div style={{ marginTop: 6, color: colors.textMuted }}>Sample step: “{recResult.sampleStep}”</div>) : null}
          </div>
        )}
        {connError && (
          <div role="alert" style={{ background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.25)', color: colors.error, borderRadius: 10, padding: '10px 12px', fontSize: 14 }}>
            {connError}. Tips: ensure backend is running on http://localhost:8000 or set REACT_APP_BACKEND_URL/REACT_APP_API_BASE. If you see CORS errors, allow http://localhost:3000 in backend CORS config or run via docker compose.
          </div>
        )}
      </div>
    </section>
  );
}

// Root App
function App() {
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchSubmitted, setSearchSubmitted] = useState('');
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const term = searchTerm.trim();
    if (!term) return;
    setSearching(true);
    setSearchSubmitted(term);
    setTimeout(() => setSearching(false), 600);
  };

  return (
    <div style={styles.app}>
      <header style={styles.topNav} aria-label="Top Navigation" role="banner">
        <div style={styles.topNavInner}>
          <div style={styles.brand} aria-label="Application Brand">
            <span style={styles.logoDot} aria-hidden="true" />
            <Link to="/" style={{ color: colors.primary, textDecoration: 'none' }}>Career Navigator</Link>
          </div>
          <div style={styles.grow} />
          <form style={styles.searchWrap} role="search" aria-label="Site Search" onSubmit={handleSearchSubmit}>
            <span style={styles.searchIcon} aria-hidden="true">🔎</span>
            <input
              type="search"
              placeholder="Search roles, skills, resources..."
              aria-label="Search"
              style={styles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit" style={{ position: 'absolute', left: -9999, width: 1, height: 1, overflow: 'hidden' }} aria-hidden="true">Search</button>
          </form>
        </div>
      </header>

      <div style={styles.layout}>
        <aside style={styles.sidebar} aria-label="Sidebar Navigation">
          <div style={styles.sidebarHeader}>Navigation</div>
          <ul style={styles.navList} role="menubar" aria-label="Primary">
            {NAV_ITEMS.map((item) => {
              const active = location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to));
              const baseStyle = { ...styles.navItem, ...(active ? styles.navItemActive : {}) };
              return (
                <li key={item.to} role="none">
                  <NavLink to={item.to} {...hoverStyle(baseStyle, styles.navItemHover)} role="menuitem" aria-current={active ? 'page' : undefined}>
                    <span style={styles.navIcon} aria-hidden="true">{item.icon}</span>
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </aside>

        <main style={styles.main} role="main">
          {searchSubmitted && (
            <div role="status" aria-live="polite" style={{ padding: '10px 14px', background: '#fff', border: `1px solid ${colors.border}`, borderRadius: 10 }}>
              {searching ? `Searching for "${searchSubmitted}"…` : `No results yet — backend pending. Last query: "${searchSubmitted}"`}
            </div>
          )}

          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/roles" element={<RolesList />} />
            <Route path="/roles/:id" element={<RoleDetail />} />
            <Route path="/analysis" element={<AnalysisPage />} />
            <Route path="/paths" element={<PathsPage />} />
            <Route path="/recommendations" element={<RecommendationsPage />} />
            <Route path="/progress" element={<ProgressPage />} />
          </Routes>
        </main>
      </div>

      <footer style={styles.footer} aria-label="Footer">
        <div style={styles.footerInner}>
          © {new Date().getFullYear()} Career Navigator — All rights reserved.
        </div>
      </footer>

      <style>
        {`
          @media (max-width: 900px) {
            div[style*="grid-template-columns: 260px 1fr"] {
              grid-template-columns: 1fr !important;
            }
          }
          @media (max-width: 780px) {
            div[style*="grid-template-columns: repeat(3"] {
              grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            }
          }
          @media (max-width: 520px) {
            div[style*="grid-template-columns: repeat(3"] {
              grid-template-columns: 1fr !important;
            }
          }
        `}
      </style>
    </div>
  );
}

export default App;
