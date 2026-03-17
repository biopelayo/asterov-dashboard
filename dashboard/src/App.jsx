import { useState, useEffect } from 'react'
import { Routes, Route, NavLink, useLocation } from 'react-router-dom'
import KitViewer from './components/KitViewer'
import Overview from './pages/Overview'
import Standings from './pages/Standings'
import Calendar from './pages/Calendar'
import TeamView from './pages/TeamView'
import Statistics from './pages/Statistics'
import Sanctions from './pages/Sanctions'
import LineupBuilder from './pages/LineupBuilder'
import Vestuario from './pages/Vestuario'
import Galeria from './pages/Galeria'

/* SVG icons — Bold sport style, 24x24 viewBox */
const icons = {
  overview: (
    /* Balón de fútbol */
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9.5" />
      <path d="M12 2.5c0 0-2.5 3-2.5 5.5s2.5 5.5 2.5 5.5 2.5-3 2.5-5.5S12 2.5 12 2.5z" />
      <path d="M2.5 12c0 0 3 2.5 5.5 2.5s5.5-2.5 5.5-2.5-3-2.5-5.5-2.5S2.5 12 2.5 12z" />
      <path d="M21.5 12c0 0-3 2.5-5.5 2.5S10.5 12 10.5 12s3-2.5 5.5-2.5S21.5 12 21.5 12z" />
      <path d="M12 21.5c0 0-2.5-3-2.5-5.5S12 10.5 12 10.5s2.5 3 2.5 5.5S12 21.5 12 21.5z" />
    </svg>
  ),
  standings: (
    /* Podio / trofeo con 1-2-3 */
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H3v-5h6v5zM15 21H9v-9h6v9zM21 21h-6v-7h6v7z" />
      <path d="M12 5l.9 2.8H16l-2.6 1.9 1 2.8L12 10.6 9.6 12.5l1-2.8L8 7.8h3.1L12 5z" fill="currentColor" opacity="0.4" stroke="none" />
      <path d="M12 5l.9 2.8H16l-2.6 1.9 1 2.8L12 10.6 9.6 12.5l1-2.8L8 7.8h3.1L12 5z" />
    </svg>
  ),
  calendar: (
    /* Calendario con número de jornada */
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18" />
      <path d="M8 3v4M16 3v4" />
      <path d="M8 14.5l1.5-1.5v4M12 13h2.5M12 17h2.5" />
    </svg>
  ),
  team: (
    /* Escudo clásico */
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L4 5.5v6C4 16.5 7.5 21 12 22c4.5-1 8-5.5 8-10.5v-6L12 2z" />
      <path d="M12 7v10M8 12h8" strokeWidth="1.4" opacity="0.7" />
    </svg>
  ),
  stats: (
    /* Gráfico de barras ascendente con flecha */
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 20h18" />
      <rect x="4" y="14" width="3" height="6" rx="0.5" fill="currentColor" opacity="0.35" stroke="none" />
      <rect x="4" y="14" width="3" height="6" rx="0.5" />
      <rect x="10.5" y="9" width="3" height="11" rx="0.5" fill="currentColor" opacity="0.35" stroke="none" />
      <rect x="10.5" y="9" width="3" height="11" rx="0.5" />
      <rect x="17" y="4" width="3" height="16" rx="0.5" fill="currentColor" opacity="0.35" stroke="none" />
      <rect x="17" y="4" width="3" height="16" rx="0.5" />
      <path d="M6 14l4-5 3 2 5-7" strokeWidth="1.5" />
      <path d="M16 4h3v3" />
    </svg>
  ),
  sanctions: (
    /* Tarjeta amarilla/roja árbitro */
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="9" height="13" rx="1.5" fill="currentColor" opacity="0.4" stroke="none" />
      <rect x="5" y="2" width="9" height="13" rx="1.5" />
      <rect x="10" y="7" width="9" height="13" rx="1.5" fill="currentColor" opacity="0.15" stroke="none" />
      <rect x="10" y="7" width="9" height="13" rx="1.5" />
    </svg>
  ),
  lineup: (
    /* Campo de fútbol horizontal con jugadores */
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="1.5" />
      <line x1="12" y1="5" x2="12" y2="19" strokeDasharray="2 1.5" strokeWidth="1.2" />
      <circle cx="12" cy="12" r="2.5" />
      {/* Portería izquierda */}
      <path d="M2 9.5h2v5H2" strokeWidth="1.4" />
      {/* Portería derecha */}
      <path d="M22 9.5h-2v5h2" strokeWidth="1.4" />
      {/* Jugadores */}
      <circle cx="5" cy="12" r="1.2" fill="currentColor" />
      <circle cx="9" cy="8.5" r="1.2" fill="currentColor" />
      <circle cx="9" cy="15.5" r="1.2" fill="currentColor" />
      <circle cx="16" cy="10" r="1.2" fill="currentColor" />
      <circle cx="16" cy="14" r="1.2" fill="currentColor" />
      <circle cx="20" cy="12" r="1.2" fill="currentColor" />
    </svg>
  ),
  vestuario: (
    /* Percha / camiseta de vestuario */
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3c-1.1 0-2 .9-2 2H6L3 8l3 2 1-1v9h10V9l1 1 3-2-3-3h-4c0-1.1-.9-2-2-2z" />
      <path d="M10 5c0 1.1.9 2 2 2s2-.9 2-2" strokeWidth="1.3" opacity="0.5" />
    </svg>
  ),
  galeria: (
    /* Cámara de fotos */
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 7l-2-3H10L8 7" />
      <circle cx="12" cy="14" r="3.5" />
      <circle cx="18" cy="10" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),
}

