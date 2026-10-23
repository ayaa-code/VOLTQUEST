import { useId } from 'react'

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
  return (
    <svg className="login-circuit-svg" viewBox="0 0 600 340" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}metal`} x2="0.8" y2="1">
          <stop stopColor="#b0d4df" />
          <stop offset=".45" stopColor="#eef7f7" />
          <stop offset="1" stopColor="#527789" />
        </linearGradient>
        <linearGradient id={`${id}battery`}>
          <stop stopColor="#07846e" />
          <stop offset=".45" stopColor="#27d4b4" />
          <stop offset="1" stopColor="#08745f" />
        </linearGradient>
        <radialGradient id={`${id}glow`}>
          <stop stopColor="#ffd97c" stopOpacity=".55" />
          <stop offset="1" stopColor="#ffcf60" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g transform="translate(0 8)">
        <path
          d="M70 110 385 48 542 215 223 300Z"
          fill={pastel ? '#d1c2e7' : '#071d30'}
          stroke={pastel ? '#9c83c1' : '#31556a'}
        />
        <path
          d="M70 110V122L223 312 542 227V215L223 300Z"
          fill={pastel ? '#9f87bd' : '#071827'}
        />
        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path
            d="M150 144 120 108 220 88M278 77 321 68M366 86 482 206 203 268 174 213"
            stroke="#061b2a"
            strokeWidth="12"
          />
          <path
            d="M150 137 120 101 220 81M278 70 321 61M366 79 482 199 203 261 174 206"
            stroke={pastel ? '#7956ac' : '#5796a8'}
            strokeWidth="7"
          />
          {on && (
            <path
              className="fallback-current"
              d="M150 137 120 101 220 81 278 70 321 61 366 79 482 199 203 261 174 206"
              stroke={pastel ? '#007b81' : '#81f3ff'}
              strokeWidth="4"
              strokeDasharray="2 22"
            />
          )}
        </g>
        <g transform="translate(148 132) rotate(-24)">
          <rect
            x="-11"
            y="0"
            width="42"
            height="86"
            rx="10"
            fill={`url(#${id}battery)`}
          />
          <ellipse cx="10" cy="4" rx="21" ry="8" fill="#ace9db" />
          <rect
            x="2"
            y="-9"
            width="16"
            height="12"
            rx="3"
            fill={`url(#${id}metal)`}
          />
          <text
            x="10"
            y="29"
            textAnchor="middle"
            fill="#06382f"
            fontSize="20"
            fontWeight="bold"
          >
            +
          </text>
          <text x="10" y="70" textAnchor="middle" fill="#d3fff3" fontSize="18">
            −
          </text>
        </g>
        <path d="M212 88 279 74 290 86 221 102Z" fill="#93a6ac" />
        <circle cx="220" cy="79" r="6" fill="#e3b86e" />
        <circle cx="278" cy="68" r="6" fill="#e3b86e" />
        <path
          className="fallback-switch"
          d={on ? 'M220 77 278 66' : 'M220 77 263 40'}
          fill="none"
          stroke="#e5b86e"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <rect
          x="202"
          y="30"
          width="90"
          height="74"
          fill="transparent"
          onClick={toggle}
          style={{ cursor: 'pointer' }}
        />
        <g transform="translate(328 51) rotate(44)">
          <rect width="48" height="23" rx="8" fill="#e0ba83" />
          <path d="M10 0V23M20 0V23M35 0V23" stroke="#805044" strokeWidth="5" />
        </g>
        <ellipse cx="458" cy="186" rx="37" ry="18" fill="#7e98a4" />
        <rect
          x="440"
          y="161"
          width="36"
          height="25"
          rx="5"
          fill={`url(#${id}metal)`}
        />
        <path d="M440 167H476M440 174H476" stroke="#456577" strokeWidth="3" />
        <circle
          className="fallback-glow"
          cx="457"
          cy="134"
          r="88"
          fill={`url(#${id}glow)`}
          opacity={on ? 1 : 0}
        />
        <path
          d="M441 161C441 148 429 149 429 129A28 28 0 0 1 485 129C485 148 473 149 473 161Z"
          fill={on ? '#ffe9a6' : '#33556a'}
          stroke={on ? '#fff2c7' : '#99bac6'}
          strokeWidth="2"
        />
        <path
          d="M450 159 447 137 457 143 467 137 464 159"
          fill="none"
          stroke={on ? '#ed9a29' : '#9ab3bf'}
          strokeWidth="2"
        />
      </g>
    </svg>
  )
}
