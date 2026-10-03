import { useId, type ReactNode } from 'react'
import type { AvatarConfig } from '../data/items'
import type { Anim, Pose } from '../data/activities'

export const INK = '#2B2118'
const SW = 4

type Pt = [number, number]
type Face = 'open' | 'closed' | 'happy' | 'sleepy' | 'wow'

const toPath = (pts: Pt[]) => pts.map((p, i) => `${i ? 'L' : 'M'}${p[0]} ${p[1]}`).join(' ')
const lerp = (a: Pt, b: Pt, t: number): Pt => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]

function Thick({ pts, color, w }: { pts: Pt[]; color: string; w: number }) {
  const d = toPath(pts)
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} stroke={INK} strokeWidth={w + SW * 2} />
      <path d={d} stroke={color} strokeWidth={w} />
    </g>
  )
}

/* ------------------------------ data ------------------------------ */

const ARMS: Record<Pose, [Pt[], Pt[]]> = {
  idle: [[[78, 132], [66, 154], [62, 176]], [[122, 132], [134, 154], [138, 176]]],
  cheer: [[[78, 132], [56, 112], [42, 84]], [[122, 132], [144, 112], [158, 84]]],
  reach: [[[78, 132], [54, 134], [30, 128]], [[122, 132], [146, 134], [170, 128]]],
  yoga: [[[78, 132], [46, 96], [96, 14]], [[122, 132], [154, 96], [104, 14]]],
  tree: [[[78, 132], [46, 96], [96, 14]], [[122, 132], [154, 96], [104, 14]]],
  wave: [[[78, 132], [66, 154], [62, 176]], [[122, 132], [144, 112], [158, 84]]],
  sit: [[[78, 132], [66, 158], [92, 170]], [[122, 132], [134, 158], [108, 170]]],
  sleep: [[[78, 134], [70, 158], [90, 166]], [[122, 134], [130, 158], [110, 166]]],
}

interface LegPose {
  l: Pt[]
  r: Pt[]
  lRot: number
  rRot: number
}
const LEGS: Record<'stand' | 'tree' | 'sit', LegPose> = {
  stand: { l: [[88, 170], [88, 224]], r: [[112, 170], [112, 224]], lRot: 0, rRot: 0 },
  tree: { l: [[94, 170], [96, 224]], r: [[108, 172], [140, 196], [108, 208]], lRot: 0, rRot: -75 },
  sit: { l: [[90, 172], [56, 196], [112, 210]], r: [[110, 172], [144, 196], [88, 210]], lRot: -80, rRot: 80 },
}

const TOPS: Record<string, { color: string; sleeve: 'none' | 'short' | 'long' }> = {
  tee: { color: '#FFFFFF', sleeve: 'short' },
  tank: { color: '#7ED957', sleeve: 'none' },
  hoodie: { color: '#9FD3FF', sleeve: 'long' },
  sweater: { color: '#B5502E', sleeve: 'long' },
  pj: { color: '#C9B8FF', sleeve: 'long' },
  jersey: { color: '#FF4B4B', sleeve: 'short' },
  startop: { color: '#FFC800', sleeve: 'short' },
  rainbow: { color: '#FF8FB1', sleeve: 'long' },
}

const BOTTOMS: Record<string, { color: string; long: boolean; skirt: boolean }> = {
  shorts: { color: '#5B8DEF', long: false, skirt: false },
  skirt: { color: '#4B4F5C', long: false, skirt: true },
  joggers: { color: '#3D3D4E', long: true, skirt: false },
  plaid: { color: '#E9D8A6', long: false, skirt: true },
  pjpants: { color: '#C9B8FF', long: true, skirt: false },
  leggings: { color: '#2E2E40', long: true, skirt: false },
  cargo: { color: '#A99A6B', long: true, skirt: false },
  cords: { color: '#8B5A3C', long: true, skirt: false },
}

/* --------------------------- backgrounds --------------------------- */

function starPoints(cx: number, cy: number, spikes: number, outer: number, inner: number, rot = 0) {
  const pts: string[] = []
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 ? inner : outer
    const a = (Math.PI * i) / spikes + rot
    pts.push(`${(cx + Math.cos(a) * r).toFixed(1)},${(cy + Math.sin(a) * r).toFixed(1)}`)
  }
  return pts.join(' ')
}

