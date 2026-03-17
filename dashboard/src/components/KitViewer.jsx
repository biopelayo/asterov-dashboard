import { useState, useRef, useCallback } from 'react'

/* ════════════════════════════════════════════════════
   ESTILO: ilustración vectorial limpia, mockup de kit
   Referencia: imagen oficial 1ª equipación San Claudio
════════════════════════════════════════════════════ */

const SKIN   = '#e8c49a'
const SKIN_D = '#c89a6a'
const SKIN_S = '#f5d8b0'

/* ── Franja diagonal: de hombro derecho hacia cadera izq ── */
function JerseyFront() {
  return (
    <svg viewBox="0 0 280 500" width="220" height="393" style={{ display:'block', overflow:'visible' }}>
      <defs>
        {/* ── Piel ── */}
        <linearGradient id="sk-neck" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor={SKIN_D}/>
          <stop offset="35%"  stopColor={SKIN_S}/>
          <stop offset="65%"  stopColor={SKIN}/>
          <stop offset="100%" stopColor={SKIN_D}/>
        </linearGradient>
        <linearGradient id="sk-arm-L" x1="100%" y1="0%" x2="0%" y2="0%">
          <stop offset="0%"   stopColor={SKIN}/>
          <stop offset="40%"  stopColor={SKIN_S}/>
          <stop offset="100%" stopColor={SKIN_D}/>
        </linearGradient>
        <linearGradient id="sk-arm-R" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor={SKIN}/>
          <stop offset="40%"  stopColor={SKIN_S}/>
          <stop offset="100%" stopColor={SKIN_D}/>
        </linearGradient>
        <linearGradient id="sk-face" x1="30%" y1="0%" x2="70%" y2="100%">
          <stop offset="0%"   stopColor={SKIN_S}/>
          <stop offset="100%" stopColor={SKIN}/>
        </linearGradient>
        <linearGradient id="sk-hand-L" x1="80%" y1="0%" x2="20%" y2="100%">
          <stop offset="0%"   stopColor={SKIN}/>
          <stop offset="100%" stopColor={SKIN_D}/>
        </linearGradient>
        <linearGradient id="sk-hand-R" x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%"   stopColor={SKIN}/>
          <stop offset="100%" stopColor={SKIN_D}/>
        </linearGradient>

        {/* ── Camiseta base 3D ── */}
        <linearGradient id="jersey-base" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#d4a800"/>
          <stop offset="12%"  stopColor="#e8b800"/>
          <stop offset="38%"  stopColor="#f7cc20"/>
          <stop offset="55%"  stopColor="#fad428"/>
          <stop offset="72%"  stopColor="#f0c418"/>
          <stop offset="88%"  stopColor="#e2b400"/>
          <stop offset="100%" stopColor="#cc9e00"/>
        </linearGradient>

        {/* ── Franja azul diagonal (top-right → bottom-left) ── */}
        <linearGradient id="stripe-blue" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="#1a8fd1" stopOpacity="0"/>
          <stop offset="16%"  stopColor="#1a8fd1" stopOpacity="0"/>
          <stop offset="24%"  stopColor="#2299e0" stopOpacity="1"/>
          <stop offset="38%"  stopColor="#29aadf" stopOpacity="1"/>
          <stop offset="46%"  stopColor="#2299e0" stopOpacity="0"/>
          <stop offset="100%" stopColor="#2299e0" stopOpacity="0"/>
        </linearGradient>

        {/* ── Franja shimmer/plata (junto a la azul) ── */}
        <linearGradient id="stripe-shimmer" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="#e8e8e8" stopOpacity="0"/>
          <stop offset="36%"  stopColor="#e8e8e8" stopOpacity="0"/>
          <stop offset="44%"  stopColor="#d8d8d8" stopOpacity="0.75"/>
          <stop offset="52%"  stopColor="#f0f0f0" stopOpacity="0.85"/>
          <stop offset="60%"  stopColor="#e8e8e8" stopOpacity="0"/>
          <stop offset="100%" stopColor="#e8e8e8" stopOpacity="0"/>
        </linearGradient>

        {/* ── Sombra lateral 3D sobre la camiseta ── */}
        <linearGradient id="jersey-shadow" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#000" stopOpacity="0.22"/>
          <stop offset="10%"  stopColor="#000" stopOpacity="0.08"/>
          <stop offset="30%"  stopColor="#000" stopOpacity="0.01"/>
          <stop offset="55%"  stopColor="#fff" stopOpacity="0.05"/>
          <stop offset="80%"  stopColor="#000" stopOpacity="0.01"/>
          <stop offset="92%"  stopColor="#000" stopOpacity="0.08"/>
          <stop offset="100%" stopColor="#000" stopOpacity="0.22"/>
        </linearGradient>

        {/* ── Pantalón ── */}
        <linearGradient id="shorts-3d" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#08182a"/>
          <stop offset="20%"  stopColor="#0f2640"/>
          <stop offset="50%"  stopColor="#163050"/>
          <stop offset="80%"  stopColor="#0f2640"/>
          <stop offset="100%" stopColor="#08182a"/>
        </linearGradient>
        <linearGradient id="shorts-fade" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="#000" stopOpacity="0"/>
          <stop offset="100%" stopColor="#000" stopOpacity="0.25"/>
        </linearGradient>

        {/* ── Clip: contorno camiseta ── */}
        <clipPath id="jersey-clip-F">
          <path d="M62,110 L14,95 L2,140 L34,152 L40,136 L40,302 L240,302 L240,136 L246,152 L278,140 L266,95 L218,110
                   C202,100 178,94 140,94 C102,94 78,100 62,110Z"/>
        </clipPath>

        {/* ── Arrugas de tela (sutil) ── */}
        <filter id="subtle">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" result="noise"/>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.2" xChannelSelector="R" yChannelSelector="G"/>
        </filter>
      </defs>

      {/* ══════════════════════════════════
          PANTALÓN
      ══════════════════════════════════ */}
      <path d="M44,298 L54,400 L108,400 L140,362 L172,400 L226,400 L236,298Z"
        fill="url(#shorts-3d)"/>
      <path d="M44,298 L54,400 L108,400 L140,362 L172,400 L226,400 L236,298Z"
        fill="url(#shorts-fade)"/>
      {/* Franjas laterales pantalón */}
      <rect x="44" y="298" width="12" height="95" rx="3" fill="#29aadf" opacity="0.30"/>
      <rect x="224" y="298" width="12" height="95" rx="3" fill="#29aadf" opacity="0.30"/>
      {/* Dobladillo pantalón */}
      <path d="M56,396 L108,398 M172,398 L224,396"
        stroke="rgba(255,255,255,0.08)" strokeWidth="2"/>

      {/* ══════════════════════════════════
          ANTEBRAZOS Y MANOS
      ══════════════════════════════════ */}
      {/* Antebrazo izquierdo */}
      <path d="M34,152 L18,212 Q14,224 24,228 Q34,232 38,220 L52,144"
        fill="url(#sk-arm-L)" stroke={SKIN_D} strokeWidth="0.8"/>
      {/* Sombra interna antebrazo izq */}
      <path d="M32,155 Q26,180 28,210" fill="none" stroke="rgba(0,0,0,0.10)" strokeWidth="3"/>
      {/* Mano izquierda */}
      <path d="M16,222 Q12,236 20,242 Q30,246 36,236 L38,220Z" fill="url(#sk-hand-L)"/>
      <path d="M18,228 L14,238 M22,225 L19,238 M26,224 L25,237 M30,224 L30,236"
        stroke={SKIN_D} strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
      <path d="M20,240 Q28,244 34,238" fill="none" stroke={SKIN_D} strokeWidth="1.2" opacity="0.5"/>

      {/* Antebrazo derecho */}
      <path d="M246,152 L262,212 Q266,224 256,228 Q246,232 242,220 L228,144"
        fill="url(#sk-arm-R)" stroke={SKIN_D} strokeWidth="0.8"/>
      <path d="M248,155 Q254,180 252,210" fill="none" stroke="rgba(0,0,0,0.10)" strokeWidth="3"/>
      {/* Mano derecha */}
      <path d="M264,222 Q268,236 260,242 Q250,246 244,236 L242,220Z" fill="url(#sk-hand-R)"/>
      <path d="M262,228 L266,238 M258,225 L261,238 M254,224 L255,237 M250,224 L250,236"
        stroke={SKIN_D} strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
      <path d="M260,240 Q252,244 246,238" fill="none" stroke={SKIN_D} strokeWidth="1.2" opacity="0.5"/>

      {/* ══════════════════════════════════
          CAMISETA — capas dentro del clip
      ══════════════════════════════════ */}
      <g clipPath="url(#jersey-clip-F)">
        {/* Base amarilla con gradiente 3D */}
        <rect x="0" y="80" width="280" height="230" fill="url(#jersey-base)"/>

        {/* Franja azul diagonal */}
        <rect x="-20" y="80" width="330" height="230" fill="url(#stripe-blue)"/>

        {/* Franja shimmer/plata */}
        <rect x="-20" y="80" width="330" height="230" fill="url(#stripe-shimmer)"/>

        {/* Sombra 3D encima */}
        <rect x="0" y="80" width="280" height="230" fill="url(#jersey-shadow)"/>

        {/* Arrugas sutiles de tela */}
        <path d="M140,155 Q137,168 140,178 Q143,168 140,155"
          fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="2.5"/>
        <path d="M118,172 Q116,183 118,192"
          fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="1.8"/>
        <path d="M162,172 Q164,183 162,192"
          fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="1.8"/>
        <path d="M68,140 Q64,155 66,166"
          fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="1.8"/>
        <path d="M212,140 Q216,155 214,166"
          fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="1.8"/>
      </g>

      {/* ── Contorno exterior camiseta ── */}
      <path d="M62,110 L14,95 L2,140 L34,152 L40,136 L40,302 L240,302 L240,136 L246,152 L278,140 L266,95 L218,110
               C202,100 178,94 140,94 C102,94 78,100 62,110Z"
        fill="none" stroke="rgba(0,0,0,0.18)" strokeWidth="1.5"/>

      {/* ── Cuello redondo ── */}
      <ellipse cx="140" cy="95" rx="40" ry="14" fill="#0a1e32"/>
      <ellipse cx="140" cy="93" rx="38" ry="12" fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="1"/>
      {/* Interior del cuello (piel visible) */}
      <ellipse cx="140" cy="93" rx="32" ry="9" fill="url(#sk-neck)"/>

      {/* ── Franja azul mangas ── */}
      {/* Manga izq */}
      <path d="M40,200 Q34,206 40,210 L52,210 Q56,205 52,200Z" fill="#29aadf" opacity="0.7"/>
      <path d="M40,206 L52,206" stroke="#f5c518" strokeWidth="2" opacity="0.6"/>
      {/* Manga der */}
      <path d="M240,200 Q246,205 240,210 L228,210 Q224,205 228,200Z" fill="#29aadf" opacity="0.7"/>
      <path d="M228,206 L240,206" stroke="#f5c518" strokeWidth="2" opacity="0.6"/>

      {/* ── Sponsor TRANSPORTARIUM ── */}
      <rect x="40" y="182" width="200" height="52" rx="4" fill="#0f2640" opacity="0.95"/>
      <rect x="40" y="182" width="200" height="52" rx="4" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1"/>
      <text x="140" y="202" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="800"
        fontFamily="'Barlow Condensed','Arial Narrow',sans-serif" letterSpacing="0.5">
        TRANSPORTARIUM, S.L.
      </text>
      <text x="140" y="222" textAnchor="middle" fill="rgba(255,255,255,0.78)" fontSize="11" fontWeight="500"
        fontFamily="'Barlow Condensed','Arial Narrow',sans-serif" letterSpacing="2.5">
        SERVICIO INMEDIATO
      </text>

      {/* ── Escudo San Claudio (pecho derecho) ── */}
      <g transform="translate(168,104)">
        {/* Escudo base */}
        <path d="M0,0 L36,0 L36,26 C36,42 18,52 18,52 C18,52 0,42 0,26Z" fill="#0f2640"/>
        <path d="M0,0 L36,0 L36,26 C36,42 18,52 18,52 C18,52 0,42 0,26Z"
          fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5"/>
        {/* Divisiones del escudo */}
        <path d="M18,0 L18,52" stroke="rgba(255,255,255,0.15)" strokeWidth="1"/>
        <path d="M0,22 L36,22" stroke="rgba(255,255,255,0.15)" strokeWidth="1"/>
        {/* Cuarteles simplificados */}
        <rect x="0" y="0" width="18" height="22" fill="#c0392b" opacity="0.8"/>
        <rect x="18" y="0" width="18" height="22" fill="#27ae60" opacity="0.8"/>
        <rect x="0" y="22" width="18" height="12" fill="#f5c518" opacity="0.8"/>
        <rect x="18" y="22" width="18" height="12" fill="#c0392b" opacity="0.8"/>
        {/* Letra I central */}
        <text x="18" y="20" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="900"
          fontFamily="serif" opacity="0.9">I</text>
        {/* Banda inferior */}
        <path d="M2,34 Q18,48 34,34 C34,45 18,52 18,52 C18,52 2,45 2,34Z" fill="#0f2640" opacity="0.6"/>
      </g>

      {/* ── Marca keon ── */}
      <text x="76" y="120" textAnchor="middle" fill="#0f2640" fontSize="11" fontWeight="700"
        fontFamily="'Barlow Condensed',sans-serif" letterSpacing="1" opacity="0.55">keon</text>

      {/* ══════════════════════════════════
          CUELLO / CABEZA
      ══════════════════════════════════ */}
      {/* Cuello */}
      <path d="M116,68 L116,96 Q140,104 164,96 L164,68" fill="url(#sk-neck)"/>
      {/* Sombra cuello */}
      <path d="M116,92 Q140,98 164,92" fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="3"/>

      {/* Barbilla / parte baja de la cabeza */}
      <path d="M104,30 Q105,68 140,72 Q175,68 176,30 Q172,14 140,12 Q108,14 104,30Z"
        fill="url(#sk-face)"/>
      {/* Mandíbula */}
      <path d="M106,52 Q112,68 140,72 Q168,68 174,52"
        fill="none" stroke={SKIN_D} strokeWidth="1" opacity="0.3"/>
      {/* Orejas */}
      <path d="M104,40 Q96,40 94,48 Q96,56 104,58 L104,40Z" fill={SKIN}/>
      <path d="M176,40 Q184,40 186,48 Q184,56 176,58 L176,40Z" fill={SKIN}/>
    </svg>
  )
}

