import { useEffect, useRef, useState } from 'react'
import type { MissionReport, MissionAIReview } from '../data/missionReport'
import { missionTopics } from '../data/missionReport'
import { experiments } from '../data/experiments'
import { evidenceStorage } from '../data/evidenceStorage'
import { AIConsent, useAIService } from './AssistantChat'

async function pdfImage(blob: Blob) {
  if (blob.type !== 'image/webp') return blob
  const image = new Image(),
    url = URL.createObjectURL(blob)
  try {
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve()
      image.onerror = () => reject(new Error('Bukti belum dapat dibaca.'))
      image.src = url
    })
    const canvas = document.createElement('canvas')
    canvas.width = image.naturalWidth
    canvas.height = image.naturalHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Konversi bukti gagal.')
    ctx.drawImage(image, 0, 0)
    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('Konversi bukti gagal.'))),
        'image/png',
      ),
    )
  } finally {
    URL.revokeObjectURL(url)
  }
}
export function MissionReportView({
  report,
  stale,
  onEdit,
  onNext,
  onAI,
}: {
  report: MissionReport
  stale: boolean
  onEdit: () => void
  onNext: () => void
  onAI: (review: MissionAIReview) => boolean
}) {
  const [image, setImage] = useState<Blob>(),
    [imageError, setImageError] = useState(''),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false),
    [consent, setConsent] = useState(false)
  const preview = useRef<HTMLImageElement>(null),
    abort = useRef<AbortController | null>(null),
    ai = useAIService()
  useEffect(() => {
    let active = true
    if (report.evidenceKey)
      evidenceStorage(report.evidenceKey, 'read')
        .then((b) => {
          if (active) {
            if (!b) setImageError('Bukti laporan belum dapat dimuat.')
            else setImage(b)
          }
        })
        .catch(() => {
          if (active) setImageError('Bukti laporan belum dapat dimuat.')
        })
    return () => {
      active = false
      abort.current?.abort()
    }
  }, [report.evidenceKey])
  useEffect(() => {
    if (!image || !preview.current) return
    const url = URL.createObjectURL(image)
    preview.current.src = url
    return () => URL.revokeObjectURL(url)
  }, [image])
  async function download() {
    if (busy) return
    setBusy(true)
    setError('')
    try {
      if (report.evidenceKey && !image)
        throw new Error(
          'Bukti laporan belum dimuat. Buka kembali laporan dan coba lagi.',
        )
      const font = await fetch('/fonts/NotoSans-Regular.ttf', {
        signal: AbortSignal.timeout(20000),
      })
      if (!font.ok)
        throw new Error(
          'Font laporan belum dapat dimuat. Periksa koneksi dan coba lagi.',
        )
      const { createReportPdf } = await import('../data/reportPdf')
      const bytes = await createReportPdf(
        report,
        await font.arrayBuffer(),
        image ? await pdfImage(image) : undefined,
      )
      const url = URL.createObjectURL(
          new Blob([new Uint8Array(bytes)], { type: 'application/pdf' }),
        ),
        link = document.createElement('a')
      link.href = url
      link.download = `VoltQuest_${report.title.replace(/[^\p{L}\p{N}]+/gu, '-')}_${report.name.replace(/[^\p{L}\p{N}]+/gu, '-')}.pdf`
      link.click()
      setTimeout(() => URL.revokeObjectURL(url), 30000)
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'PDF belum dapat dibuat. Coba lagi.',
      )
    } finally {
      setBusy(false)
    }
  }
  async function review() {
    if (busy || !consent || !ai.token || !ai.config.enabled || stale) return
    setBusy(true)
    setError('')
    abort.current = new AbortController()
    try {
      const result = (await ai.request(
        {
          task: 'mission-review',
          missionId: report.missionId,
          snapshot: report.input,
        },
        abort.current.signal,
      )) as MissionAIReview
      if (abort.current.signal.aborted) return
      if (!onAI(result))
        throw new Error('Pembahasan belum tersimpan. Coba lagi.')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Pembahasan AI belum tersedia.')
    } finally {
      setBusy(false)
    }
  }
  const input = report.input
  return (
    <section
      className="content-card mission-report"
      aria-label="Laporan Eksperimen"
    >
      <span className="section-kicker">
        MISSION {String(report.number).padStart(2, '0')}
      </span>
      <h1 tabIndex={-1}>Laporan Eksperimen</h1>
      <h2>{report.title}</h2>
      <p>
        {report.name} · Dikirim{' '}
        {new Date(report.submittedAt).toLocaleString('id-ID')} · {report.status}
      </p>
      {report.createdAt !== report.submittedAt && (
        <p>
          Pengiriman awal: {new Date(report.createdAt).toLocaleString('id-ID')}
        </p>
      )}
      {stale && (
        <p role="status">
          Laporan ini belum diperbarui setelah perubahan isian atau bukti. PDF
          tetap menggunakan versi tersimpan di bawah.
        </p>
      )}
      <h2>Prediksi dan alasan</h2>
      <dl>
        <div>
          <dt>Prediksi awal</dt>
          <dd>
            {input.initialPrediction?.choice === 'Prediksi lain'
              ? input.initialPrediction.text
              : input.initialPrediction?.choice || input.prediction}
          </dd>
        </div>
        <div>
          <dt>Alasan awal</dt>
          <dd>{input.initialPrediction?.reason || input.predictionReason}</dd>
        </div>
        <div>
          <dt>Prediksi yang dikirim</dt>
          <dd>
            {input.prediction === 'Prediksi lain'
              ? input.predictionText
              : input.prediction}
          </dd>
        </div>
        <div>
          <dt>Alasan</dt>
          <dd>{input.predictionReason}</dd>
        </div>
      </dl>
      <h2>Data pengamatan</h2>
      <dl>
        {experiments[report.missionId].groups
          .flatMap((g) => g.fields)
          .map((f) => (
            <div key={f.id}>
              <dt>{f.label}</dt>
              <dd>{input.observations[f.id]}</dd>
            </div>
          ))}
      </dl>
      <p>Perbandingan dengan prediksi: {input.comparison}</p>
      <h2>Bukti rangkaian</h2>
      {image ? (
        <img
          ref={preview}
          alt="Screenshot rangkaian pada saat laporan dikirim"
        />
      ) : (
        <p>
          {report.evidenceKey
            ? imageError || 'Memuat bukti laporan…'
            : 'Tidak ada screenshot yang disertakan. Ketiadaan gambar tidak otomatis berarti percobaan salah.'}
        </p>
      )}
      <h2>Refleksi</h2>
      <p>{report.question}</p>
      <p>
        Pilihan:{' '}
        {input.answer === null ? '' : String.fromCharCode(65 + input.answer)} —{' '}
        {report.answerText}. Hasil pilihan:{' '}
        {report.choiceCorrect ? 'tepat' : 'perlu revisi'}.
      </p>
      <p>{input.reflectionReason}</p>
      <h2>Pembahasan dan arahan perbaikan</h2>
      {(['sesuai', 'periksa', 'informasi'] as const).map((kind) => (
        <div key={kind}>
          <h3>
            {kind === 'sesuai'
              ? 'Yang sudah sesuai'
              : kind === 'periksa'
                ? 'Temuan yang perlu diperiksa'
                : 'Bukti dan batas pemeriksaan'}
          </h3>
          <ul>
            {report.findings
              .filter((f) => f.kind === kind)
              .map((f, i) => (
                <li key={i}>
                  {f.text}
                  <p>{f.suggestion}</p>
                </li>
              ))}
          </ul>
        </div>
      ))}
      <p>
        Materi untuk dikuatkan:{' '}
        {
          [
            '',
            'Arus Listrik',
            'Hambatan Ohmik dan Non-Ohmik',
            '',
            'Rangkaian Seri–Paralel',
            'Kirchhoff dan penerapan rangkaian',
            'Daya Listrik',
          ][missionTopics[report.missionId]]
        }
        . Gunakan temuan di atas untuk menentukan bagian yang perlu dipelajari
        kembali.
      </p>
      <h2>Pembahasan AI</h2>
      {report.ai ? (
        <>
          <ul>
            {report.ai.strengths.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
            {report.ai.findings.map((f, i) => (
              <li key={i}>
                {f.explanation}
                <p>{f.suggestion}</p>
              </li>
            ))}
          </ul>
          <p>{report.ai.limitations}</p>
        </>
      ) : (
        <p>
          Pembahasan AI belum tersedia. Pemeriksaan lokal tidak memastikan makna
          penjelasan atau aktivitas PhET; screenshot belum dianalisis otomatis.
        </p>
      )}
      {ai.config.enabled && (
        <>
          <AIConsent service={ai} consent={consent} onConsent={setConsent} />
          <button
            type="button"
            className="secondary-button"
            disabled={busy || !consent || !ai.token || stale}
            onClick={() => void review()}
          >
            Tinjau dengan AI
          </button>
        </>
      )}
      {error && <p role="alert">{error}</p>}
      <div className="report-actions">
        <button
          className="primary-button"
          disabled={busy || !!imageError}
          onClick={() => void download()}
        >
          {busy ? 'Menyiapkan…' : 'Unduh Laporan Eksperimen'}
        </button>
        <button className="secondary-button" onClick={onEdit}>
          Perbaiki Jawaban
        </button>
        <button className="text-button" onClick={onNext}>
          Lanjut ke tahap berikutnya
        </button>
      </div>
    </section>
  )
}
