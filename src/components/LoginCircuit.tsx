import { useEffect, useRef, useState } from 'react'
import { Layers2, Pause, Play, Power } from 'lucide-react'
import { CircuitFallback } from './CircuitFallback'
import type { CircuitState, createCircuitScene } from './circuitScene'

export function LoginCircuit({ phase }: { phase: CircuitState['phase'] }) {
  const host = useRef<HTMLDivElement>(null)
  const scene = useRef<ReturnType<typeof createCircuitScene> | null>(null)
  const [on, setOn] = useState(true)
  const [paused, setPaused] = useState(false)
  const [reduced, setReduced] = useState(
    () => matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const [mode, setMode] = useState<'svg' | '3d'>('svg')
  const [lightweight, setLightweight] = useState(false)
  const [inactive, setInactive] = useState(false)
  const live = useRef<CircuitState>({ on, paused, reduced, phase })
  const powered = phase === 'success' || on
  useEffect(() => {
    live.current = { on: powered, paused, reduced, phase }
    scene.current?.refresh()
  }, [powered, paused, reduced, phase])
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
    if (lightweight) return
    const nav = navigator as Navigator & {
      deviceMemory?: number
      connection?: { saveData?: boolean }
    }
    if (
      nav.connection?.saveData ||
      (nav.deviceMemory && nav.deviceMemory <= 2) ||
      navigator.hardwareConcurrency <= 2
    )
      return
    let disposed = false
    const fail = () => {
      if (!disposed) {
        setLightweight(true)
        setMode('svg')
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
          )
          setMode('3d')
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
  }, [lightweight])
  return (
    <figure
      className={`login-circuit ${paused || reduced || inactive ? 'is-paused' : ''}`}
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
        {mode === 'svg' && (
          <CircuitFallback
            on={powered}
            toggle={() => {
              if (phase === 'idle') setOn(!on)
            }}
          />
        )}
        <span className="circuit-label battery-label">Baterai</span>
        <span className="circuit-label resistor-label">Resistor</span>
        <span className="circuit-label lamp-label">Lampu</span>
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
          <button
            type="button"
            className="circuit-pause"
            aria-label={paused ? 'Putar animasi' : 'Jeda animasi'}
            disabled={reduced}
            onClick={() => setPaused(!paused)}
          >
            {paused ? <Play size={16} /> : <Pause size={16} />}
          </button>
          {mode === '3d' && (
            <button
              className="circuit-pause circuit-lightweight"
              type="button"
              aria-label="Gunakan tampilan ringan"
              title="Gunakan tampilan ringan"
              onClick={() => {
                setLightweight(true)
                setMode('svg')
              }}
            >
              <Layers2 size={16} />
            </button>
          )}
        </div>
        <p>
          {powered
            ? 'Satu jalur terhubung. Lampu pun menyala.'
            : 'Jalur terputus. Arus berhenti, lampu mati.'}
        </p>
        <small>Ilustrasi arus konvensional · Coba klik saklarnya.</small>
      </figcaption>
    </figure>
  )
}
