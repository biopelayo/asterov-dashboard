import { useState, useMemo } from 'react'
import { useParams } from 'react-router-dom'

const SORT_OPTIONS = [
  { key: 'total_goals', label: 'Goles' },
  { key: 'matches_played', label: 'PJ' },
  { key: 'yellow_cards', label: 'TA' },
  { key: 'red_cards', label: 'TR' },
  { key: 'name', label: 'Nombre' },
]

/* Normaliza nombre para comparación: quita acentos, mayúsculas, espacios extra */
function normName(str) {
  return (str || '').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ').trim()
}

export default function TeamView({ data, teamId: propTeamId }) {
  const { teamId: paramTeamId } = useParams()
  const teamId = paramTeamId || propTeamId
  const team = data.teams[teamId]
  const [sortBy, setSortBy] = useState('total_goals')
  const [searchPlayer, setSearchPlayer] = useState('')
  const [expandedPlayer, setExpandedPlayer] = useState(null)

  if (!team) {
    return <p style={{ color: 'var(--text-dim)' }}>Equipo no encontrado (ID: {teamId})</p>
  }

  const standings = team.standings || {}
  const isFeatured = teamId === data.meta.featured_team_id

  /* Lookup de perfiles por nombre normalizado */
  const profileMap = useMemo(() => {
    const map = {}
    if (data.playerProfiles?.players) {
      for (const prof of data.playerProfiles.players) {
        map[normName(prof.name)] = prof
      }
    }
    return map
  }, [data.playerProfiles])

  const getProfile = (playerName) => profileMap[normName(playerName)] || null

  // Calculate team matches from calendar
  const teamMatches = useMemo(() => {
    const matches = []
    for (const [divKey, div] of Object.entries(data.calendar)) {
      for (const round of div.rounds) {
        for (const m of round.matches) {
          if (m.home === team.name || m.away === team.name) {
            const isHome = m.home === team.name
            let result = ''
            if (m.played) {
              const gf = isHome ? m.home_goals : m.away_goals
              const ga = isHome ? m.away_goals : m.home_goals
              result = gf > ga ? 'W' : gf === ga ? 'D' : 'L'
            }
            matches.push({ ...m, round: round.round, isHome, result })
          }
        }
      }
    }
    return matches
  }, [data.calendar, team.name])

  const form = teamMatches.filter((m) => m.played).slice(-5).map((m) => m.result)

  const sortedPlayers = useMemo(() => {
    let list = [...team.players]
    if (searchPlayer) {
      const q = searchPlayer.toLowerCase()
      list = list.filter((p) => p.name.toLowerCase().includes(q))
    }
    if (sortBy === 'name') {
      list.sort((a, b) => a.name.localeCompare(b.name))
    } else {
      list.sort((a, b) => (b[sortBy] || 0) - (a[sortBy] || 0))
    }
    return list
  }, [team.players, sortBy, searchPlayer])

  // Computed team-level stats
  const teamStats = useMemo(() => {
    const played = teamMatches.filter((m) => m.played)
    const totalGoalsScored = played.reduce((acc, m) => acc + (m.isHome ? m.home_goals : m.away_goals), 0)
    const totalGoalsConceded = played.reduce((acc, m) => acc + (m.isHome ? m.away_goals : m.home_goals), 0)
    const homeMatches = played.filter((m) => m.isHome)
    const awayMatches = played.filter((m) => !m.isHome)
    const homeWins = homeMatches.filter((m) => m.result === 'W').length
    const awayWins = awayMatches.filter((m) => m.result === 'W').length
    const cleanSheets = played.filter((m) => (m.isHome ? m.away_goals : m.home_goals) === 0).length
    const bigWins = played.filter((m) => {
      const gf = m.isHome ? m.home_goals : m.away_goals
      const ga = m.isHome ? m.away_goals : m.home_goals
      return gf - ga >= 3
    }).length
    const bigLosses = played.filter((m) => {
      const gf = m.isHome ? m.home_goals : m.away_goals
      const ga = m.isHome ? m.away_goals : m.home_goals
      return ga - gf >= 3
    }).length

    return {
      avgGoalsScored: played.length ? (totalGoalsScored / played.length).toFixed(1) : '-',
      avgGoalsConceded: played.length ? (totalGoalsConceded / played.length).toFixed(1) : '-',
      homeRecord: `${homeWins}G ${homeMatches.filter((m) => m.result === 'D').length}E ${homeMatches.filter((m) => m.result === 'L').length}P`,
      awayRecord: `${awayWins}G ${awayMatches.filter((m) => m.result === 'D').length}E ${awayMatches.filter((m) => m.result === 'L').length}P`,
      cleanSheets,
      bigWins,
      bigLosses,
      totalYellows: team.players.reduce((a, p) => a + (p.yellow_cards || 0), 0),
      totalReds: team.players.reduce((a, p) => a + (p.red_cards || 0), 0),
      topScorer: [...team.players].sort((a, b) => b.total_goals - a.total_goals)[0],
    }
  }, [teamMatches, team])

  return (
    <div>
      {/* Team header */}
      <div className="team-header">
        {team.logo && <img src={team.logo} alt={team.name} />}
        <div>
          <h2 style={isFeatured ? { color: 'var(--featured)' } : {}}>
            {team.name}
          </h2>
          <span className="division-badge">
            {team.division === '1a_division' ? '1a Division' : '2a Division'}
          </span>
          {form.length > 0 && (
            <span style={{ marginLeft: 12 }}>
              {form.map((r, i) => (
                <span key={i} className={`form-badge ${r}`}>{r}</span>
              ))}
            </span>
          )}
        </div>
      </div>

      {/* Quick stats */}
      <div className="stats-row">
        <div className={`stat-card${isFeatured ? ' featured' : ''}`}>
          <div className="value">{standings.position || '-'}</div>
          <div className="label">Posicion</div>
        </div>
        <div className={`stat-card${isFeatured ? ' featured' : ''}`}>
          <div className="value">{standings.points || '-'}</div>
          <div className="label">Puntos</div>
        </div>
        <div className="stat-card">
          <div className="value">{standings.played || '-'}</div>
          <div className="label">PJ</div>
        </div>
        <div className="stat-card">
          <div className="value" style={{ color: 'var(--win)' }}>{standings.won || 0}</div>
          <div className="label">Victorias</div>
        </div>
        <div className="stat-card">
          <div className="value" style={{ color: 'var(--draw)' }}>{standings.drawn || 0}</div>
          <div className="label">Empates</div>
        </div>
        <div className="stat-card">
          <div className="value" style={{ color: 'var(--loss)' }}>{standings.lost || 0}</div>
          <div className="label">Derrotas</div>
        </div>
        <div className="stat-card">
          <div className="value">{standings.goals_for || 0}</div>
          <div className="label">GF</div>
        </div>
        <div className="stat-card">
          <div className="value">{standings.goals_against || 0}</div>
          <div className="label">GC</div>
        </div>
      </div>

      {/* Team analytics */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-title">Analisis del Equipo</div>
        <div className="stats-row" style={{ marginBottom: 0 }}>
          <div className="stat-card">
            <div className="value" style={{ fontSize: 22 }}>{teamStats.avgGoalsScored}</div>
            <div className="label">Media GF/partido</div>
          </div>
          <div className="stat-card">
            <div className="value" style={{ fontSize: 22 }}>{teamStats.avgGoalsConceded}</div>
            <div className="label">Media GC/partido</div>
          </div>
          <div className="stat-card">
            <div className="value" style={{ fontSize: 22 }}>{teamStats.cleanSheets}</div>
            <div className="label">Porterias a 0</div>
          </div>
          <div className="stat-card">
            <div className="value" style={{ fontSize: 22 }}>{teamStats.bigWins}</div>
            <div className="label">Goleadas dadas</div>
          </div>
          <div className="stat-card">
            <div className="value" style={{ fontSize: 22 }}>{teamStats.bigLosses}</div>
            <div className="label">Goleadas recibidas</div>
          </div>
          <div className="stat-card">
            <div className="value" style={{ fontSize: 14 }}>{teamStats.homeRecord}</div>
            <div className="label">En casa</div>
          </div>
          <div className="stat-card">
            <div className="value" style={{ fontSize: 14 }}>{teamStats.awayRecord}</div>
            <div className="label">Fuera</div>
          </div>
          <div className="stat-card">
            <div className="value" style={{ fontSize: 22, color: 'var(--warning)' }}>{teamStats.totalYellows}</div>
            <div className="label">Amarillas</div>
          </div>
        </div>
      </div>

      <div className="grid-2">
        {/* Players with sorting */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
            <div className="card-title" style={{ marginBottom: 0 }}>Plantilla ({team.total_players})</div>
            <input
              type="text" placeholder="Buscar jugador..."
              value={searchPlayer} onChange={(e) => setSearchPlayer(e.target.value)}
              style={{
                padding: '5px 10px', background: 'var(--bg)', border: '1px solid var(--border)',
                borderRadius: 5, color: 'var(--text)', fontSize: 12, width: 160,
              }}
            />
          </div>
          <div className="division-tabs" style={{ marginBottom: 8 }}>
            {SORT_OPTIONS.map((opt) => (
              <button key={opt.key} className={sortBy === opt.key ? 'active' : ''} onClick={() => setSortBy(opt.key)}>
                {opt.label}
              </button>
            ))}
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th></th>
                <th>Jugador</th>
                {isFeatured && <th style={{ color: 'var(--text-dim)', fontSize: 11 }}>Pos</th>}
                <th className="num" style={{ cursor: 'pointer', color: sortBy === 'matches_played' ? 'var(--accent)' : '' }} onClick={() => setSortBy('matches_played')}>PJ</th>
                <th className="num" style={{ cursor: 'pointer', color: sortBy === 'total_goals' ? 'var(--accent)' : '' }} onClick={() => setSortBy('total_goals')}>Goles</th>
                <th className="num" style={{ cursor: 'pointer', color: sortBy === 'yellow_cards' ? 'var(--accent)' : '' }} onClick={() => setSortBy('yellow_cards')}>TA</th>
                <th className="num" style={{ cursor: 'pointer', color: sortBy === 'red_cards' ? 'var(--accent)' : '' }} onClick={() => setSortBy('red_cards')}>TR</th>
              </tr>
            </thead>
            <tbody>
              {sortedPlayers.map((p, i) => {
                const prof = isFeatured ? getProfile(p.name) : null
                const isExpanded = expandedPlayer === (p.player_id || i)
                const canExpand = isFeatured && prof?.notes
                return (
                  <>
                    <tr
                      key={p.player_id || i}
                      onClick={() => canExpand && setExpandedPlayer(isExpanded ? null : (p.player_id || i))}
                      style={{ cursor: canExpand ? 'pointer' : 'default' }}
                    >
                      <td>
                        {p.photo ? (
                          <img className="player-photo" src={p.photo} alt="" />
                        ) : (
                          <div className="player-photo" />
                        )}
                      </td>
                      <td style={{ color: 'var(--text-bright)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          {prof?.alias ? (
                            <span>
                              <span style={{ fontWeight: 700 }}>{prof.alias}</span>
                              <span style={{ color: 'var(--text-dim)', fontSize: 11, marginLeft: 5 }}>({p.name})</span>
                            </span>
                          ) : p.name}
                          {canExpand && (
                            <span style={{ fontSize: 9, color: 'var(--text-dim)', marginLeft: 2 }}>
                              {isExpanded ? '▲' : '▼'}
                            </span>
                          )}
                        </span>
                      </td>
                      {isFeatured && (
                        <td>
                          {prof?.position ? (
                            <span style={{
                              fontSize: 10, fontWeight: 700, padding: '2px 5px',
                              borderRadius: 3, background: 'var(--accent-dim)',
                              color: 'var(--accent)', whiteSpace: 'nowrap',
                              fontFamily: 'var(--font-heading)', letterSpacing: 0.5,
                            }}>{prof.position.split(' / ')[0]}</span>
                          ) : null}
                        </td>
                      )}
                      <td className="num">{p.matches_played}</td>
                      <td className="num" style={{ fontWeight: p.total_goals > 0 ? 700 : 400 }}>
                        {p.total_goals || '-'}
                      </td>
                      <td className="num" style={{ color: p.yellow_cards > 0 ? 'var(--warning)' : '' }}>
                        {p.yellow_cards || '-'}
                      </td>
                      <td className="num" style={{ color: p.red_cards > 0 ? 'var(--danger)' : '' }}>
                        {p.red_cards || '-'}
                      </td>
                    </tr>
                    {isExpanded && prof?.notes && (
                      <tr key={`${p.player_id || i}-notes`} style={{ background: 'var(--accent-dim)' }}>
                        <td colSpan={isFeatured ? 7 : 6} style={{ padding: '8px 12px' }}>
                          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                            {prof.position && (
                              <span style={{
                                fontSize: 10, fontWeight: 700, padding: '3px 7px', borderRadius: 3,
                                background: 'var(--card)', border: '1px solid var(--accent)',
                                color: 'var(--accent)', whiteSpace: 'nowrap', flexShrink: 0,
                                fontFamily: 'var(--font-heading)',
                              }}>{prof.position}</span>
                            )}
                            <span style={{ fontSize: 12, color: 'var(--text)', lineHeight: 1.5, fontStyle: 'italic' }}>
                              "{prof.notes}"
                            </span>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Matches */}
        <div className="card">
          <div className="card-title">Partidos</div>
          {teamMatches.map((m, i) => (
            <div key={i} className={`match-card${isFeatured ? ' featured' : ''}`} style={{ marginBottom: 6 }}>
              <div className="home">
                <div className="team-name" style={m.home === team.name ? { fontWeight: 600, color: 'var(--text-bright)' } : {}}>
                  {m.home}
                </div>
                <div className="match-meta">{m.round}</div>
              </div>
              <div className={`score${m.played ? '' : ' pending'}`}>
                {m.played ? (
                  <>
                    {m.home_goals} - {m.away_goals}
                    <div style={{ fontSize: 10, color: m.result === 'W' ? 'var(--win)' : m.result === 'D' ? 'var(--draw)' : 'var(--loss)' }}>
                      {m.result === 'W' ? 'Victoria' : m.result === 'D' ? 'Empate' : 'Derrota'}
                    </div>
                  </>
                ) : (
                  <>
                    {m.date || 'TBD'}
                    {m.time && <div>{m.time}</div>}
                  </>
                )}
              </div>
              <div className="away">
                <div className="team-name" style={m.away === team.name ? { fontWeight: 600, color: 'var(--text-bright)' } : {}}>
                  {m.away}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
