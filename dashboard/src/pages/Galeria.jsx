import { useState } from 'react'

export default function Galeria({ data }) {
  const galeria = data?.galeria || { photos: [], categories: [] }
  const [filter, setFilter] = useState('todos')
  const [lightbox, setLightbox] = useState(null) // photo object or null

  const displayed =
    filter === 'todos' ? galeria.photos : galeria.photos.filter((p) => p.category === filter)

  const openLightbox = (photo) => setLightbox(photo)
  const closeLightbox = () => setLightbox(null)

  const navigate = (dir) => {
    const idx = displayed.findIndex((p) => p.id === lightbox.id)
    const next = displayed[(idx + dir + displayed.length) % displayed.length]
    setLightbox(next)
  }

  const handleKeyDown = (e) => {
    if (!lightbox) return
    if (e.key === 'ArrowRight') navigate(1)
    if (e.key === 'ArrowLeft') navigate(-1)
    if (e.key === 'Escape') closeLightbox()
  }

  return (
    <div className="galeria-page" onKeyDown={handleKeyDown} tabIndex={-1}>
      {/* Kit decorativo San Claudio */}
      <div className="kit-hero">
        <KitSanClaudio />
        <div className="kit-hero-text">
          <div className="kit-hero-title">San Claudio</div>
          <div className="kit-hero-sub">Liga Asterov 25/26</div>
        </div>
      </div>

      {/* Filtros */}
      <div className="galeria-filters">
        {galeria.categories.map((cat) => (
          <button
            key={cat.id}
            className={`galeria-filter-btn ${filter === cat.id ? 'active' : ''}`}
            onClick={() => setFilter(cat.id)}
          >
            {cat.emoji} {cat.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="galeria-grid">
        {displayed.map((photo) => (
          <div
            key={photo.id}
            className="galeria-card"
            onClick={() => openLightbox(photo)}
          >
            <div className="galeria-card-img-wrap">
              <img src={`/${photo.file}`} alt={photo.title} loading="lazy" />
              <div className="galeria-card-overlay">
                <span className="galeria-card-cat">
                  {galeria.categories.find((c) => c.id === photo.category)?.emoji}{' '}
                  {galeria.categories.find((c) => c.id === photo.category)?.label}
                </span>
              </div>
            </div>
            <div className="galeria-card-info">
              <span className="galeria-card-title">{photo.title}</span>
              <span className="galeria-card-date">{photo.date}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <button className="lightbox-close" onClick={closeLightbox}>×</button>
          <button
            className="lightbox-nav prev"
            onClick={(e) => { e.stopPropagation(); navigate(-1) }}
          >
            ‹
          </button>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img src={`/${lightbox.file}`} alt={lightbox.title} />
            <div className="lightbox-info">
              <span className="lightbox-title">{lightbox.title}</span>
              <span className="lightbox-caption">{lightbox.caption}</span>
              <span className="lightbox-date">{lightbox.date}</span>
            </div>
          </div>
          <button
            className="lightbox-nav next"
            onClick={(e) => { e.stopPropagation(); navigate(1) }}
          >
            ›
          </button>
        </div>
      )}
    </div>
  )
}

/* ─── Kit SVG San Claudio ────────────────────────────────────────────────── */
function KitSanClaudio() {
  const yellow = '#f5c518'
  const blue = '#1a3a5c'
  const blueMid = '#2a5a8c'

  return (
    <div className="kit-svg-wrap">
      <svg viewBox="0 0 220 320" fill="none" xmlns="http://www.w3.org/2000/svg">

        {/* ── CAMISETA ── */}
        {/* Cuerpo principal */}
        <path
          d="M55 75 L30 55 L10 80 L30 95 L30 200 L95 210 L125 210 L190 200 L190 95 L210 80 L190 55 L165 75 C155 65 140 58 125 55 L125 50 C125 42 119 36 110 36 C101 36 95 42 95 50 L95 55 C80 58 65 65 55 75Z"
          fill={yellow}
        />
        {/* Franja diagonal azul 1 — de hombro izq a cadera der */}
        <path
          d="M55 75 L165 75 L190 200 L30 200Z"
          fill={yellow}
          opacity="0"
        />
        {/* Franjas diagonales — diagonal de izquierda-abajo a derecha-arriba */}
        <path
          d="M30 160 L190 105 L190 125 L30 180Z"
          fill={blue}
          opacity="0.9"
        />
        <path
          d="M30 120 L190 65 L190 82 L30 137Z"
          fill={blue}
          opacity="0.9"
        />
        {/* Manga izquierda */}
        <path
          d="M55 75 L10 80 L30 95 L55 95Z"
          fill={yellow}
        />
        <path d="M55 75 L10 80 L30 95 L55 95Z" fill={blue} opacity="0.15" />
        {/* Manga derecha */}
        <path
          d="M165 75 L210 80 L190 95 L165 95Z"
          fill={yellow}
        />
        {/* Cuello redondo */}
        <path
          d="M95 55 C95 42 101 36 110 36 C119 36 125 42 125 55"
          fill="none"
          stroke={blue}
          strokeWidth="3"
        />
        {/* Ribete cuello */}
        <path
          d="M93 57 C92 42 101 34 110 34 C119 34 128 42 127 57"
          fill="none"
          stroke={blue}
          strokeWidth="2"
          opacity="0.5"
        />
        {/* Número dorsal */}
        <text
          x="110" y="180"
          textAnchor="middle"
          fontFamily="'Barlow Condensed', sans-serif"
          fontSize="36"
          fontWeight="800"
          fill={blue}
          opacity="0.18"
          letterSpacing="-1"
        >
          SC
        </text>
        {/* Borde/costura camiseta */}
        <path
          d="M55 75 L30 55 L10 80 L30 95 L30 200 L95 210 L125 210 L190 200 L190 95 L210 80 L190 55 L165 75 C155 65 140 58 125 55 L125 50 C125 42 119 36 110 36 C101 36 95 42 95 50 L95 55 C80 58 65 65 55 75Z"
          fill="none"
          stroke={blue}
          strokeWidth="2"
          opacity="0.4"
        />

        {/* ── PANTALÓN ── */}
        <path
          d="M45 210 L75 280 L110 280 L110 215 L45 210Z"
          fill={blue}
        />
        <path
          d="M175 210 L145 280 L110 280 L110 215 L175 210Z"
          fill={blue}
        />
        {/* Raya lateral pantalón */}
        <path d="M55 213 L82 278" stroke={yellow} strokeWidth="2.5" opacity="0.5" />
        <path d="M165 213 L138 278" stroke={yellow} strokeWidth="2.5" opacity="0.5" />
        {/* Separación pantalón */}
        <line x1="110" y1="215" x2="110" y2="280" stroke={blueMid} strokeWidth="1" opacity="0.4" />
        {/* Cinturilla */}
        <rect x="45" y="208" width="130" height="8" rx="2" fill={blue} />
        <rect x="45" y="208" width="130" height="8" rx="2" fill="none" stroke={yellow} strokeWidth="1" opacity="0.4" />

        {/* ── MEDIAS ── */}
        {/* Media izquierda */}
        <path d="M75 280 L68 320 L90 320 L98 280Z" fill={yellow} />
        <rect x="68" y="280" width="30" height="6" fill={blue} opacity="0.7" />
        {/* Media derecha */}
        <path d="M145 280 L152 320 L130 320 L122 280Z" fill={yellow} />
        <rect x="122" y="280" width="30" height="6" fill={blue} opacity="0.7" />
        {/* Franja azul media */}
        <rect x="70" y="295" width="26" height="5" fill={blue} opacity="0.35" rx="1" />
        <rect x="124" y="295" width="26" height="5" fill={blue} opacity="0.35" rx="1" />

      </svg>
    </div>
  )
}
