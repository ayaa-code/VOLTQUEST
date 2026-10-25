import { experiments, parseMeasurement } from './experiments.ts'
import { explanationNeedsRevision } from './reflectionReview.ts'

export type MissionInput = {
  prediction: string
  predictionText: string
  predictionReason: string
  initialPrediction: { choice: string; reason: string; text?: string } | null
  observations: Record<string, string>
  comparison: string
  answer: number | null
  reflectionReason: string
}
export type ReportFinding = {
  kind: 'sesuai' | 'periksa' | 'informasi'
  text: string
  suggestion: string
}
export type MissionAIReview = {
  strengths: string[]
  findings: { explanation: string; suggestion: string; topicId: number }[]
  limitations: string
}
export type MissionReport = {
  id: string
  missionId: number
  number: number
  title: string
  name: string
  question: string
  answerText: string
  createdAt: number
  submittedAt: number
  input: MissionInput
  inputKey: string
  choiceCorrect: boolean
  status: 'selesai' | 'Perlu penguatan'
  findings: ReportFinding[]
  evidenceKey: string
  evidenceSignature: string
  ai?: MissionAIReview
  aiAt?: number
}
export function missionInput(draft: MissionInput): MissionInput {
  return {
    prediction: draft.prediction,
    predictionText: draft.predictionText,
    predictionReason: draft.predictionReason,
    initialPrediction: draft.initialPrediction,
    observations: Object.fromEntries(
      Object.entries(draft.observations).sort(([a], [b]) => a.localeCompare(b)),
    ),
    comparison: draft.comparison,
    answer: draft.answer,
    reflectionReason: draft.reflectionReason,
  }
}
export const missionInputKey = (draft: MissionInput) =>
  JSON.stringify(missionInput(draft))
export function inspectMission(
  id: number,
  input: MissionInput,
): ReportFinding[] {
  const results: ReportFinding[] = []
  const add = (kind: ReportFinding['kind'], text: string, suggestion: string) =>
    results.push({ kind, text, suggestion })
  const fields = experiments[id].groups.flatMap((g) => g.fields)
  const complete = fields.every((f) => (input.observations[f.id] ?? '').trim())
  add(
    complete ? 'sesuai' : 'informasi',
    complete
      ? 'Seluruh kolom pengamatan telah diisi.'
      : 'Ada catatan pengamatan yang belum lengkap.',
    'Pastikan setiap nilai berasal dari pembacaanmu sendiri, bukan nilai contoh.',
  )
  if (explanationNeedsRevision(input.reflectionReason))
    add(
      'periksa',
      'Penjelasan refleksi belum menunjukkan hubungan pengamatan dengan konsep.',
      'Jelaskan perubahan yang kamu amati, lalu hubungkan sebab-akibatnya dengan materi terkait.',
    )
  else
    add(
      'informasi',
      'Penjelasan tertulis tersedia; ketepatan maknanya belum dipastikan oleh pemeriksaan lokal.',
      'Rujuk kondisi percobaan dan bukti yang mendukung penjelasan, bukan hanya mengulang rumus.',
    )
  const n = (k: string) => parseMeasurement(input.observations[k] ?? '')
  if (id === 3) {
    const r = n('r')
    for (const condition of ['A', 'B']) {
      const v = n(`v${condition}`),
        i = n(`i${condition}`)
      if (r === null || v === null || i === null) {
        add(
          'informasi',
          `Kondisi ${condition}: hubungan V, I, dan R belum dapat diperiksa.`,
          'Lengkapi angka dan gunakan V, A, serta Ω.',
        )
        continue
      }
      const consistent =
        Math.abs(v - i * r) <= Math.max(0.02, Math.abs(v) * 0.05)
      add(
        consistent ? 'sesuai' : 'periksa',
        `Kondisi ${condition}: ${consistent ? 'V, I, dan R yang dicatat konsisten dalam toleransi pengukuran.' : 'V, I, dan R yang dicatat belum konsisten dengan V = IR pada resistor yang sama.'}`,
        'Periksa voltmeter paralel, amperemeter seri, konversi mA ke A, dan nilai resistor. Selisih pembulatan kecil dapat diterima.',
      )
    }
  }
  if (id === 4) {
    const t = n('duration')
    for (const condition of ['A', 'B']) {
      const v = n(`v${condition}`),
        i = n(`i${condition}`)
      if (v === null || i === null || t === null) continue
      const power = v * i,
        energy = power * t
      add(
        'sesuai',
        `Beban ${condition}: dari data tercatat, P = ${power.toLocaleString('id-ID', { maximumSignificantDigits: 6 })} W dan E = ${energy.toLocaleString('id-ID', { maximumSignificantDigits: 6 })} J.`,
        'Ini hasil perhitungan data yang kamu masukkan, bukan verifikasi alat ukur. Durasi adalah asumsi penggunaan, bukan waktu yang dibaca otomatis dari PhET.',
      )
    }
  }
  if (
    id === 1 &&
    (input.observations.open !== 'Padam' ||
      input.observations.closed !== 'Menyala')
  )
    add(
      'periksa',
      'Keadaan lampu yang dicatat perlu dibandingkan kembali dengan posisi sakelar dan sambungan.',
      'Ulangi kedua kondisi dengan rangkaian yang sama. Periksa kabel, sumber, lampu, dan kemungkinan jalur lain; perbedaan catatan belum membuktikan kamu salah menjalankan percobaan.',
    )
  if (id === 2)
    add(
      'informasi',
      'Dua susunan dan keadaan sebelum/sesudah pelepasan sudah dapat dibandingkan dari tabel.',
      'Telusuri jalur arus masing-masing susunan. Pastikan lampu, sumber dan sambungan awal sama sebelum membandingkan.',
    )
  if (id === 5)
    add(
      'informasi',
      'Catatan tiap sakelar dapat digunakan untuk meninjau kendali cabang.',
      'Cocokkan label ruang dengan kabel dan sakelar pada setiap cabang. Kendali mandiri saja belum membuktikan penghematan energi.',
    )
  add(
    'informasi',
    'Gambar dan aktivitas PhET belum diverifikasi otomatis.',
    'Screenshot menjadi bukti pendukung untuk guru; pemeriksaan lokal tidak menentukan apakah susunan pada gambar sudah benar.',
  )
  return results
}
export const missionTopics: Record<number, number> = {
  1: 1,
  2: 4,
  3: 2,
  4: 6,
  5: 5,
}
