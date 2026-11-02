import { useEffect, useRef, useState } from 'react'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import type { useDynamicLearning } from '../hooks/useDynamicLearning'
import { AIConsent, useAIService } from './AssistantChat'
import { gradeSummative } from '../data/assessmentClient'
import {
  MAX_ESSAY_LENGTH,
  summativeDraft,
  summativeErrors,
  summativeKey,
  summativeQuestions,
  summativeEssays,
  summativeInputSchema,
  type SummativeInput,
  type SummativeSubmission,
  type SummativeAIReview,
} from '../data/summative'
import './SummativeAssessment.css'

function LoopDiagram() {
  return (
    <figure className="summative-circuit">
      <svg
        viewBox="0 0 520 255"
        role="img"
        aria-labelledby="sum-circuit-title sum-circuit-desc"
      >
        <title id="sum-circuit-title">
          Diagram dua loop dengan R₃ pada cabang tengah
        </title>
        <desc id="sum-circuit-desc">
          Jalur bawah adalah acuan nol volt. Cabang kiri: sumber 18 volt positif
          di atas lalu resistor R1 tiga ohm ke simpul A. Cabang kanan: sumber 12
          volt positif di atas lalu resistor R2 enam ohm ke A. R3 enam ohm
          menghubungkan A dengan jalur bawah.
        </desc>
        <g
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinejoin="round"
        >
          <path d="M70 100V45H140M200 45H260H320M380 45H450V100M70 145V215H450V145M260 45V90M260 145V215" />
          <path d="M140 33H200V57H140ZM320 33H380V57H320ZM248 90H272V145H248Z" />
          <path d="M47 110H93M57 132H83M427 110H473M437 132H463M70 100V110M70 132V145M450 100V110M450 132V145" />
        </g>
        <g fill="currentColor" fontSize="17" fontFamily="sans-serif">
          <text x="139" y="23">
            R₁ = 3 Ω
          </text>
          <text x="321" y="23">
            R₂ = 6 Ω
          </text>
          <text x="279" y="123">
            R₃ = 6 Ω
          </text>
          <text x="267" y="72">
            A
          </text>
          <text x="90" y="174">
            E₁ = 18 V
          </text>
          <text x="430" y="174" textAnchor="end">
            E₂ = 12 V
          </text>
          <text x="98" y="112">
            +
          </text>
          <text x="98" y="139">
            −
          </text>
          <text x="478" y="112">
            +
          </text>
          <text x="478" y="139">
            −
          </text>
          <text x="217" y="246">
            Acuan 0 V
          </text>
        </g>
        <circle cx="260" cy="45" r="5" fill="currentColor" />
      </svg>
      <figcaption>
        Dua loop dengan jalur bawah bersama. Kedua kutub positif sumber berada
        di sisi atas.
      </figcaption>
    </figure>
  )
}