/* ════════════════════════════════════════════════════
   VISTA TRASERA — mismo estilo limpio
════════════════════════════════════════════════════ */
function JerseyBack() {
  return (
    <svg viewBox="0 0 280 500" width="220" height="393" style={{ display:'block', overflow:'visible' }}>
      <defs>
        <linearGradient id="b-sk-neck" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor={SKIN_D}/>
          <stop offset="35%"  stopColor={SKIN_S}/>
          <stop offset="65%"  stopColor={SKIN}/>
          <stop offset="100%" stopColor={SKIN_D}/>
        </linearGradient>
        <linearGradient id="b-sk-arm-L" x1="100%" y1="0%" x2="0%" y2="0%">
          <stop offset="0%"   stopColor={SKIN}/>
          <stop offset="40%"  stopColor={SKIN_S}/>
          <stop offset="100%" stopColor={SKIN_D}/>
        </linearGradient>
        <linearGradient id="b-sk-arm-R" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor={SKIN}/>
          <stop offset="40%"  stopColor={SKIN_S}/>
          <stop offset="100%" stopColor={SKIN_D}/>
        </linearGradient>
        <linearGradient id="b-jersey-base" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#cc9e00"/>
          <stop offset="12%"  stopColor="#e2b400"/>
          <stop offset="38%"  stopColor="#f0c418"/>
          <stop offset="55%"  stopColor="#fad428"/>
          <stop offset="72%"  stopColor="#f7cc20"/>
          <stop offset="88%"  stopColor="#e8b800"/>
          <stop offset="100%" stopColor="#d4a800"/>
        </linearGradient>
        {/* Franja diagonal (en espalda: top-left → bottom-right, espejo) */}
        <linearGradient id="b-stripe-blue" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#1a8fd1" stopOpacity="0"/>
          <stop offset="16%"  stopColor="#1a8fd1" stopOpacity="0"/>
          <stop offset="24%"  stopColor="#2299e0" stopOpacity="1"/>
          <stop offset="38%"  stopColor="#29aadf" stopOpacity="1"/>
          <stop offset="46%"  stopColor="#2299e0" stopOpacity="0"/>
          <stop offset="100%" stopColor="#2299e0" stopOpacity="0"/>
        </linearGradient>
        <linearGradient id="b-stripe-shimmer" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#e8e8e8" stopOpacity="0"/>
          <stop offset="36%"  stopColor="#e8e8e8" stopOpacity="0"/>
          <stop offset="44%"  stopColor="#d8d8d8" stopOpacity="0.75"/>
          <stop offset="52%"  stopColor="#f0f0f0" stopOpacity="0.85"/>
          <stop offset="60%"  stopColor="#e8e8e8" stopOpacity="0"/>
          <stop offset="100%" stopColor="#e8e8e8" stopOpacity="0"/>
        </linearGradient>
        <linearGradient id="b-jersey-shadow" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#000" stopOpacity="0.22"/>
          <stop offset="10%"  stopColor="#000" stopOpacity="0.08"/>
          <stop offset="30%"  stopColor="#000" stopOpacity="0.01"/>
          <stop offset="55%"  stopColor="#fff" stopOpacity="0.05"/>
          <stop offset="80%"  stopColor="#000" stopOpacity="0.01"/>
          <stop offset="92%"  stopColor="#000" stopOpacity="0.08"/>
          <stop offset="100%" stopColor="#000" stopOpacity="0.22"/>
        </linearGradient>
        <linearGradient id="b-shorts-3d" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#08182a"/>
          <stop offset="20%"  stopColor="#0f2640"/>
          <stop offset="50%"  stopColor="#163050"/>
          <stop offset="80%"  stopColor="#0f2640"/>
          <stop offset="100%" stopColor="#08182a"/>
        </linearGradient>
        <linearGradient id="b-sk-face" x1="30%" y1="0%" x2="70%" y2="100%">
          <stop offset="0%"   stopColor="#c89a6a"/>
          <stop offset="100%" stopColor="#b07840"/>
        </linearGradient>
        <clipPath id="jersey-clip-B">
          <path d="M62,110 L14,95 L2,140 L34,152 L40,136 L40,302 L240,302 L240,136 L246,152 L278,140 L266,95 L218,110
                   C202,100 178,94 140,94 C102,94 78,100 62,110Z"/>
        </clipPath>
      </defs>

      {/* Pantalón */}
      <path d="M44,298 L54,400 L108,400 L140,362 L172,400 L226,400 L236,298Z"
        fill="url(#b-shorts-3d)"/>
      <rect x="44" y="298" width="12" height="95" rx="3" fill="#29aadf" opacity="0.30"/>
      <rect x="224" y="298" width="12" height="95" rx="3" fill="#29aadf" opacity="0.30"/>

      {/* Antebrazos */}
      <path d="M34,152 L18,212 Q14,224 24,228 Q34,232 38,220 L52,144"
        fill="url(#b-sk-arm-L)" stroke={SKIN_D} strokeWidth="0.8"/>
      <path d="M246,152 L262,212 Q266,224 256,228 Q246,232 242,220 L228,144"
        fill="url(#b-sk-arm-R)" stroke={SKIN_D} strokeWidth="0.8"/>

      {/* Manos */}
      <path d="M16,222 Q12,236 20,242 Q30,246 36,236 L38,220Z" fill={SKIN_D}/>
      <path d="M264,222 Q268,236 260,242 Q250,246 244,236 L242,220Z" fill={SKIN_D}/>

      {/* Camiseta trasera */}
      <g clipPath="url(#jersey-clip-B)">
        <rect x="0" y="80" width="280" height="230" fill="url(#b-jersey-base)"/>
        <rect x="-20" y="80" width="330" height="230" fill="url(#b-stripe-blue)"/>
        <rect x="-20" y="80" width="330" height="230" fill="url(#b-stripe-shimmer)"/>
        <rect x="0" y="80" width="280" height="230" fill="url(#b-jersey-shadow)"/>
        {/* Arrugas espalda */}
        <path d="M140,130 Q137,145 140,158 Q143,145 140,130"
          fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="2.5"/>
        <path d="M140,160 Q136,180 138,200"
          fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="2"/>
        <path d="M140,160 Q144,180 142,200"
          fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="2"/>
      </g>

      <path d="M62,110 L14,95 L2,140 L34,152 L40,136 L40,302 L240,302 L240,136 L246,152 L278,140 L266,95 L218,110
               C202,100 178,94 140,94 C102,94 78,100 62,110Z"
        fill="none" stroke="rgba(0,0,0,0.18)" strokeWidth="1.5"/>

      {/* Cuello redondo trasero */}
      <ellipse cx="140" cy="96" rx="38" ry="12" fill="#0a1e32"/>
      <ellipse cx="140" cy="94" rx="30" ry="9" fill="url(#b-sk-neck)"/>

      {/* Franjas manga */}
      <path d="M40,200 Q34,206 40,210 L52,210 Q56,205 52,200Z" fill="#29aadf" opacity="0.7"/>
      <path d="M40,206 L52,206" stroke="#f5c518" strokeWidth="2" opacity="0.6"/>
      <path d="M240,200 Q246,205 240,210 L228,210 Q224,205 228,200Z" fill="#29aadf" opacity="0.7"/>
      <path d="M228,206 L240,206" stroke="#f5c518" strokeWidth="2" opacity="0.6"/>

      {/* Número */}
      <text x="140" y="248" textAnchor="middle" fill="#0f2640" fontSize="72" fontWeight="900"
        fontFamily="'Barlow Condensed','Arial Narrow',sans-serif" opacity="0.80" letterSpacing="-2">
        9
      </text>
      {/* Nombre */}
      <text x="140" y="138" textAnchor="middle" fill="#0f2640" fontSize="14" fontWeight="700"
        fontFamily="'Barlow Condensed','Arial Narrow',sans-serif" letterSpacing="3" opacity="0.70">
        JUGADOR
      </text>

      {/* Cuello / cabeza trasera */}
      <path d="M116,68 L116,96 Q140,104 164,96 L164,68" fill="url(#b-sk-neck)"/>
      {/* Cabeza trasera: pelo */}
      <ellipse cx="140" cy="38" rx="36" ry="38" fill="#2a1608"/>
      <path d="M104,38 Q106,12 140,10 Q174,12 176,38 Q172,58 140,62 Q108,58 104,38Z" fill="#221004"/>
      {/* Textura pelo */}
      <path d="M118,14 Q116,32 118,50" fill="none" stroke="#180a02" strokeWidth="2" opacity="0.4"/>
      <path d="M132,11 Q130,30 132,50" fill="none" stroke="#180a02" strokeWidth="2" opacity="0.3"/>
      <path d="M148,11 Q150,30 148,50" fill="none" stroke="#180a02" strokeWidth="2" opacity="0.3"/>
      <path d="M162,14 Q164,32 162,50" fill="none" stroke="#180a02" strokeWidth="2" opacity="0.4"/>
      {/* Orejas */}
      <path d="M104,44 Q96,44 94,52 Q96,60 104,62 L104,44Z" fill={SKIN}/>
      <path d="M176,44 Q184,44 186,52 Q184,60 176,62 L176,44Z" fill={SKIN}/>
    </svg>
  )
}

