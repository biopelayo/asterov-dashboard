import { Link } from 'react-router-dom'
import { useMemo } from 'react'

export default function Overview({ data }) {
  const { meta, standings, calendar, teams } = data
  const featured = teams[meta.featured_team_id]
  const featuredStandings = featured?.standings

  // All matches for featured team
  const { played: playedMatches, upcoming: upcomingMatches } = useMemo(() => {
    const played = []
    const upcoming = []
    for (const div of Object.values(calendar)) {
      for (const round of div.rounds) {
        for (const m of round.matches) {
          if (m.home === featured?.name || m.away === featured?.name) {
            const isHome = m.home === featured?.name
            if (m.played) {
              const gf = isHome ? m.home_goals : m.away_goals
              const ga = isHome ? m.away_goals : m.home_goals
              const res = gf > ga ? 'V' : gf === ga ? 'E' : 'D'
              played.push({ ...m, round: round.round, isHome, gf, ga, result: res })
            } else {
              upcoming.push({ ...m, round: round.round })
            }
          }
        }
      }
    }
    return { played, upcoming }
  }, [calendar, featured])

  const recentMatches = playedMatches.slice(-5)

  // Analytics
  const homeMatches = playedMatches.filter((m) => m.isHome)
  const awayMatches = playedMatches.filter((m) => !m.isHome)
  const homeWins = homeMatches.filter((m) => m.result === 'V').length
  const awayWins = awayMatches.filter((m) => m.result === 'V').length
  const goalsPerGame = featuredStandings ? (featuredStandings.goals_for / featuredStandings.played).toFixed(1) : '-'
  const concededPerGame = featuredStandings ? (featuredStandings.goals_against / featuredStandings.played).toFixed(1) : '-'

  // Top scorers
  const topScorers = [...(featured?.players || [])]
    .filter((p) => p.total_goals > 0)
    .sort((a, b) => b.total_goals - a.total_goals)
    .slice(0, 5)

  // Active players (5+ matches)
  const activePlayers = (featured?.players || []).filter((p) => p.matches_played >= 5).length

  return (
    <div>
      {/* Stats summary */}
      <div className="stats-row">
        <div className="stat-card" data-dorsal="26">
          <div className="value">{meta.stats_summary.total_teams}</div>
          <div className="label">Equipos</div>
        </div>
        <div className="stat-card" data-dorsal="10">
          <div className="value">{meta.stats_summary.total_players}</div>
          <div className="label">Jugadores</div>
        </div>
        <div className="stat-card" data-dorsal="90">
          <div className="value">{meta.stats_summary.total_matches}</div>
          <div className="label">Partidos</div>
        </div>
        <div className="stat-card featured" data-dorsal="1">
          <div className="value" style={{ color: 'var(--featured)' }}>
            {featuredStandings?.position || '-'}
          </div>
          <div className="label">{featured?.name} - Posicion</div>
        </div>
        <div className="stat-card featured" data-dorsal="9">
          <div className="value" style={{ color: 'var(--featured)' }}>
            {featuredStandings?.points || '-'}
          </div>
          <div className="label">{featured?.name} - Puntos</div>
        </div>
      </div>

      <div className="grid-2">
        {/* Featured team card with award image */}
        <div className="card">
          <div className="card-title">{featured?.name}</div>
          <div className="team-header" style={{ marginBottom: 12 }}>
            {featured?.logo && (
              <img src={featured.logo} alt={featured.name} />
            )}
            <div>
              <h2 style={{ fontSize: 20, color: 'var(--text-bright)' }}>{featured?.name}</h2>
              <span className="division-badge">
                {featured?.division === '1a_division' ? '1a Division' : '2a Division'}
              </span>
            </div>
          </div>

          {/* Award image */}
          <div style={{
            borderRadius: 8,
            overflow: 'hidden',
            marginBottom: 14,
            border: '1px solid var(--border)',
          }}>
            <img
              src="/san_claudio_award.jpg"
              alt="San Claudio - Equipo mas deportivo 2023/24"
              style={{ width: '100%', display: 'block' }}
            />
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 14, fontStyle: 'italic' }}>
            Equipo mas deportivo en 1a Division, temporada 2023/24
          </p>

          <table className="data-table">
            <thead>
              <tr>
                <th className="num">PJ</th><th className="num">G</th><th className="num">E</th>
                <th className="num">P</th><th className="num">GF</th><th className="num">GC</th>
                <th className="num">Pts</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="num">{featuredStandings?.played}</td>
                <td className="num">{featuredStandings?.won}</td>
                <td className="num">{featuredStandings?.drawn}</td>
                <td className="num">{featuredStandings?.lost}</td>
                <td className="num">{featuredStandings?.goals_for}</td>
                <td className="num">{featuredStandings?.goals_against}</td>
                <td className="num" style={{ fontWeight: 700, color: 'var(--accent)' }}>
                  {featuredStandings?.points}
                </td>
              </tr>
            </tbody>
          </table>
          <div style={{ marginTop: 12, textAlign: 'right' }}>
            <Link to={`/team/${meta.featured_team_id}`}>Ver ficha completa</Link>
          </div>
        </div>

        {/* Analytics card */}
        <div>
          <div className="card">
            <div className="card-title">Analisis - {featured?.name}</div>
            <div className="stats-row" style={{ marginBottom: 0 }}>
              <div className="stat-card" style={{ padding: 10 }}>
                <div className="value" style={{ fontSize: 20 }}>{goalsPerGame}</div>
                <div className="label" style={{ fontSize: 10 }}>Goles/partido</div>
              </div>
              <div className="stat-card" style={{ padding: 10 }}>
                <div className="value" style={{ fontSize: 20 }}>{concededPerGame}</div>
                <div className="label" style={{ fontSize: 10 }}>Encajados/partido</div>
              </div>
              <div className="stat-card" style={{ padding: 10 }}>
                <div className="value" style={{ fontSize: 20 }}>{activePlayers}</div>
                <div className="label" style={{ fontSize: 10 }}>Jugadores activos</div>
              </div>
              <div className="stat-card" style={{ padding: 10 }}>
                <div className="value" style={{ fontSize: 20, color: 'var(--win)' }}>
                  {featuredStandings ? `${Math.round(featuredStandings.won / featuredStandings.played * 100)}%` : '-'}
                </div>
                <div className="label" style={{ fontSize: 10 }}>% Victorias</div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-title">Casa vs Fuera</div>
            <table className="data-table">
              <thead>
                <tr>
                  <th></th><th className="num">PJ</th><th className="num">G</th>
                  <th className="num">E</th><th className="num">D</th>
                  <th className="num">GF</th><th className="num">GC</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ fontWeight: 600 }}>Casa</td>
                  <td className="num">{homeMatches.length}</td>
                  <td className="num" style={{ color: 'var(--win)' }}>{homeWins}</td>
                  <td className="num">{homeMatches.filter((m) => m.result === 'E').length}</td>
                  <td className="num" style={{ color: 'var(--loss)' }}>{homeMatches.filter((m) => m.result === 'D').length}</td>
                  <td className="num">{homeMatches.reduce((s, m) => s + m.gf, 0)}</td>
                  <td className="num">{homeMatches.reduce((s, m) => s + m.ga, 0)}</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>Fuera</td>
                  <td className="num">{awayMatches.length}</td>
                  <td className="num" style={{ color: 'var(--win)' }}>{awayWins}</td>
                  <td className="num">{awayMatches.filter((m) => m.result === 'E').length}</td>
                  <td className="num" style={{ color: 'var(--loss)' }}>{awayMatches.filter((m) => m.result === 'D').length}</td>
                  <td className="num">{awayMatches.reduce((s, m) => s + m.gf, 0)}</td>
                  <td className="num">{awayMatches.reduce((s, m) => s + m.ga, 0)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="card">
            <div className="card-title">Goleadores - {featured?.name}</div>
            <table className="data-table">
              <thead>
                <tr>
                  <th></th><th>Jugador</th><th className="num">G</th>
                  <th className="num">PJ</th><th className="num">G/PJ</th>
                </tr>
              </thead>
              <tbody>
                {topScorers.map((p, i) => (
                  <tr key={p.player_id || i}>
                    <td>
                      {p.photo ? <img className="player-photo" src={p.photo} alt="" /> : <div className="player-photo" />}
                    </td>
                    <td style={{ color: 'var(--text-bright)' }}>{p.name}</td>
                    <td className="num" style={{ fontWeight: 700, color: 'var(--accent)' }}>{p.total_goals}</td>
                    <td className="num">{p.matches_played}</td>
                    <td className="num" style={{ color: 'var(--text-dim)' }}>
                      {(p.total_goals / (p.matches_played || 1)).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grid-2">
        {/* Recent results */}
        <div className="card">
          <div className="card-title">Ultimos resultados - {featured?.name}</div>
          {recentMatches.map((m, i) => (
            <div key={i} className="match-card featured" style={{ marginBottom: 6 }}>
              <div className="home">
                <div className="team-name" style={m.home === featured?.name ? { fontWeight: 600 } : {}}>
                  {m.home}
                </div>
              </div>
              <div className="score">
                {m.home_goals} - {m.away_goals}
                <div style={{
                  fontSize: 10,
                  color: m.result === 'V' ? 'var(--win)' : m.result === 'E' ? 'var(--draw)' : 'var(--loss)',
                  fontWeight: 600,
                }}>
                  {m.result === 'V' ? 'Victoria' : m.result === 'E' ? 'Empate' : 'Derrota'}
                </div>
              </div>
              <div className="away">
                <div className="team-name" style={m.away === featured?.name ? { fontWeight: 600 } : {}}>
                  {m.away}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Upcoming matches */}
        <div className="card">
          <div className="card-title">Proximos partidos - {featured?.name}</div>
          {upcomingMatches.slice(0, 3).map((m, i) => (
            <div key={i} className="match-card featured" style={{ marginBottom: 6 }}>
              <div className="home">
                <div className="team-name" style={m.home === featured?.name ? { fontWeight: 600 } : {}}>
                  {m.home}
                </div>
                <div className="match-meta">{m.round}</div>
              </div>
              <div className="score pending">
                {m.date || 'Por definir'}
                {m.time && <div>{m.time}</div>}
              </div>
              <div className="away">
                <div className="team-name" style={m.away === featured?.name ? { fontWeight: 600 } : {}}>
                  {m.away}
                </div>
              </div>
            </div>
          ))}
          {upcomingMatches.length === 0 && (
            <p style={{ color: 'var(--text-dim)', padding: 12 }}>No hay partidos pendientes</p>
          )}
        </div>
      </div>
    </div>
  )
}
