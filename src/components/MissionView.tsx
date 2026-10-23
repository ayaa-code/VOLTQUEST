import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  Check,
  CheckCircle2,
  ExternalLink,
  FlaskConical,
  Leaf,
  Sparkles,
  Target,
  Zap,
} from 'lucide-react'
import { PHET_URL } from '../data/missions'
import type { Mission } from '../data/missions'
import { experiments } from '../data/experiments'
import { useExperimentDraft } from '../hooks/useExperimentDraft'
import { ObservationForm } from './ObservationForm'
import { ConceptConfirmation } from './ConceptConfirmation'
import { useConceptFeedback } from '../hooks/useConceptFeedback'
import type { RecommendationRef } from '../data/feedbackRules'
export function MissionView({
  mission,
  profileId,
  completed,
  visited,
  onComplete,
  onVisit,
  onPractice,
  onRecommended,
  onBack,
  onNext,
}: {
  mission: Mission
  profileId: string
  completed: boolean
  visited: boolean
  onComplete: () => void
  onVisit: () => void
  onPractice: () => void
  onRecommended: (ref: RecommendationRef) => void
  onBack: () => void
  onNext: () => void
}) {
  const { draft, update, saved, notice, error } = useExperimentDraft(
    profileId,
    mission.id,
  )
  const answer = draft.answer
  const conceptFeedback = useConceptFeedback(profileId, mission, answer)
  const config = experiments[mission.id]
  const panel = useRef<HTMLDivElement>(null)
  function go(step: number) {
    update({
      step,
      ...(step > 0 && !draft.initialPrediction && draft.prediction
        ? {
            initialPrediction: {
              choice: draft.prediction,
              reason: draft.predictionReason,
            },
          }
        : {}),
    })
    requestAnimationFrame(() =>
      panel.current?.querySelector<HTMLElement>('#step-heading')?.focus(),
    )
  }
  const steps = ['Prediksi', 'Eksperimen', 'Pengamatan', 'Refleksi']
  const predictionChanged =
    draft.initialPrediction &&
    (draft.initialPrediction.choice !== draft.prediction ||
      draft.initialPrediction.reason !== draft.predictionReason)
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null)
  const [newReward, setNewReward] = useState(false)
  const Icon = mission.icon
  const success = feedback === 'correct'
  function submit(e: FormEvent) {
    e.preventDefault()
    if (answer === null) return
    update({ answer })
    conceptFeedback.begin(answer)
    if (answer === mission.correct) {
      setNewReward(!completed)
      setFeedback('correct')
      onComplete()
    } else setFeedback('incorrect')
  }
  return (
    <main className="mission-page page-enter">
      <button className="back-link" onClick={onBack}>
        <ArrowLeft size={17} /> Kembali ke misi
      </button>
      <div className={`mission-heading ${mission.theme}`}>
        <span className="detail-icon">
          <Icon size={35} strokeWidth={1.6} />
        </span>
        <div>
          <span className="eyebrow">
            MISI {String(mission.id).padStart(2, '0')}{' '}
            {mission.id === 5 ? '· TANTANGAN FINAL' : '· LISTRIK DINAMIS'}
          </span>
          <h1>{mission.title}</h1>
          <p>{mission.subtitle}</p>
        </div>
        <span className="xp-chip">
          <Zap size={15} /> {completed ? '100 XP diraih' : '+100 XP'}
        </span>
      </div>
      <div className="guided-briefing">
        <section className="content-card briefing">
          <span className="section-kicker">
            <BookOpen size={16} /> BRIEFING MISI
          </span>
          <h2>Mulai dari masalah sekolah</h2>
          <p>{mission.story}</p>
          <div className="learning-target">
            <Target size={21} />
            <div>
              <strong>Target belajarmu</strong>
              <p>{mission.target}</p>
            </div>
          </div>
        </section>
      </div>
      <nav className="experiment-steps" aria-label="Langkah eksperimen">
        {steps.map((label, index) => (
          <button
            key={label}
            className={draft.step === index ? 'active' : ''}
            aria-current={draft.step === index ? 'step' : undefined}
            disabled={index > 0 && !draft.prediction}
            onClick={() => go(index)}
          >
            <span>{index + 1}</span>
            {label}
          </button>
        ))}
      </nav>
      <p className="draft-status">
        Langkah {draft.step + 1} dari 4 ·{' '}
        {saved
          ? 'Draf tersimpan di browser ini.'
          : 'Draf disimpan saat kamu mengubah isian atau langkah.'}
      </p>
      {notice && !saved && !error && (
        <p className="storage-warning" role="alert">
          {notice}
        </p>
      )}
      {error && (
        <p className="storage-warning" role="alert">
          {error}
        </p>
      )}
      <div ref={panel} className="guided-panel">
        {draft.step === 0 && (
          <section className="content-card">
            <h2 id="step-heading" tabIndex={-1}>
              Buat prediksimu
            </h2>
            <p>
              Ini perkiraan awal, bukan tes. Tidak ada penilaian benar/salah
              atau XP. “Belum yakin” juga boleh.
            </p>
            <fieldset>
              <legend>{config.prediction}</legend>
              <div className="answer-options">
                {config.choices.map((choice) => (
                  <label
                    className={`answer-option ${draft.prediction === choice ? 'selected' : ''}`}
                    key={choice}
                  >
                    <input
                      type="radio"
                      name="prediction"
                      value={choice}
                      checked={draft.prediction === choice}
                      onChange={() => update({ prediction: choice })}
                    />
                    <span className="option-text">{choice}</span>
                    {draft.prediction === choice && <Check size={17} />}
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="guided-field">
              <label htmlFor="prediction-reason">
                Mengapa kamu memperkirakan begitu? <span>(opsional)</span>
              </label>
              <textarea
                id="prediction-reason"
                rows={3}
                maxLength={800}
                value={draft.predictionReason}
                onChange={(event) =>
                  update({ predictionReason: event.target.value })
                }
              />
            </div>
            {draft.initialPrediction && (
              <aside className="draft-summary">
                <strong>Prediksi awal saat pertama melanjutkan</strong>
                <p>{draft.initialPrediction.choice}</p>
                <p>
                  {draft.initialPrediction.reason || 'Tanpa alasan tertulis.'}
                </p>
                <p>
                  {predictionChanged
                    ? 'Prediksi di atas sudah diperbarui. Respons awal tetap disimpan.'
                    : 'Jika kamu mengubah prediksi, respons awal tetap disimpan.'}
                </p>
              </aside>
            )}
            <div className="step-actions">
              <button
                className="primary-button"
                disabled={!draft.prediction}
                onClick={() => go(1)}
              >
                Lanjut ke eksperimen <ArrowRight size={17} />
              </button>
            </div>
          </section>
        )}
        {draft.step === 1 && (
          <section className="content-card lab-card">
            <span className="section-kicker">
              <FlaskConical size={16} /> LABORATORIUM EKSTERNAL
            </span>
            <h2 id="step-heading" tabIndex={-1}>
              Uji prediksimu di PhET
            </h2>
            <p>
              <strong>Pertanyaan uji:</strong> {config.prediction}
            </p>
            <dl className="experiment-guide">
              <div>
                <dt>Komponen</dt>
                <dd>{config.components}</dd>
              </div>
              <div>
                <dt>Yang diubah</dt>
                <dd>{config.changed}</dd>
              </div>
              <div>
                <dt>Yang dipertahankan</dt>
                <dd>{config.controlled}</dd>
              </div>
            </dl>
            <ol className="lab-steps">
              {config.actions.map((action) => (
                <li key={action}>{action}</li>
              ))}
            </ol>
            <p>
              <strong>Catat nanti:</strong> {config.observe}
            </p>
            <a
              className="primary-button"
              href={PHET_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                update({ step: 1 })
                onVisit()
              }}
            >
              Buka Laboratorium PhET <ExternalLink size={17} />
            </a>
            <p className="phet-credit">
              Simulasi oleh PhET Interactive Simulations, University of Colorado
              Boulder. Terbuka di tab baru.
            </p>
            {visited && (
              <p className="lab-visited">
                <CheckCircle2 size={14} /> Tautan laboratorium sudah dibuka.
              </p>
            )}
            <p>
              Setelah mencoba, kembali ke tab VoltQuest untuk mencatat.
              VoltQuest menyediakan panduan dan catatan; aktivitas serta hasil
              PhET tidak dibaca otomatis.
            </p>
            <div className="step-actions">
              <button className="secondary-button" onClick={() => go(0)}>
                Kembali ke prediksi
              </button>
              <button className="primary-button" onClick={() => go(2)}>
                Lanjut ke pengamatan
              </button>
            </div>
          </section>
        )}
        {draft.step === 2 && (
          <section className="content-card">
            <ObservationForm
              missionId={mission.id}
              draft={draft}
              update={update}
              onBack={() => go(1)}
              onContinue={(skipped) => {
                update({ observationStatus: skipped ? 'skipped' : 'recorded' })
                go(3)
              }}
            />
          </section>
        )}
        {draft.step === 3 && (
          <section className="content-card reflection">
            <button className="back-link" onClick={() => go(2)}>
              <ArrowLeft size={17} /> Kembali ke pengamatan
            </button>
            <h2 id="step-heading" tabIndex={-1}>
              Hubungkan hasil dengan konsep
            </h2>
            <aside className="draft-summary" aria-label="Ringkasan kegiatan">
              <strong>Prediksi awal</strong>
              <p>
                {draft.initialPrediction?.choice ||
                  draft.prediction ||
                  'Belum diisi'}
              </p>
              <p>
                {draft.initialPrediction?.reason || 'Tanpa alasan tertulis.'}
              </p>
              {predictionChanged && (
                <>
                  <strong>Prediksi yang diperbarui</strong>
                  <p>{draft.prediction}</p>
                  <p>{draft.predictionReason || 'Tanpa alasan tertulis.'}</p>
                </>
              )}
              <strong>
                {draft.observationStatus === 'recorded'
                  ? 'Catatan pengamatan siswa'
                  : 'Belum mencatat pengamatan'}
              </strong>
              {draft.observationStatus !== 'recorded' && (
                <p>
                  Isian sementara, bila ada, tetap berupa draf. Kamu dapat
                  kembali untuk melengkapinya.
                </p>
              )}
              {draft.observationStatus === 'recorded' && (
                <dl>
                  {config.groups
                    .flatMap((group) => group.fields)
                    .map((field) => (
                      <div key={field.id}>
                        <dt>{field.label}</dt>
                        <dd>{draft.observations[field.id] || 'Belum diisi'}</dd>
                      </div>
                    ))}
                </dl>
              )}
              {draft.comparison && (
                <p>Perbandingan dengan prediksi: {draft.comparison}</p>
              )}
            </aside>
            <span className="section-kicker">
              <Sparkles size={16} /> WAKTU REFLEKSI
            </span>
            <h2>Apa yang kamu temukan?</h2>
            <p className="reflection-intro">
              Hubungkan pengamatanmu dengan konsep.
            </p>
            <form onSubmit={submit}>
              <fieldset disabled={success}>
                <legend>{mission.question}</legend>
                <div className="answer-options">
                  {mission.options.map((option, index) => (
                    <label
                      key={option}
                      className={`answer-option ${answer === index ? 'selected' : ''} ${success && answer === index ? 'correct' : ''}`}
                    >
                      <input
                        type="radio"
                        name="answer"
                        value={index}
                        checked={answer === index}
                        onChange={() => {
                          conceptFeedback.invalidate()
                          update({ answer: index })
                          setFeedback(null)
                        }}
                      />
                      <span className="option-letter">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="option-text">{option}</span>
                      {answer === index && <Check size={17} />}
                    </label>
                  ))}
                </div>
              </fieldset>
              <div className="guided-field">
                <label htmlFor="reflection-reason">
                  Berdasarkan pengamatanmu, bagaimana kamu menjelaskan jawaban
                  ini? <span>(opsional)</span>
                </label>
                <textarea
                  id="reflection-reason"
                  rows={3}
                  maxLength={800}
                  value={draft.reflectionReason}
                  onChange={(event) =>
                    update({ reflectionReason: event.target.value })
                  }
                />
                <p className="guided-help">
                  Alasan tertulis tidak dinilai otomatis. Soal ini memiliki data
                  sendiri yang dapat berbeda dari catatanmu.
                </p>
              </div>
              {feedback && (
                <div
                  className={`feedback ${success ? 'success' : 'retry'}`}
                  role="status"
                >
                  <strong>
                    {success
                      ? newReward
                        ? 'Kerja bagus, penjelajah! +100 XP'
                        : 'Tepat lagi! Coba jelaskan alasannya.'
                      : 'Hampir! Coba pikirkan lagi.'}
                  </strong>
                  <p>{success ? mission.explanation : mission.hint}</p>
                  {success && (
                    <span>
                      <Award size={17} /> Badge {mission.badge}{' '}
                      {newReward ? 'diraih' : 'sudah dimiliki'}
                    </span>
                  )}
                </div>
              )}
              {success ? (
                <button
                  type="button"
                  className="primary-button next-button"
                  onClick={onNext}
                >
                  {mission.id === 5
                    ? 'Kembali ke dashboard'
                    : 'Lanjut ke misi berikutnya'}
                  <ArrowRight size={17} />
                </button>
              ) : (
                <button
                  className="primary-button submit-button"
                  disabled={answer === null}
                  type="submit"
                >
                  {feedback === 'incorrect'
                    ? 'Coba jawaban lagi'
                    : 'Kirim jawaban'}
                  <ArrowRight size={17} />
                </button>
              )}
            </form>
            <ConceptConfirmation
              controller={conceptFeedback}
              onRecommended={onRecommended}
            />
            <aside className="practice-reflection-invite">
              <h3>Ingin menguatkan konsep?</h3>
              <p>
                Pilih fokus dan coba latihan lain. Kamu boleh berlatih atau
                melanjutkan misi; latihan tidak menambah XP.
              </p>
              <button
                type="button"
                className="secondary-button"
                onClick={onPractice}
              >
                Pilih latihan penguatan <ArrowRight size={17} />
              </button>
            </aside>
            <div className="reflection-note">
              <Leaf size={15} /> Belajar itu proses. Kamu boleh mencoba lagi.
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