export function SummativeAssessment({
  store,
  onBack,
  onReview,
}: {
  store: ReturnType<typeof useDynamicLearning>
  onBack: () => void
  onReview: (topicId: number) => void
}) {
  const [input, setInput] = useState(() =>
    summativeDraft(store.learning.summative),
  )
  const [saved, setSaved] = useState(!store.storageError)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [consent, setConsent] = useState(false)
  const [aiBusy, setAIBusy] = useState(false)
  const ai = useAIService()
  const form = useRef<HTMLFormElement>(null)
  const abort = useRef<AbortController | null>(null)
  const pending = useRef(false)
  const liveKey = useRef(summativeKey(input))
  const receipt = store.learning.summative.submission
  const key = summativeKey(input)
  const current = receipt && summativeKey(receipt.input) === key
  useEffect(
    () => () => {
      abort.current?.abort()
    },
    [],
  )

  function persist(next: SummativeInput) {
    liveKey.current = summativeKey(next)
    setInput(next)
    setSaved(store.saveSummativeDraft(next))
    setError('')
    setErrors({})
  }
  async function submit(event: React.FormEvent) {
    event.preventDefault()
    if (pending.current) return
    const invalid = summativeErrors(input)
    setErrors(invalid)
    if (Object.keys(invalid).length) {
      form.current
        ?.querySelector<HTMLElement>(
          `[data-question="${Object.keys(invalid)[0]}"] input, [data-question="${Object.keys(invalid)[0]}"] textarea`,
        )
        ?.focus()
      return
    }
    if (!store.saveSummativeDraft(input)) {
      setSaved(false)
      setError(
        'Jawaban belum tersimpan. Periksa ruang atau izin penyimpanan lalu coba lagi; isianmu tetap ada di halaman ini.',
      )
      return
    }
    setSaved(true)
    if (current) return
    pending.current = true
    setBusy(true)
    setError('')
    const version = key
    abort.current = new AbortController()
    try {
      const review = await gradeSummative(input, abort.current.signal)
      if (abort.current.signal.aborted || liveKey.current !== version) return
      const submission: SummativeSubmission = {
        id: crypto.randomUUID(),
        at: Date.now(),
        input: summativeInputSchema.parse(input),
        review,
      }
      if (!store.submitSummative(submission))
        throw new Error(
          'Hasil belum tersimpan. Draf jawaban tetap ada; coba kirim kembali.',
        )
    } catch (e) {
      if (!abort.current?.signal.aborted)
        setError(
          e instanceof Error
            ? e.message
            : 'Pengiriman belum berhasil. Coba lagi.',
        )
    } finally {
      pending.current = false
      if (!abort.current?.signal.aborted) setBusy(false)
    }
  }
  async function reviewAI() {
    if (
      pending.current ||
      !receipt ||
      !current ||
      !consent ||
      !ai.token ||
      !ai.config.enabled
    )
      return
    pending.current = true
    setAIBusy(true)
    setError('')
    const version = key
    abort.current = new AbortController()
    try {
      const result = (await ai.request(
        { task: 'summative-review', essays: receipt.input.essays },
        abort.current.signal,
      )) as SummativeAIReview
      if (abort.current.signal.aborted || liveKey.current !== version) return
      if (!store.saveSummativeAI(receipt.id, result))
        throw new Error(
          'Feedback AI belum tersimpan. Hasil pengiriman awal tetap tersedia; coba lagi.',
        )
    } catch (e) {
      if (!abort.current?.signal.aborted)
        setError(
          e instanceof Error
            ? e.message
            : 'Tinjauan AI belum berhasil; hasil awal tetap tersimpan.',
        )
    } finally {
      pending.current = false
      if (!abort.current?.signal.aborted) setAIBusy(false)
    }
  }

  return (
    <section className="content-card learning-detail summative-detail">
      <span className="section-kicker">ASESMEN SUMATIF</span>
      <h1>Listrik Dinamis</h1>
      <p>
        Jawab tiga pilihan ganda dan dua uraian. Setelah dikirim, lihat hasil
        pilihan ganda serta catatan perbaikan untuk masing-masing uraian.
      </p>
      <p className="summative-save" role="status">
        {!Object.keys(input.answers).length &&
        !Object.values(input.essays).some((text) => text.length)
          ? 'Jawabanmu akan tersimpan sebagai draf saat diisi.'
          : saved
            ? 'Draf tersimpan di perangkat ini.'
            : 'Draf belum tersimpan. Isian tetap ada di halaman ini.'}
      </p>
      {!saved && (
        <button
          type="button"
          className="secondary-button"
          onClick={() => setSaved(store.saveSummativeDraft(input))}
        >
          Coba simpan draf
        </button>
      )}
      {receipt && !current && (
        <p className="summative-notice" role="status">
          Jawaban telah berubah. Kirim ulang untuk memperbarui hasil; pengiriman
          sebelumnya tetap tersimpan.
        </p>
      )}
      {store.learning.summative.submitted && !receipt && (
        <p className="summative-notice">
          Penyelesaian versi sebelumnya tetap tercatat. Kirim jawaban lengkap
          untuk mendapatkan catatan pemeriksaan terbaru.
        </p>
      )}
      <form ref={form} onSubmit={submit} noValidate>
        {summativeQuestions.map((q, i) => {
          const result = current
            ? receipt.review.choices.find((c) => c.id === q.id)
            : undefined
          return (
            <fieldset
              key={q.id}
              data-question={q.id}
              disabled={busy || aiBusy}
              aria-describedby={errors[q.id] ? `error-${q.id}` : undefined}
            >
              <legend>
                {i + 1}. {q.question}
              </legend>
              {q.id === 'loop' && <LoopDiagram />}
              {q.options.map((option, index) => (
                <label className="answer-option" key={option}>
                  <input
                    type="radio"
                    name={q.id}
                    checked={input.answers[q.id] === index}
                    aria-invalid={!!errors[q.id]}
                    onChange={() =>
                      persist({
                        ...input,
                        answers: { ...input.answers, [q.id]: index },
                      })
                    }
                  />
                  <span>
                    {String.fromCharCode(65 + index)}. {option}
                  </span>
                </label>
              ))}
              {errors[q.id] && (
                <p
                  className="summative-error"
                  id={`error-${q.id}`}
                  role="alert"
                >
                  {errors[q.id]}
                </p>
              )}
              {result && (
                <div
                  className={`summative-feedback ${result.correct ? 'is-correct' : ''}`}
                >
                  <strong>
                    {result.correct
                      ? 'Jawaban tepat.'
                      : 'Belum tepat, mari revisi.'}
                  </strong>
                  <p>{result.feedback}</p>
                  {!result.correct && (
                    <button
                      type="button"
                      className="text-button"
                      onClick={() => onReview(q.topicId)}
                    >
                      Pelajari kembali materi <ArrowRight size={16} />
                    </button>
                  )}
                </div>
              )}
            </fieldset>
          )
        })}
        {summativeEssays.map((q, i) => (
          <div className="summative-essay" key={q.id} data-question={q.id}>
            <label className="guided-field" htmlFor={`essay-${q.id}`}>
              Uraian {i + 4}. {q.question}
            </label>
            <p className="summative-assumption" id={`assumption-${q.id}`}>
              {q.assumption}
            </p>
            <textarea
              id={`essay-${q.id}`}
              rows={7}
              maxLength={MAX_ESSAY_LENGTH}
              disabled={busy || aiBusy}
              value={input.essays[q.id]}
              aria-invalid={!!errors[q.id]}
              aria-describedby={`assumption-${q.id} limit-${q.id}${errors[q.id] ? ` error-${q.id}` : ''}`}
              placeholder="Tulis langkah, alasan, dan satuan yang relevan."
              onChange={(e) =>
                persist({
                  ...input,
                  essays: { ...input.essays, [q.id]: e.target.value },
                })
              }
            />
            <small id={`limit-${q.id}`}>
              Maksimal {MAX_ESSAY_LENGTH.toLocaleString('id-ID')} karakter.
            </small>
            {errors[q.id] && (
              <p className="summative-error" id={`error-${q.id}`} role="alert">
                {errors[q.id]}
              </p>
            )}
            <details className="summative-rubric">
              <summary>Aspek yang ditinjau</summary>
              <ul>
                {q.rubric.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </details>
          </div>
        ))}
        <button
          className="primary-button"
          type="submit"
          disabled={busy || aiBusy}
        >
          {busy
            ? 'Mengirim dan memeriksa…'
            : current
              ? 'Jawaban ini sudah dikirim'
              : 'Kirim asesmen sumatif'}{' '}
          <ArrowRight size={17} />
        </button>
      </form>
      {error && (
        <p className="summative-error" role="alert">
          {error}
        </p>
      )}
      {current && (
        <section
          className="summative-results"
          aria-label="Hasil asesmen sumatif"
          aria-live="polite"
        >
          <h2>
            <CheckCircle2 size={22} /> Asesmen tersimpan di perangkat ini
          </h2>
          <p>
            Dikirim {new Date(receipt.at).toLocaleString('id-ID')}. Pilihan
            ganda: <strong>{receipt.review.correctCount} dari 3 tepat</strong>.
          </p>
          <p>
            Uraian mendapat catatan berbasis aturan dan rubrik. Nilai uraian
            serta nilai akhir belum ditetapkan; mintalah peninjauan guru.
          </p>
          {summativeEssays.map((q) => {
            const local = receipt.review.essays.find((r) => r.id === q.id)!
            const aiResult = receipt.ai?.essays.find((r) => r.id === q.id)
            return (
              <article
                className="summative-feedback"
                key={q.id}
                aria-label={`Feedback ${q.title}`}
              >
                <h3>
                  {q.title} —{' '}
                  {local.status === 'perlu-revisi'
                    ? 'Perlu diperbaiki'
                    : 'Perlu ditinjau'}
                </h3>
                <strong>Pemeriksaan berbasis aturan</strong>
                {local.strengths.length > 0 && (
                  <ul>
                    {local.strengths.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                )}
                {local.findings.map((f, i) => (
                  <div key={i}>
                    <p>{f.explanation}</p>
                    <p>
                      <strong>Langkah perbaikan:</strong> {f.suggestion}
                    </p>
                  </div>
                ))}
                {aiResult && (
                  <div className="summative-ai-review">
                    <strong>
                      Tinjauan AI —{' '}
                      {aiResult.status === 'perlu-revisi'
                        ? 'Perlu diperbaiki'
                        : 'Perlu ditinjau guru'}
                    </strong>
                    <ul>
                      {aiResult.strengths.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                    {aiResult.findings.map((f, i) => (
                      <p key={i}>
                        {f.explanation} {f.suggestion}
                      </p>
                    ))}
                  </div>
                )}
                <button
                  type="button"
                  className="text-button"
                  onClick={() => onReview(q.topicId)}
                >
                  Pelajari kembali materi <ArrowRight size={16} />
                </button>
                <button
                  type="button"
                  className="secondary-button"
                  disabled={aiBusy}
                  onClick={() => {
                    const el = document.getElementById(`essay-${q.id}`)
                    el?.focus()
                    el?.scrollIntoView({ block: 'center', behavior: 'smooth' })
                  }}
                >
                  Perbaiki uraian
                </button>
              </article>
            )
          })}
          {ai.config.enabled ? (
            <div className="summative-ai">
              <h3>Tinjau penjelasan dengan AI</h3>
              <AIConsent
                service={ai}
                consent={consent}
                onConsent={setConsent}
              />
              <button
                className="secondary-button"
                disabled={aiBusy || !consent || !ai.token}
                onClick={() => void reviewAI()}
              >
                {aiBusy ? 'Meninjau uraian…' : 'Tinjau uraian dengan AI'}
              </button>
            </div>
          ) : (
            <p>
              Tinjauan AI belum tersedia. Catatan berbasis aturan dan jawabanmu
              tetap tersimpan untuk ditinjau bersama guru.
            </p>
          )}
          {receipt.ai && <p>{receipt.ai.limitations}</p>}
        </section>
      )}
      {(store.learning.summative.history?.length ?? 0) > 0 && (
        <details className="summative-history">
          <summary>Riwayat pengiriman</summary>
          {[...(store.learning.summative.history ?? [])].reverse().map((s) => (
            <div key={s.id}>
              <p>
                {new Date(s.at).toLocaleString('id-ID')} · Pilihan ganda{' '}
                {s.review.correctCount}/3
              </p>
              {summativeEssays.map((q) => (
                <details key={q.id}>
                  <summary>{q.title}</summary>
                  <p className="summative-snapshot">{s.input.essays[q.id]}</p>
                </details>
              ))}
            </div>
          ))}
        </details>
      )}
      <button type="button" className="text-button" onClick={onBack}>
        Kembali ke progres
      </button>
    </section>
  )
}
