import { useState } from 'react'

export default function Calendar({ data }) {
  const { calendar, meta } = data
  const divKeys = Object.keys(calendar)
  const [activeDivision, setActiveDivision] = useState(divKeys[0])
  const [filterTeam, setFilterTeam] = useState('')

  const division = calendar[activeDivision]
  const rounds = division?.rounds || []

  // Build team list for filter
  const teamNames = new Set()
  for (const round of rounds) {
    for (const m of round.matches) {
      if (m.home) teamNames.add(m.home)
      if (m.away) teamNames.add(m.away)
    }
  }
  const sortedTeams = [...teamNames].sort()

  // Find latest round with played matches
  let latestPlayedIdx = 0
  rounds.forEach((r, i) => {
    if (r.matches.some((m) => m.played)) latestPlayedIdx = i
  })
  const [activeRound, setActiveRound] = useState(latestPlayedIdx)

  const filteredRounds = filterTeam
    ? rounds.map((r) => ({
        ...r,
        matches: r.matches.filter(
          (m) => m.home === filterTeam || m.away === filterTeam
        ),
      })).filter((r) => r.matches.length > 0)
    : [rounds[activeRound]].filter(Boolean)

  const featuredName = data.teams[meta.featured_team_id]?.name

  return (
    <div>
      <div className="division-tabs">
        {divKeys.map((key) => (
          <button
            key={key}
            className={activeDivision === key ? 'active' : ''}
            onClick={() => { setActiveDivision(key); setActiveRound(0) }}
          >
            {calendar[key].label}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <div className="team-selector" style={{ flex: 1 }}>
          <select value={filterTeam} onChange={(e) => setFilterTeam(e.target.value)}>
            <option value="">Todos los equipos</option>
            {sortedTeams.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {!filterTeam && (
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {rounds.map((r, i) => (
              <button
                key={i}
                onClick={() => setActiveRound(i)}
                style={{
                  padding: '6px 10px',
                  background: activeRound === i ? 'var(--accent-dim)' : 'var(--bg-card)',
                  border: `1px solid ${activeRound === i ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius: 4,
                  color: activeRound === i ? 'var(--accent)' : 'var(--text-dim)',
                  cursor: 'pointer',
                  fontSize: 12,
                }}
              >
                J{i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {filteredRounds.map((round, ri) => (
        <div key={ri}>
          <div className="round-header">
            {round.round} {round.dates && <span style={{ fontWeight: 400, color: 'var(--text-dim)', fontSize: 12 }}>({round.dates})</span>}
          </div>
          {round.matches.map((m, mi) => {
            const isFeatured = m.home === featuredName || m.away === featuredName
            return (
              <div key={mi} className={`match-card${isFeatured ? ' featured' : ''}`}>
                <div className="home">
                  <div className="team-name" style={m.home === featuredName ? { color: 'var(--featured)', fontWeight: 600 } : {}}>
                    {m.home}
                  </div>
                </div>
                <div className={`score${m.played ? '' : ' pending'}`}>
                  {m.played ? (
                    `${m.home_goals} - ${m.away_goals}`
                  ) : (
                    <>
                      {m.date || 'Por definir'}
                      {m.time && <div>{m.time}</div>}
                    </>
                  )}
                </div>
                <div className="away">
                  <div className="team-name" style={m.away === featuredName ? { color: 'var(--featured)', fontWeight: 600 } : {}}>
                    {m.away}
                  </div>
                  {m.venue && (
                    <div className="match-meta">{m.venue}</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
