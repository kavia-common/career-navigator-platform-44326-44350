import React from 'react';

/**
 * Ocean Professional themed landing page for the Career Navigation Platform.
 * - Single-file component with inline CSS-in-JS (no external deps).
 * - Layout:
 *    - Top navigation bar with app title and a non-functional search field.
 *    - Left sidebar with sections: Dashboard, Career Paths, Job Recommendations, Resources, Progress.
 *    - Main area with hero banner and three feature cards.
 *    - Footer with concise copyright.
 * - Colors:
 *    - primary:   #1E3A8A
 *    - secondary: #F59E0B
 *    - success:   #059669
 *    - error:     #DC2626
 *    - background:#F3F4F6
 *    - surface:   #FFFFFF
 *    - text:      #111827
 * - Clean, classic aesthetic with subtle shadows and responsiveness.
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
  },
  navItemHover: {
    background: 'rgba(30,58,138,0.06)',
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
  // Responsive adjustments
  '@media(maxWidth: 1024px)': {},
};

// Utility: hover style merge for inline events
function hoverStyle(base, hover) {
  return {
    onMouseEnter: (e) => Object.assign(e.currentTarget.style, hover),
    onMouseLeave: (e) => Object.assign(e.currentTarget.style, {}),
    style: base,
  };
}

// PUBLIC_INTERFACE
function App() {
  return (
    <div style={styles.app}>
      {/* Top Navigation */}
      <header style={styles.topNav} aria-label="Top Navigation">
        <div style={styles.topNavInner}>
          <div style={styles.brand}>
            <span style={styles.logoDot} aria-hidden="true" />
            <span>Career Navigator</span>
          </div>
          <div style={styles.grow} />
          <div style={styles.searchWrap}>
            <span style={styles.searchIcon} aria-hidden="true">🔎</span>
            <input
              type="search"
              placeholder="Search roles, skills, resources..."
              aria-label="Search"
              style={styles.searchInput}
            />
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div
        style={{
          ...styles.layout,
          // Make the grid responsive
          gridTemplateColumns: '260px 1fr',
        }}
      >
        {/* Sidebar */}
        <aside style={styles.sidebar} aria-label="Sidebar Navigation">
          <div style={styles.sidebarHeader}>Navigation</div>
          <ul style={styles.navList}>
            <li>
              <a
                href="#"
                {...hoverStyle(styles.navItem, styles.navItemHover)}
              >
                <span style={styles.navIcon} aria-hidden="true">🏠</span>
                <span>Dashboard</span>
              </a>
            </li>
            <li>
              <a
                href="#career-paths"
                {...hoverStyle(styles.navItem, styles.navItemHover)}
              >
                <span style={styles.navIcon} aria-hidden="true">🧭</span>
                <span>Career Paths</span>
              </a>
            </li>
            <li>
              <a
                href="#job-recs"
                {...hoverStyle(styles.navItem, styles.navItemHover)}
              >
                <span style={styles.navIcon} aria-hidden="true">💼</span>
                <span>Job Recommendations</span>
              </a>
            </li>
            <li>
              <a
                href="#resources"
                {...hoverStyle(styles.navItem, styles.navItemHover)}
              >
                <span style={styles.navIcon} aria-hidden="true">📚</span>
                <span>Resources</span>
              </a>
            </li>
            <li>
              <a
                href="#progress"
                {...hoverStyle(styles.navItem, styles.navItemHover)}
              >
                <span style={styles.navIcon} aria-hidden="true">📈</span>
                <span>Progress</span>
              </a>
            </li>
          </ul>
        </aside>

        {/* Main content */}
        <main style={styles.main}>
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
              <button type="button" style={styles.btnPrimary}>
                Explore Roles
              </button>
              <button type="button" style={styles.btnSecondary}>
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
                // Responsive grid rules inline
                gridTemplateColumns: 'repeat(3, minmax(0,1fr))',
              }}
            >
              <article
                {...hoverStyle({ ...styles.card }, { transform: 'translateY(-2px)' })}
                aria-labelledby="card-paths-title"
              >
                <div style={styles.cardHeader}>
                  <span style={styles.cardIcon} aria-hidden="true">🧭</span>
                  <h3 id="card-paths-title" style={styles.cardTitle}>Career Paths</h3>
                </div>
                <p style={styles.cardDesc}>
                  Browse curated paths from Senior Engineer to CTO. Understand required skills and competencies.
                </p>
                <button type="button" style={styles.cardCta}>View Paths</button>
              </article>

              <article
                {...hoverStyle({ ...styles.card }, { transform: 'translateY(-2px)' })}
                aria-labelledby="card-recs-title"
              >
                <div style={styles.cardHeader}>
                  <span style={styles.cardIcon} aria-hidden="true">💼</span>
                  <h3 id="card-recs-title" style={styles.cardTitle}>Job Recommendations</h3>
                </div>
                <p style={styles.cardDesc}>
                  Match your strengths to roles and get actionable steps to close gaps and ace opportunities.
                </p>
                <button type="button" style={styles.cardCta}>See Recommendations</button>
              </article>

              <article
                {...hoverStyle({ ...styles.card }, { transform: 'translateY(-2px)' })}
                aria-labelledby="card-progress-title"
              >
                <div style={styles.cardHeader}>
                  <span style={styles.cardIcon} aria-hidden="true">📈</span>
                  <h3 id="card-progress-title" style={styles.cardTitle}>Progress Tracking</h3>
                </div>
                <p style={styles.cardDesc}>
                  Log your skill levels, measure improvement over time, and celebrate milestone achievements.
                </p>
                <button type="button" style={styles.cardCta}>Track Progress</button>
              </article>
            </div>
          </section>
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
            /* Stack sidebar above main by switching to 1 column */
            div[style*="grid-template-columns: 260px 1fr"] {
              grid-template-columns: 1fr !important;
            }
          }
          @media (max-width: 780px) {
            /* Cards: 2 columns on tablets */
            div[style*="grid-template-columns: repeat(3"] {
              grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            }
          }
          @media (max-width: 520px) {
            /* Cards: 1 column on phones */
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
