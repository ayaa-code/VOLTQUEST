import { useState } from 'react'
import {
  Zap,
  CheckCircle2,
  LockKeyhole,
  Lightbulb,
  Tv,
  Refrigerator,
} from 'lucide-react'
import type { useDynamicLearning } from '../hooks/useDynamicLearning'
import {
  checkpointDone,
  checkEnergyAnswer,
  energyMissions,
  numericAnswer,
} from '../data/checkpoints'
import './EnergyControlRoom.css'

export function EnergyControlRoom({
  store,
  onReview,
  onNext,
  onBack,
}: {
  store: ReturnType<typeof useDynamicLearning>
  onReview: (id: number) => void
  onNext: () => void
  onBack: () => void
}) {
  const saved = store.learning.checkpoints?.[2]
  const [index, setIndex] = useState(() =>
    Math.min(
      2,
      [1, 2, 3].findIndex((id) => !saved?.solved.includes(id)) < 0
        ? 2
        : [1, 2, 3].findIndex((id) => !saved?.solved.includes(id)),
    ),
  )
  const [values, setValues] = useState<string[]>(
    saved?.answers[index + 1] ?? [],
  )
  const [checked, setChecked] = useState(false)
  const mission = energyMissions[index]
  const complete = checkpointDone(store.learning, 2)
  const solved = saved?.solved.includes(index + 1) ?? false
  const correct = checkEnergyAnswer(index + 1, values)
  return (
    <section className="content-card learning-detail energy-room">
      <header className="energy-header">
        <Zap size={30} />
        <div>
          <span>FORMATIVE CHECKPOINT 2</span>
          <h1>VoltQuest Energy Control Room</h1>
          <p>Stabilkan jaringan. Pecahkan tiga misi energi.</p>
        </div>
      </header>
      <ol className="energy-nodes" aria-label="Progres misi">
        {energyMissions.map((m, i) => (
          <li
            key={m.title}
            className={
              saved?.solved.includes(i + 1) || complete
                ? 'done'
                : i === index
                  ? 'active'
                  : ''
            }
          >
            {saved?.solved.includes(i + 1) || complete ? (
              <CheckCircle2 />
            ) : i === index ? (
              <Zap />
            ) : (
              <LockKeyhole />
            )}
            <span>
              {i + 1}. {m.title}
            </span>
          </li>
        ))}
      </ol>
      {complete ? (
        <div className="energy-panel">
          <h2>Checkpoint complete. Your energy system is stable.</h2>
          <button className="primary-button" onClick={onNext}>
            Start PhET Challenge
          </button>
        </div>
      ) : (
        <div className="energy-panel" key={index}>
          <span className="section-kicker">Question {index + 1} of 3</span>
          <h2>{mission.title}</h2>
          <div className={`energy-diagram ${solved ? 'stabilized' : ''}`}>
            {index === 0 ? (
              <svg
                viewBox="0 0 520 190"
                role="img"
                aria-label="Source 12 V, R3 in series with parallel branches R1 and R2"
              >
                <g fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M60 70V30H180M260 30H350V65M350 125V160H60V110M350 30H470V65M470 125V160H350" />
                  <path d="M180 18H260V42H180ZM335 65H365V125H335ZM455 65H485V125H455M40 70H80M48 88H72M40 110H80" />
                </g>
                <g fill="currentColor" fontSize="17">
                  <text x="10" y="150">
                    12 V
                  </text>
                  <text x="175" y="70">
                    R3 · 4 Ω
                  </text>
                  <text x="270" y="100">
                    6 Ω
                  </text>
                  <text x="410" y="100">
                    12 Ω
                  </text>
                </g>
              </svg>
            ) : index === 1 ? (
              <svg
                viewBox="0 0 520 170"
                role="img"
                aria-label="3 A and 5 A enter a junction; 2 A, 1.5 A and I5 leave"
              >
                <defs>
                  <marker
                    id="energy-arrow"
                    markerWidth="8"
                    markerHeight="8"
                    refX="7"
                    refY="4"
                    orient="auto"
                  >
                    <path d="M0 0L8 4L0 8" fill="currentColor" />
                  </marker>
                </defs>
                <g
                  stroke="currentColor"
                  strokeWidth="3"
                  markerEnd="url(#energy-arrow)"
                >
                  <path d="M50 35L240 80M50 135L240 90M270 80L455 30M270 90L455 140M270 85H465" />
                </g>
                <circle cx="255" cy="85" r="12" fill="currentColor" />
                <g fill="currentColor" fontSize="18">
                  <text x="55" y="25">
                    3 A →
                  </text>
                  <text x="55" y="165">
                    5 A →
                  </text>
                  <text x="425" y="20">
                    2 A
                  </text>
                  <text x="415" y="165">
                    1,5 A
                  </text>
                  <text x="425" y="75">
                    I5 ?
                  </text>
                </g>
              </svg>
            ) : (
              <div className="energy-devices">
                <span>
                  <Lightbulb />5 × 20 W<br />
                  10 h/hari
                </span>
                <span>
                  <Tv />
                  100 W<br />5 h/hari
                </span>
                <span>
                  <Refrigerator />
                  150 W<br />
                  24 h/hari
                </span>
              </div>
            )}
          </div>
          <p>{mission.prompt}</p>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (store.answerEnergy(index + 1, values)) setChecked(true)
            }}
          >
            <div className="energy-inputs">
              {mission.labels.map((label, i) => (
                <label key={label}>
                  {label}
                  <input
                    aria-label={label}
                    required
                    inputMode="decimal"
                    value={values[i] ?? ''}
                    disabled={solved}
                    onChange={(e) => {
                      setValues((v) => {
                        const next = [...v]
                        next[i] = e.target.value
                        return next
                      })
                      setChecked(false)
                    }}
                  />
                  {checked && (
                    <small>
                      {Math.abs(
                        numericAnswer(values[i] ?? '') - mission.expected[i],
                      ) < 0.001
                        ? '✓ Tepat'
                        : 'Periksa kembali'}
                    </small>
                  )}
                </label>
              ))}
              {index === 1 && (
                <label>
                  Arah I5
                  <select
                    aria-label="Arah I5"
                    required
                    value={values[1] ?? ''}
                    disabled={solved}
                    onChange={(e) => {
                      setValues([values[0] ?? '', e.target.value])
                      setChecked(false)
                    }}
                  >
                    <option value="">Pilih arah</option>
                    <option value="masuk">Masuk</option>
                    <option value="keluar">Keluar</option>
                  </select>
                </label>
              )}
            </div>
            {!solved && (
              <div className="learning-actions">
                <button className="primary-button">Check System</button>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => {
                    setValues([])
                    setChecked(false)
                  }}
                >
                  Reset Answer
                </button>
              </div>
            )}
          </form>
          {checked && !correct && (
            <aside className="quiz-feedback" role="status">
              <strong>Belum tepat. Periksa kembali sistemnya.</strong>
              <p>{mission.help}</p>
              <button
                className="secondary-button"
                onClick={() => setChecked(false)}
              >
                Try Again
              </button>
              <button
                className="text-button"
                onClick={() => onReview(mission.topic)}
              >
                Back to Related Lesson
              </button>
            </aside>
          )}
          {solved && (
            <div role="status" className="energy-success">
              <CheckCircle2 />
              <strong>System Stabilized</strong>
              <p>{mission.help}</p>
              <button
                className="primary-button"
                onClick={() => {
                  if (index < 2) {
                    setIndex(index + 1)
                    setValues(saved?.answers[index + 2] ?? [])
                    setChecked(false)
                  } else store.completeEnergy()
                }}
              >
                {index < 2 ? 'Continue to Next Mission' : 'Complete Checkpoint'}
              </button>
            </div>
          )}
        </div>
      )}
      {store.storageError && (
        <p role="alert">
          Progres belum tersimpan. Coba kembali sebelum meninggalkan halaman.
        </p>
      )}
      <button className="energy-back" onClick={onBack}>
        Back to Learning Path
      </button>
    </section>
  )
}
