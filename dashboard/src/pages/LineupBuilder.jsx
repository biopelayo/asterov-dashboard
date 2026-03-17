import { useState, useMemo, useRef, useCallback } from 'react'

/* Formations: HORIZONTAL pitch — x goes left(our goal) to right(attack), y goes top to bottom
   Goalkeeper at left (low x), attackers at right (high x) */
const DEFAULT_FORMATIONS = {
  '4-3-3': [
    { x: 8, y: 50, pos: 'POR' },
    { x: 24, y: 12, pos: 'LI' }, { x: 22, y: 38, pos: 'DFC' },
    { x: 22, y: 62, pos: 'DFC' }, { x: 24, y: 88, pos: 'LD' },
    { x: 48, y: 25, pos: 'MCI' }, { x: 45, y: 50, pos: 'MC' },
    { x: 48, y: 75, pos: 'MCD' },
    { x: 75, y: 18, pos: 'EI' }, { x: 80, y: 50, pos: 'DC' },
    { x: 75, y: 82, pos: 'ED' },
  ],
  '4-4-2': [
    { x: 8, y: 50, pos: 'POR' },
    { x: 24, y: 12, pos: 'LI' }, { x: 22, y: 38, pos: 'DFC' },
    { x: 22, y: 62, pos: 'DFC' }, { x: 24, y: 88, pos: 'LD' },
    { x: 48, y: 12, pos: 'MI' }, { x: 46, y: 38, pos: 'MCI' },
    { x: 46, y: 62, pos: 'MCD' }, { x: 48, y: 88, pos: 'MD' },
    { x: 78, y: 35, pos: 'DC' }, { x: 78, y: 65, pos: 'DC' },
  ],
  '3-5-2': [
    { x: 8, y: 50, pos: 'POR' },
    { x: 22, y: 25, pos: 'DFC' }, { x: 20, y: 50, pos: 'DFC' },
    { x: 22, y: 75, pos: 'DFC' },
    { x: 48, y: 8, pos: 'CAI' }, { x: 44, y: 30, pos: 'MCI' },
    { x: 42, y: 50, pos: 'MC' }, { x: 44, y: 70, pos: 'MCD' },
    { x: 48, y: 92, pos: 'CAD' },
    { x: 78, y: 35, pos: 'DC' }, { x: 78, y: 65, pos: 'DC' },
  ],
  '4-2-3-1': [
    { x: 8, y: 50, pos: 'POR' },
    { x: 24, y: 12, pos: 'LI' }, { x: 22, y: 38, pos: 'DFC' },
    { x: 22, y: 62, pos: 'DFC' }, { x: 24, y: 88, pos: 'LD' },
    { x: 42, y: 35, pos: 'MCD' }, { x: 42, y: 65, pos: 'MCD' },
    { x: 62, y: 18, pos: 'MI' }, { x: 60, y: 50, pos: 'MCO' },
    { x: 62, y: 82, pos: 'MD' },
    { x: 82, y: 50, pos: 'DC' },
  ],
  '5-3-2': [
    { x: 8, y: 50, pos: 'POR' },
    { x: 22, y: 8, pos: 'CAI' }, { x: 20, y: 28, pos: 'DFC' },
    { x: 18, y: 50, pos: 'DFC' }, { x: 20, y: 72, pos: 'DFC' },
    { x: 22, y: 92, pos: 'CAD' },
    { x: 46, y: 25, pos: 'MC' }, { x: 44, y: 50, pos: 'MC' },
    { x: 46, y: 75, pos: 'MC' },
    { x: 78, y: 35, pos: 'DC' }, { x: 78, y: 65, pos: 'DC' },
  ],
  '3-4-3': [
    { x: 8, y: 50, pos: 'POR' },
    { x: 22, y: 25, pos: 'DFC' }, { x: 20, y: 50, pos: 'DFC' },
    { x: 22, y: 75, pos: 'DFC' },
    { x: 46, y: 12, pos: 'MI' }, { x: 44, y: 38, pos: 'MC' },
    { x: 44, y: 62, pos: 'MC' }, { x: 46, y: 88, pos: 'MD' },
    { x: 75, y: 18, pos: 'EI' }, { x: 80, y: 50, pos: 'DC' },
    { x: 75, y: 82, pos: 'ED' },
  ],
}