function Background({ id, uid }: { id: string; uid: string }) {
  switch (id) {
    case 'mint':
      return (
        <g>
          <rect width="200" height="250" fill="#D7FFB8" />
          {Array.from({ length: 30 }, (_, i) => (
            <circle key={i} cx={(i % 6) * 38 + ((Math.floor(i / 6) % 2) * 19) + 6} cy={Math.floor(i / 6) * 52 + 14} r="4" fill="#A5ED6E" />
          ))}
        </g>
      )
    case 'night':
      return (
        <g>
          <rect width="200" height="250" fill="#26245C" />
          <circle cx="160" cy="44" r="20" fill="#FFF3B0" stroke={INK} strokeWidth={SW} />
          <circle cx="152" cy="38" r="4" fill="#F0E08A" />
          <circle cx="166" cy="52" r="3" fill="#F0E08A" />
          {[[24, 30], [60, 60], [36, 120], [176, 120], [120, 22], [16, 200], [184, 190]].map(([x, y], i) => (
            <polygon key={i} points={starPoints(x, y, 4, 6, 2)} fill="#FFF3B0" />
          ))}
          <path d="M0 220 Q100 196 200 220 L200 250 L0 250 Z" fill="#3A3780" />
        </g>
      )
    case 'burst':
      return (
        <g>
          <rect width="200" height="250" fill="#8BA65A" />
          <polygon points={starPoints(100, 125, 11, 110, 62, -Math.PI / 2)} fill="#E59BC8" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
        </g>
      )
    case 'meadow':
      return (
        <g>
          <rect width="200" height="250" fill="#BDE8FF" />
          <circle cx="40" cy="40" r="18" fill="#FFD84D" stroke={INK} strokeWidth={SW} />
          <path d="M0 180 Q60 150 120 172 Q170 160 200 170 L200 250 L0 250 Z" fill="#8EDB5A" stroke={INK} strokeWidth={SW} />
          {[[20, 210], [170, 200], [150, 236], [40, 238]].map(([x, y], i) => (
            <g key={i}>
              {[0, 72, 144, 216, 288].map((a) => (
                <circle key={a} cx={x + Math.cos((a * Math.PI) / 180) * 5} cy={y + Math.sin((a * Math.PI) / 180) * 5} r="4" fill="#fff" />
              ))}
              <circle cx={x} cy={y} r="3" fill="#FFC800" />
            </g>
          ))}
        </g>
      )
    case 'sunset':
      return (
        <g>
          <defs>
            <linearGradient id={`${uid}sun`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#FFB3C7" />
              <stop offset="1" stopColor="#FFD59E" />
            </linearGradient>
          </defs>
          <rect width="200" height="250" fill={`url(#${uid}sun)`} />
          <circle cx="100" cy="190" r="56" fill="#FF8A5B" stroke={INK} strokeWidth={SW} />
          <path d="M0 200 L200 200 L200 250 L0 250 Z" fill="#7FB8E6" stroke={INK} strokeWidth={SW} />
          <path d="M30 216 L60 216 M120 230 L170 230 M70 240 L100 240" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
        </g>
      )
    case 'rainbowbg':
      return (
        <g>
          <rect width="200" height="250" fill="#FFF6E5" />
          {['#FF6B6B', '#FFA94D', '#FFD43B', '#69DB7C', '#4DABF7', '#9775FA'].map((c, i) => (
            <path key={c} d={`M${-10 + i * 12} 250 A${110 - i * 12} ${110 - i * 12} 0 0 1 ${210 - i * 12} 250`} fill="none" stroke={c} strokeWidth="12" />
          ))}
          <ellipse cx="30" cy="236" rx="30" ry="14" fill="#fff" stroke={INK} strokeWidth={SW} />
          <ellipse cx="172" cy="236" rx="30" ry="14" fill="#fff" stroke={INK} strokeWidth={SW} />
        </g>
      )
    case 'galaxy':
      return (
        <g>
          <rect width="200" height="250" fill="#1A1033" />
          <circle cx="40" cy="60" r="60" fill="#3B1E6E" opacity="0.6" />
          <circle cx="170" cy="200" r="70" fill="#5A1E6E" opacity="0.5" />
          <circle cx="160" cy="50" r="16" fill="#FF9AD5" stroke={INK} strokeWidth={SW} />
          <ellipse cx="160" cy="50" rx="28" ry="6" fill="none" stroke="#FFD43B" strokeWidth="4" />
          <circle cx="30" cy="190" r="10" fill="#7CE0FF" stroke={INK} strokeWidth={SW} />
          {Array.from({ length: 18 }, (_, i) => (
            <circle key={i} cx={(i * 53) % 200} cy={(i * 37) % 250} r={i % 3 ? 1.5 : 2.5} fill="#fff" />
          ))}
        </g>
      )
    case 'sky':
    default:
      return (
        <g>
          <rect width="200" height="250" fill="#DDF4FF" />
          {[[34, 40, 1], [160, 70, 0.8], [60, 200, 0.7]].map(([x, y, s], i) => (
            <g key={i} transform={`translate(${x} ${y}) scale(${s})`} fill="#fff">
              <circle cx="-14" cy="0" r="10" />
              <circle cx="0" cy="-6" r="13" />
              <circle cx="15" cy="0" r="10" />
              <rect x="-24" y="0" width="48" height="10" rx="5" />
            </g>
          ))}
        </g>
      )
  }
}

/* ------------------------------ hair ------------------------------ */

const BANGS = 'M56 88 C50 46 74 28 100 28 C126 28 150 46 144 88 C140 72 134 64 126 60 C120 68 108 70 100 60 C92 70 80 68 74 60 C66 64 60 72 56 88 Z'
const CURL_BACK: [number, number, number][] = [
  [58, 58, 19], [70, 36, 19], [92, 24, 19], [116, 24, 19], [136, 36, 19], [146, 58, 19], [150, 84, 18], [50, 84, 18], [148, 108, 16], [52, 108, 16],
]
const CURL_FRONT: [number, number, number][] = [
  [64, 58, 12], [74, 44, 13], [90, 36, 13], [108, 34, 13], [124, 40, 13], [136, 52, 12],
]

function Blob({ circles, color }: { circles: [number, number, number][]; color: string }) {
  return (
    <g>
      {circles.map(([x, y, r], i) => (
        <circle key={`o${i}`} cx={x} cy={y} r={r + SW} fill={INK} />
      ))}
      {circles.map(([x, y, r], i) => (
        <circle key={`f${i}`} cx={x} cy={y} r={r} fill={color} />
      ))}
    </g>
  )
}

function HairBack({ style, color }: { style: string; color: string }) {
  const p = { fill: color, stroke: INK, strokeWidth: SW, strokeLinejoin: 'round' as const }
  switch (style) {
    case 'long':
      return <path {...p} d="M58 70 C50 34 80 22 100 22 C120 22 150 34 142 70 L152 186 C140 194 126 192 120 186 L80 186 C74 192 60 194 48 186 Z" />
    case 'bob':
      return <path {...p} d="M56 70 C50 34 80 22 100 22 C120 22 150 34 144 70 L150 122 C140 130 126 128 122 120 L78 120 C74 128 60 130 50 122 Z" />
    case 'buns':
      return (
        <g>
          <circle {...p} cx="62" cy="38" r="17" />
          <circle {...p} cx="138" cy="38" r="17" />
        </g>
      )
    case 'ponytail':
      return (
        <g>
          <path {...p} d="M128 40 C162 34 176 70 166 108 C162 126 152 142 140 148 C150 122 150 96 136 70 Z" />
          <circle cx="134" cy="44" r="7" fill="#FF4B91" stroke={INK} strokeWidth={SW} />
        </g>
      )
    case 'curly':
      return <Blob circles={CURL_BACK} color={color} />
    default:
      return null
  }
}

function HairFront({ style, color }: { style: string; color: string }) {
  const p = { fill: color, stroke: INK, strokeWidth: SW, strokeLinejoin: 'round' as const }
  switch (style) {
    case 'short':
      return (
        <g>
          <path {...p} d="M54 86 C48 42 74 26 102 26 C132 26 152 44 146 86 C140 70 130 58 114 54 C106 62 88 64 78 58 C68 64 58 72 54 86 Z" />
          <path d="M100 30 Q108 22 118 24" fill="none" stroke={INK} strokeWidth={SW} strokeLinecap="round" />
        </g>
      )
    case 'ponytail':
      return <path {...p} d="M56 86 C50 44 76 26 102 26 C130 26 152 44 144 86 C136 66 120 52 94 58 C82 62 68 70 56 86 Z" />
    case 'curly':
      return <Blob circles={CURL_FRONT} color={color} />
    case 'side':
      return (
        <g>
          <path {...p} d="M54 86 C48 42 76 26 104 26 C132 26 152 44 146 86 C143 68 134 56 120 50 C104 58 80 60 64 66 C59 72 56 78 54 86 Z" />
          <path d="M120 30 Q114 40 118 50" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
        </g>
      )
    case 'spiky':
      return <path {...p} d="M54 86 C50 62 54 48 60 42 L62 22 L76 34 L84 12 L96 30 L108 10 L116 30 L132 16 L134 38 C146 46 150 62 146 86 C140 70 130 60 114 58 C100 64 82 64 70 60 C62 66 56 74 54 86 Z" />
    case 'buzz':
      return <path {...p} d="M57 76 C55 44 78 32 100 32 C122 32 145 44 143 76 C135 60 118 52 100 52 C82 52 65 60 57 76 Z" />
    case 'quiff':
      return <path {...p} d="M54 86 C48 48 68 32 92 28 C98 12 124 4 144 16 C134 18 128 24 130 32 C146 42 152 62 146 86 C140 68 128 58 110 56 C96 62 78 62 66 60 C60 66 56 74 54 86 Z" />
    default:
      return <path {...p} d={BANGS} />
  }
}

/* --------------------------- accessories --------------------------- */

function Accessory({ id, hairColor }: { id: string; hairColor: string }) {
  const o = { stroke: INK, strokeWidth: SW, strokeLinejoin: 'round' as const }
  switch (id) {
    case 'cap':
      return (
        <g {...o}>
          <path d="M56 62 C54 22 146 22 144 62 Z" fill="#3D6BFF" />
          <path d="M50 62 Q100 50 150 62 Q152 72 100 70 Q48 72 50 62 Z" fill="#2B4FCC" />
          <circle cx="100" cy="26" r="4" fill="#2B4FCC" strokeWidth="2.5" />
          <path d="M88 46 L112 46" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
        </g>
      )
    case 'beard':
      return (
        <g {...o}>
          <path d="M57 88 C58 116 80 126 100 126 C120 126 142 116 143 88 C136 102 122 110 110 108 Q100 104 90 108 C78 110 64 102 57 88 Z" fill={hairColor} />
          <path d="M88 100 Q100 94 112 100 Q100 102 88 100 Z" fill={hairColor} strokeWidth="2.5" />
        </g>
      )
    case 'glasses':
      return (
        <g fill="rgba(255,255,255,0.25)" {...o}>
          <circle cx="83" cy="84" r="11" />
          <circle cx="117" cy="84" r="11" />
          <path d="M94 84 L106 84" fill="none" />
        </g>
      )
    case 'headphones':
      return (
        <g>
          <path d="M54 82 C48 14 152 14 146 82" fill="none" stroke={INK} strokeWidth="14" strokeLinecap="round" />
          <path d="M54 82 C48 14 152 14 146 82" fill="none" stroke="#FF8FB1" strokeWidth="7" strokeLinecap="round" />
          <rect x="40" y="68" width="18" height="30" rx="8" fill="#FF8FB1" {...o} />
          <rect x="142" y="68" width="18" height="30" rx="8" fill="#FF8FB1" {...o} />
        </g>
      )
    case 'flower':
      return (
        <g transform="translate(136 50)">
          {[0, 72, 144, 216, 288].map((a) => (
            <circle key={a} cx={Math.cos((a * Math.PI) / 180) * 8} cy={Math.sin((a * Math.PI) / 180) * 8} r="7" fill="#fff" {...o} />
          ))}
          <circle r="6" fill="#FFC800" {...o} />
        </g>
      )
    case 'catears':
      return (
        <g {...o}>
          <path d="M58 52 L62 14 L90 36 Z" fill="#2B2B3A" />
          <path d="M142 52 L138 14 L110 36 Z" fill="#2B2B3A" />
          <path d="M65 42 L67 25 L80 36 Z" fill="#FF9FB8" strokeWidth="2" />
          <path d="M135 42 L133 25 L120 36 Z" fill="#FF9FB8" strokeWidth="2" />
        </g>
      )
    case 'mask':
      return (
        <g {...o}>
          <rect x="62" y="40" width="76" height="22" rx="11" fill="#B9A6FF" />
          <path d="M76 52 Q82 57 88 52 M112 52 Q118 57 124 52" fill="none" strokeWidth="3" strokeLinecap="round" />
        </g>
      )
    case 'horns':
      return (
        <g fill="#D97ACF" {...o}>
          <path d="M70 42 C60 32 62 18 70 10 C72 22 80 28 88 34 Z" />
          <path d="M130 42 C140 32 138 18 130 10 C128 22 120 28 112 34 Z" />
        </g>
      )
    case 'crown':
      return (
        <g {...o}>
          <path d="M70 36 L72 8 L86 22 L100 4 L114 22 L128 8 L130 36 Z" fill="#FFC800" />
          <circle cx="100" cy="26" r="4" fill="#FF4B4B" strokeWidth="2" />
          <circle cx="82" cy="30" r="3" fill="#1CB0F6" strokeWidth="2" />
          <circle cx="118" cy="30" r="3" fill="#58CC02" strokeWidth="2" />
        </g>
      )
    case 'halo':
      return (
        <g className="av-halo">
          <ellipse cx="100" cy="14" rx="32" ry="8" fill="none" stroke={INK} strokeWidth="12" />
          <ellipse cx="100" cy="14" rx="32" ry="8" fill="none" stroke="#FFE066" strokeWidth="5" />
        </g>
      )
    default:
      return null
  }
}

/* ------------------------------ clothes ------------------------------ */

function Top({ id, uid, broad }: { id: string; uid: string; broad: boolean }) {
  const t = TOPS[id] ?? TOPS.tee
  const o = { stroke: INK, strokeWidth: SW, strokeLinejoin: 'round' as const }
  const base = broad ? 'M72 125 Q100 119 128 125 L132 172 Q100 177 68 172 Z' : 'M76 126 Q100 120 124 126 L131 172 Q100 177 69 172 Z'
  const wide = broad ? 'M70 125 Q100 117 130 125 L136 176 Q100 182 64 176 Z' : 'M73 126 Q100 118 127 126 L135 176 Q100 182 65 176 Z'
  switch (id) {
    case 'tank':
      return (
        <path
          d={broad ? 'M78 125 L89 124 Q100 136 111 124 L122 125 L132 172 Q100 177 68 172 Z' : 'M80 126 L90 125 Q100 136 110 125 L120 126 L131 172 Q100 177 69 172 Z'}
          fill={t.color}
          {...o}
        />
      )
    case 'hoodie':
      return (
        <g>
          <path d="M76 130 Q100 108 124 130" fill="none" stroke={INK} strokeWidth="16" strokeLinecap="round" />
          <path d="M76 130 Q100 108 124 130" fill="none" stroke="#7FBDF0" strokeWidth="8" strokeLinecap="round" />
          <path d={wide} fill={t.color} {...o} />
          <path d="M84 156 L116 156 L120 172 L80 172 Z" fill="#7FBDF0" {...o} strokeWidth="3" />
          <path d="M94 128 L93 146 M106 128 L107 146" stroke={INK} strokeWidth="3" strokeLinecap="round" />
        </g>
      )
    case 'sweater':
      return (
        <g>
          <path d={wide} fill={t.color} {...o} />
          <path d="M72 168 Q100 174 128 168" fill="none" stroke="#8C3A1F" strokeWidth="3" />
          <path d="M112 146 c0 -4 6 -4 6 0 c0 -4 6 -4 6 0 c0 4 -6 8 -6 8 c0 0 -6 -4 -6 -8 Z" fill="#E07A5F" stroke="#8C3A1F" strokeWidth="2" />
        </g>
      )
    case 'pj':
      return (
        <g>
          <path d={base} fill={t.color} {...o} />
          <path d="M100 128 L100 174" stroke={INK} strokeWidth="2.5" />
          {[140, 152, 164].map((y) => <circle key={y} cx="104" cy={y} r="2.5" fill="#fff" stroke={INK} strokeWidth="1.5" />)}
          {[[84, 140], [118, 158], [86, 162]].map(([x, y], i) => (
            <polygon key={i} points={starPoints(x, y, 5, 4.5, 2, -Math.PI / 2)} fill="#FFE066" />
          ))}
        </g>
      )
    case 'jersey':
      return (
        <g>
          <path d={base} fill={t.color} {...o} />
          <path d="M90 124 Q100 132 110 124" fill="none" stroke="#fff" strokeWidth="3" />
          <text x="100" y="164" textAnchor="middle" fontSize="28" fontWeight="900" fill="#fff" stroke={INK} strokeWidth="2" fontFamily="Bricolage Grotesque, sans-serif">1</text>
        </g>
      )
    case 'startop':
      return (
        <g>
          <path d={base} fill={t.color} {...o} />
          <polygon points={starPoints(100, 150, 5, 15, 7, -Math.PI / 2)} fill="#FF7EB6" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
        </g>
      )
    case 'rainbow':
      return (
        <g>
          <defs>
            <clipPath id={`${uid}rb`}>
              <path d={wide} />
            </clipPath>
          </defs>
          <g clipPath={`url(#${uid}rb)`}>
            {['#FF8FB1', '#FFB86B', '#FFE066', '#8CE99A', '#74C0FC', '#B197FC'].map((c, i) => (
              <rect key={c} x="60" y={118 + i * 11} width="80" height="11" fill={c} />
            ))}
          </g>
          <path d={wide} fill="none" {...o} />
        </g>
      )
    case 'tee':
    default:
      return (
        <g>
          <path d={base} fill={t.color} {...o} />
          <path d="M90 125 Q100 134 110 125" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
        </g>
      )
  }
}

function Bottom({ id, uid, sitting }: { id: string; uid: string; sitting: boolean }) {
  const b = BOTTOMS[id] ?? BOTTOMS.shorts
  const o = { stroke: INK, strokeWidth: SW, strokeLinejoin: 'round' as const }
  if (b.skirt) {
    const d = sitting ? 'M70 164 L130 164 L150 204 Q100 214 50 204 Z' : 'M70 164 L130 164 L144 202 Q100 208 56 202 Z'
    return (
      <g>
        {id === 'plaid' && (
          <defs>
            <pattern id={`${uid}pl`} width="14" height="14" patternUnits="userSpaceOnUse">
              <rect width="14" height="14" fill="#E9D8A6" />
              <rect width="14" height="4" fill="#8A9A5B" opacity="0.6" />
              <rect width="4" height="14" fill="#8A9A5B" opacity="0.6" />
            </pattern>
          </defs>
        )}
        <path d={d} fill={id === 'plaid' ? `url(#${uid}pl)` : b.color} {...o} />
        <path d="M86 168 L80 202 M100 168 L100 205 M114 168 L120 202" stroke={INK} strokeWidth="2" opacity="0.5" />
      </g>
    )
  }
  if (!b.long) {
    return sitting ? (
      <path d="M68 164 L132 164 L140 196 Q100 204 60 196 Z" fill={b.color} {...o} />
    ) : (
      <path d="M68 164 L132 164 L134 196 L103 196 L100 186 L97 196 L66 196 Z" fill={b.color} {...o} />
    )
  }
  return (
    <g>
      <path d="M68 164 L132 164 L129 188 Q100 192 71 188 Z" fill={b.color} />
      <path d="M71 188 L68 164 L132 164 L129 188" fill="none" {...o} />
      {!sitting && <path d="M100 176 L100 192" stroke={INK} strokeWidth="3" strokeLinecap="round" />}
      {id === 'cargo' && !sitting && (
        <g fill="#8E8055" stroke={INK} strokeWidth="2.5">
          <rect x="82" y="196" width="11" height="11" rx="2" />
          <rect x="107" y="196" width="11" height="11" rx="2" />
        </g>
      )}
      {id === 'cords' && !sitting && (
        <path d="M84 194 L84 218 M92 194 L92 218 M108 194 L108 218 M116 194 L116 218" stroke="#6E4329" strokeWidth="2" />
      )}
    </g>
  )
}

function Shoe({ id, at, rot, scale = 1 }: { id: string; at: Pt; rot: number; scale?: number }) {
  const o = { stroke: INK, strokeWidth: SW, strokeLinejoin: 'round' as const }
  let body: ReactNode
  switch (id) {
    case 'boots':
      body = (
        <g>
          <path d="M-13 -24 L13 -24 L14 0 Q22 4 20 12 L-20 12 Q-22 4 -14 0 Z" fill="#B5D96B" {...o} />
          <path d="M-21 10 L21 10 Q22 18 16 19 L-16 19 Q-22 18 -21 10 Z" fill={INK} {...o} />
        </g>
      )
      break
    case 'hightops':
      body = (
        <g>
          <path d="M-12 -18 L12 -18 L13 -4 Q20 2 18 10 L-18 10 Q-20 2 -13 -4 Z" fill="#FF4B4B" {...o} />
          <path d="M-18 8 L18 8 Q19 15 14 15 L-14 15 Q-19 15 -18 8 Z" fill="#fff" {...o} />
          <path d="M-6 -12 L6 -12 M-6 -6 L6 -6" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      )
      break
    case 'slippers':
      body = (
        <g>
          <ellipse cx="-6" cy="-10" rx="4" ry="10" fill="#FFD1E1" {...o} />
          <ellipse cx="6" cy="-10" rx="4" ry="10" fill="#FFD1E1" {...o} />
          <ellipse cx="0" cy="6" rx="19" ry="10" fill="#FFD1E1" {...o} />
          <circle cx="-5" cy="4" r="1.6" fill={INK} />
          <circle cx="5" cy="4" r="1.6" fill={INK} />
        </g>
      )
      break
    case 'loafers':
      body = (
        <g>
          <rect x="-8" y="-14" width="16" height="12" rx="3" fill="#fff" {...o} />
          <path d="M-13 -4 Q0 -8 13 -4 Q19 4 17 12 L-17 12 Q-19 4 -13 -4 Z" fill="#7A1F2B" {...o} />
          <circle cx="0" cy="2" r="3" fill="#FF4B4B" strokeWidth="2" stroke={INK} />
        </g>
      )
      break
    case 'rocket':
      body = (
        <g>
          <path className="av-flame" d="M-9 14 Q0 34 9 14 Z" fill="#FF9600" stroke={INK} strokeWidth="3" />
          <path d="M-13 -8 Q0 -12 13 -8 Q20 2 18 12 L-18 12 Q-20 2 -13 -8 Z" fill="#D9E1EA" {...o} />
          <path d="M-8 0 L8 0" stroke="#1CB0F6" strokeWidth="4" strokeLinecap="round" />
        </g>
      )
      break
    case 'sneakers':
    default:
      body = (
        <g>
          <path d="M-13 -6 Q0 -10 13 -6 Q19 2 17 10 L-17 10 Q-19 2 -13 -6 Z" fill="#fff" {...o} />
          <path d="M-18 8 L18 8 Q19 15 14 15 L-14 15 Q-19 15 -18 8 Z" fill="#58CC02" {...o} />
        </g>
      )
  }
  return <g transform={`translate(${at[0]} ${at[1]}) rotate(${rot}) scale(${scale})`}>{body}</g>
}

function Eyes({ face }: { face: Face }) {
  const line = { fill: 'none', stroke: INK, strokeWidth: 3.5, strokeLinecap: 'round' as const }
  switch (face) {
    case 'closed':
    case 'sleepy':
      return (
        <g>
          <path d="M76 84 Q83 90 90 84" {...line} />
          <path d="M110 84 Q117 90 124 84" {...line} />
        </g>
      )
    case 'happy':
      return (
        <g>
          <path d="M76 87 Q83 77 90 87" {...line} />
          <path d="M110 87 Q117 77 124 87" {...line} />
        </g>
      )
    case 'wow':
      return (
        <g>
          <circle cx="83" cy="83" r="6" fill={INK} />
          <circle cx="117" cy="83" r="6" fill={INK} />
          <circle cx="85" cy="80.5" r="2.2" fill="#fff" />
          <circle cx="119" cy="80.5" r="2.2" fill="#fff" />
        </g>
      )
    default:
      return (
        <g className="av-eyes">
          <ellipse cx="83" cy="84" rx="4.5" ry="6" fill={INK} />
          <ellipse cx="117" cy="84" rx="4.5" ry="6" fill={INK} />
          <circle cx="84.6" cy="81.5" r="1.7" fill="#fff" />
          <circle cx="118.6" cy="81.5" r="1.7" fill="#fff" />
        </g>
      )
  }
}

function Mouth({ face }: { face: Face }) {
  if (face === 'happy' || face === 'wow')
    return <path d="M92 98 Q100 110 108 98 Z" fill="#D9485F" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
  if (face === 'sleepy') return <ellipse cx="100" cy="101" rx="3" ry="3.5" fill="none" stroke={INK} strokeWidth="3" />
  return <path d="M94 99 Q100 105 106 99" fill="none" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
}

/* ------------------------------ avatar ------------------------------ */

export interface AvatarProps {
  config: AvatarConfig
  pose?: Pose
  face?: Face
  anim?: Anim
  showBg?: boolean
  className?: string
  title?: string
}

export function Avatar({ config, pose = 'idle', face, anim = 'bob', showBg = true, className, title }: AvatarProps) {
  const uid = useId().replace(/:/g, '')
  const top = TOPS[config.top] ?? TOPS.tee
  const bottom = BOTTOMS[config.bottom] ?? BOTTOMS.shorts
  const boy = config.body === 'boy'
  const sleeping = pose === 'sleep'
  const legPose = pose === 'tree' ? LEGS.tree : pose === 'sit' ? LEGS.sit : LEGS.stand
  const sitting = pose === 'sit'
  const legColor = bottom.long ? bottom.color : config.skin
  const f: Face = face ?? (pose === 'sit' ? 'closed' : sleeping ? 'sleepy' : pose === 'cheer' ? 'happy' : 'open')
  const [armL, armR] = ARMS[pose]

  const arm = (pts: Pt[]) => {
    const sleeve =
      top.sleeve === 'short' ? [pts[0], lerp(pts[0], pts[1], 0.55)] : top.sleeve === 'long' ? [pts[0], pts[1], lerp(pts[1], pts[2], 0.78)] : null
    const end = pts[pts.length - 1]
    return (
      <g>
        <Thick pts={pts} color={config.skin} w={12} />
        {sleeve && <Thick pts={sleeve} color={top.color} w={15} />}
        <circle cx={end[0]} cy={end[1]} r="7.5" fill={config.skin} stroke={INK} strokeWidth={SW} />
      </g>
    )
  }

  const legEnd = (pts: Pt[]) => pts[pts.length - 1]

  return (
    <svg viewBox="0 0 200 250" className={`avatar ${className ?? ''}`} role="img" aria-label={title ?? 'Your avatar'}>
      {showBg && <Background id={config.background} uid={uid} />}
      <ellipse cx="100" cy="240" rx="52" ry="6" fill="rgba(0,0,0,0.13)" />
      <g className={`av-body av-${anim}`}>
        <HairBack style={config.hair} color={config.hairColor} />

        {!sleeping && (
          <g>
            <Thick pts={legPose.l} color={legColor} w={13} />
            <Thick pts={legPose.r} color={legColor} w={13} />
            <Bottom id={config.bottom} uid={uid} sitting={sitting} />
            <Shoe id={config.shoes} at={legEnd(legPose.l)} rot={legPose.lRot} scale={sitting ? 0.8 : 1} />
            <Shoe id={config.shoes} at={legEnd(legPose.r)} rot={legPose.rRot} scale={pose === 'tree' || sitting ? 0.8 : 1} />
          </g>
        )}

        {!sleeping && !sitting && (
          <g>
            {arm(armL)}
            {arm(armR)}
          </g>
        )}
        <Top id={config.top} uid={uid} broad={boy} />
        {sitting && (
          <g>
            {arm(armL)}
            {arm(armR)}
          </g>
        )}

        <rect x={boy ? 89 : 91} y="108" width={boy ? 22 : 18} height="20" rx="6" fill={config.skin} stroke={INK} strokeWidth={SW} />
        {config.top === 'sweater' && <rect x="88" y="116" width="24" height="14" rx="5" fill={top.color} stroke={INK} strokeWidth={SW} />}
        <ellipse cx="100" cy="76" rx="44" ry="41" fill={config.skin} stroke={INK} strokeWidth={SW} />
        <ellipse cx="72" cy="96" rx={boy ? 6 : 7.5} ry={boy ? 3.5 : 4.5} fill="#FF9FB0" opacity={boy ? 0.5 : 0.75} />
        <ellipse cx="128" cy="96" rx={boy ? 6 : 7.5} ry={boy ? 3.5 : 4.5} fill="#FF9FB0" opacity={boy ? 0.5 : 0.75} />
        <Eyes face={f} />
        {boy && <path d="M75 71 L90 69 M110 69 L125 71" stroke={INK} strokeWidth="4" strokeLinecap="round" />}
        <Mouth face={f} />
        <HairFront style={config.accessory === 'cap' && ['spiky', 'quiff', 'curly'].includes(config.hair) ? 'short' : config.hair} color={config.hairColor} />
        <Accessory id={config.accessory} hairColor={config.hairColor} />

        {sleeping && (
          <g>
            <path d="M34 150 Q100 136 166 150 L172 246 L28 246 Z" fill="#FFE8A3" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
            <path d="M34 150 Q100 136 166 150 L167 164 Q100 150 33 164 Z" fill="#fff" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
            {[[60, 196], [100, 214], [140, 190], [80, 232], [130, 232]].map(([x, y], i) => (
              <polygon key={i} points={starPoints(x, y, 5, 7, 3, -Math.PI / 2)} fill="#FFC14D" />
            ))}
            {arm(armL)}
            {arm(armR)}
          </g>
        )}
      </g>
      {sleeping && (
        <g className="av-zzz" fill={INK} fontFamily="Bricolage Grotesque, sans-serif" fontWeight="900">
          <text x="150" y="40" fontSize="18">z</text>
          <text x="164" y="24" fontSize="13">z</text>
        </g>
      )}
    </svg>
  )
}
