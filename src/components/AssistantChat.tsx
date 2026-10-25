import { useCallback, useEffect, useRef, useState } from 'react'
import type { WorksheetData } from '../data/challengeWorksheet'
import './ChallengeWorksheet.css'
type Config = { enabled: boolean; siteKey?: string }
type Turnstile = {
  render: (el: HTMLElement, options: Record<string, unknown>) => string
  remove: (id: string) => void
  reset: (id: string) => void
}
declare global {
  interface Window {
    turnstile?: Turnstile
  }
}
// Kept beside the two consumers so the request/consent contract stays centralized.
// oxlint-disable-next-line react/only-export-components
export function useAIService() {
  const [config, setConfig] = useState<Config>({ enabled: false })
  const [token, setToken] = useState('')
  const widget = useRef<string | null>(null)
  const setWidget = useCallback((id: string | null) => {
    widget.current = id
  }, [])
  useEffect(() => {
    const abort = new AbortController()
    fetch('/api/ai', { signal: abort.signal })
      .then((r) => (r.ok ? r.json() : { enabled: false }))
      .then((v) =>
        setConfig({ enabled: v.enabled === true, siteKey: v.siteKey }),
      )
      .catch(() => {})
    return () => abort.abort()
  }, [])
  async function request(
    payload: Record<string, unknown>,
    signal: AbortSignal,
  ) {
    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, consent: true, token }),
      signal: AbortSignal.any([signal, AbortSignal.timeout(35000)]),
    })
    setToken('')
    if (widget.current && window.turnstile)
      window.turnstile.reset(widget.current)
    let body
    try {
      body = await response.json()
    } catch {
      throw new Error('Layanan AI belum tersedia. Data tetap tersimpan.')
    }
    if (!response.ok)
      throw new Error(body.error ?? 'Permintaan gagal. Coba lagi nanti.')
    // The same strict contracts used by the server are also checked on the client.
    const { reviewSchema, chatOutputSchema, missionReviewSchema } =
      await import('../data/aiContracts')
    const parsed = (
      payload.task === 'mission-review'
        ? missionReviewSchema
        : payload.task === 'review'
          ? reviewSchema
          : chatOutputSchema
    ).safeParse(body.result)
    if (!parsed.success)
      throw new Error(
        'Respons AI tidak valid dan tidak ditampilkan. Coba lagi.',
      )
    return parsed.data
  }
  return { config, token, setToken, setWidget, request }
}
export function AIConsent({
  service,
  consent,
  onConsent,
}: {
  service: ReturnType<typeof useAIService>
  consent: boolean
  onConsent: (value: boolean) => void
}) {
  const container = useRef<HTMLDivElement>(null)
  const {
    config: { enabled, siteKey },
    setToken,
    setWidget,
  } = service
  useEffect(() => {
    if (!consent || !enabled || !siteKey) return
    let canceled = false,
      id: string | undefined
    const render = () => {
      if (canceled || !container.current || !window.turnstile) return
      id = window.turnstile.render(container.current, {
        sitekey: siteKey,
        action: 'voltquest-ai',
        callback: setToken,
        'expired-callback': () => setToken(''),
        'error-callback': () => setToken(''),
      })
      setWidget(id)
    }
    if (window.turnstile) render()
    else {
      let script = document.querySelector<HTMLScriptElement>(
        'script[data-voltquest-turnstile]',
      )
      if (!script) {
        script = document.createElement('script')
        script.src =
          'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
        script.dataset.voltquestTurnstile = 'true'
        script.async = true
        document.head.append(script)
      }
      script.addEventListener('load', render, { once: true })
    }
    return () => {
      canceled = true
      if (id) window.turnstile?.remove(id)
      setWidget(null)
      setToken('')
    }
  }, [consent, enabled, siteKey, setToken, setWidget])
  if (!service.config.enabled)
    return (
      <p className="ai-status" role="status">
        Layanan tanya jawab belum tersedia saat ini.
      </p>
    )
  return (
    <div>
      <label className="ai-consent">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => onConsent(e.target.checked)}
        />
        Saya setuju pertanyaan atau catatan pembelajaran yang saya pilih dikirim
        ke layanan AI. Jangan sertakan nama, email, atau kata sandi. AI dapat
        keliru.
      </label>
      {consent && <div ref={container} />}
    </div>
  )
}
type Message = { role: 'user' | 'assistant'; text: string }
export function AssistantChat({
  profileId,
  topicId,
  worksheet,
}: {
  profileId: string
  topicId: number
  worksheet?: WorksheetData
}) {
  const key = `voltquest.chat.v1:${profileId}`
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(key) ?? '[]')
      return Array.isArray(raw)
        ? raw
            .filter(
              (m) =>
                ['user', 'assistant'].includes(m.role) &&
                typeof m.text === 'string',
            )
            .slice(-12)
        : []
    } catch {
      return []
    }
  })
  const [question, setQuestion] = useState(''),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false),
    [consent, setConsent] = useState(false),
    [include, setInclude] = useState(false)
  const ai = useAIService(),
    abort = useRef<AbortController | null>(null),
    generation = useRef(0),
    inFlight = useRef(false)
  useEffect(
    () => () => {
      generation.current++
      abort.current?.abort()
    },
    [],
  )
  function persist(next: Message[]) {
    const bounded = next.slice(-12)
    setMessages(bounded)
    try {
      localStorage.setItem(key, JSON.stringify(bounded))
    } catch {
      setError('Percakapan tidak dapat disimpan di browser ini.')
    }
  }
  async function send(event: React.FormEvent) {
    event.preventDefault()
    if (
      inFlight.current ||
      !question.trim() ||
      !consent ||
      !ai.config.enabled ||
      !ai.token
    )
      return
    inFlight.current = true
    setBusy(true)
    setError('')
    const version = ++generation.current
    abort.current = new AbortController()
    const text = question.trim()
    try {
      const result = (await ai.request(
        {
          task: 'chat',
          topicId,
          question: text,
          history: messages.slice(-6),
          ...(include && worksheet ? { data: worksheet } : {}),
        },
        abort.current.signal,
      )) as { answer: string; relatedTopicIds: number[] }
      if (version !== generation.current) return
      persist([
        ...messages,
        { role: 'user', text },
        { role: 'assistant', text: result.answer },
      ])
      setQuestion('')
    } catch (e) {
      if (version === generation.current)
        setError(
          e instanceof Error && e.name === 'AbortError'
            ? 'Permintaan dibatalkan.'
            : e instanceof Error
              ? e.message
              : 'Layanan gagal. Coba lagi.',
        )
    } finally {
      if (version === generation.current) {
        setBusy(false)
        inFlight.current = false
      }
    }
  }
  return (
    <details className="content-card ai-panel">
      <summary>Tanya VoltQuest</summary>
      <p>
        Teman diskusi Listrik Dinamis. Asisten membantu memahami konsep dan
        langkah, bukan memberikan kunci asesmen.
      </p>
      <AIConsent service={ai} consent={consent} onConsent={setConsent} />
      <div className="ai-examples">
        {[
          'Mengapa arus sama pada rangkaian seri?',
          'Bagaimana memasang voltmeter?',
          'Apa perbedaan daya dan energi?',
        ].map((text) => (
          <button
            className="secondary-button"
            key={text}
            onClick={() => setQuestion(text)}
          >
            {text}
          </button>
        ))}
      </div>
      <div className="ai-history" role="log" aria-label="Percakapan VoltQuest">
        {messages.map((m, i) => (
          <div className="ai-message" key={i}>
            <strong>{m.role === 'user' ? 'Kamu' : 'VoltQuest'}</strong>
            <p>{m.text}</p>
          </div>
        ))}
      </div>
      <form onSubmit={send}>
        <label className="guided-field">
          Pertanyaan tentang materi
          <textarea
            value={question}
            maxLength={1500}
            rows={3}
            onChange={(e) => setQuestion(e.target.value)}
          />
        </label>
        {worksheet && (
          <label className="ai-consent">
            <input
              type="checkbox"
              checked={include}
              onChange={(e) => setInclude(e.target.checked)}
            />
            Sertakan isian LKPD saat ini dalam pertanyaan ini.
          </label>
        )}
        <button
          className="primary-button"
          disabled={
            busy ||
            !consent ||
            !ai.config.enabled ||
            !ai.token ||
            !question.trim()
          }
        >
          Kirim pertanyaan
        </button>
        {busy && (
          <button
            type="button"
            className="secondary-button"
            onClick={() => abort.current?.abort()}
          >
            Batalkan
          </button>
        )}
        <p role="status">
          {busy ? 'VoltQuest sedang menyiapkan penjelasan…' : error}
        </p>
      </form>
      <button
        className="text-button"
        onClick={() => {
          generation.current++
          abort.current?.abort()
          inFlight.current = false
          setBusy(false)
          persist([])
          setError(
            'Salinan riwayat di aplikasi dihapus. Ini tidak menjamin penghapusan pada penyedia AI.',
          )
        }}
      >
        Percakapan baru / hapus riwayat
      </button>
      <p>
        Hanya pertanyaan dan enam pesan terakhir dikirim. Isian LKPD hanya
        disertakan jika kamu memilihnya.
      </p>
    </details>
  )
}
