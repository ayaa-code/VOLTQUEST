import { useEffect, useRef, useState } from 'react'
import { PhetLab } from './PhetLab'
import { AssistantChat, AIConsent, useAIService } from './AssistantChat'
import {
  emptyWorksheet,
  inspectWorksheet,
  snapshotOf,
  worksheetSections,
  displayNumber,
  tolerance,
  type WorksheetData,
  type WorksheetRecord,
  type AIReview,
} from '../data/challengeWorksheet'
import type { useDynamicLearning } from '../hooks/useDynamicLearning'
import './ChallengeWorksheet.css'
import {
  worksheetTemplateMode,
  worksheetTemplateHeadings,
} from '../data/worksheetTemplate'

export function ChallengeWorksheet({
  store,
  onBack,
  onSum,
  onMaterial,
}: {
  store: ReturnType<typeof useDynamicLearning>
  onBack: () => void
  onSum: () => void
  onMaterial: (id: number) => void
}) {
  const [data, setData] = useState<WorksheetData>(
    () => store.learning.worksheet?.data ?? emptyWorksheet(),
  )
  const [message, setMessage] = useState('')
  const [showChecks, setShowChecks] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [busy, setBusy] = useState(false)
  const [consent, setConsent] = useState(false)
  const ai = useAIService()
  const controller = useRef<AbortController | null>(null)
  const latest = useRef(data)
  const recordRef = useRef(store.learning.worksheet)
  useEffect(() => {
    latest.current = data
  }, [data])
  useEffect(() => {
    recordRef.current = store.learning.worksheet
  }, [store.learning.worksheet])
  const mounted = useRef(true)
  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
      controller.current?.abort()
    }
  }, [])
  const snapshot = snapshotOf(data),
    checks = inspectWorksheet(data)
  const saved = store.learning.worksheet
  const clean = saved?.snapshot === snapshot
  const feedback = saved?.feedback.at(-1)
  const change = (next: WorksheetData) => {
    setData(next)
    setConfirmed(false)
  }
  function save(): WorksheetRecord | null {
    const now = new Date().toISOString()
    const old = recordRef.current
    const record: WorksheetRecord = {
      data: structuredClone(data),
      snapshot,
      savedAt: now,
      completedAt: old?.completedAt,
      feedback: old?.feedback ?? [],
      history:
        old?.snapshot && old.snapshot !== snapshot
          ? [
              ...(old.history ?? []),
              { snapshot: old.snapshot, data: old.data, savedAt: old.savedAt },
            ].slice(-5)
          : (old?.history ?? []),
    }
    if (!store.saveWorksheet(record)) {
      setMessage(
        'Draf gagal disimpan. Ruang penyimpanan mungkin penuh; jangan tutup halaman.',
      )
      return null
    }
    recordRef.current = record
    setMessage('Draf berhasil disimpan di profil ini.')
    return record
  }
  async function review() {
    if (busy) return
    const record = save()
    setShowChecks(true)
    if (!record) return
    if (!checks.valid) {
      setMessage(
        'Draf tersimpan. Lengkapi atau perbaiki isian sebelum meminta feedback AI.',
      )
      return
    }
    if (!ai.config.enabled) {
      setMessage(
        'Draf tersimpan. Asisten AI belum diaktifkan. Gunakan pemeriksaan lokal di bawah.',
      )
      return
    }
    if (!consent || !ai.token) {
      setMessage(
        'Draf tersimpan. Berikan persetujuan dan selesaikan verifikasi sebelum meminta feedback AI.',
      )
      return
    }
    setBusy(true)
    controller.current = new AbortController()
    try {
      const result = (await ai.request(
        { task: 'review', data: record.data },
        controller.current.signal,
      )) as AIReview
      if (!mounted.current) return
      // A late result belongs to its original snapshot and never replaces newer data.
      if (
        snapshotOf(latest.current) !== record.snapshot ||
        recordRef.current?.snapshot !== record.snapshot
      ) {
        setMessage(
          'Data berubah selama peninjauan. Simpan revisi dan minta feedback lagi.',
        )
        return
      }
      const next = {
        ...recordRef.current!,
        feedback: [
          ...(recordRef.current!.feedback ?? []),
          { snapshot: record.snapshot, at: new Date().toISOString(), result },
        ].slice(-5),
      }
      if (store.saveWorksheet(next))
        setMessage('Feedback AI tersimpan untuk versi ini.')
      else setMessage('Feedback diterima tetapi gagal disimpan. Coba lagi.')
    } catch (error) {
      if (mounted.current)
        setMessage(
          error instanceof Error
            ? error.message
            : 'Peninjauan gagal. Data tetap tersimpan.',
        )
    } finally {
      if (mounted.current) setBusy(false)
    }
  }
  function complete() {
    if (!clean || !checks.valid || !data.visited || !confirmed || busy) return
    const reviewed = { ...saved!, reviewed: snapshot }
    if (!store.saveWorksheet(reviewed) || !store.completeWorksheet(snapshot)) {
      setMessage('Penyelesaian belum tersimpan. Coba lagi.')
      return
    }
    setMessage(
      'Challenge selesai. Data pengamatan dan analisismu sudah tersimpan.',
    )
  }
  return (
    <div className="worksheet">
      <section className="content-card">
        <span className="section-kicker">EKSPLORASI LISTRIK DINAMIS</span>
        <h1>Challenge</h1>
        <p>
          Bangun rangkaian, ukur, lalu hubungkan bukti dengan konsep. Isi data
          pengamatan secara manual; VoltQuest tidak membaca isi simulasi. Draf
          tidak menyimpan susunan rangkaian PhET.
        </p>
        <p>
          Catat besar tegangan dan arus DC nonnegatif dengan satuan pada judul
          kolom. Jangan hubungkan kutub baterai langsung tanpa beban. Gunakan
          sakelar untuk memutus rangkaian.
        </p>
      </section>
      <PhetLab
        startLabel="Mulai simulasi"
        visited={data.visited}
        onVisit={() => change({ ...latest.current, visited: true })}
      />
      {worksheetTemplateMode &&
        worksheetTemplateHeadings.map((title) => (
          <section
            className="content-card worksheet-section worksheet-template"
            key={title}
          >
            <h2>{title}</h2>
          </section>
        ))}
      {!worksheetTemplateMode &&
        worksheetSections.map((section, index) => (
          <section
            className="content-card worksheet-section"
            key={section.title}
          >
            <h2>{section.title}</h2>
            <p>{section.instruction}</p>
            {section.rows.length > 0 && (
              <div
                className="worksheet-table"
                role="table"
                aria-label={section.title}
              >
                {section.rows.map((row) => (
                  <div role="row" className="worksheet-row" key={row.title}>
                    <h3 role="rowheader">{row.title}</h3>
                    {row.fields.map((field) => (
                      <label
                        className="guided-field"
                        role="cell"
                        key={field.id}
                        htmlFor={field.id}
                      >
                        {field.label}
                        <input
                          id={field.id}
                          inputMode={field.numeric ? 'decimal' : 'text'}
                          maxLength={1200}
                          value={data.fields[field.id] ?? ''}
                          onChange={(e) =>
                            change({
                              ...data,
                              fields: {
                                ...data.fields,
                                [field.id]: e.target.value,
                              },
                            })
                          }
                          aria-invalid={
                            showChecks &&
                            checks.findings.some(
                              (f) => f.field === field.id && f.kind === 'error',
                            )
                          }
                        />
                      </label>
                    ))}
                    {row.derived && (
                      <output className="worksheet-derived" role="cell">
                        {row.derived === 'branch' ? (
                          <>
                            Jumlah arus cabang:{' '}
                            {displayNumber(checks.computed.branch)} A<br />
                            Selisih bertanda (masuk − jumlah cabang):{' '}
                            {displayNumber(checks.computed.difference)} A
                          </>
                        ) : row.derived === 'power' ? (
                          <>P = VI: {displayNumber(checks.computed.power)} W</>
                        ) : (
                          <>
                            R = V/I:{' '}
                            {displayNumber(checks.computed[row.derived])} Ω
                          </>
                        )}
                      </output>
                    )}
                  </div>
                ))}
              </div>
            )}
            {section.analysis.map((field) => (
              <label className="guided-field" key={field.id} htmlFor={field.id}>
                {field.label}
                {field.optional ? ' (opsional)' : ' *'}
                <textarea
                  id={field.id}
                  maxLength={1200}
                  rows={3}
                  value={data.fields[field.id] ?? ''}
                  onChange={(e) =>
                    change({
                      ...data,
                      fields: { ...data.fields, [field.id]: e.target.value },
                    })
                  }
                  aria-invalid={
                    showChecks &&
                    checks.findings.some(
                      (f) => f.field === field.id && f.kind === 'error',
                    )
                  }
                />
              </label>
            ))}
            {index < 4 && (
              <button
                className="text-button"
                onClick={() => onMaterial([1, 2, 4, 5][index])}
              >
                Kembali ke materi terkait
              </button>
            )}
          </section>
        ))}
      <section className="content-card">
        <h2>Simpan dan tinjau</h2>
        <p>
          {worksheetTemplateMode
            ? 'Template LKPD sedang disiapkan. Pertanyaan dan tabel akan ditambahkan.'
            : clean
              ? `Tersimpan: ${new Date(saved.savedAt).toLocaleString('id-ID')}`
              : 'Ada isian yang belum disimpan.'}
        </p>
        <div className="learning-actions">
          <button className="secondary-button" onClick={save}>
            Simpan draf
          </button>
          <button
            className="primary-button"
            disabled={busy || worksheetTemplateMode}
            onClick={review}
          >
            Simpan dan minta feedback
          </button>
          {busy && (
            <button
              className="text-button"
              onClick={() => controller.current?.abort()}
            >
              Batalkan peninjauan
            </button>
          )}
        </div>
        <p role="status">
          {busy ? 'Sedang meninjau hasil eksplorasimu…' : message}
        </p>
        {!worksheetTemplateMode && (
          <AIConsent service={ai} consent={consent} onConsent={setConsent} />
        )}
        {!worksheetTemplateMode && (showChecks || clean) && (
          <section aria-label="Pemeriksaan lokal">
            <h3>Pemeriksaan lokal — bukan feedback AI</h3>
            <p>
              Kedekatan teori: toleransi absolut {tolerance.absolute} pada
              satuan kolom + {tolerance.relative * 100}% relatif. Sesuaikan
              penafsiran dengan resolusi alat; temuan fisika merupakan saran
              tinjau, bukan nilai.
            </p>
            {!checks.findings.length && (
              <p>
                Isian wajib valid dan tidak ditemukan ketidaksesuaian numerik
                pada model ideal yang diperiksa. Kualitas penalaran belum
                dipastikan.
              </p>
            )}
            {checks.findings.map((finding, i) => (
              <p
                key={i}
                className={
                  finding.kind === 'error' ? 'error-note' : 'learning-summary'
                }
              >
                <strong>
                  {finding.kind === 'error'
                    ? 'Kesalahan isian/perhitungan'
                    : 'Temuan yang perlu ditinjau'}
                  :
                </strong>{' '}
                {finding.text}{' '}
                <button
                  className="text-button"
                  onClick={() => {
                    document.getElementById(finding.field)?.focus()
                    document
                      .getElementById(finding.field)
                      ?.scrollIntoView({ block: 'center', behavior: 'smooth' })
                  }}
                >
                  Perbaiki jawaban ({finding.field})
                </button>
              </p>
            ))}
          </section>
        )}
        {!worksheetTemplateMode && feedback && (
          <section aria-label="Feedback AI">
            <h3>Feedback AI</h3>
            <p>{new Date(feedback.at).toLocaleString('id-ID')}</p>
            {feedback.snapshot !== snapshot && (
              <p role="status">
                Data telah berubah. Feedback ini berasal dari versi sebelumnya.
              </p>
            )}
            <p>{feedback.result.summary}</p>
            <p>Cakupan: {feedback.result.coverage.join(', ')}</p>
            <ul>
              {feedback.result.strengths.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
            {feedback.result.findings.map((f, i) => (
              <div key={i}>
                <strong>
                  {f.field} · {f.kind}
                </strong>
                <p>{f.explanation}</p>
                <p>{f.suggestion}</p>
                <button
                  className="text-button"
                  onClick={() => document.getElementById(f.field)?.focus()}
                >
                  Perbaiki jawaban
                </button>
                <button
                  className="text-button"
                  onClick={() => onMaterial(f.topicId)}
                >
                  Pengingat konsep
                </button>
              </div>
            ))}
            <p>{feedback.result.limitations}</p>
            <p>
              Feedback AI membantu meninjau data dan penalaran yang kamu tulis.
              AI tidak melihat rangkaian PhET secara langsung dan dapat keliru.
            </p>
          </section>
        )}
        {!worksheetTemplateMode && (
          <label className="worksheet-confirm">
            <input
              type="checkbox"
              checked={confirmed}
              disabled={!clean || !checks.valid || !(showChecks || feedback)}
              onChange={(e) => setConfirmed(e.target.checked)}
            />{' '}
            Saya sudah meninjau data, analisis, dan saran perbaikan.
          </label>
        )}
        {!worksheetTemplateMode && !data.visited && (
          <p>Buka simulasi sebelum menyelesaikan Challenge.</p>
        )}
        <button
          className="primary-button"
          disabled={
            worksheetTemplateMode ||
            !clean ||
            !checks.valid ||
            !data.visited ||
            !confirmed ||
            busy
          }
          onClick={complete}
        >
          Selesaikan Challenge
        </button>
        {saved?.completedAt && (
          <div className="success-note">
            <p>
              Challenge selesai. Data pengamatan dan analisismu sudah tersimpan.
            </p>
            <button className="primary-button" onClick={onSum}>
              Kerjakan Asesmen Sumatif
            </button>
          </div>
        )}
        <button className="text-button" onClick={onBack}>
          Kembali ke dashboard
        </button>
        {Object.keys(store.learning.challengeDrafts).length > 0 && (
          <details>
            <summary>Catatan Challenge sebelumnya</summary>
            {Object.entries(store.learning.challengeDrafts).map(
              ([id, draft]) => (
                <section key={id}>
                  <h3>Challenge {id}</h3>
                  <p>{draft.observation}</p>
                  <p>{draft.reflection}</p>
                </section>
              ),
            )}
          </details>
        )}
        {saved?.history.length ? (
          <details>
            <summary>Riwayat revisi tersimpan ({saved.history.length})</summary>
            {saved.history.map((h, i) => (
              <details key={i}>
                <summary>{new Date(h.savedAt).toLocaleString('id-ID')}</summary>
                <dl>
                  {Object.entries(h.data.fields).map(([key, value]) => (
                    <div key={key}>
                      <dt>{key}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
              </details>
            ))}
          </details>
        ) : null}
      </section>
      <AssistantChat
        profileId={store.profileId!}
        topicId={1}
        worksheet={data}
      />
    </div>
  )
}
