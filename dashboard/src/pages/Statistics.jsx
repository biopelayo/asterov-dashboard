import { useState, useMemo } from 'react'

const PAGE_SIZE = 50

export default function Statistics({ data }) {
  const { statistics, meta } = data
  const [sortBy, setSortBy] = useState('total_goals')
  const [filterTeam, setFilterTeam] = useState('')
  const [filterDivision, setFilterDivision] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)

  const teams = useMemo(
    () => [...new Set(statistics.map((s) => s.team).filter(Boolean))].sort(),
    [statistics]
  )

  const sorted = useMemo(() => {
    let list = statistics

    if (filterDivision) {
      list = list.filter((s) => s.division === filterDivision)
    }
    if (filterTeam) {
      list = list.filter((s) => s.team === filterTeam)
    }
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(
        (s) => s.name.toLowerCase().includes(q) || s.team.toLowerCase().includes(q)
      )
    }

    return [...list].sort((a, b) => (b[sortBy] || 0) - (a[sortBy] || 0))
  }, [statistics, filterDivision, filterTeam, search, sortBy])

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE)
  const paginated = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const columns = [
    { key: 'total_goals', label: 'Goles', short: 'G' },
    { key: 'matches_played', label: 'Partidos', short: 'PJ' },
    { key: 'yellow_cards', label: 'Amarillas', short: 'TA' },
    { key: 'red_cards', label: 'Rojas', short: 'TR' },
    { key: 'goals_conceded', label: 'Encajados', short: 'GC' },
  ]

  const featuredName = data.teams[meta.featured_team_id]?.name

  return (
    <div>
      {/* Filters bar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Buscar jugador o equipo..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0) }}
          style={{
            padding: '8px 12px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 6,
            color: 'var(--text)',
            fontSize: '13.5px',
            width: 250,
          }}
        />
        <div className="team-selector" style={{ marginBottom: 0 }}>
          <select
            value={filterDivision}
            onChange={(e) => { setFilterDivision(e.target.value); setPage(0) }}
          >
            <option value="">Todas las divisiones</option>
            <option value="1a_division">1a Division</option>
            <option value="2a_division">2a Division</option>
          </select>
        </div>
        <div className="team-selector" style={{ marginBottom: 0 }}>
          <select
            value={filterTeam}
            onChange={(e) => { setFilterTeam(e.target.value); setPage(0) }}
          >
            <option value="">Todos los equipos</option>
            {teams.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <span style={{ color: 'var(--text-dim)', fontSize: 13, marginLeft: 'auto' }}>
          {sorted.length} jugadores
        </span>
      </div>

      {/* Sort tabs */}
      <div className="division-tabs" style={{ marginBottom: 12 }}>
        {columns.map((col) => (
          <button
            key={col.key}
            className={sortBy === col.key ? 'active' : ''}
            onClick={() => { setSortBy(col.key); setPage(0) }}
          >
            {col.label}
          </button>
        ))}
      </div>

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th className="num">#</th>
              <th></th>
              <th>Jugador</th>
              <th>Equipo</th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="num"
                  style={{
                    cursor: 'pointer',
                    color: sortBy === col.key ? 'var(--accent)' : undefined,
                  }}
                  onClick={() => setSortBy(col.key)}
                >
                  {col.short}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.map((s, i) => {
              const isFeatured = s.team === featuredName
              return (
                <tr key={s.player_id || `${s.name}-${i}`} className={isFeatured ? 'featured' : ''}>
                  <td className="num" style={{ color: 'var(--text-dim)' }}>
                    {page * PAGE_SIZE + i + 1}
                  </td>
                  <td>
                    {s.photo ? (
                      <img className="player-photo" src={s.photo} alt="" />
                    ) : (
                      <div className="player-photo" />
                    )}
                  </td>
                  <td style={{ color: 'var(--text-bright)', fontWeight: isFeatured ? 600 : 400 }}>
                    {s.name}
                  </td>
                  <td style={{ color: 'var(--text-dim)', fontSize: 13 }}>{s.team}</td>
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className="num"
                      style={{
                        fontWeight: sortBy === col.key && s[col.key] > 0 ? 700 : 400,
                        color:
                          col.key === 'yellow_cards' && s[col.key] > 0
                            ? 'var(--warning)'
                            : col.key === 'red_cards' && s[col.key] > 0
                            ? 'var(--danger)'
                            : sortBy === col.key
                            ? 'var(--accent)'
                            : undefined,
                      }}
                    >
                      {s[col.key] || '-'}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>

        {sorted.length === 0 && (
          <p style={{ color: 'var(--text-dim)', padding: 20, textAlign: 'center' }}>
            No hay datos para los filtros seleccionados
          </p>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginTop: 16 }}>
            <button
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
              style={{
                padding: '6px 12px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 4,
                cursor: page === 0 ? 'default' : 'pointer',
                color: page === 0 ? 'var(--border)' : 'var(--text)',
                fontSize: 13,
              }}
            >
              Anterior
            </button>
            <span style={{ padding: '6px 12px', fontSize: 13, color: 'var(--text-dim)' }}>
              {page + 1} / {totalPages}
            </span>
            <button
              disabled={page >= totalPages - 1}
              onClick={() => setPage(page + 1)}
              style={{
                padding: '6px 12px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 4,
                cursor: page >= totalPages - 1 ? 'default' : 'pointer',
                color: page >= totalPages - 1 ? 'var(--border)' : 'var(--text)',
                fontSize: 13,
              }}
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
