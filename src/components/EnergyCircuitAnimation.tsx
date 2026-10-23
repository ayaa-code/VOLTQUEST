import { useEffect, useId, useRef, useState } from 'react'
import { Pause, Play } from 'lucide-react'
import './EnergyCircuitAnimation.css'

// Original decorative composition; no measured current or particle simulation.
const CYCLE = 10
const WIRE =
  'M178 64H104Q84 64 84 84V198Q84 218 104 218H296Q316 218 316 198V84Q316 64 296 64H222'
const ease = (a: number, b: number, t: number) => {
  const x = Math.max(0, Math.min(1, (t - a) / (b - a)))
  return x * x * (3 - 2 * x)
}

export function EnergyCircuitAnimation() {
  const glowId = useId()
  const svgRef = useRef<SVGSVGElement>(null)
  const switchRef = useRef<SVGLineElement>(null)
  const lightRef = useRef<SVGGElement>(null)
  const pulseRef = useRef<SVGPathElement>(null)
  const sceneRef = useRef<SVGGElement>(null)
  const wireRef = useRef<SVGPathElement>(null)
  const batteryRef = useRef<SVGGElement>(null)
  const bulbRef = useRef<SVGGElement>(null)
  const haloRef = useRef<SVGCircleElement>(null)
  const elapsed = useRef(0)
  const [paused, setPaused] = useState(false)
  const [reduced, setReduced] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(preference.matches)
    update()
    preference.addEventListener('change', update)
    return () => preference.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    const svg = svgRef.current!
    const contact = switchRef.current!
    const light = lightRef.current!
    const pulse = pulseRef.current!
    const scene = sceneRef.current!
    const wire = wireRef.current!
    const battery = batteryRef.current!
    const bulb = bulbRef.current!
    const halo = haloRef.current!
    let frameId: number | null = null
    let previous: number | null = null
    let inView = false
    let disposed = false

    function draw(t: number) {
      // Assemble, float gently, then reset. The wire never morphs into a wave.
      const arrival = ease(0, 1.2, t)
      const departure = 1 - ease(9, 10, t)
      const float = ease(0, 4.5, t) * (1 - ease(4.5, 9, t))
      scene.setAttribute('opacity', String(arrival * departure))
      scene.setAttribute('transform', `translate(0 ${-7 * float})`)
      wire.setAttribute('stroke-dashoffset', String(1 - ease(0.2, 1.7, t)))
      battery.setAttribute('transform', `translate(${-18 * (1 - arrival)} 0)`)
      bulb.setAttribute(
        'transform',
        `translate(0 ${14 * (1 - ease(0.3, 1.5, t))})`,
      )
      // A slow breathing glow remains decorative; only a closed contact lights it.
      const breath = ease(3.4, 4.8, t) * (1 - ease(4.8, 6.6, t))
      halo.setAttribute('r', String(52 + 14 * breath))
      const closed = ease(1.8, 2.6, t) * (1 - ease(7.4, 8.2, t))
      const lit = ease(2.7, 3.4, t) * (1 - ease(6.6, 7.3, t))
      contact.setAttribute('transform', `rotate(${-35 * (1 - closed)} 178 64)`)
      light.setAttribute('opacity', String(lit))
      pulse.setAttribute('opacity', String(lit * 0.9))
      pulse.setAttribute('stroke-dashoffset', String(-(t - 2.7) * 65))
      const phase = reduced
        ? 'static'
        : t < 1.8 || t >= 8.2
          ? 'open'
          : t < 2.6
            ? 'closing'
            : t < 7.4
              ? 'closed'
              : 'opening'
      if (svg.dataset.phase !== phase) svg.dataset.phase = phase
    }

    function stop() {
      if (frameId !== null) cancelAnimationFrame(frameId)
      frameId = null
      previous = null
    }
    function frame(now: number) {
      if (disposed) return
      if (previous !== null)
        elapsed.current =
          (elapsed.current + Math.min(now - previous, 100) / 1000) % CYCLE
      previous = now
      draw(elapsed.current)
      frameId = requestAnimationFrame(frame)
    }
    function reconcile() {
      if (disposed) return
      if (paused || reduced || document.hidden || !inView) stop()
      else if (frameId === null) frameId = requestAnimationFrame(frame)
    }
    draw(reduced ? 4 : elapsed.current)
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting
      reconcile()
    })
    observer.observe(svg)
    document.addEventListener('visibilitychange', reconcile)
    return () => {
      disposed = true
      stop()
      observer.disconnect()
      document.removeEventListener('visibilitychange', reconcile)
    }
  }, [paused, reduced])

  return (
    <div className="energy-animation">
      <svg
        ref={svgRef}
        className="energy-art"
        viewBox="0 0 400 270"
        fill="none"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <radialGradient id={glowId}>
            <stop stopColor="var(--energy-yellow)" stopOpacity=".8" />
            <stop offset="1" stopColor="var(--energy-yellow)" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse
          cx="200"
          cy="140"
          rx="161"
          ry="111"
          fill="var(--energy-lilac)"
          opacity=".48"
        />
        <g ref={sceneRef} className="energy-scene" opacity="0">
          <path
            ref={wireRef}
            d={WIRE}
            pathLength="1"
            strokeDasharray="1"
            stroke="var(--purple)"
            strokeWidth="2.8"
            strokeLinecap="round"
          />
          <g className="energy-components">
            <path
              ref={pulseRef}
              d={`${WIRE}H178`}
              stroke="var(--energy-mint)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="12 46"
              opacity="0"
            />
            {/* Battery covers the wire and connects at its two terminals. */}
            <g ref={batteryRef}>
              <rect
                x="73"
                y="99"
                width="22"
                height="12"
                rx="4"
                fill="var(--purple)"
              />
              <rect
                x="58"
                y="108"
                width="52"
                height="72"
                rx="13"
                fill="var(--energy-lilac)"
                stroke="var(--purple)"
                strokeWidth="2.5"
              />
              <path d="M59 128H109" stroke="var(--purple)" strokeWidth="2" />
              <path
                d="M84 113V123M79 118H89M79 169H89"
                stroke="var(--purple)"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M86 137L76 151H85L81 162L94 146H85Z"
                fill="var(--purple)"
              />
            </g>
            {/* A visibly hinged switch spans the only gap in the wire. */}
            <rect
              x="166"
              y="49"
              width="68"
              height="30"
              rx="12"
              fill="var(--energy-paper)"
            />
            <line
              ref={switchRef}
              x1="178"
              y1="64"
              x2="222"
              y2="64"
              stroke="var(--purple)"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <circle cx="178" cy="64" r="4" fill="var(--purple)" />
            <circle
              cx="222"
              cy="64"
              r="4"
              fill="var(--energy-coral)"
              stroke="var(--purple)"
              strokeWidth="1.5"
            />
            {/* The base bulb is unlit; the separate light layer appears after closure. */}
            <g ref={bulbRef}>
              <path
                d="M289 124C289 89 343 89 343 124C343 142 329 146 328 161H304C303 146 289 142 289 124Z"
                fill="var(--energy-paper)"
                stroke="var(--purple)"
                strokeWidth="2.5"
              />
              <g ref={lightRef} className="energy-light" opacity="0">
                <circle
                  ref={haloRef}
                  cx="316"
                  cy="127"
                  r="58"
                  fill={`url(#${glowId})`}
                />
                <path
                  d="M292 124C292 93 340 93 340 124C340 141 327 146 326 158H306C305 146 292 141 292 124Z"
                  fill="var(--energy-yellow)"
                />
                <path
                  d="M316 85V79M354 100L359 95M278 100L273 95M358 128H364"
                  stroke="var(--energy-gold)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </g>
              <path
                d="M307 127L316 139L325 127M316 139V160"
                stroke="var(--energy-gold)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M304 163H328M306 169H326M311 175H321"
                stroke="var(--purple)"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </g>
          </g>
        </g>
      </svg>
      <div className="energy-controls">
        {reduced ? (
          <span className="energy-static-note">
            Ilustrasi statis · gerak dikurangi
          </span>
        ) : (
          <button
            type="button"
            className="energy-toggle"
            onClick={() => setPaused((value) => !value)}
          >
            {paused ? (
              <Play size={14} aria-hidden="true" />
            ) : (
              <Pause size={14} aria-hidden="true" />
            )}
            {paused ? 'Putar animasi' : 'Jeda animasi'}
          </button>
        )}
      </div>
    </div>
  )
}
