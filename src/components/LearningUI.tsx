import { ArrowRight, CheckCircle2, Flag, Zap } from 'lucide-react'
import type { Mission } from '../data/missions'
export function Brand({ small = false }: { small?: boolean }) {
  return (
    <div className={`brand ${small ? 'small' : ''}`}>
      <span className="brand-symbol">
        <Zap size={small ? 21 : 25} fill="currentColor" />
      </span>
      <span>
        Volt<span className="brand-quest">Quest</span>
        {!small && <small>FISIKA FASE F</small>}
      </span>
    </div>
  )
}
export function ProgressBar({ count }: { count: number }) {
  return (
    <div
      className="progress-track"
      role="progressbar"
      aria-label="Progres misi"
      aria-valuenow={count}
      aria-valuemin={0}
      aria-valuemax={5}
    >
      <span style={{ width: `${count * 20}%` }} />
    </div>
  )
}
export function MissionCard({
  mission,
  completed,
  onSelect,
}: {
  mission: Mission
  completed: boolean
  onSelect: () => void
}) {
  const Icon = mission.icon
  return (
    <button
      className={`mission-card ${mission.theme} ${mission.id === 5 ? 'final-card' : ''}`}
      onClick={onSelect}
    >
      <div className="mission-card-top">
        <span className="eyebrow">
          MISI {String(mission.id).padStart(2, '0')}
        </span>
        {mission.id === 5 ? (
          <span className="final-tag">
            <Flag size={11} /> MISI FINAL
          </span>
        ) : (
          <ArrowRight size={17} className="card-arrow" />
        )}
      </div>
      <div className="mission-icon">
        <Icon strokeWidth={1.6} />
      </div>
      <h3>{mission.title}</h3>
      <span className={`mission-status ${completed ? 'is-complete' : ''}`}>
        {completed ? (
          <>
            <CheckCircle2 size={14} /> Selesai
          </>
        ) : (
          <>
            <span className="status-dot" /> Siap dijelajahi
          </>
        )}
      </span>
    </button>
  )
}