/* ════════════════════════════════════════════════════
   DRAG-TO-ROTATE
════════════════════════════════════════════════════ */
function RotatingPlayer() {
  const [angle, setAngle]     = useState(0)
  const [dragging, setDragging] = useState(false)
  const startRef = useRef({ x: 0, angle: 0 })

  const onPointerDown = useCallback((e) => {
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    setDragging(true)
    startRef.current = { x: e.clientX, angle }
  }, [angle])

  const onPointerMove = useCallback((e) => {
    if (!dragging) return
    setAngle(startRef.current.angle + (e.clientX - startRef.current.x) * 0.65)
  }, [dragging])

  const onPointerUp = useCallback(() => setDragging(false), [])

  const norm = ((angle % 360) + 360) % 360
  const showBack = norm > 90 && norm < 270

  return (
    <div
      className={`kit-rotator-wrap${dragging ? ' dragging' : ''}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
    >
      <div className="kit-rotator-scene">
        <div className="kit-rotator-front" style={{ opacity: showBack ? 0 : 1 }}>
          <JerseyFront/>
        </div>
        <div className="kit-rotator-back" style={{ opacity: showBack ? 1 : 0 }}>
          <JerseyBack/>
        </div>
      </div>
      <div className="kit-player-shadow"/>
      <div className="kit-drag-hint">
        <svg viewBox="0 0 22 12" width="18" height="10" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M2 6h18M2 6l4-4M2 6l4 4M20 6l-4-4M20 6l-4 4"/>
        </svg>
        Arrastra para girar
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════
   WIDGET DEL SIDEBAR
════════════════════════════════════════════════════ */
export default function KitViewer() {
  return (
    <div className="kit-sidebar-widget">
      <div className="kit-sidebar-sep"/>
      <div className="kit-sidebar-header">
        <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13" style={{ opacity:0.6 }}>
          <path d="M12 3c-1.1 0-2 .9-2 2H6L3 8l3 2 1-1v9h10V9l1 1 3-2-3-3h-4c0-1.1-.9-2-2-2z"/>
        </svg>
        <span>1ª Equipación</span>
      </div>
      <RotatingPlayer/>
      <div className="kit-sidebar-footer">
        <span className="kit-swatch" style={{ background:'#f5c518' }}                                   title="Amarillo"/>
        <span className="kit-swatch" style={{ background:'#29aadf' }}                                   title="Azul"/>
        <span className="kit-swatch" style={{ background:'#0f2640' }}                                   title="Marino"/>
        <span className="kit-swatch" style={{ background:'#f0f0f0', border:'1px solid rgba(255,255,255,0.2)' }} title="Blanco"/>
        <span className="kit-sidebar-sponsor">Transportarium</span>
      </div>
    </div>
  )
}
