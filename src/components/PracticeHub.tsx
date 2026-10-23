import { useRef } from 'react'
import { ArrowLeft, ArrowRight, BookOpen, Check, Leaf } from 'lucide-react'
import { practiceConcepts, practiceExercises } from '../data/practice'
import { getPracticePlan } from '../data/practiceSelection'
import { usePractice } from '../hooks/usePractice'
import type { RecommendationRef } from '../data/feedbackRules'

export function PracticeHub({
  profileId,
  sourceMissionId,
  onReturn,
  onDashboard,
  onNextMission,
  initialRecommendation,
}: {
  profileId: string
  sourceMissionId: number | null
  onReturn: () => void
  onDashboard: () => void
  onNextMission: () => void
  initialRecommendation?: RecommendationRef | null
}) {
  const practice = usePractice(profileId, initialRecommendation)
  const { active, record } = practice
  const heading = useRef<HTMLHeadingElement>(null)
  const plan = active ? getPracticePlan(active.conceptId) : null
  const success = record.submitted && record.selectedId === active?.correctId
  const next =
    plan && active
      ? plan.exercises[
          (plan.exercises.findIndex((item) => item.id === active.id) + 1) %
            plan.exercises.length
        ]
      : null
  function focusHeading() {
    requestAnimationFrame(() => heading.current?.focus())
  }
  function open(id: string) {
    practice.open(id)
    focusHeading()
  }
  return (
    <main className="mission-page practice-page page-enter">
      <button className="back-link" onClick={onReturn}>
        <ArrowLeft size={17} />{' '}
        {sourceMissionId ? 'Kembali ke refleksi' : 'Kembali ke dashboard'}
      </button>
      <header className="practice-heading">
        <span className="section-kicker">
          <BookOpen size={17} /> LATIHAN PILIHANMU
        </span>
        <h1>Latih konsep, langkah demi langkah</h1>
        <p>
          Pilih fokusmu dan coba situasi baru. Latihan bersifat opsional, tanpa
          tambahan XP atau badge.
        </p>
      </header>
      <p className="practice-summary" aria-label="Ringkasan latihan">
        {practice.uniqueCount} dari {practiceExercises.length} latihan pernah
        dikirim · {practice.lastCorrectCount} jawaban terakhir sesuai kunci.
      </p>
      <p className="guided-help">
        Pengulangan dihitung pada latihan yang sama. Catatan ini bukan ukuran
        penguasaan konsep.
      </p>
      <p className="draft-status">
        {practice.saved
          ? 'Latihan tersimpan di browser ini.'
          : 'Pilihan dan pengiriman jawaban disimpan saat kamu berinteraksi.'}
      </p>
      {(practice.error || practice.notice) && (
        <p className="storage-warning" role="alert">
          {practice.error || practice.notice}
        </p>
      )}
      {!active ? (
        <section aria-labelledby="practice-focus-title">
          <h2 id="practice-focus-title" ref={heading} tabIndex={-1}>
            Pilih fokus latihanmu
          </h2>
          <p className="practice-intro">
            Kamu bebas memilih konsep yang ingin dilatih. Setiap fokus berisi
            dua latihan.
          </p>
          <div className="practice-focus-grid">
            {practiceConcepts.map((concept) => {
              const exercises = getPracticePlan(concept.id).exercises
              return (
                <article
                  className="content-card practice-focus-card"
                  key={concept.id}
                >
                  <h3>{concept.title}</h3>
                  <p>{concept.description}</p>
                  <span className="practice-count">
                    {
                      exercises.filter(
                        (exercise) =>
                          (practice.records[exercise.id]?.submissions ?? 0) > 0,
                      ).length
                    }{' '}
                    dari {exercises.length} pernah dikirim
                  </span>
                  <button
                    className="secondary-button"
                    onClick={() => open(exercises[0].id)}
                  >
                    Latih {concept.title} <ArrowRight size={17} />
                  </button>
                </article>
              )
            })}
          </div>
        </section>
      ) : (
        <div className="guided-panel">
          <section
            className="content-card practice-exercise"
            aria-labelledby="practice-exercise-title"
          >
            <p className="practice-reason">
              {practice.recommendationOutcome?.reason ??
                (practice.staleRecommendation
                  ? 'Latihan umum; alasan rekomendasi sebelumnya tidak lagi digunakan.'
                  : plan!.reason)}
            </p>
            {practice.staleRecommendation && (
              <p className="guided-help">
                Jawaban atau konfirmasi sumber telah berubah atau tidak
                tersedia. Latihan ini tetap dapat dikerjakan; kamu boleh memilih
                fokus lain.
              </p>
            )}
            <h2 ref={heading} tabIndex={-1} id="practice-exercise-title">
              {active.title}
            </h2>
            <p className="practice-assumption">
              <strong>Kondisi soal:</strong> {active.assumption}
            </p>
            <form
              onSubmit={(event) => {
                event.preventDefault()
                practice.submit()
              }}
            >
              <fieldset disabled={success}>
                <legend>{active.question}</legend>
                <div className="answer-options">
                  {active.options.map((option, index) => (
                    <label
                      key={option.id}
                      className={`answer-option ${record.selectedId === option.id ? 'selected' : ''} ${success && record.selectedId === option.id ? 'correct' : ''}`}
                    >
                      <input
                        type="radio"
                        name="practice-answer"
                        value={option.id}
                        checked={record.selectedId === option.id}
                        onChange={() => practice.select(option.id)}
                      />
                      <span className="option-letter">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="option-text">{option.text}</span>
                      {record.selectedId === option.id && <Check size={17} />}
                    </label>
                  ))}
                </div>
              </fieldset>
              {record.submitted && (
                <div
                  role="status"
                  className={`feedback ${success ? 'success' : 'retry'}`}
                >
                  <strong>
                    {success
                      ? 'Jawabanmu sesuai kunci.'
                      : 'Coba periksa kembali.'}
                  </strong>
                  <p>{success ? active.explanation : active.hint}</p>
                  {!success && <p>Ubah pilihanmu untuk mencoba lagi.</p>}
                </div>
              )}
              {!success && (
                <button
                  type="submit"
                  className="primary-button submit-button"
                  disabled={!record.selectedId || record.submitted}
                >
                  Kirim jawaban latihan <ArrowRight size={17} />
                </button>
              )}
            </form>
            {record.submissions > 0 && (
              <p className="practice-attempts">
                {record.submissions} pengiriman untuk latihan ini.
                {record.firstSubmittedId
                  ? ` Jawaban pertama ${record.firstSubmittedId === active.correctId ? 'sesuai kunci' : 'belum sesuai kunci'}.`
                  : ''}
              </p>
            )}
            <div className="step-actions">
              {record.submitted && (
                <button
                  className="secondary-button"
                  onClick={() => {
                    practice.repeat()
                    focusHeading()
                  }}
                >
                  Ulangi latihan ini
                </button>
              )}
              <button
                className="secondary-button"
                onClick={() => open(next!.id)}
              >
                Coba latihan lain
              </button>
              <button
                className="secondary-button"
                onClick={() => {
                  practice.chooseFocus()
                  focusHeading()
                }}
              >
                Ganti fokus latihan
              </button>
            </div>
            <p className="reflection-note">
              <Leaf size={15} /> Kamu boleh berlatih lagi atau melanjutkan
              petualangan.
            </p>
          </section>
        </div>
      )}
      <div className="step-actions practice-exit">
        {sourceMissionId && (
          <button className="secondary-button" onClick={onReturn}>
            Kembali ke refleksi
          </button>
        )}
        <button className="secondary-button" onClick={onDashboard}>
          Ke dashboard misi
        </button>
        <button className="primary-button" onClick={onNextMission}>
          {sourceMissionId && sourceMissionId < 5
            ? 'Lanjut ke misi berikutnya'
            : 'Jelajahi misi'}{' '}
          <ArrowRight size={17} />
        </button>
      </div>
    </main>
  )
}