/* Pitch size presets */
const PITCH_SIZES = [
  { key: 'XS', label: 'Mini', pct: 22 },
  { key: 'S', label: 'Peq', pct: 30 },
  { key: 'M', label: 'Med', pct: 40 },
]

/* Normaliza nombre para comparación */
function normName(str) {
  return (str || '').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ').trim()
}

export default function LineupBuilder({ data }) {
  const { meta, teams, calendar, playerProfiles } = data
  const team = teams[meta.featured_team_id]
  const [formation, setFormation] = useState('4-3-3')
  const [customFormation, setCustomFormation] = useState('')
  const [pitchSize, setPitchSize] = useState('XS')
  const [hoveredProfile, setHoveredProfile] = useState(null) // { prof, player, rect }
  const [copied, setCopied] = useState(false)

  /* Mapa de perfiles por nombre normalizado */
  const profileMap = useMemo(() => {
    const map = {}
    if (playerProfiles?.players) {
      for (const prof of playerProfiles.players) {
        map[normName(prof.name)] = prof
      }
    }
    return map
  }, [playerProfiles])

  const getProfile = (playerName) => profileMap[normName(playerName)] || null

  const [slots, setSlots] = useState(() =>
    DEFAULT_FORMATIONS['4-3-3'].map((s) => ({ player: null, x: s.x, y: s.y, pos: s.pos }))
  )
  const [available, setAvailable] = useState(() =>
    new Set((team?.players || []).map((p) => p.player_id))
  )

  const pitchRef = useRef(null)
  const dragRef = useRef(null)

  const nextMatch = useMemo(() => {
    for (const div of Object.values(calendar)) {
      for (const round of div.rounds) {
        for (const m of round.matches) {
          if (!m.played && (m.home === team?.name || m.away === team?.name)) {
            return { ...m, round: round.round }
          }
        }
      }
    }
    return null
  }, [calendar, team])

  const players = useMemo(() =>
    (team?.players || [])
      .filter((p) => p.matches_played > 0)
      .sort((a, b) => b.matches_played - a.matches_played),
    [team]
  )

  const assignedIds = new Set(slots.filter((s) => s.player).map((s) => s.player.player_id))

  const generateWhatsApp = useCallback(() => {
    const rival = nextMatch ? (nextMatch.home === 'SAN CLAUDIO' ? nextMatch.away : nextMatch.home) : '???'
    const jornada = nextMatch?.round || 'Próxima jornada'
    const fecha = nextMatch?.date || 'Fecha por definir'
    const hora = nextMatch?.time || ''
    const localVisita = nextMatch?.home === 'SAN CLAUDIO' ? '🏠 Casa' : '✈️ Fuera'
    const slotLines = slots
      .filter((s) => s.player)
      .map((s) => {
        const prof = getProfile(s.player.name)
        const name = prof?.alias || s.player.name.split(' ')[0]
        return `  • ${name} (${s.pos})`
      })
      .join('\n')
    const text = [
      `⚽ *CONVOCATORIA - SAN CLAUDIO*`,
      `🆚 vs *${rival}* | ${jornada}`,
      `📅 ${fecha}${hora ? ' · ' + hora : ''} | ${localVisita}`,
      ``,
      slotLines ? `*Alineación prevista:*\n${slotLines}` : `*Alineación pendiente*`,
      ``,
      `¿Vienes? Responde ✅ Sí / ❌ No / ⚠️ Duda`,
    ].join('\n')
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }, [slots, nextMatch, getProfile])

  const eventToPitchPct = useCallback((e) => {
    const pitch = pitchRef.current
    if (!pitch) return null
    const rect = pitch.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    const x = Math.max(3, Math.min(97, ((clientX - rect.left) / rect.width) * 100))
    const y = Math.max(3, Math.min(97, ((clientY - rect.top) / rect.height) * 100))
    return { x, y }
  }, [])

  const handleSlotDragStart = useCallback((e, slotIdx) => {
    e.preventDefault()
    dragRef.current = { type: 'slot', index: slotIdx }
    const handleMove = (me) => {
      me.preventDefault()
      const pos = eventToPitchPct(me)
      if (!pos) return
      setSlots((prev) => {
        const next = [...prev]
        next[slotIdx] = { ...next[slotIdx], x: pos.x, y: pos.y }
        return next
      })
    }
    const handleEnd = () => {
      dragRef.current = null
      document.removeEventListener('mousemove', handleMove)
      document.removeEventListener('mouseup', handleEnd)
      document.removeEventListener('touchmove', handleMove)
      document.removeEventListener('touchend', handleEnd)
    }
    document.addEventListener('mousemove', handleMove)
    document.addEventListener('mouseup', handleEnd)
    document.addEventListener('touchmove', handleMove, { passive: false })
    document.addEventListener('touchend', handleEnd)
  }, [eventToPitchPct])

  const handlePlayerDragStart = useCallback((e, player) => {
    e.preventDefault()
    const handleMove = (me) => { me.preventDefault() }
    const handleEnd = (me) => {
      document.removeEventListener('mousemove', handleMove)
      document.removeEventListener('mouseup', handleEnd)
      document.removeEventListener('touchmove', handleMove)
      document.removeEventListener('touchend', handleEnd)
      const clientX = me.changedTouches ? me.changedTouches[0].clientX : me.clientX
      const clientY = me.changedTouches ? me.changedTouches[0].clientY : me.clientY
      const pitch = pitchRef.current
      if (!pitch) return
      const rect = pitch.getBoundingClientRect()
      if (clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom) {
        const x = Math.max(3, Math.min(97, ((clientX - rect.left) / rect.width) * 100))
        const y = Math.max(3, Math.min(97, ((clientY - rect.top) / rect.height) * 100))
        setSlots((prev) => {
          const emptyIdx = prev.findIndex((s) => !s.player)
          const next = prev.map((s) => s.player?.player_id === player.player_id ? { ...s, player: null } : s)
          if (emptyIdx >= 0) next[emptyIdx] = { ...next[emptyIdx], player, x, y }
          return next
        })
      }
    }
    document.addEventListener('mousemove', handleMove)
    document.addEventListener('mouseup', handleEnd)
    document.addEventListener('touchmove', handleMove, { passive: false })
    document.addEventListener('touchend', handleEnd)
  }, [])

  /* Parse a custom formation string like "4-1-4-1" into slot positions */
  const parseCustomFormation = (str) => {
    const parts = str.split('-').map((n) => parseInt(n, 10)).filter((n) => !isNaN(n) && n > 0)
    if (parts.length < 2 || parts.reduce((a, b) => a + b, 0) !== 10) return null
    const positions = [{ x: 8, y: 50, pos: 'POR' }] // always a GK
    const lines = parts.length
    const xStep = 70 / (lines + 1) // distribute across pitch width
    parts.forEach((count, lineIdx) => {
      const xPos = 18 + xStep * (lineIdx + 1)
      for (let i = 0; i < count; i++) {
        const yPos = count === 1 ? 50 : 10 + (80 / (count - 1)) * i
        const posLabels = lineIdx === 0 ? 'DFC' : lineIdx === lines - 1 ? 'DC' : 'MC'
        positions.push({ x: Math.round(xPos), y: Math.round(yPos), pos: posLabels })
      }
    })
    return positions
  }

  const changeFormation = (f) => {
    setFormation(f)
    setCustomFormation('')
    const template = DEFAULT_FORMATIONS[f]
    setSlots((prev) => {
      const assignedPlayers = prev.filter((s) => s.player).map((s) => s.player)
      return template.map((t, i) => ({
        player: i < assignedPlayers.length ? assignedPlayers[i] : null,
        x: t.x, y: t.y, pos: t.pos,
      }))
    })
  }

  const applyCustomFormation = () => {
    const template = parseCustomFormation(customFormation)
    if (!template) return
    setFormation('custom')
    setSlots((prev) => {
      const assignedPlayers = prev.filter((s) => s.player).map((s) => s.player)
      return template.map((t, i) => ({
        player: i < assignedPlayers.length ? assignedPlayers[i] : null,
        x: t.x, y: t.y, pos: t.pos,
      }))
    })
  }

  const toggleAvailable = (playerId) => {
    setAvailable((prev) => {
      const next = new Set(prev)
      if (next.has(playerId)) {
        next.delete(playerId)
        setSlots((prev) => prev.map((s) => s.player?.player_id === playerId ? { ...s, player: null } : s))
      } else { next.add(playerId) }
      return next
    })
  }

  const assignToSlot = (player) => {
    setSlots((prev) => {
      const next = prev.map((s) => s.player?.player_id === player.player_id ? { ...s, player: null } : s)
      const emptyIdx = next.findIndex((s) => !s.player)
      if (emptyIdx >= 0) next[emptyIdx] = { ...next[emptyIdx], player }
      return next
    })
  }

  const removeFromSlot = (slotIdx) => {
    setSlots((prev) => { const next = [...prev]; next[slotIdx] = { ...next[slotIdx], player: null }; return next })
  }

  const autoFill = () => {
    const avail = players.filter((p) => available.has(p.player_id) && !assignedIds.has(p.player_id))
    setSlots((prev) => {
      const next = [...prev]
      const used = new Set(next.filter((s) => s.player).map((s) => s.player.player_id))
      for (let i = 0; i < next.length; i++) {
        if (!next[i].player) {
          const c = avail.find((p) => !used.has(p.player_id))
          if (c) { next[i] = { ...next[i], player: c }; used.add(c.player_id) }
        }
      }
      return next
    })
  }

  const clearAll = () => setSlots((prev) => prev.map((s) => ({ ...s, player: null })))
  const availableCount = players.filter((p) => available.has(p.player_id)).length
  const currentPitchPct = PITCH_SIZES.find((s) => s.key === pitchSize)?.pct || 48

  return (
    <div>
      {/* Next match */}
      {nextMatch && (
        <div className="card" style={{ marginBottom: 12, textAlign: 'center', padding: 10 }}>
          <div style={{ fontSize: 10, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: 1.5, fontFamily: 'var(--font-heading)', fontWeight: 700 }}>Proximo partido</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-bright)', marginTop: 3, fontFamily: 'var(--font-heading)', letterSpacing: 0.5 }}>
            {nextMatch.home} vs {nextMatch.away}
          </div>
          <div style={{ color: 'var(--text-dim)', fontSize: 11, marginTop: 2 }}>
            {nextMatch.round} | {nextMatch.date || 'Fecha por definir'} {nextMatch.time || ''}
          </div>
        </div>
      )}

      {/* Main layout: convocatoria izquierda + campo derecha */}
      <div className="card" style={{ padding: 12 }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>

          {/* Columna izquierda: convocatoria vertical */}
          <div style={{ width: 140, flexShrink: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <div className="card-title" style={{ marginBottom: 0, fontSize: 11 }}>Convocatoria ({availableCount})</div>
            </div>
            <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
              <button onClick={autoFill} style={{
                flex: 1, padding: '3px 0', background: 'var(--accent-dim)', border: '1px solid var(--accent)',
                borderRadius: 3, color: 'var(--accent)', cursor: 'pointer', fontSize: 9, fontWeight: 700,
                fontFamily: 'var(--font-heading)', textTransform: 'uppercase', letterSpacing: 0.3,
              }}>Auto</button>
              <button onClick={clearAll} style={{
                flex: 1, padding: '3px 0', background: 'var(--bg)', border: '1px solid var(--border)',
                borderRadius: 3, color: 'var(--text-dim)', cursor: 'pointer', fontSize: 9,
                fontFamily: 'var(--font-heading)', textTransform: 'uppercase', letterSpacing: 0.3,
              }}>Limpiar</button>
            </div>
            <button onClick={generateWhatsApp} style={{
              width: '100%', padding: '5px 0', marginBottom: 8,
              background: copied ? '#25D366' : 'rgba(37,211,102,0.12)',
              border: `1px solid ${copied ? '#25D366' : 'rgba(37,211,102,0.4)'}`,
              borderRadius: 3, color: copied ? '#fff' : '#25D366',
              cursor: 'pointer', fontSize: 10, fontWeight: 700,
              fontFamily: 'var(--font-heading)', letterSpacing: 0.5,
              transition: 'all 0.2s',
            }}>
              {copied ? '✓ Copiado!' : '📲 Copiar convocatoria WhatsApp'}
            </button>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, maxHeight: 400, overflowY: 'auto' }}>
              {players.map((p) => {
                const isAvail = available.has(p.player_id)
                const isAssigned = assignedIds.has(p.player_id)
                const prof = getProfile(p.name)
                const displayName = prof?.alias || p.name.split(' ').slice(-1)[0]
                const posLabel = prof?.position ? prof.position.split(' / ')[0] : null
                return (
                  <div
                    key={p.player_id}
                    onMouseDown={(e) => isAvail && !isAssigned ? handlePlayerDragStart(e, p) : undefined}
                    onTouchStart={(e) => isAvail && !isAssigned ? handlePlayerDragStart(e, p) : undefined}
                    onClick={() => { if (isAvail && !isAssigned) assignToSlot(p) }}
                    onMouseEnter={() => { if (prof?.notes) setHoveredProfile({ prof, player: p }) }}
                    onMouseLeave={() => setHoveredProfile(null)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '4px 6px', borderRadius: 4,
                      background: isAssigned ? 'var(--accent-dim)' : 'transparent',
                      border: isAssigned ? '1px solid var(--accent)' : '1px solid transparent',
                      opacity: isAvail ? 1 : 0.3,
                      cursor: isAvail && !isAssigned ? 'grab' : 'default',
                      transition: 'all 0.12s',
                      position: 'relative',
                    }}
                  >
                    <input
                      type="checkbox" checked={isAvail}
                      onChange={(e) => { e.stopPropagation(); toggleAvailable(p.player_id) }}
                      style={{ width: 10, height: 10, cursor: 'pointer', flexShrink: 0 }}
                    />
                    {p.photo ? (
                      <img src={p.photo} alt="" style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover', border: isAssigned ? '2px solid var(--accent)' : '1px solid var(--border)', flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: 'var(--text-dim)', flexShrink: 0 }}>{p.name.charAt(0)}</div>
                    )}
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 9, fontWeight: 700, color: isAssigned ? 'var(--accent)' : 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {displayName}
                      </div>
                      {posLabel && (
                        <div style={{ fontSize: 7.5, color: 'var(--text-dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {posLabel}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Columna derecha: controles de formación + campo */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Fila controles: formaciones + tamaño campo */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              {Object.keys(DEFAULT_FORMATIONS).map((f) => (
                <button key={f} onClick={() => changeFormation(f)} style={{
                  padding: '3px 8px',
                  background: formation === f ? 'var(--blue)' : 'var(--bg)',
                  border: `1px solid ${formation === f ? 'var(--blue)' : 'var(--border)'}`,
                  borderRadius: 3, color: formation === f ? '#fff' : 'var(--text-dim)',
                  cursor: 'pointer', fontSize: 10, fontWeight: 700,
                  fontFamily: 'var(--font-heading)', letterSpacing: 0.5,
                }}>{f}</button>
              ))}
              <div style={{ display: 'flex', gap: 3, alignItems: 'center', marginLeft: 4 }}>
                <input
                  type="text" placeholder="4-1-4-1"
                  value={customFormation}
                  onChange={(e) => setCustomFormation(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && applyCustomFormation()}
                  style={{
                    padding: '3px 6px', width: 72, background: 'var(--bg)', border: '1px solid var(--border)',
                    borderRadius: 3, color: 'var(--text)', fontSize: 10, fontFamily: 'var(--font-heading)',
                  }}
                />
                <button onClick={applyCustomFormation} style={{
                  padding: '3px 6px', background: customFormation ? 'var(--yellow)' : 'var(--bg)',
                  border: `1px solid ${customFormation ? 'var(--yellow)' : 'var(--border)'}`,
                  borderRadius: 3, color: customFormation ? '#000' : 'var(--text-dim)',
                  cursor: 'pointer', fontSize: 9, fontWeight: 700,
                }}>OK</button>
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 3, alignItems: 'center' }}>
                <span style={{ fontSize: 9, color: 'var(--text-dim)', fontWeight: 600 }}>Campo:</span>
                {PITCH_SIZES.map((s) => (
                  <button key={s.key} onClick={() => setPitchSize(s.key)} style={{
                    padding: '2px 6px',
                    background: pitchSize === s.key ? 'var(--accent-dim)' : 'transparent',
                    border: `1px solid ${pitchSize === s.key ? 'var(--accent)' : 'var(--border)'}`,
                    borderRadius: 3, color: pitchSize === s.key ? 'var(--accent)' : 'var(--text-dim)',
                    cursor: 'pointer', fontSize: 9, fontWeight: 600,
                  }}>{s.label}</button>
                ))}
              </div>
            </div>

            {/* Campo — ocupa todo el ancho disponible de la columna derecha */}
            <div
              ref={pitchRef}
              style={{
                position: 'relative',
                width: '100%',
                paddingBottom: `${currentPitchPct}%`,
                background: 'linear-gradient(90deg, #2d8840 0%, #339a4a 8%, #2d8840 16%, #339a4a 24%, #2d8840 32%, #339a4a 40%, #2d8840 48%, #339a4a 56%, #2d8840 64%, #339a4a 72%, #2d8840 80%, #339a4a 88%, #2d8840 100%)',
                borderRadius: 6, overflow: 'hidden',
                border: '2px solid #1a6b28',
                userSelect: 'none', touchAction: 'none',
                boxShadow: 'inset 0 0 30px rgba(0,0,0,0.15)',
              }}
            >
            {/* Field markings — horizontal: viewBox 105x68 */}
            <svg viewBox="0 0 105 68" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} preserveAspectRatio="none">
              <rect x="2" y="2" width="101" height="64" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="0.5" />
              <line x1="52.5" y1="2" x2="52.5" y2="66" stroke="rgba(255,255,255,0.35)" strokeWidth="0.5" />
              <circle cx="52.5" cy="34" r="9.15" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="0.5" />
              <circle cx="52.5" cy="34" r="0.5" fill="rgba(255,255,255,0.35)" />
              <rect x="2" y="13.5" width="16.5" height="41" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="0.5" />
              <rect x="2" y="21" width="5.5" height="26" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="0.5" />
              <circle cx="13" cy="34" r="0.5" fill="rgba(255,255,255,0.35)" />
              <path d="M 18.5 24.85 A 9.15 9.15 0 0 1 18.5 43.15" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="0.5" />
              <rect x="86.5" y="13.5" width="16.5" height="41" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="0.5" />
              <rect x="97.5" y="21" width="5.5" height="26" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="0.5" />
              <circle cx="92" cy="34" r="0.5" fill="rgba(255,255,255,0.35)" />
              <path d="M 86.5 24.85 A 9.15 9.15 0 0 0 86.5 43.15" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="0.5" />
              <path d="M 4 2 A 2 2 0 0 0 2 4" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="0.5" />
              <path d="M 103 4 A 2 2 0 0 0 101 2" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="0.5" />
              <path d="M 2 64 A 2 2 0 0 0 4 66" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="0.5" />
              <path d="M 101 66 A 2 2 0 0 0 103 64" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="0.5" />
            </svg>

            {/* Direction indicator */}
            <div style={{
              position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
              color: 'rgba(255,255,255,0.2)', fontSize: 8, fontWeight: 700,
              fontFamily: 'var(--font-heading)', letterSpacing: 1.5, textTransform: 'uppercase',
              display: 'flex', alignItems: 'center', gap: 2, zIndex: 5,
            }}>
              ATQ <span style={{ fontSize: 11 }}>&#9654;</span>
            </div>

            {/* Player slots */}
            {slots.map((slot, i) => {
              const player = slot.player
              return (
                <div
                  key={i}
                  onMouseDown={(e) => player ? handleSlotDragStart(e, i) : undefined}
                  onTouchStart={(e) => player ? handleSlotDragStart(e, i) : undefined}
                  onDoubleClick={() => player ? removeFromSlot(i) : undefined}
                  style={{
                    position: 'absolute',
                    left: `${slot.x}%`, top: `${slot.y}%`,
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center', cursor: player ? 'grab' : 'default', zIndex: 10,
                  }}
                >
                  {player ? (
                    <>
                      {player.photo ? (
                        <img src={player.photo} alt="" style={{
                          width: 30, height: 30, borderRadius: '50%', border: '2px solid #fff',
                          objectFit: 'cover', boxShadow: '0 2px 6px rgba(0,0,0,0.5)', pointerEvents: 'none',
                        }} />
                      ) : (
                        <div style={{
                          width: 30, height: 30, borderRadius: '50%', background: '#fff',
                          border: '2px solid #fff', display: 'flex', alignItems: 'center',
                          justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#2d8c3c',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
                          fontFamily: 'var(--font-heading)',
                        }}>{player.name.charAt(0)}</div>
                      )}
                      <div style={{
                        fontSize: 7.5, color: '#fff', fontWeight: 700, marginTop: 1,
                        textShadow: '0 1px 3px rgba(0,0,0,0.9)', whiteSpace: 'nowrap',
                        maxWidth: 60, overflow: 'hidden', textOverflow: 'ellipsis',
                        background: 'rgba(0,0,0,0.55)', borderRadius: 2, padding: '1px 3px',
                        fontFamily: 'var(--font-heading)', letterSpacing: 0.3,
                      }}>
                        {player.name.split(' ').slice(-1)[0]}
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{
                        width: 30, height: 30, borderRadius: '50%',
                        border: '2px dashed rgba(255,255,255,0.3)',
                        background: 'rgba(255,255,255,0.06)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 14, color: 'rgba(255,255,255,0.3)',
                      }}>+</div>
                      <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.4)', marginTop: 1, fontWeight: 700, fontFamily: 'var(--font-heading)', letterSpacing: 0.5 }}>
                        {slot.pos}
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
            <p style={{ fontSize: 9, color: 'var(--text-dim)', textAlign: 'center', marginTop: 4, lineHeight: 1.4 }}>
              Click para colocar · Arrastra para mover · Doble click para quitar
            </p>

            {/* Panel de perfil bajo el campo — se activa al hacer hover en la convocatoria */}
            <div style={{
              marginTop: 10,
              minHeight: 80,
              borderRadius: 6,
              border: hoveredProfile ? '1px solid var(--accent)' : '1px solid var(--border)',
              background: hoveredProfile ? 'var(--card)' : 'var(--bg)',
              padding: hoveredProfile ? '12px 16px' : '10px 16px',
              transition: 'all 0.15s',
            }}>
              {hoveredProfile ? (
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  {/* Foto + nombre + posición */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                    {hoveredProfile.player.photo ? (
                      <img src={hoveredProfile.player.photo} alt="" style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--accent)', boxShadow: '0 3px 10px rgba(0,0,0,0.2)' }} />
                    ) : (
                      <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: 'var(--accent)', fontFamily: 'var(--font-heading)' }}>
                        {hoveredProfile.player.name.charAt(0)}
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: 8, fontSize: 11, color: 'var(--text-dim)' }}>
                      <span><strong style={{ color: 'var(--text-bright)' }}>{hoveredProfile.player.matches_played}</strong> PJ</span>
                      {hoveredProfile.player.total_goals > 0 && <span><strong style={{ color: 'var(--accent)' }}>{hoveredProfile.player.total_goals}</strong> G</span>}
                      {hoveredProfile.player.yellow_cards > 0 && <span><strong style={{ color: 'var(--warning)' }}>{hoveredProfile.player.yellow_cards}</strong> TA</span>}
                    </div>
                  </div>
                  {/* Texto */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--text-bright)', fontFamily: 'var(--font-heading)', letterSpacing: 0.5, lineHeight: 1 }}>
                      {hoveredProfile.prof.alias || hoveredProfile.player.name.split(' ')[0]}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 2 }}>
                      {hoveredProfile.player.name}
                    </div>
                    {hoveredProfile.prof.position && (
                      <span style={{ display: 'inline-block', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 3, background: 'var(--accent-dim)', color: 'var(--accent)', fontFamily: 'var(--font-heading)', letterSpacing: 0.5, marginBottom: 7 }}>
                        {hoveredProfile.prof.position}
                      </span>
                    )}
                    {hoveredProfile.prof.notes && (
                      <div style={{ fontSize: 12, color: 'var(--text)', lineHeight: 1.6, fontStyle: 'italic' }}>
                        "{hoveredProfile.prof.notes}"
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p style={{ fontSize: 11, color: 'var(--text-dim)', margin: 0, textAlign: 'center', lineHeight: 1.6 }}>
                  Pasa el cursor sobre un jugador de la convocatoria para ver su perfil aquí
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
