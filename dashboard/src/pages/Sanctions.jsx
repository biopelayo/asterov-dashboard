import { useState, useMemo } from 'react'

export default function Sanctions({ data }) {
  const { sanctions } = data
  const [filterTeam, setFilterTeam] = useState('')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('matches_banned')

  const teams = useMemo(
    () => [...new Set(sanctions.map((s) => s.team).filter(Boolean))].sort(),
    [sanctions]
  )

  const sorted = useMemo(() => {
    let list = sanctions
    if (filterTeam) list = list.filter((s) => s.team === filterTeam)
    if (search) {
      const q = search.toLowerCase()
      list = list.filter((s) => s.player.toLowerCase().includes(q) || s.team.toLowerCase().includes(q))
    }
    return [...list].sort((a, b) => {
      if (sortBy === 'player') return a.player.localeCompare(b.player)
      if (sortBy === 'team') return a.team.localeCompare(b.team)
      if (sortBy === 'round') return (a.round || '').localeCompare(b.round || '')
      return (b[sortBy] || 0) - (a[sortBy] || 0)
    })
  }, [sanctions, filterTeam, search, sortBy])

  return (
    <div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="text" placeholder="Buscar jugador o equipo..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: '8px 12px', background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 6, color: 'var(--text)', fontSize: '13.5px', width: 250,
          }}
        />
        <div className="team-selector" style={{ marginBottom: 0 }}>
          <select value={filterTeam} onChange={(e) => setFilterTeam(e.target.value)}>
            <option value="">Todos los equipos</option>
            {teams.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <span style={{ color: 'var(--text-dim)', fontSize: 13, marginLeft: 'auto' }}>
          {sorted.length} sanciones
        </span>
      </div>

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ cursor: 'pointer', color: sortBy === 'player' ? 'var(--accent)' : '' }} onClick={() => setSortBy('player')}>Jugador</th>
              <th style={{ cursor: 'pointer', color: sortBy === 'team' ? 'var(--accent)' : '' }} onClick={() => setSortBy('team')}>Equipo</th>
              <th style={{ cursor: 'pointer', color: sortBy === 'round' ? 'var(--accent)' : '' }} onClick={() => setSortBy('round')}>Jornada</th>
              <th>Partido</th>
              <th>Sancion</th>
              <th className="num" style={{ cursor: 'pointer', color: sortBy === 'matches_banned' ? 'var(--accent)' : '' }} onClick={() => setSortBy('matches_banned')}>Partidos</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((s, i) => (
              <tr key={i}>
                <td style={{ color: 'var(--text-bright)' }}>{s.player}</td>
                <td style={{ color: 'var(--text-dim)', fontSize: 13 }}>{s.team}</td>
                <td className="num">{s.round}</td>
                <td style={{ fontSize: 13 }}>{s.match}</td>
                <td>
                  <span style={{
                    padding: '2px 8px', borderRadius: 4, fontSize: 12,
                    background: s.sanction_type?.includes('Roja') ? 'rgba(244, 67, 54, 0.15)' : 'rgba(255, 152, 0, 0.15)',
                    color: s.sanction_type?.includes('Roja') ? 'var(--danger)' : 'var(--warning)',
                  }}>
                    {s.sanction_type || 'N/A'}
                  </span>
                </td>
                <td className="num">{s.matches_banned || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {sorted.length === 0 && (
          <p style={{ color: 'var(--text-dim)', padding: 20, textAlign: 'center' }}>
            No hay sanciones para los filtros seleccionados
          </p>
        )}
      </div>
    </div>
  )
}
