import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  FlaskConical,
  Leaf,
  Sparkles,
  Target,
  Zap,
} from 'lucide-react'
import type { Mission } from '../data/missions'
import { PhetLab } from './PhetLab'
import {
  experiments,
  experimentScreens,
  observationErrors,
} from '../data/experiments'
import { useExperimentDraft } from '../hooks/useExperimentDraft'
import { ObservationForm } from './ObservationForm'
import type { RecommendationRef } from '../data/feedbackRules'
import type { QuestionProgress } from '../data/attempts'
import { gradeAnswer } from '../data/assessmentClient'
import { CircuitEvidence } from './CircuitEvidence'
import './ExperimentRecovery.css'
import { useMissionReport } from '../hooks/useMissionReport'
import { MissionReportView } from './MissionReportView'
import { missionInputKey } from '../data/missionReport'
import './MissionReport.css'
import { explanationNeedsRevision } from '../data/reflectionReview'
export function MissionView({
  mission,
  profileId,
  completed,
  visited,
  onComplete,
  onVisit,
  onPractice,
  onBack,
  onNext,
  assessment,
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
  assessment?: {
    progress?: QuestionProgress
    onSubmit: (
      answer: number,
      needsSupport?: boolean,
      finalize?: boolean,
    ) => Promise<{ saved: boolean; correct: boolean; explanation?: string }>
    onSkip: () => boolean
    onReview: () => void
  }
}) {
  const { draft, update, saved, notice, error, retrySave } = useExperimentDraft(
    profileId,
    mission.id,
  )
  const answer = draft.answer
  const config = experiments[mission.id]
  const predictionValue =
    draft.prediction === 'Prediksi lain'
      ? draft.predictionText.trim()
      : draft.prediction
  const predictionReady =
    config.choices.includes(draft.prediction) &&
    !!predictionValue &&
    !!draft.predictionReason.trim()
  const observationReady =
    draft.observationStatus === 'recorded' &&
    Object.keys(observationErrors(mission.id, draft.observations)).length ===
      0 &&
    !!draft.comparison.trim()
  // Old skipped/incomplete drafts are retained, but the UI now returns to the table.
  const step =
    draft.step > 0 && !predictionReady
      ? 0
      : draft.step === 3 && !observationReady
        ? 2
        : draft.step
  const panel = useRef<HTMLDivElement>(null)
  function go(step: number) {
    if (step > 0 && !predictionReady) return
    if (step === 3 && !observationReady) return
    update({
      step,
      ...(step > 0 && !draft.initialPrediction && draft.prediction
        ? {
            initialPrediction: {
              choice: draft.prediction,
              reason: draft.predictionReason,
              text: draft.predictionText,
            },
          }
        : {}),
    })
    requestAnimationFrame(() =>
      Array.from(
        panel.current?.querySelectorAll<HTMLElement>('[tabindex="-1"]') ?? [],
      )
        .find((el) => el.getClientRects().length)
        ?.focus(),
    )
  }
  const steps = ['Prediksi', 'Eksperimen', 'Pengamatan', 'Refleksi']
  const predictionChanged =
    draft.initialPrediction &&
    (draft.initialPrediction.choice !== draft.prediction ||
      draft.initialPrediction.reason !== draft.predictionReason ||
      (draft.initialPrediction.text ?? '') !== draft.predictionText)
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(
    draft.review?.answer === draft.answer
      ? draft.review?.choiceCorrect
        ? 'correct'
        : 'incorrect'
      : null,
  )
  const [answerError, setAnswerError] = useState('')
  const submitting = useRef(false)
  const [pending, setPending] = useState(false)
  const Icon = mission.icon
  const success = feedback === 'correct'
  const reportState = useMissionReport(profileId, mission, draft, update)
  const checked = draft.review?.answer === answer && feedback !== null
  async function checkChoice() {
    if (
      answer === null ||
      !predictionReady ||
      !observationReady ||
      submitting.current
    )
      return
    submitting.current = true
    setPending(true)
    setAnswerError('')
    const result = assessment
      ? await assessment.onSubmit(answer, false, false)
      : await gradeAnswer('phet', mission.id, answer)
          .then((r) => ({ ...r, saved: true }))
          .catch(() => null)
    submitting.current = false
    setPending(false)
    if (!result?.saved) {
      setAnswerError('Jawaban belum tersimpan. Periksa koneksi dan coba lagi.')
      return
    }
    update({
      review: {
        source: 'local',
        at: Date.now(),
        answer,
        reason: draft.reflectionReason,
        observations: JSON.stringify(draft.observations),
        comparison: draft.comparison,
        choiceCorrect: result.correct,
        explanation: explanationNeedsRevision(draft.reflectionReason)
          ? 'needs-revision'
          : 'unassessed',
      },
    })
    setFeedback(result.correct ? 'correct' : 'incorrect')
  }
  async function submit(e: FormEvent) {
    e.preventDefault()
    if (
      answer === null ||
      !checked ||
      !predictionReady ||
      !observationReady ||
      !draft.reflectionReason.trim() ||
      submitting.current
    )
      return
    const correct = !!draft.review?.choiceCorrect
    if (!correct && assessment?.progress?.status !== 'reinforcement') {
      setAnswerError(
        'Revisi pilihan atau gunakan Lanjut dengan penguatan setelah batas percobaan.',
      )
      return
    }
    submitting.current = true
    setPending(true)
    setAnswerError('')
    const support = !correct || explanationNeedsRevision(draft.reflectionReason)
    if (correct && assessment) {
      const result = await assessment.onSubmit(answer, support, true)
      if (!result.saved) {
        setAnswerError(
          'Jawaban belum tersimpan. Periksa koneksi dan coba lagi.',
        )
        submitting.current = false
        setPending(false)
        return
      }
    }
    if (correct && !assessment && !completed) onComplete()
    update({
      review: {
        source: 'local',
        at: Date.now(),
        answer,
        reason: draft.reflectionReason,
        observations: JSON.stringify(draft.observations),
        comparison: draft.comparison,
        choiceCorrect: correct,
        explanation: support ? 'needs-revision' : 'unassessed',
      },
    })
    await reportState.save(correct, support)
    submitting.current = false
    setPending(false)
  }
  const showingReport = reportState.open && !!draft.report && saved

  return (
    <main className="mission-page page-enter">
      {showingReport && draft.report && (
        <>
          <button
            className="back-link"
            onClick={() => reportState.setOpen(false)}
          >
            Kembali ke misi
          </button>
          <MissionReportView
            key={draft.report.id}
            report={draft.report}
            stale={
              draft.report.inputKey !== missionInputKey(draft) ||
              reportState.signature !== draft.report.evidenceSignature
            }
            onEdit={() => {
              reportState.setOpen(false)
              go(3)
            }}
            onNext={onNext}
            onAI={(ai) =>
              update({ report: { ...draft.report!, ai, aiAt: Date.now() } })
            }
          />
        </>
      )}
      <div hidden={showingReport}>
        <button className="back-link" onClick={onBack}>
          <ArrowLeft size={17} /> Kembali ke misi
        </button>
        <div className={`mission-heading ${mission.theme}`}>
          <span className="detail-icon">
            <Icon size={35} strokeWidth={1.6} />
          </span>
          <div>
            <span className="eyebrow">
              MISSION{' '}
              {String([1, 3, 2, 4, 5].indexOf(mission.id) + 1).padStart(2, '0')}{' '}
              {mission.id === 5 ? '· TANTANGAN FINAL' : '· LISTRIK DINAMIS'}
            </span>
            <h1>{mission.title}</h1>
            <p>{mission.subtitle}</p>
          </div>
          {!assessment && (
            <span className="xp-chip">
              <Zap size={15} /> {completed ? '100 XP diraih' : '+100 XP'}
            </span>
          )}
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
              className={step === index ? 'active' : ''}
              aria-current={step === index ? 'step' : undefined}
              disabled={
                (index > 0 && !predictionReady) ||
                (index === 3 && !observationReady)
              }
              onClick={() => go(index)}
            >
              <span>{index + 1}</span>
              {label}
            </button>
          ))}
        </nav>
        <div className="draft-status" role="status">
          Langkah {step + 1} dari 4 ·{' '}
          {error
            ? 'Belum tersimpan. Coba lagi.'
            : saved
              ? 'Tersimpan di perangkat ini'
              : 'Isianmu tersimpan otomatis di perangkat ini.'}
          {error && (
            <button type="button" className="text-button" onClick={retrySave}>
              Coba simpan draf lagi
            </button>
          )}
        </div>
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
        <div
          ref={panel}
          className={`guided-panel ${step === 1 || step === 2 ? 'has-workbench' : ''}`}
        >
          {step === 0 && (
            <section className="content-card">
              <h2 id="step-heading" tabIndex={-1}>
                Buat prediksimu
              </h2>

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
              {draft.prediction === 'Prediksi lain' && (
                <div className="guided-field">
                  <label htmlFor="prediction-text">Tuliskan prediksimu</label>
                  <textarea
                    id="prediction-text"
                    required
                    maxLength={800}
                    rows={3}
                    value={draft.predictionText}
                    onChange={(e) => update({ predictionText: e.target.value })}
                  />
                </div>
              )}
              <div className="guided-field">
                <label htmlFor="prediction-reason">
                  Mengapa kamu memperkirakan begitu?
                </label>
                <textarea
                  id="prediction-reason"
                  required
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
                  <p>
                    {draft.initialPrediction.choice === 'Prediksi lain'
                      ? draft.initialPrediction.text
                      : draft.initialPrediction.choice}
                  </p>
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
                  disabled={!predictionReady}
                  onClick={() => go(1)}
                >
                  Lanjut ke eksperimen <ArrowRight size={17} />
                </button>
              </div>
            </section>
          )}
          <div
            className="experiment-workbench"
            hidden={step !== 1 && step !== 2}
          >
            <section className="content-card lab-card" hidden={step !== 1}>
              <span className="section-kicker">
                <FlaskConical size={16} /> PANDUAN PERCOBAAN
              </span>
              <h2 id="experiment-heading" tabIndex={-1}>
                Siapkan Eksperimenmu
              </h2>
              <p>
                <strong>
                  Mulai di PhET: pilih {experimentScreens[mission.id].tab}.
                </strong>{' '}
                {experimentScreens[mission.id].hint}
              </p>
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
              <p>Gunakan simulasi di bawah untuk mencoba langkah percobaan.</p>
            </section>
            <div className="mission-lab-area">
              <PhetLab onVisit={onVisit} visited={visited} />
              <CircuitEvidence
                key={`${profileId}:${mission.id}`}
                profileId={profileId}
                missionId={mission.id}
              />
            </div>
            <div className="step-actions" hidden={step !== 1}>
              <button className="secondary-button" onClick={() => go(0)}>
                Kembali ke prediksi
              </button>
              <button className="primary-button" onClick={() => go(2)}>
                Lanjut ke pengamatan
              </button>
            </div>
            <section className="content-card" hidden={step !== 2}>
              <ObservationForm
                missionId={mission.id}
                draft={draft}
                update={update}
                onBack={() => go(1)}
                onContinue={() => {
                  update({ observationStatus: 'recorded', step: 3 })
                  requestAnimationFrame(() =>
                    panel.current
                      ?.querySelector<HTMLElement>('#step-heading')
                      ?.focus(),
                  )
                }}
              />
            </section>
          </div>
          {step === 3 && (
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
                  {(draft.initialPrediction?.choice === 'Prediksi lain'
                    ? draft.initialPrediction.text
                    : draft.initialPrediction?.choice) ||
                    predictionValue ||
                    'Belum diisi'}
                </p>
                <p>
                  {draft.initialPrediction?.reason || 'Tanpa alasan tertulis.'}
                </p>
                {predictionChanged && (
                  <>
                    <strong>Prediksi yang diperbarui</strong>
                    <p>{predictionValue}</p>
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
                          <dd>
                            {draft.observations[field.id] || 'Belum diisi'}
                          </dd>
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
                <fieldset disabled={pending}>
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
                <button
                  type="button"
                  className="secondary-button"
                  disabled={answer === null || pending || (checked && success)}
                  onClick={() => void checkChoice()}
                >
                  Periksa pilihan
                </button>
                {feedback && (
                  <div
                    className={`feedback ${success ? 'success' : 'retry'}`}
                    role="status"
                  >
                    <strong>
                      {success
                        ? 'Pilihan jawabanmu tepat.'
                        : 'Belum tepat, mari revisi.'}
                    </strong>
                    {!success && (
                      <>
                        <p>
                          {
                            [
                              'Tinjau fungsi sumber tegangan, penghantar, beban, dan sakelar.',
                              'Tinjau jalur arus pada rangkaian seri dan paralel.',
                              'Gunakan R = V/I dan periksa satuannya.',
                              'Gunakan E = P × t.',
                              'Tinjau fungsi cabang dan sakelar dalam rangkaian.',
                            ][mission.id - 1]
                          }
                        </p>
                        {assessment && (
                          <button
                            type="button"
                            className="text-button"
                            onClick={assessment.onReview}
                          >
                            Pelajari kembali materi
                          </button>
                        )}
                      </>
                    )}
                  </div>
                )}
                <div className="guided-field">
                  <label htmlFor="reflection-reason">
                    Berdasarkan pengamatanmu, bagaimana kamu menjelaskan jawaban
                    ini?
                  </label>
                  <textarea
                    id="reflection-reason"
                    required
                    rows={3}
                    maxLength={800}
                    value={draft.reflectionReason}
                    onChange={(event) =>
                      update({ reflectionReason: event.target.value })
                    }
                  />
                  <p className="guided-help">
                    Alasan tertulis tidak dinilai otomatis. Soal ini memiliki
                    data sendiri yang dapat berbeda dari catatanmu.
                  </p>
                </div>
                <button
                  className="primary-button submit-button"
                  type="submit"
                  disabled={
                    pending ||
                    !checked ||
                    !draft.reflectionReason.trim() ||
                    (!success &&
                      assessment?.progress?.status !== 'reinforcement')
                  }
                >
                  Kirim dan Lihat Laporan <ArrowRight size={17} />
                </button>
                {draft.report && (
                  <button
                    type="button"
                    className="text-button"
                    disabled={!saved}
                    onClick={() => reportState.setOpen(true)}
                  >
                    Lihat laporan tersimpan
                  </button>
                )}
              </form>
              {answerError && <p role="alert">{answerError}</p>}
              {reportState.error && <p role="alert">{reportState.error}</p>}
              {assessment &&
                assessment.progress?.status === 'open' &&
                assessment.progress.wrong >= 4 && (
                  <button
                    className="secondary-button"
                    onClick={assessment.onSkip}
                  >
                    Lanjut dengan penguatan
                  </button>
                )}
              {assessment?.progress?.status === 'reinforcement' && (
                <div className="learning-summary">
                  <strong>Perlu penguatan</strong>
                  <p>Kamu boleh melanjutkan atau mencoba lagi.</p>
                  <p>
                    Lengkapi refleksi, lalu kirim untuk melihat laporan
                    eksperimen.
                  </p>
                </div>
              )}
              {!assessment && (
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
              )}
              <div className="reflection-note">
                <Leaf size={15} /> Belajar itu proses. Kamu boleh mencoba lagi.
              </div>
            </section>
          )}
        </div>
      </div>
    </main>
  )
}