const PAGES = [
  { path: '/', label: 'Resumen', icon: 'overview' },
  { path: '/standings', label: 'Clasificacion', icon: 'standings' },
  { path: '/calendar', label: 'Calendario', icon: 'calendar' },
  { path: '/team', label: 'Mi Equipo', icon: 'team' },
  { path: '/statistics', label: 'Estadisticas', icon: 'stats' },
  { path: '/sanctions', label: 'Sanciones', icon: 'sanctions' },
  { path: '/lineup', label: 'Alineacion', icon: 'lineup' },
  { path: '/vestuario', label: 'Vestuario', icon: 'vestuario' },
  { path: '/galeria', label: 'Galeria', icon: 'galeria' },
]

const PAGE_TITLES = {
  '/': 'Resumen General',
  '/standings': 'Clasificacion',
  '/calendar': 'Calendario de Partidos',
  '/team': 'Ficha de Equipo',
  '/statistics': 'Estadisticas de Jugadores',
  '/sanctions': 'Sanciones',
  '/lineup': 'Constructor de Alineacion',
  '/vestuario': 'Vestuario — San Claudio',
  '/galeria': 'Galería del Equipo',
}

async function loadJSON(file) {
  const resp = await fetch(`${import.meta.env.BASE_URL}${file}`)
  if (!resp.ok) throw new Error(`Failed to load ${file}`)
  return resp.json()
}

export default function App() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dark, setDark] = useState(false)
  const location = useLocation()

  // Theme toggle
  const toggleTheme = () => {
    setDark((d) => {
      document.documentElement.classList.toggle('dark', !d)
      return !d
    })
  }

  useEffect(() => {
    Promise.all([
      loadJSON('meta.json'),
      loadJSON('standings.json'),
      loadJSON('calendar.json'),
      loadJSON('teams.json'),
      loadJSON('statistics.json'),
      loadJSON('sanctions.json'),
      loadJSON('news.json'),
      loadJSON('san_claudio_players.json'),
      loadJSON('galeria.json'),
    ])
      .then(([meta, standings, calendar, teams, statistics, sanctions, news, playerProfiles, galeria]) => {
        setData({ meta, standings, calendar, teams, statistics, sanctions, news, playerProfiles, galeria })
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  const currentPath = location.pathname
  const pageTitle = PAGE_TITLES[currentPath] || 'Liga Asterov'

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#80868b' }}>
        Cargando datos de la Liga Asterov...
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#d93025' }}>
        Error: {error}. Ejecuta primero el scraper (python scraper.py).
      </div>
    )
  }

  return (
    <>
      <aside className="sidebar">
        <div className="sidebar-logo">
          {data.teams[data.meta.featured_team_id]?.logo && (
            <img src={data.teams[data.meta.featured_team_id].logo} alt="San Claudio" />
          )}
          <div className="brand">
            <h1>San Claudio</h1>
            <small>Liga Asterov 25/26</small>
          </div>
        </div>
        <nav>
          <div className="sidebar-section">Navegacion</div>
          {PAGES.map((p) => (
            <NavLink
              key={p.path}
              to={p.path}
              end={p.path === '/'}
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              <span className="nav-icon">{icons[p.icon]}</span>
              {p.label}
            </NavLink>
          ))}

          <div className="sidebar-section" style={{ marginTop: 12 }}>1ª División</div>
          {data.standings['1a_division']?.teams?.map((t) => (
            <NavLink
              key={t.team_id}
              to={`/team/${t.team_id}`}
              className={({ isActive }) => (isActive ? 'active' : '')}
              style={t.name === 'SAN CLAUDIO' ? { fontWeight: 600 } : {}}
            >
              {t.logo && <img src={t.logo} alt="" style={{ width: 20, height: 20, borderRadius: 3 }} />}
              <span style={{ fontSize: 13 }}>{t.name}</span>
            </NavLink>
          ))}
          <div className="sidebar-section" style={{ marginTop: 10 }}>2ª División</div>
          {data.standings['2a_division']?.teams?.map((t) => (
            <NavLink
              key={t.team_id}
              to={`/team/${t.team_id}`}
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              {t.logo && <img src={t.logo} alt="" style={{ width: 20, height: 20, borderRadius: 3 }} />}
              <span style={{ fontSize: 13 }}>{t.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* Kit Viewer al fondo del sidebar */}
        <KitViewer />

        {/* Copyright */}
        <div className="sidebar-copyright">
          <span>© {new Date().getFullYear()} Pelayo González de Lena</span>
          <a href="https://biopelayo.github.io" target="_blank" rel="noopener noreferrer">biopelayo.github.io</a>
        </div>
      </aside>

      <div className="main">
        <header className="header">
          <h2>{pageTitle}</h2>
          <span className="meta">
            Actualizado: {new Date(data.meta.last_updated).toLocaleDateString('es-ES')}
          </span>
          <button className="theme-toggle" onClick={toggleTheme} title="Cambiar tema">
            {dark ? '\u2600' : '\u263D'}
          </button>
        </header>

        <div className="content">
          <Routes>
            <Route path="/" element={<Overview data={data} />} />
            <Route path="/standings" element={<Standings data={data} />} />
            <Route path="/calendar" element={<Calendar data={data} />} />
            <Route path="/team" element={<TeamView data={data} teamId={data.meta.featured_team_id} />} />
            <Route path="/team/:teamId" element={<TeamView data={data} />} />
            <Route path="/statistics" element={<Statistics data={data} />} />
            <Route path="/sanctions" element={<Sanctions data={data} />} />
            <Route path="/lineup" element={<LineupBuilder data={data} />} />
            <Route path="/vestuario" element={<Vestuario data={data} />} />
            <Route path="/galeria" element={<Galeria data={data} />} />
          </Routes>
        </div>
      </div>
    </>
  )
}
