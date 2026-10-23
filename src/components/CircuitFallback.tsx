import { useId } from 'react'

// Match the WebGL camera direction without importing Three.js in SVG mode.
const normalize = (v: number[]) => {
  const length = Math.hypot(...v)
  return v.map((n) => n / length)
}
const forward = normalize([3.3, 5.9, 7.5])
const right = normalize([forward[2], 0, -forward[0]])
const up = [
  forward[1] * right[2],
  forward[2] * right[0] - forward[0] * right[2],
  -forward[1] * right[0],
]
const project = (x: number, y: number, z: number) => ({
  x: 300 + (x * right[0] + z * right[2]) * 78,
  y: 182 - (x * up[0] + (y - 0.1) * up[1] + z * up[2]) * 78,
})
const point = (x: number, y: number, z: number) => {
  const p = project(x, y, z)
  return `${p.x},${p.y}`
}
const wire = (points: [number, number][]) =>
  points.map(([x, z], i) => `${i ? 'L' : 'M'}${point(x, 0.22, z)}`).join(' ')
const runs = [
  wire([
    [-2.05, -0.5],
    [-2.05, -1.2],
    [-1.25, -1.2],
  ]),
  wire([
    [-0.5, -1.2],
    [0.35, -1.2],
  ]),
  wire([
    [1.05, -1.2],
    [2.05, -1.2],
    [2.05, -0.27],
  ]),
  wire([
    [2.05, 0.27],
    [2.05, 1.2],
    [-2.05, 1.2],
    [-2.05, 0.5],
  ]),
]
const current = wire([
  [-2.05, -0.5],
  [-2.05, -1.2],
  [2.05, -1.2],
  [2.05, 1.2],
  [-2.05, 1.2],
  [-2.05, 0.5],
])
const board = (y: number) =>
  [
    [-2.85, -1.75],
    [2.85, -1.75],
    [2.85, 1.75],
    [-2.85, 1.75],
  ]
    .map(([x, z]) => point(x, y, z))
    .join(' ')

