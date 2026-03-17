import { useState, useCallback } from 'react'

/* ─── localStorage hook ─────────────────────────────────────────────────── */
function useLocalState(key, defaultVal) {
  const [state, setState] = useState(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored ? JSON.parse(stored) : defaultVal
    } catch {
      return defaultVal
    }
  })
  const setAndPersist = useCallback(
    (val) => {
      setState((prev) => {
        const next = typeof val === 'function' ? val(prev) : val
        localStorage.setItem(key, JSON.stringify(next))
        return next
      })
    },
    [key],
  )
  return [state, setAndPersist]
}

/* ─── helpers ───────────────────────────────────────────────────────────── */
function playerLabel(p) {
  return p.alias || p.name.split(' ')[0]
}

/* ══════════════════════════════════════════════════════════════════════════
   TAB 1 — CUOTAS
══════════════════════════════════════════════════════════════════════════ */
function Cuotas({ players }) {
  const [cuotas, setCuotas] = useLocalState('vest_cuotas', {
    amount: 5,
    period: 'Temporada 25/26',
    paid: {},
  })

  const toggle = (name) =>
    setCuotas((p) => ({ ...p, paid: { ...p.paid, [name]: !p.paid[name] } }))

  const paidCount = players.filter((p) => cuotas.paid[p.name]).length
  const pending = players.length - paidCount

  return (
    <div className="vest-section">
      {/* KPI bar */}
      <div className="vest-kpi-row">
        <div className="vest-kpi">
          <span className="vest-kpi-num">{paidCount}/{players.length}</span>
          <span className="vest-kpi-label">Han pagado</span>
        </div>
        <div className="vest-kpi green">
          <span className="vest-kpi-num">€{paidCount * cuotas.amount}</span>
          <span className="vest-kpi-label">Recaudado</span>
        </div>
        <div className="vest-kpi red">
          <span className="vest-kpi-num">€{pending * cuotas.amount}</span>
          <span className="vest-kpi-label">Pendiente</span>
        </div>
        <div className="vest-kpi-config">
          <label>
            €/jugador
            <input
              type="number"
              min={0}
              value={cuotas.amount}
              onChange={(e) =>
                setCuotas((p) => ({ ...p, amount: Number(e.target.value) }))
              }
            />
          </label>
          <label>
            Periodo
            <input
              type="text"
              value={cuotas.period}
              onChange={(e) =>
                setCuotas((p) => ({ ...p, period: e.target.value }))
              }
            />
          </label>
        </div>
      </div>

      {/* Player grid */}
      <div className="vest-player-grid">
        {players.map((p) => {
          const paid = !!cuotas.paid[p.name]
          return (
            <button
              key={p.name}
              className={`vest-player-btn ${paid ? 'paid' : 'unpaid'}`}
              onClick={() => toggle(p.name)}
              title={p.name}
            >
              <span className="vest-btn-alias">{playerLabel(p)}</span>
              <span className="vest-btn-status">{paid ? '✓' : '✗'}</span>
            </button>
          )
        })}
      </div>

      {pending > 0 && (
        <div className="vest-pending-list">
          <strong>Pendientes:</strong>{' '}
          {players
            .filter((p) => !cuotas.paid[p.name])
            .map((p) => playerLabel(p))
            .join(', ')}
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   TAB 2 — FONDO MATERIAL
══════════════════════════════════════════════════════════════════════════ */
function FondoMaterial({ players }) {
  const [fondo, setFondo] = useLocalState('vest_fondo', {
    contributions: [],
    expenses: [],
  })
  const [cForm, setCForm] = useState({ player: '', amount: '' })
  const [eForm, setEForm] = useState({ concept: '', amount: '' })

  const totalIn = fondo.contributions.reduce((s, c) => s + c.amount, 0)
  const totalOut = fondo.expenses.reduce((s, e) => s + e.amount, 0)
  const balance = totalIn - totalOut

  const addContrib = () => {
    if (!cForm.player || !cForm.amount) return
    setFondo((p) => ({
      ...p,
      contributions: [
        ...p.contributions,
        {
          id: Date.now(),
          player: cForm.player,
          amount: Number(cForm.amount),
          date: new Date().toLocaleDateString('es-ES'),
        },
      ],
    }))
    setCForm({ player: '', amount: '' })
  }

  const addExpense = () => {
    if (!eForm.concept || !eForm.amount) return
    setFondo((p) => ({
      ...p,
      expenses: [
        ...p.expenses,
        {
          id: Date.now(),
          concept: eForm.concept,
          amount: Number(eForm.amount),
          date: new Date().toLocaleDateString('es-ES'),
        },
      ],
    }))
    setEForm({ concept: '', amount: '' })
  }

  const remove = (type, id) =>
    setFondo((p) => ({ ...p, [type]: p[type].filter((x) => x.id !== id) }))

  return (
    <div className="vest-section">
      <div className="vest-kpi-row">
        <div className={`vest-kpi ${balance >= 0 ? 'green' : 'red'} large`}>
          <span className="vest-kpi-num">€{balance.toFixed(2)}</span>
          <span className="vest-kpi-label">Saldo actual</span>
        </div>
        <div className="vest-kpi">
          <span className="vest-kpi-num">€{totalIn.toFixed(2)}</span>
          <span className="vest-kpi-label">Total entradas</span>
        </div>
        <div className="vest-kpi red">
          <span className="vest-kpi-num">€{totalOut.toFixed(2)}</span>
          <span className="vest-kpi-label">Total gastos</span>
        </div>
      </div>

      <div className="vest-two-col">
        {/* Contributions */}
        <div className="vest-col">
          <h4>Aportaciones</h4>
          <div className="vest-form-row">
            <select
              value={cForm.player}
              onChange={(e) => setCForm((p) => ({ ...p, player: e.target.value }))}
            >
              <option value="">Jugador…</option>
              {players.map((p) => (
                <option key={p.name} value={playerLabel(p)}>
                  {playerLabel(p)}
                </option>
              ))}
            </select>
            <input
              type="number"
              placeholder="€"
              min={0}
              value={cForm.amount}
              onChange={(e) => setCForm((p) => ({ ...p, amount: e.target.value }))}
            />
            <button className="vest-add-btn" onClick={addContrib}>
              +
            </button>
          </div>
          <ul className="vest-list">
            {fondo.contributions
              .slice()
              .reverse()
              .map((c) => (
                <li key={c.id}>
                  <span>{c.player}</span>
                  <span className="amount green-text">+€{c.amount}</span>
                  <span className="vest-date">{c.date}</span>
                  <button
                    className="vest-del-btn"
                    onClick={() => remove('contributions', c.id)}
                  >
                    ×
                  </button>
                </li>
              ))}
            {fondo.contributions.length === 0 && (
              <li className="vest-empty">Sin aportaciones aún.</li>
            )}
          </ul>
        </div>

        {/* Expenses */}
        <div className="vest-col">
          <h4>Gastos</h4>
          <div className="vest-form-row">
            <input
              type="text"
              placeholder="Concepto…"
              value={eForm.concept}
              onChange={(e) => setEForm((p) => ({ ...p, concept: e.target.value }))}
            />
            <input
              type="number"
              placeholder="€"
              min={0}
              value={eForm.amount}
              onChange={(e) => setEForm((p) => ({ ...p, amount: e.target.value }))}
            />
            <button className="vest-add-btn" onClick={addExpense}>
              +
            </button>
          </div>
          <ul className="vest-list">
            {fondo.expenses
              .slice()
              .reverse()
              .map((e) => (
                <li key={e.id}>
                  <span>{e.concept}</span>
                  <span className="amount red-text">-€{e.amount}</span>
                  <span className="vest-date">{e.date}</span>
                  <button
                    className="vest-del-btn"
                    onClick={() => remove('expenses', e.id)}
                  >
                    ×
                  </button>
                </li>
              ))}
            {fondo.expenses.length === 0 && (
              <li className="vest-empty">Sin gastos registrados.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   TAB 3 — LAVANDERÍA
══════════════════════════════════════════════════════════════════════════ */
function Lavanderia({ players }) {
  const allNames = players.map(playerLabel)
  const [lav, setLav] = useLocalState('vest_lavanderia', {
    queue: [],
    history: [],
    current: null,
  })

  const sortear = () => {
    // If no queue left (first call or round just finished), reload all
    const queue = lav.queue.length > 0 ? [...lav.queue] : [...allNames]
    const newHistory = lav.current ? [...lav.history, lav.current] : [...lav.history]
    const idx = Math.floor(Math.random() * queue.length)
    const winner = queue[idx]
    const newQueue = queue.filter((_, i) => i !== idx)
    setLav({ queue: newQueue, history: newHistory, current: winner })
  }

  const reset = () => setLav({ queue: [], history: [], current: null })

  const doneCount = lav.history.length + (lav.current ? 1 : 0)
  const roundComplete = lav.queue.length === 0 && lav.current !== null

  return (
    <div className="vest-section vest-lavanderia">
      {/* Big winner display */}
      <div className="vest-sorter-center">
        <div className={`vest-winner-card ${lav.current ? '' : 'empty'}`}>
          <div className="vest-winner-emoji">{lav.current ? '🧺' : '👕'}</div>
          {lav.current ? (
            <>
              <div className="vest-winner-name">{lav.current}</div>
              <div className="vest-winner-sub">lava esta semana</div>
            </>
          ) : (
            <div className="vest-winner-sub">Nadie sorteado aún</div>
          )}
        </div>

        <div className="vest-lav-stats">
          <span>
            <strong>{doneCount}</strong> han lavado
          </span>
          <span className="vest-lav-dot">·</span>
          <span>
            <strong>{allNames.length - doneCount}</strong> quedan
          </span>
        </div>

        {roundComplete && (
          <div className="vest-round-badge">¡Todos han lavado! Empieza nueva ronda</div>
        )}

        <div className="vest-lav-btns">
          <button
            className="vest-sortear-btn"
            onClick={sortear}
            disabled={roundComplete}
          >
            ⚽ Sortear
          </button>
          <button className="vest-reset-btn" onClick={reset}>
            Reiniciar ronda
          </button>
        </div>
      </div>

      {/* History chips */}
      {doneCount > 0 && (
        <div className="vest-history-block">
          <h4>Orden esta ronda</h4>
          <div className="vest-chips">
            {lav.history.map((name, i) => (
              <span key={i} className="vest-chip done">
                {i + 1}. {name}
              </span>
            ))}
            {lav.current && (
              <span className="vest-chip current">
                {lav.history.length + 1}. {lav.current} ◀
              </span>
            )}
            {lav.queue.map((name, i) => (
              <span key={name} className="vest-chip pending">
                {doneCount + i + 1}. ?
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   TAB 4 — MULTAS
══════════════════════════════════════════════════════════════════════════ */
const FINE_REASONS = [
  'No presentarse a convocatoria',
  'Llegar tarde al partido',
  'No avisar al capitán',
  'Comportamiento antideportivo',
  'Otro',
]

function Multas({ players }) {
  const [multas, setMultas] = useLocalState('vest_multas', { fines: [] })
  const [form, setForm] = useState({ player: '', reason: FINE_REASONS[0], amount: '5' })
  const [filter, setFilter] = useState('all')

  const addFine = () => {
    if (!form.player || !form.amount) return
    setMultas((p) => ({
      fines: [
        ...p.fines,
        {
          id: Date.now(),
          player: form.player,
          reason: form.reason,
          amount: Number(form.amount),
          date: new Date().toLocaleDateString('es-ES'),
          paid: false,
        },
      ],
    }))
    setForm((p) => ({ ...p, player: '' }))
  }

  const togglePaid = (id) =>
    setMultas((p) => ({
      fines: p.fines.map((f) => (f.id === id ? { ...f, paid: !f.paid } : f)),
    }))

  const removeFine = (id) =>
    setMultas((p) => ({ fines: p.fines.filter((f) => f.id !== id) }))

  const totalPending = multas.fines.filter((f) => !f.paid).reduce((s, f) => s + f.amount, 0)
  const totalPaid = multas.fines.filter((f) => f.paid).reduce((s, f) => s + f.amount, 0)

  // Per-player deuda
  const deuda = {}
  multas.fines
    .filter((f) => !f.paid)
    .forEach((f) => {
      deuda[f.player] = (deuda[f.player] || 0) + f.amount
    })
  const deudores = Object.entries(deuda).sort((a, b) => b[1] - a[1])

  const displayed = multas.fines
    .filter((f) => {
      if (filter === 'pending') return !f.paid
      if (filter === 'paid') return f.paid
      return true
    })
    .slice()
    .reverse()

  return (
    <div className="vest-section">
      {/* KPIs */}
      <div className="vest-kpi-row">
        <div className="vest-kpi red">
          <span className="vest-kpi-num">€{totalPending}</span>
          <span className="vest-kpi-label">Por cobrar</span>
        </div>
        <div className="vest-kpi green">
          <span className="vest-kpi-num">€{totalPaid}</span>
          <span className="vest-kpi-label">Cobrado</span>
        </div>
        <div className="vest-kpi">
          <span className="vest-kpi-num">{multas.fines.length}</span>
          <span className="vest-kpi-label">Total multas</span>
        </div>
      </div>

      {/* Deudores */}
      {deudores.length > 0 && (
        <div className="vest-deudores">
          <span className="vest-deudores-label">Deudores:</span>
          <div className="vest-chips">
            {deudores.map(([name, amount]) => (
              <span key={name} className="vest-chip pending">
                {name} — €{amount}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Add fine form */}
      <div className="vest-form-row multas-form">
        <select
          value={form.player}
          onChange={(e) => setForm((p) => ({ ...p, player: e.target.value }))}
        >
          <option value="">Jugador…</option>
          {players.map((p) => (
            <option key={p.name} value={playerLabel(p)}>
              {playerLabel(p)}
            </option>
          ))}
        </select>
        <select
          value={form.reason}
          onChange={(e) => setForm((p) => ({ ...p, reason: e.target.value }))}
        >
          {FINE_REASONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <input
          type="number"
          placeholder="€"
          value={form.amount}
          min={0}
          style={{ width: 64 }}
          onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
        />
        <button className="vest-add-btn danger" onClick={addFine}>
          + Multa
        </button>
      </div>

      {/* Filter */}
      <div className="vest-filter-row">
        {['all', 'pending', 'paid'].map((f) => (
          <button
            key={f}
            className={filter === f ? 'active' : ''}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'Todas' : f === 'pending' ? 'Pendientes' : 'Cobradas'}
          </button>
        ))}
      </div>

      {/* Fines list */}
      <ul className="vest-list multas-list">
        {displayed.map((f) => (
          <li key={f.id} className={f.paid ? 'paid' : ''}>
            <span className="fine-player">{f.player}</span>
            <span className="fine-reason">{f.reason}</span>
            <span className={f.paid ? 'amount green-text' : 'amount red-text'}>
              €{f.amount}
            </span>
            <span className="vest-date">{f.date}</span>
            <button
              className={`vest-pay-btn ${f.paid ? 'paid' : ''}`}
              onClick={() => togglePaid(f.id)}
              title={f.paid ? 'Marcar pendiente' : 'Marcar cobrada'}
            >
              {f.paid ? '✓' : '€'}
            </button>
            <button className="vest-del-btn" onClick={() => removeFine(f.id)}>
              ×
            </button>
          </li>
        ))}
        {displayed.length === 0 && (
          <li className="vest-empty">
            Sin multas{filter !== 'all' ? ' en esta categoría' : ''}.
          </li>
        )}
      </ul>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   TAB 5 — FARTURAS
══════════════════════════════════════════════════════════════════════════ */
const DEFAULT_PLATOS = [
  { id: 'fabada', label: 'Fabada', emoji: '🫘' },
  { id: 'cordero', label: 'Cordero', emoji: '🐑' },
  { id: 'paella', label: 'Paella', emoji: '🥘' },
]

function Farturas({ players }) {
  const [data, setData] = useLocalState('vest_farturas', {
    tags: {},        // { playerAlias: ['fabada', 'cordero', ...] }
    platos: DEFAULT_PLATOS,
    custom: '',      // input for new custom plato
  })
  const [copied, setCopied] = useState(false)
  const [newPlato, setNewPlato] = useState('')

  const toggleTag = (alias, platoId) => {
    setData((p) => {
      const current = p.tags[alias] || []
      const next = current.includes(platoId)
        ? current.filter((t) => t !== platoId)
        : [...current, platoId]
      return { ...p, tags: { ...p.tags, [alias]: next } }
    })
  }

  const addPlato = () => {
    const label = newPlato.trim()
    if (!label) return
    const id = label.toLowerCase().replace(/\s+/g, '_')
    if (data.platos.find((p) => p.id === id)) return
    setData((p) => ({ ...p, platos: [...p.platos, { id, label, emoji: '🍽️' }] }))
    setNewPlato('')
  }

  const removePlato = (id) => {
    setData((p) => ({
      ...p,
      platos: p.platos.filter((pl) => pl.id !== id),
      tags: Object.fromEntries(
        Object.entries(p.tags).map(([k, v]) => [k, v.filter((t) => t !== id)])
      ),
    }))
  }

  const generateWhatsApp = () => {
    const lines = ['🍽️ *FARTURAS SAN CLAUDIO* 🍽️', '']
    let anyTag = false
    data.platos.forEach((pl) => {
      const fans = players
        .map(playerLabel)
        .filter((alias) => (data.tags[alias] || []).includes(pl.id))
      if (fans.length > 0) {
        lines.push(`${pl.emoji} *${pl.label}:* ${fans.join(', ')}`)
        anyTag = true
      }
    })
    if (!anyTag) {
      lines.push('Nadie ha votado aún sus farturas favoritas 😅')
    }
    lines.push('')
    lines.push('¿Cuáles son vuestras farturas de equipo? ¡Decid! 🤌')
    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  // Stats per plato
  const stats = data.platos.map((pl) => ({
    ...pl,
    fans: players.map(playerLabel).filter((a) => (data.tags[a] || []).includes(pl.id)),
  }))

  return (
    <div className="vest-section">
      {/* Summary chips */}
      <div className="farturas-summary">
        {stats.map((pl) => (
          <div key={pl.id} className="fartura-stat-card">
            <span className="fartura-emoji">{pl.emoji}</span>
            <span className="fartura-label">{pl.label}</span>
            <span className="fartura-count">{pl.fans.length}</span>
            {pl.fans.length > 0 && (
              <span className="fartura-fans">{pl.fans.join(', ')}</span>
            )}
            {!DEFAULT_PLATOS.find((d) => d.id === pl.id) && (
              <button className="vest-del-btn fartura-del" onClick={() => removePlato(pl.id)} title="Eliminar plato">×</button>
            )}
          </div>
        ))}
        <div className="fartura-add-card">
          <input
            type="text"
            placeholder="Nuevo plato…"
            value={newPlato}
            maxLength={20}
            onChange={(e) => setNewPlato(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addPlato()}
          />
          <button className="vest-add-btn" onClick={addPlato}>+</button>
        </div>
      </div>

      {/* Player grid */}
      <div className="farturas-grid">
        {players.map((p) => {
          const alias = playerLabel(p)
          const playerTags = data.tags[alias] || []
          return (
            <div key={p.name} className="fartura-player-row">
              <span className="fartura-player-name">{alias}</span>
              <div className="fartura-player-tags">
                {data.platos.map((pl) => (
                  <button
                    key={pl.id}
                    className={`fartura-tag-btn ${playerTags.includes(pl.id) ? 'active' : ''}`}
                    onClick={() => toggleTag(alias, pl.id)}
                    title={pl.label}
                  >
                    {pl.emoji}
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <button
        className={`vest-whatsapp-btn ${copied ? 'copied' : ''}`}
        onClick={generateWhatsApp}
      >
        {copied ? '✓ ¡Copiado!' : '📋 Nota de WhatsApp'}
      </button>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   TAB 6 — PLANES
══════════════════════════════════════════════════════════════════════════ */
const PLAN_TYPES = ['Cena de equipo', 'Salida nocturna', 'Torneo amistoso', 'Entrenamiento extra', 'Otro']
const VOTES = { si: '✓ Voy', quizas: '? Quizás', no: '✗ No puedo' }

function Planes({ players }) {
  const [planes, setPlanes] = useLocalState('vest_planes', { events: [] })
  const [form, setForm] = useState({ title: '', type: PLAN_TYPES[0], date: '', location: '' })
  const [expanded, setExpanded] = useState(null)
  const [copied, setCopied] = useState(null)

  const addEvent = () => {
    if (!form.title) return
    setPlanes((p) => ({
      events: [
        ...p.events,
        { id: Date.now(), ...form, votes: {}, created: new Date().toLocaleDateString('es-ES') },
      ],
    }))
    setForm({ title: '', type: PLAN_TYPES[0], date: '', location: '' })
  }

  const vote = (eventId, alias, option) => {
    setPlanes((p) => ({
      events: p.events.map((ev) =>
        ev.id === eventId
          ? { ...ev, votes: { ...ev.votes, [alias]: ev.votes[alias] === option ? null : option } }
          : ev
      ),
    }))
  }

  const removeEvent = (id) =>
    setPlanes((p) => ({ events: p.events.filter((e) => e.id !== id) }))

  const generateWhatsApp = (ev) => {
    const si = players.map(playerLabel).filter((a) => ev.votes[a] === 'si')
    const quizas = players.map(playerLabel).filter((a) => ev.votes[a] === 'quizas')
    const no = players.map(playerLabel).filter((a) => ev.votes[a] === 'no')
    const lines = [
      `📅 *${ev.type.toUpperCase()}: ${ev.title}*`,
      '',
    ]
    if (ev.date) lines.push(`🗓️ Fecha: ${ev.date}`)
    if (ev.location) lines.push(`📍 Lugar: ${ev.location}`)
    lines.push('')
    lines.push(`✅ Confirmados (${si.length}): ${si.length ? si.join(', ') : '—'}`)
    lines.push(`❓ Quizás (${quizas.length}): ${quizas.length ? quizas.join(', ') : '—'}`)
    lines.push(`❌ No pueden (${no.length}): ${no.length ? no.join(', ') : '—'}`)
    lines.push('')
    lines.push('¡Responded si aún no lo habéis hecho! 👇')
    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      setCopied(ev.id)
      setTimeout(() => setCopied(null), 2500)
    })
  }

  return (
    <div className="vest-section">
      {/* Create event form */}
      <div className="planes-form">
        <input
          type="text"
          placeholder="Nombre del plan…"
          value={form.title}
          onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
        />
        <select value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}>
          {PLAN_TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>
        <input
          type="date"
          value={form.date}
          onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
        />
        <input
          type="text"
          placeholder="Lugar (opcional)…"
          value={form.location}
          onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
        />
        <button className="vest-add-btn" onClick={addEvent}>+ Plan</button>
      </div>

      {/* Events list */}
      {planes.events.length === 0 && (
        <div className="vest-empty" style={{ padding: '24px 0', textAlign: 'center' }}>
          Sin planes creados aún. ¡Añade uno arriba!
        </div>
      )}

      {planes.events.slice().reverse().map((ev) => {
        const si = players.map(playerLabel).filter((a) => ev.votes[a] === 'si')
        const quizas = players.map(playerLabel).filter((a) => ev.votes[a] === 'quizas')
        const no = players.map(playerLabel).filter((a) => ev.votes[a] === 'no')
        const isOpen = expanded === ev.id

        return (
          <div key={ev.id} className="plan-card">
            <div className="plan-header" onClick={() => setExpanded(isOpen ? null : ev.id)}>
              <div className="plan-header-left">
                <span className="plan-title">{ev.title}</span>
                <span className="plan-type-badge">{ev.type}</span>
                {ev.date && <span className="vest-date">{ev.date}</span>}
                {ev.location && <span className="plan-location">📍 {ev.location}</span>}
              </div>
              <div className="plan-header-right">
                <span className="plan-vote-count si">✓ {si.length}</span>
                <span className="plan-vote-count quizas">? {quizas.length}</span>
                <span className="plan-vote-count no">✗ {no.length}</span>
                <button
                  className={`vest-whatsapp-btn small ${copied === ev.id ? 'copied' : ''}`}
                  onClick={(e) => { e.stopPropagation(); generateWhatsApp(ev) }}
                >
                  {copied === ev.id ? '✓' : '📋'}
                </button>
                <button className="vest-del-btn" onClick={(e) => { e.stopPropagation(); removeEvent(ev.id) }}>×</button>
                <span className="plan-chevron">{isOpen ? '▲' : '▼'}</span>
              </div>
            </div>

            {isOpen && (
              <div className="plan-votes-grid">
                {players.map((p) => {
                  const alias = playerLabel(p)
                  const current = ev.votes[alias]
                  return (
                    <div key={alias} className="plan-vote-row">
                      <span className="plan-vote-name">{alias}</span>
                      {Object.entries(VOTES).map(([key, label]) => (
                        <button
                          key={key}
                          className={`plan-vote-btn ${key} ${current === key ? 'active' : ''}`}
                          onClick={() => vote(ev.id, alias, key)}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════════════════ */
const TAB_ICONS = {
  cuotas: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v1.5M12 15.5V17" />
      <path d="M9.5 9.5c0-1.1.9-2 2.5-2s2.5.9 2.5 2c0 2.5-5 2.5-5 5 0 1.1.9 2 2.5 2s2.5-.9 2.5-2" />
    </svg>
  ),
  fondo: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3c-1.1 0-2 .9-2 2H6L3 8l3 2 1-1v9h10V9l1 1 3-2-3-3h-4c0-1.1-.9-2-2-2z" />
      <path d="M9.5 14l2 2 3-3.5" strokeWidth="2" />
    </svg>
  ),
  lavanderia: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2.5" />
      <circle cx="12" cy="13" r="4.5" />
      <circle cx="12" cy="13" r="2" />
      <path d="M6.5 6.5h2M11 6.5h.5" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  ),
  multas: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="9" height="13" rx="1.5" fill="currentColor" opacity="0.25" stroke="none" />
      <rect x="5" y="2" width="9" height="13" rx="1.5" />
      <rect x="10" y="7" width="9" height="13" rx="1.5" fill="currentColor" opacity="0.1" stroke="none" />
      <rect x="10" y="7" width="9" height="13" rx="1.5" />
    </svg>
  ),
  farturas: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11h18" />
      <ellipse cx="12" cy="11" rx="9" ry="3.5" />
      <path d="M5 11v3c0 3 3.1 5.5 7 5.5s7-2.5 7-5.5v-3" />
      <path d="M9 5c0-1.5 1.3-2.5 3-2.5s3 1 3 2.5" />
    </svg>
  ),
  planes: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18" />
      <path d="M8 3v4M16 3v4" />
      <path d="M12 14l.7 2.2H15l-2 1.5.7 2.2L12 18.4l-1.7 1.5.7-2.2-2-1.5h2.3L12 14z" fill="currentColor" opacity="0.6" stroke="none" />
      <path d="M12 14l.7 2.2H15l-2 1.5.7 2.2L12 18.4l-1.7 1.5.7-2.2-2-1.5h2.3L12 14z" strokeWidth="1" />
    </svg>
  ),
}

const TABS = [
  { id: 'cuotas',     label: 'Cuotas' },
  { id: 'fondo',      label: 'Material' },
  { id: 'lavanderia', label: 'Lavandería' },
  { id: 'multas',     label: 'Multas' },
  { id: 'farturas',   label: 'Farturas' },
  { id: 'planes',     label: 'Planes' },
]

export default function Vestuario({ data }) {
  const [tab, setTab] = useState('cuotas')
  const players = data?.playerProfiles?.players || []

  return (
    <div className="vestuario-page">
      <div className="vest-tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`vest-tab ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            <span className="vest-tab-icon">{TAB_ICONS[t.id]}</span>
            <span className="vest-tab-label">{t.label}</span>
          </button>
        ))}
      </div>
      <div className="vest-body">
        {tab === 'cuotas' && <Cuotas players={players} />}
        {tab === 'fondo' && <FondoMaterial players={players} />}
        {tab === 'lavanderia' && <Lavanderia players={players} />}
        {tab === 'multas' && <Multas players={players} />}
        {tab === 'farturas' && <Farturas players={players} />}
        {tab === 'planes' && <Planes players={players} />}
      </div>
    </div>
  )
}
