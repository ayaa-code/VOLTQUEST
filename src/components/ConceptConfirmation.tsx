import { ArrowRight, Check, MessageCircle } from 'lucide-react'
import type { useConceptFeedback } from '../hooks/useConceptFeedback'
import type { RecommendationRef } from '../data/feedbackRules'

export function ConceptConfirmation({
  controller,
  onRecommended,
}: {
  controller: ReturnType<typeof useConceptFeedback>
  onRecommended: (ref: RecommendationRef) => void
}) {
  const { config, active, outcome, recommendation } = controller
  return (
    <section className="concept-confirmation" aria-label="Konfirmasi alasan">
      {(controller.error || controller.notice) && (
        <p className="storage-warning" role="alert">
          {controller.error || controller.notice}
        </p>
      )}
      {config && active && (
        <>
          <span className="section-kicker">
            <MessageCircle size={16} /> TINJAU ALASANMU
          </span>
          <h3>Ingin memeriksa alasanmu?</h3>
          <p>
            Opsional, tanpa tambahan XP. Pilihan alasan membantu menentukan
            bantuan; tulisan bebasmu tidak dinilai.
          </p>
          <p className="confirmation-context">
            Jawaban refleksi yang dikirim:{' '}
            <strong>
              {
                config.answers.find((entry) => entry.id === active.answerId)
                  ?.label
              }
            </strong>
            .
          </p>
          <form
            onSubmit={(event) => {
              event.preventDefault()
              controller.confirm()
            }}
          >
            <fieldset>
              <legend>{config.question}</legend>
              <div className="answer-options">
                {config.options.map((option) => (
                  <label
                    key={option.id}
                    className={`answer-option ${active.draftResponseId === option.id ? 'selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="confirmation"
                      value={option.id}
                      checked={active.draftResponseId === option.id}
                      onChange={() => controller.choose(option.id)}
                    />
                    <span className="option-text">{option.label}</span>
                    {active.draftResponseId === option.id && (
                      <Check size={17} />
                    )}
                  </label>
                ))}
              </div>
            </fieldset>
            <button
              type="submit"
              className="secondary-button"
              disabled={
                !active.draftResponseId ||
                active.draftResponseId === active.responseId
              }
            >
              Lihat bantuan dari alasan
            </button>
          </form>
          {outcome && (
            <div
              className="confirmation-feedback"
              role="region"
              aria-label="Bantuan dari konfirmasi"
              aria-live="polite"
            >
              <strong>Tinjau hubungan yang kamu pilih</strong>
              <p>{outcome.feedback}</p>
              {recommendation && (
                <>
                  <p className="recommendation-reason">{outcome.reason}</p>
                  <button
                    className="primary-button"
                    onClick={() => onRecommended(recommendation)}
                  >
                    Coba latihan yang ditawarkan <ArrowRight size={17} />
                  </button>
                </>
              )}
            </div>
          )}
          <p className="draft-status">
            {controller.saved
              ? 'Konfirmasi tersimpan di browser ini.'
              : 'Respons konfirmasi disimpan saat kamu berinteraksi.'}
          </p>
          <p className="guided-help">
            Kamu boleh mencoba jawaban refleksi lagi atau melanjutkan tanpa
            menjawab konfirmasi. Bantuan ini bukan diagnosis kemampuan.
          </p>
        </>
      )}
    </section>
  )
}