export function CircuitFallback({
  on,
  toggle,
  variant = 'login',
}: {
  on: boolean
  toggle: () => void
  variant?: 'login' | 'dashboard'
}) {
  const id = useId().replaceAll(':', '')
  const pastel = variant === 'dashboard'
  const top = project(-2.05, 0.39, -0.47),
    bottom = project(-2.05, 0.39, 0.47)
  const length = Math.hypot(top.x - bottom.x, top.y - bottom.y)
  const angle =
    (Math.atan2(top.y - bottom.y, top.x - bottom.x) * 180) / Math.PI + 90
  const start = project(0.35, 0.24, -1.2),
    end = project(1.05, 0.24, -1.2)
  const rLength = Math.hypot(end.x - start.x, end.y - start.y)
  const rAngle = (Math.atan2(end.y - start.y, end.x - start.x) * 180) / Math.PI
  const hinge = project(-1.25, 0.32, -1.2),
    contact = project(-0.5, 0.32, -1.2)
  const tip = on
    ? contact
    : project(-1.25 + 0.76 * Math.cos(0.65), 0.32 + 0.76 * Math.sin(0.65), -1.2)
  const handleAngle =
    (Math.atan2(tip.y - hinge.y, tip.x - hinge.x) * 180) / Math.PI
  const base = project(2.05, 0.18, 0),
    bulb = project(2.05, 0.82, 0)
  const metal = `url(#${id}-metal)`
  return (
    <svg className="login-circuit-svg" viewBox="0 0 600 340" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-metal`} x2=".25" y2="1">
          <stop stopColor="#e3eef0" />
          <stop offset=".48" stopColor="#a4b9be" />
          <stop offset="1" stopColor="#607e8c" />
        </linearGradient>
        <linearGradient id={`${id}-battery`}>
          <stop stopColor="#087c68" />
          <stop offset=".4" stopColor="#37d8b5" />
          <stop offset=".7" stopColor="#16b89c" />
          <stop offset="1" stopColor="#087a66" />
        </linearGradient>
        <linearGradient id={`${id}-resistor`} x2="0" y2="1">
          <stop stopColor="#fff1ce" />
          <stop offset=".5" stopColor="#e6c692" />
          <stop offset="1" stopColor="#b78e5e" />
        </linearGradient>
        <radialGradient id={`${id}-glass`} cx=".35" cy=".25">
          <stop stopColor={on ? '#fffbd1' : '#b8d0d6'} />
          <stop offset=".7" stopColor={on ? '#ffe58f' : '#7496a4'} />
          <stop offset="1" stopColor={on ? '#f5c766' : '#476b7b'} />
        </radialGradient>
        <radialGradient id={`${id}-glow`}>
          <stop stopColor="#ffce65" stopOpacity=".4" />
          <stop offset="1" stopColor="#ffce65" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse
        cx="300"
        cy="277"
        rx="230"
        ry="36"
        fill={pastel ? '#75579d' : '#021b2b'}
        opacity=".1"
      />
      <polygon points={board(-0.16)} fill={pastel ? '#ad97ca' : '#0a2132'} />
      <polygon
        points={board(-0.04)}
        fill={pastel ? '#d4c5ec' : '#1b4056'}
        stroke={pastel ? '#b59dce' : '#2b566a'}
        strokeWidth="1.5"
      />
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        {runs.map((d, i) => (
          <g key={i}>
            <path
              d={d}
              stroke={pastel ? '#7b609d' : '#092637'}
              strokeWidth="9"
              transform="translate(0 3)"
            />
            <path
              d={d}
              stroke={pastel ? '#8562b6' : '#4f96a9'}
              strokeWidth="6"
            />
            <path
              d={d}
              stroke={pastel ? '#c1a8df' : '#90c6ce'}
              strokeWidth="1.5"
              transform="translate(0 -1)"
            />
          </g>
        ))}
        {on && (
          <path
            className="fallback-current"
            d={current}
            stroke={pastel ? '#007f83' : '#90f3ff'}
            strokeWidth="3.5"
            strokeDasharray="1 19"
          />
        )}
      </g>
      <g transform={`translate(${bottom.x} ${bottom.y}) rotate(${angle})`}>
        <rect
          x="-16"
          y={-length}
          width="32"
          height={length}
          fill={`url(#${id}-battery)`}
        />
        <ellipse rx="16" ry="7" fill="#547d85" />
        <ellipse cy={-length} rx="16" ry="7" fill="#acebdc" />
        <rect
          x="-6"
          y={-length - 8}
          width="12"
          height="8"
          rx="2"
          fill={metal}
        />
        <ellipse cy={-length - 8} rx="6" ry="2.5" fill="#e5eeee" />
        <path
          d={`M-5 ${-length + 14}H5M0 ${-length + 9}V${-length + 19}`}
          stroke="#075746"
          strokeWidth="2.5"
        />
        <path d="M-5 -11H5" stroke="#d8fff4" strokeWidth="2.5" />
      </g>
      <polygon
        points={[
          [-1.4, -1.48],
          [-0.35, -1.48],
          [-0.35, -0.92],
          [-1.4, -0.92],
        ]
          .map(([x, z]) => point(x, 0.13, z))
          .join(' ')}
        fill={pastel ? '#a38abb' : '#5d7986'}
        stroke={pastel ? '#c7b4dd' : '#8ca9b4'}
        strokeWidth="2"
      />
      <g fill="#d8ad63" stroke="#f6da97" strokeWidth="1.5">
        <circle cx={hinge.x} cy={hinge.y} r="5" />
        <circle cx={contact.x} cy={contact.y} r="5" />
      </g>
      <path
        className="fallback-switch"
        d={`M${hinge.x} ${hinge.y}L${tip.x} ${tip.y}`}
        fill="none"
        stroke="#dfb66c"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <rect
        x="-9"
        y="-5"
        width="18"
        height="10"
        rx="2"
        transform={`translate(${hinge.x + (tip.x - hinge.x) * 0.65} ${hinge.y + (tip.y - hinge.y) * 0.65 - 2}) rotate(${handleAngle})`}
        fill="#29c5a5"
        stroke="#88e5cf"
      />
      <g transform={`translate(${start.x} ${start.y}) rotate(${rAngle})`}>
        <rect
          y="-9"
          width={rLength}
          height="18"
          rx="7"
          fill={`url(#${id}-resistor)`}
        />
        {[0.2, 0.4, 0.72].map((fraction, i) => (
          <path
            key={i}
            d={`M${rLength * fraction} -8V8`}
            stroke={i === 2 ? '#a6813d' : '#73504f'}
            strokeWidth="4"
          />
        ))}
      </g>
      <ellipse
        cx={base.x}
        cy={base.y + 4}
        rx="28"
        ry="13"
        fill={pastel ? '#9d8ab7' : '#0d2c3e'}
        opacity=".25"
      />
      <ellipse cx={base.x} cy={base.y} rx="27" ry="12" fill={metal} />
      <path
        d={`M${base.x - 13} ${base.y - 24}h26v22q-13 7-26 0Z`}
        fill={metal}
      />
      {[4, 10, 16].map((n) => (
        <path
          key={n}
          d={`M${base.x - 13} ${base.y - n}q13 6 26 0`}
          fill="none"
          stroke="#52697b"
          strokeWidth="2"
        />
      ))}
      <circle
        className="fallback-glow"
        cx={bulb.x}
        cy={bulb.y}
        r="65"
        fill={`url(#${id}-glow)`}
        opacity={on ? 1 : 0}
      />
      <path
        d={`M${bulb.x - 13} ${base.y - 23}L${bulb.x - 14} ${bulb.y + 20}A25 25 0 1 1 ${bulb.x + 14} ${bulb.y + 20}L${bulb.x + 13} ${base.y - 23}Z`}
        fill={`url(#${id}-glass)`}
        stroke={on ? '#fff0b8' : '#99bac4'}
        strokeWidth="1.5"
      />
      <ellipse
        cx={bulb.x - 8}
        cy={bulb.y - 10}
        rx="5"
        ry="8"
        fill="#fff"
        opacity={on ? 0.6 : 0.2}
        transform={`rotate(25 ${bulb.x - 8} ${bulb.y - 10})`}
      />
      <rect
        x={hinge.x - 12}
        y={Math.min(hinge.y, tip.y) - 14}
        width={Math.max(60, contact.x - hinge.x + 26)}
        height="58"
        fill="transparent"
        onClick={toggle}
        style={{ cursor: 'pointer' }}
      />
    </svg>
  )
}
