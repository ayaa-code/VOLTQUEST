import { useEffect, useRef, useState } from 'react'
import { Power } from 'lucide-react'
import './CircuitAnimation.css'
import type {
  CircuitLabelPositions,
  CircuitState,
  createCircuitScene,
} from './circuitScene'

export function CircuitAnimation({
  variant = 'login',
  phase = 'idle',
}: {
  variant?: 'login' | 'dashboard'
  phase?: CircuitState['phase']
}) {
  const host = useRef<HTMLDivElement>(null)
  const scene = useRef<ReturnType<typeof createCircuitScene> | null>(null)
  const [on, setOn] = useState(true)
  const [reduced, setReduced] = useState(
    () => matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const [mode, setMode] = useState<'initializing' | '3d' | 'unavailable'>(
    'initializing',
  )
  const [labels, setLabels] = useState<CircuitLabelPositions | null>(null)
  const [inactive, setInactive] = useState(false)
  const live = useRef<CircuitState>({ on, reduced, phase })
  const powered = phase === 'success' || on
  useEffect(() => {
    live.current = { on: powered, reduced, phase }
    scene.current?.refresh()
  }, [powered, reduced, phase])
  useEffect(() => {
    const query = matchMedia('(prefers-reduced-motion: reduce)')
    const change = () => setReduced(query.matches)
    query.addEventListener('change', change)
    return () => query.removeEventListener('change', change)
  }, [])
  useEffect(() => {
    let visible = true
    const sync = () => setInactive(document.hidden || !visible)
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      sync()
    })
    if (host.current) observer.observe(host.current)
    document.addEventListener('visibilitychange', sync)
    return () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', sync)
    }
  }, [])
  useEffect(() => {
    let disposed = false
    const fail = () => {
      if (!disposed) {
        scene.current?.dispose()
        scene.current = null
        setLabels(null)
        setMode('unavailable')
      }
    }
    import('./circuitScene')
      .then(({ createCircuitScene: create }) => {
        if (disposed || !host.current) return
        try {
          scene.current = create(
            host.current,
            () => live.current,
            () => {
              if (live.current.phase === 'idle') setOn((value) => !value)
            },
            fail,
            variant,
            setLabels,
          )
          if (!disposed) setMode('3d')
        } catch {
          fail()
        }
      })
      .catch(fail)
    return () => {
      disposed = true
      scene.current?.dispose()
      scene.current = null
    }
  }, [variant])
  return (
    <figure
      className={`circuit-animation ${variant}-circuit ${reduced || inactive || !powered ? 'is-paused' : ''}`}
      data-variant={variant}
      aria-label={
        variant === 'dashboard'
          ? 'Rangkaian interaktif dashboard'
          : 'Rangkaian interaktif login'
      }
      data-powered={powered}
      data-phase={phase}
      data-renderer={mode}
    >
      <div
        className="circuit-stage"
        role="img"
        aria-label={`Rangkaian seri: baterai, saklar, resistor, dan lampu. Saklar ${powered ? 'tertutup, lampu menyala' : 'terbuka, lampu mati'}.`}
      >
        <div ref={host} className="circuit-webgl" />
        {labels && (
          <div className="circuit-labels" aria-hidden="true">
            {(
              [
                ['battery', 'Baterai'],
                ['switch', 'Saklar'],
                ['resistor', 'Resistor'],
                ['lamp', 'Lampu'],
              ] as const
            ).map(([id, text]) => (
              <span
                className={`circuit-label circuit-label-${id}`}
                key={id}
                style={{ left: labels[id].x, top: labels[id].y }}
              >
                {text}
              </span>
            ))}
          </div>
        )}
        {mode === 'unavailable' && (
          <p className="circuit-unavailable" role="status">
            Visualisasi rangkaian 3D belum didukung oleh perangkat ini.
          </p>
        )}
      </div>
      <figcaption>
        <div className="circuit-controls">
          <button
            type="button"
            className="circuit-toggle"
            role="switch"
            aria-checked={powered}
            aria-label="Saklar rangkaian"
            disabled={phase !== 'idle'}
            onClick={() => setOn(!on)}
          >
            <Power size={16} />
            <span>
              Saklar <strong>{powered ? 'ON' : 'OFF'}</strong>
            </span>
            <span className="switch-track">
              <i />
            </span>
          </button>
        </div>
      </figcaption>
    </figure>
  )
}
