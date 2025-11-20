import React, { useMemo, useState } from 'react';
import { getRoles, postGapAnalysis, postRecommend, isMockMode } from './api';

/**
 * Ocean Professional themed landing page for the Career Navigation Platform.
 * - Adds interactivity without new dependencies:
 *   1) Local state for selected section with active styles and content placeholders.
 *   2) Search input with local state and non-blocking results notice.
 *   3) Feature cards and CTAs are clickable to switch sections.
 *   4) Keyboard accessibility: Enter key activates focused items; ARIA roles and attributes.
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
  app: {
    background: colors.background,
    color: colors.text,
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  topNav: {
    position: 'sticky',
    top: 0,
    zIndex: 10,
    background: colors.surface,
    borderBottom: `1px solid ${colors.border}`,
    boxShadow: '0 2px 8px rgba(17,24,39,0.04)',
  },
  topNavInner: {
    maxWidth: 1280,
    margin: '0 auto',
    padding: '12px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    fontWeight: 700,
    color: colors.primary,
    letterSpacing: '0.2px',
  },
  logoDot: {
    width: 12,
    height: 12,
    borderRadius: '50%',
    background: colors.secondary,
    boxShadow: '0 0 0 3px rgba(245, 158, 11, 0.2)',
  },
  grow: { flex: 1 },
  searchWrap: {
    position: 'relative',
    minWidth: 240,
    maxWidth: 420,
    width: '100%',
  },
  searchInput: {
    width: '100%',
    padding: '10px 14px 10px 38px',
    borderRadius: 10,
    border: `1px solid ${colors.border}`,
    background: '#fff',
    outline: 'none',
    color: colors.text,
    fontSize: 14,
    boxShadow: 'inset 0 1px 2px rgba(17,24,39,0.03)',
  },
  searchIcon: {
    position: 'absolute',
    left: 12,
    top: '50%',
    transform: 'translateY(-50%)',
    color: colors.textMuted,
    fontSize: 16,
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: '260px 1fr',
    gap: 24,
    maxWidth: 1280,
    width: '100%',
    margin: '20px auto',
    padding: '0 20px',
  },
  sidebar: {
    background: colors.surface,
    border: `1px solid ${colors.border}`,
    borderRadius: 12,
    boxShadow: colors.shadow,
    overflow: 'hidden',
    height: 'fit-content',
  },
  sidebarHeader: {
    padding: '14px 16px',
    borderBottom: `1px solid ${colors.border}`,
    background: 'linear-gradient(90deg, rgba(30,58,138,0.06), rgba(245,158,11,0.06))',
    fontWeight: 600,
    color: colors.primary,
    letterSpacing: '0.2px',
  },
  navList: {
    listStyle: 'none',
    margin: 0,
    padding: '10px 8px',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 10px',
    margin: '4px 6px',
    borderRadius: 10,
    color: colors.text,
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'background 160ms ease, transform 80ms ease',
    outline: 'none',
  },
  navItemHover: {
    background: 'rgba(30,58,138,0.06)',
  },
  navItemActive: {
    background: 'rgba(30,58,138,0.12)',
    boxShadow: 'inset 0 0 0 1px rgba(30,58,138,0.18)',
  },
  navIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    background: 'rgba(30,58,138,0.08)',
    display: 'grid',
    placeItems: 'center',
    fontSize: 16,
    color: colors.primary,
  },
  main: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  hero: {
    background: colors.surface,
    border: `1px solid ${colors.border}`,
    borderRadius: 14,
    boxShadow: colors.shadow,
    padding: '28px 26px',
    position: 'relative',
    overflow: 'hidden',
  },
  heroAccent: {
    position: 'absolute',
    right: -40,
    top: -40,
    width: 200,
    height: 200,
    borderRadius: '50%',
    background:
      'radial-gradient(circle at 30% 30%, rgba(30,58,138,0.12), rgba(245,158,11,0.10) 40%, rgba(255,255,255,0) 65%)',
    pointerEvents: 'none',
  },
  heroTitle: {
    margin: 0,
    fontSize: 28,
    lineHeight: 1.2,
    color: colors.primary,
    letterSpacing: '0.2px',
  },
  heroSubtitle: {
    margin: '10px 0 0',
    fontSize: 15,
    color: colors.textMuted,
    maxWidth: 760,
  },
  heroCtas: {
    marginTop: 16,
    display: 'flex',
    gap: 12,
    flexWrap: 'wrap',
  },
  btnPrimary: {
    background: colors.primary,
    color: '#fff',
    padding: '10px 14px',
    borderRadius: 10,
    border: 'none',
    fontWeight: 600,
    fontSize: 14,
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(30,58,138,0.20)',
  },
  btnSecondary: {
    background: colors.secondary,
    color: '#111827',
    padding: '10px 14px',
    borderRadius: 10,
    border: 'none',
    fontWeight: 700,
    fontSize: 14,
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(245,158,11,0.25)',
  },
  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: 16,
  },
  card: {
    background: colors.surface,
    border: `1px solid ${colors.border}`,
    borderRadius: 12,
    boxShadow: colors.shadow,
    padding: 18,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    transition: 'transform 120ms ease',
    cursor: 'pointer',
    outline: 'none',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  cardIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    background: 'rgba(245,158,11,0.12)',
    color: '#92400E',
    display: 'grid',
    placeItems: 'center',
    fontSize: 18,
  },
  cardTitle: {
    margin: 0,
    fontSize: 16,
    fontWeight: 700,
    color: colors.text,
  },
  cardDesc: {
    margin: 0,
    fontSize: 14,
    color: colors.textMuted,
    flex: 1,
  },
  cardCta: {
    alignSelf: 'flex-start',
    marginTop: 6,
    background: colors.secondary,
    color: '#111827',
    padding: '8px 12px',
    borderRadius: 10,
    border: 'none',
    fontWeight: 700,
    fontSize: 13,
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(245,158,11,0.25)',
  },
  footer: {
    marginTop: 'auto',
    borderTop: `1px solid ${colors.border}`,
    background: colors.surface,
  },
  footerInner: {
    maxWidth: 1280,
    margin: '0 auto',
    padding: '14px 20px',
    color: colors.textMuted,
    fontSize: 13,
  },
};

// Utility: hover style merge for inline events
function hoverStyle(base, hover) {
  return {
    onMouseEnter: (e) => Object.assign(e.currentTarget.style, hover),
    onMouseLeave: (e) => Object.assign(e.currentTarget.style, {}),
    style: base,
  };
}

// Small helper for keyboard activation
function keyActivate(handler) {
  return (e) => {
    if (e.key === 'Enter' || e.keyCode === 13) {
      handler(e);
    }
  };
}

// Map for section labels and icons
const SECTIONS = [
  { key: 'Dashboard', label: 'Dashboard', icon: '🏠' },
  { key: 'Career Paths', label: 'Career Paths', icon: '🧭' },
  { key: 'Job Recommendations', label: 'Job Recommendations', icon: '💼' },
  { key: 'Resources', label: 'Resources', icon: '📚' },
  { key: 'Progress', label: 'Progress', icon: '📈' },
];

// PUBLIC_INTERFACE
function App() {
  // Section state
  const [selected, setSelected] = useState('Dashboard');

  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [searchSubmitted, setSearchSubmitted] = useState('');
  const [searching, setSearching] = useState(false);

  const sectionActiveStyle = useMemo(
    () => styles.navItemActive,
    []
  );

  // Handle mock search
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const term = searchTerm.trim();
    if (!term) return;
    setSearching(true);
    setSearchSubmitted(term);
    // Non-blocking UX: show "Searching..." then resolve with a stub
    setTimeout(() => {
      setSearching(false);
    }, 600);
  };

  const handleSelect = (section) => {
    setSelected(section);
  };

  // CTA shortcuts
  const goToPaths = () => handleSelect('Career Paths');
  const goToRecs = () => handleSelect('Job Recommendations');
  const goToProgress = () => handleSelect('Progress');

  // Render placeholder content for the selected section and search notice
  // Connectivity panel state
  const [rolesCount, setRolesCount] = useState(null);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [gaResult, setGaResult] = useState(null);
  const [gaLoading, setGaLoading] = useState(false);
  const [recResult, setRecResult] = useState(null);
  const [recLoading, setRecLoading] = useState(false);
  const [connError, setConnError] = useState(null);

  const panelBoxStyle = {
    background: colors.surface,
    border: `1px solid ${colors.border}`,
    borderRadius: 12,
    boxShadow: colors.shadow,
    padding: 16,
  };

  const smallBtn = {
    background: colors.primary,
    color: '#fff',
    padding: '8px 12px',
    borderRadius: 10,
    border: 'none',
    fontWeight: 600,
    fontSize: 13,
    cursor: 'pointer',
    boxShadow: '0 3px 10px rgba(30,58,138,0.18)',
  };

  const smallBtnAlt = {
    ...smallBtn,
    background: colors.secondary,
    color: '#111827',
    boxShadow: '0 3px 10px rgba(245,158,11,0.22)',
  };

  // Handlers for connectivity actions
  const handleFetchRoles = async () => {
    setConnError(null);
    setRolesLoading(true);
    setRolesCount(null);
    try {
      const data = await getRoles();
      setRolesCount(Array.isArray(data) ? data.length : 0);
    } catch (e) {
      setConnError(e.message || String(e));
    } finally {
      setRolesLoading(false);
    }
  };

  const handleSampleGapAnalysis = async () => {
    setConnError(null);
    setGaLoading(true);
    setGaResult(null);
    try {
      // Use a simple sample: current=1, target=2 (IDs will exist after seed)
      const data = await postGapAnalysis({ currentRoleId: 1, targetRoleId: 2 });
      setGaResult({
        strengths: data?.strengths?.length ?? 0,
        gaps: data?.gaps?.length ?? 0,
        recommendations: data?.recommendations?.slice(0, 2) ?? [],
      });
    } catch (e) {
      setConnError(e.message || String(e));
    } finally {
      setGaLoading(false);
    }
  };

  const handleSampleRecommend = async () => {
    setConnError(null);
    setRecLoading(true);
    setRecResult(null);
    try {
      const data = await postRecommend({
        skillName: 'System Design',
        skillDescription: 'Architecting scalable and reliable web services.',
        requiredLevel: 4,
      });
      // Show just counts and a peek
      setRecResult({
        stepsCount: data?.steps?.length ?? 0,
        resourcesCount: data?.resources?.length ?? 0,
        projectsCount: data?.projects?.length ?? 0,
        sampleStep: data?.steps?.[0] ?? '',
      });
    } catch (e) {
      setConnError(e.message || String(e));
    } finally {
      setRecLoading(false);
    }
  };

  const renderMainContent = () => {
    const searchNotice =
      searching && searchSubmitted ? (
        <div role="status" aria-live="polite" style={{ padding: '10px 14px', background: '#fff', border: `1px solid ${colors.border}`, borderRadius: 10 }}>
          Searching for "{searchSubmitted}"...
        </div>
      ) : searchSubmitted ? (
        <div role="status" aria-live="polite" style={{ padding: '10px 14px', background: '#fff', border: `1px solid ${colors.border}`, borderRadius: 10 }}>
          No results yet — backend pending. Last query: "{searchSubmitted}"
        </div>
      ) : null;

      const sectionBox = (title, copy) => (
        <section aria-label={`${title} Content`} style={{ background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: 12, boxShadow: colors.shadow, padding: 16 }}>
          <h2 style={{ margin: '0 0 6px', fontSize: 20, color: colors.primary }}>{title}</h2>
          <p style={{ margin: 0, color: colors.textMuted, fontSize: 14 }}>{copy}</p>
        </section>
      );

      let sectionContent = null;
      switch (selected) {
        case 'Dashboard':
          sectionContent = sectionBox('Dashboard', 'Overview of your tools and recent activity. Explore cards below to get started.');
          break;
        case 'Career Paths':
          sectionContent = sectionBox('Career Paths', 'Browse curated paths and role expectations. Integration with backend pending.');
          break;
        case 'Job Recommendations':
          sectionContent = sectionBox('Job Recommendations', 'Personalized role suggestions based on your strengths and goals (stub).');
          break;
        case 'Resources':
          sectionContent = sectionBox('Resources', 'Handpicked learning materials and reference guides (coming soon).');
          break;
        case 'Progress':
          sectionContent = sectionBox('Progress', 'Track skill levels and milestones. Update your growth over time.');
          break;
        default:
          sectionContent = null;
      }

      return (
        <>
          {searchNotice}

          {/* Connectivity Panel */}
          <section aria-label="Connectivity" style={panelBoxStyle}>
            <h2 style={{ margin: '0 0 8px', fontSize: 18, color: colors.primary }}>
              Connectivity
            </h2>
            <p style={{ margin: '0 0 12px', color: colors.textMuted, fontSize: 14 }}>
              Quick checks to verify backend and recommender services are reachable.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <button type="button" style={smallBtn} onClick={handleFetchRoles} disabled={rolesLoading}>
                {rolesLoading ? 'Fetching roles…' : 'Fetch Roles'}
              </button>
              <button type="button" style={smallBtnAlt} onClick={handleSampleGapAnalysis} disabled={gaLoading}>
                {gaLoading ? 'Running gap-analysis…' : 'Sample Gap Analysis'}
              </button>
              <button type="button" style={smallBtn} onClick={handleSampleRecommend} disabled={recLoading}>
                {recLoading ? 'Requesting recommendations…' : 'Sample Recommend'}
              </button>
            </div>

            <div style={{ marginTop: 12, display: 'grid', gap: 8 }}>
              {rolesCount !== null && (
                <div
                  style={{
                    background: '#fff',
                    border: `1px solid ${colors.border}`,
                    borderRadius: 10,
                    padding: '10px 12px',
                    fontSize: 14,
                  }}
                >
                  Roles count: <strong>{rolesCount}</strong>
                </div>
              )}

              {gaResult && (
                <div
                  style={{
                    background: '#fff',
                    border: `1px solid ${colors.border}`,
                    borderRadius: 10,
                    padding: '10px 12px',
                    fontSize: 14,
                  }}
                >
                  Gap analysis — strengths: <strong>{gaResult.strengths}</strong>, gaps:{" "}
                  <strong>{gaResult.gaps}</strong>
                  {gaResult.recommendations?.length ? (
                    <div style={{ marginTop: 6, color: colors.textMuted }}>
                      Sample recommendations:
                      <ul style={{ margin: '6px 0 0 18px' }}>
                        {gaResult.recommendations.map((r, idx) => (
                          <li key={idx}>{r.suggestion || JSON.stringify(r)}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              )}

              {recResult && (
                <div
                  style={{
                    background: '#fff',
                    border: `1px solid ${colors.border}`,
                    borderRadius: 10,
                    padding: '10px 12px',
                    fontSize: 14,
                  }}
                >
                  Recommendations — steps: <strong>{recResult.stepsCount}</strong>, resources:{" "}
                  <strong>{recResult.resourcesCount}</strong>, projects:{" "}
                  <strong>{recResult.projectsCount}</strong>
                  {recResult.sampleStep ? (
                    <div style={{ marginTop: 6, color: colors.textMuted }}>
                      Sample step: “{recResult.sampleStep}”
                    </div>
                  ) : null}
                </div>
              )}

              {connError && (
                <div
                  role="alert"
                  style={{
                    background: 'rgba(220,38,38,0.06)',
                    border: '1px solid rgba(220,38,38,0.25)',
                    color: colors.error,
                    borderRadius: 10,
                    padding: '10px 12px',
                    fontSize: 14,
                  }}
                >
                  {connError}. Tips: ensure backend is running on http://localhost:8000 or set REACT_APP_BACKEND_URL/REACT_APP_API_BASE. If you see CORS errors, allow http://localhost:3000 in backend CORS config or run via docker compose.
                </div>
              )}
            </div>
          </section>

          {sectionContent}
        </>
      );
  };

  return (
    <div style={styles.app}>
      {/* Top Navigation */}
      <header style={styles.topNav} aria-label="Top Navigation" role="banner">
        <div style={styles.topNavInner}>
          <div style={styles.brand} aria-label="Application Brand">
            <span style={styles.logoDot} aria-hidden="true" />
            <span>Career Navigator</span>
          </div>
          <div style={styles.grow} />
          {/* Search: wrapped in a form to allow Enter submit */}
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
            {/* Hidden submit button to enable Enter without adding visible UI */}
            <button type="submit" style={{ position: 'absolute', left: -9999, width: 1, height: 1, overflow: 'hidden' }} aria-hidden="true">Search</button>
          </form>
        </div>
      </header>

      {/* Main Layout */}
      <div
        style={{
          ...styles.layout,
          gridTemplateColumns: '260px 1fr',
        }}
      >
        {/* Sidebar */}
        <aside style={styles.sidebar} aria-label="Sidebar Navigation">
          <div style={styles.sidebarHeader}>Navigation</div>
          <ul style={styles.navList} role="menubar" aria-label="Primary">
            {SECTIONS.map((s) => {
              const active = selected === s.key;
              const baseStyle = {
                ...styles.navItem,
                ...(active ? sectionActiveStyle : {}),
              };
              return (
                <li key={s.key} role="none">
                  <a
                    href="#"
                    {...hoverStyle(baseStyle, styles.navItemHover)}
                    role="menuitem"
                    aria-current={active ? 'page' : undefined}
                    aria-label={s.label}
                    tabIndex={0}
                    onClick={(e) => { e.preventDefault(); handleSelect(s.key); }}
                    onKeyDown={keyActivate((e) => { e.preventDefault(); handleSelect(s.key); })}
                  >
                    <span style={styles.navIcon} aria-hidden="true">{s.icon}</span>
                    <span>{s.label}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </aside>

        {/* Main content */}
        <main style={styles.main} role="main">
          {/* Hero Banner */}
          <section style={styles.hero} aria-labelledby="hero-title">
            <div style={styles.heroAccent} aria-hidden="true" />
            <h1 id="hero-title" style={styles.heroTitle}>
              Chart Your Path with Confidence
            </h1>
            <p style={styles.heroSubtitle}>
              Discover tailored career paths, get role-based recommendations, and track your growth —
              all in one elegant workspace designed for professionals.
            </p>
            <div style={styles.heroCtas}>
              <button
                type="button"
                style={styles.btnPrimary}
                onClick={goToPaths}
                onKeyDown={keyActivate(goToPaths)}
                aria-label="Explore Roles - go to Career Paths"
              >
                Explore Roles
              </button>
              <button
                type="button"
                style={styles.btnSecondary}
                onClick={goToRecs}
                onKeyDown={keyActivate(goToRecs)}
                aria-label="Start Analysis - go to Job Recommendations"
              >
                Start Analysis
              </button>
            </div>
          </section>

          {/* Feature Cards */}
          <section
            aria-label="Key Features"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <div
              style={{
                ...styles.cardsGrid,
                gridTemplateColumns: 'repeat(3, minmax(0,1fr))',
              }}
            >
              <article
                {...hoverStyle({ ...styles.card }, { transform: 'translateY(-2px)' })}
                aria-labelledby="card-paths-title"
                role="button"
                tabIndex={0}
                onClick={goToPaths}
                onKeyDown={keyActivate(goToPaths)}
                aria-pressed={selected === 'Career Paths' ? 'true' : 'false'}
              >
                <div style={styles.cardHeader}>
                  <span style={styles.cardIcon} aria-hidden="true">🧭</span>
                  <h3 id="card-paths-title" style={styles.cardTitle}>Career Paths</h3>
                </div>
                <p style={styles.cardDesc}>
                  Browse curated paths from Senior Engineer to CTO. Understand required skills and competencies.
                </p>
                <button
                  type="button"
                  style={styles.cardCta}
                  onClick={(e) => { e.stopPropagation(); goToPaths(); }}
                  onKeyDown={keyActivate((e) => { e.stopPropagation(); goToPaths(); })}
                  aria-label="View Career Paths"
                >
                  View Paths
                </button>
              </article>

              <article
                {...hoverStyle({ ...styles.card }, { transform: 'translateY(-2px)' })}
                aria-labelledby="card-recs-title"
                role="button"
                tabIndex={0}
                onClick={goToRecs}
                onKeyDown={keyActivate(goToRecs)}
                aria-pressed={selected === 'Job Recommendations' ? 'true' : 'false'}
              >
                <div style={styles.cardHeader}>
                  <span style={styles.cardIcon} aria-hidden="true">💼</span>
                  <h3 id="card-recs-title" style={styles.cardTitle}>Job Recommendations</h3>
                </div>
                <p style={styles.cardDesc}>
                  Match your strengths to roles and get actionable steps to close gaps and ace opportunities.
                </p>
                <button
                  type="button"
                  style={styles.cardCta}
                  onClick={(e) => { e.stopPropagation(); goToRecs(); }}
                  onKeyDown={keyActivate((e) => { e.stopPropagation(); goToRecs(); })}
                  aria-label="See Job Recommendations"
                >
                  See Recommendations
                </button>
              </article>

              <article
                {...hoverStyle({ ...styles.card }, { transform: 'translateY(-2px)' })}
                aria-labelledby="card-progress-title"
                role="button"
                tabIndex={0}
                onClick={goToProgress}
                onKeyDown={keyActivate(goToProgress)}
                aria-pressed={selected === 'Progress' ? 'true' : 'false'}
              >
                <div style={styles.cardHeader}>
                  <span style={styles.cardIcon} aria-hidden="true">📈</span>
                  <h3 id="card-progress-title" style={styles.cardTitle}>Progress Tracking</h3>
                </div>
                <p style={styles.cardDesc}>
                  Log your skill levels, measure improvement over time, and celebrate milestone achievements.
                </p>
                <button
                  type="button"
                  style={styles.cardCta}
                  onClick={(e) => { e.stopPropagation(); goToProgress(); }}
                  onKeyDown={keyActivate((e) => { e.stopPropagation(); goToProgress(); })}
                  aria-label="Track Progress"
                >
                  Track Progress
                </button>
              </article>
            </div>
          </section>

          {renderMainContent()}
        </main>
      </div>

      {/* Footer */}
      <footer style={styles.footer} aria-label="Footer">
        <div style={styles.footerInner}>
          © {new Date().getFullYear()} Career Navigator — All rights reserved.
        </div>
      </footer>

      {/* Responsive helpers via inline style tags */}
      <style>
        {`
          @media (max-width: 1024px) {
            .layout-grid {
              grid-template-columns: 1fr;
            }
          }
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
