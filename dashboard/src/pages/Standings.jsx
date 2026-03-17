import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Standings({ data }) {
  const { standings, meta } = data
  const divKeys = Object.keys(standings)
  const [activeDivision, setActiveDivision] = useState(divKeys[0])
  const division = standings[activeDivision]

  return (
    <div>
      <div className="division-tabs">
        {divKeys.map((key) => (
          <button
            key={key}
            className={activeDivision === key ? 'active' : ''}
            onClick={() => setActiveDivision(key)}
          >
            {standings[key].label}
          </button>
        ))}
      </div>

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th className="num">Pos</th>
              <th></th>
              <th>Equipo</th>
              <th className="num">PJ</th>
              <th className="num">G</th>
              <th className="num">E</th>
              <th className="num">P</th>
              <th className="num">GF</th>
              <th className="num">GC</th>
              <th className="num">DG</th>
              <th className="num">Pts</th>
            </tr>
          </thead>
          <tbody>
            {division.teams.map((team) => {
              const isFeatured = team.team_id === meta.featured_team_id
              return (
                <tr key={team.team_id} className={isFeatured ? 'featured' : ''}>
                  <td className="num">{team.position}</td>
                  <td>
                    {team.logo && (
                      <img
                        src={team.logo}
                        alt=""
                        style={{ width: 24, height: 24, borderRadius: 4, verticalAlign: 'middle' }}
                      />
                    )}
                  </td>
                  <td>
                    <Link
                      to={`/team/${team.team_id}`}
                      style={isFeatured ? { color: 'var(--featured)', fontWeight: 600 } : { color: 'var(--text-bright)' }}
                    >
                      {team.name}
                    </Link>
                  </td>
                  <td className="num">{team.played}</td>
                  <td className="num">{team.won}</td>
                  <td className="num">{team.drawn}</td>
                  <td className="num">{team.lost}</td>
                  <td className="num">{team.goals_for}</td>
                  <td className="num">{team.goals_against}</td>
                  <td className="num" style={{ color: team.goal_diff > 0 ? 'var(--win)' : team.goal_diff < 0 ? 'var(--loss)' : 'var(--text)' }}>
                    {team.goal_diff > 0 ? `+${team.goal_diff}` : team.goal_diff}
                  </td>
                  <td className="num" style={{ fontWeight: 700, color: isFeatured ? 'var(--featured)' : 'var(--accent)' }}>
                    {team.points}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
