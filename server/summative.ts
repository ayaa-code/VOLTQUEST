import {
  summativeInputSchema,
  summativeQuestions,
  summativeEssays,
  type SummativeReview,
  type SummativeInput,
} from '../src/data/summative.ts'
import { explanationNeedsRevision } from '../src/data/reflectionReview.ts'

// Derived from the supplied assessment's nodal equation and rubric. Keys stay on the server.
const keys = { wire: 1, loop: 2, safety: 1 }
const explanations = {
  wire: 'Pada bahan sama, RY = 0,5 RX. Tegangan sama membuat IY = 2 IX.',
  loop: 'Persamaan simpul (VA − 18)/3 + VA/6 + (VA − 12)/6 = 0 menghasilkan VA = 12 V. Arus cabang tengah 2,0 A.',
  safety:
    'Total daya nominal 3.300 W memerlukan arus 15 A pada 220 V, melebihi batas 10 A. Waktu trip mengikuti karakteristik MCB.',
}
function powerNear(text: string, label: string) {
  const part = text.match(
    new RegExp(`\\b${label}\\b([^;\\n]{0,100})`, 'i'),
  )?.[1]
  const value = part?.match(/(\d+(?:[.,]\d+)?)\s*(kW|W|watt)\b/i)
  return value
    ? Number(value[1].replace(',', '.')) * (/^kw$/i.test(value[2]) ? 1000 : 1)
    : null
}
export function inspectSummativeEssays(
  essays: SummativeInput['essays'],
): SummativeReview['essays'] {
  return summativeEssays.map((q) => {
    const value = essays[q.id].trim(),
      strengths: string[] = [],
      findings: { explanation: string; suggestion: string }[] = []
    const add = (explanation: string, suggestion: string) =>
      findings.push({ explanation, suggestion })
    let needsRevision = explanationNeedsRevision(value)
    if (needsRevision) {
      add(
        'Jawaban belum menjelaskan hubungan konsep dengan kasus yang ditanyakan.',
        'Mulai dari kondisi sumber dan beban, lalu tulis rumus atau hubungan sebab-akibat yang kamu pahami.',
      )
    } else {
      if (q.id === 'lamps') {
        for (const [label, expected] of [
          ['paralel', 120],
          ['seri', 220 ** 2 / (3 * (220 ** 2 / 40))],
        ] as const) {
          const power = powerNear(value, label)
          if (power === null)
            add(
              `Daya total ${label} belum dapat dikenali dari angka bersatuan W/kW pada jawaban.`,
              'Tuliskan hasil untuk masing-masing susunan dengan label dan satuan; tunjukkan hubungan P, V, dan R.',
            )
          else if (
            Math.abs(power - expected) > Math.max(0.08, expected * 0.005)
          ) {
            needsRevision = true
            add(
              `Angka daya ${label} yang terbaca belum sesuai model hambatan nominal tetap.`,
              'Hitung hambatan satu lampu dari label nominal, tentukan hambatan pengganti, lalu periksa P = V²/Rtotal.',
            )
          } else
            strengths.push(
              `Angka daya ${label} yang terbaca konsisten dengan model hambatan nominal tetap; langkah penalarannya tetap perlu ditinjau.`,
            )
        }
        if (!/putus|rusak|padam|menyala/i.test(value))
          add(
            'Akibat kerusakan satu lampu belum dibahas secara jelas.',
            'Bandingkan lintasan arus saat satu lampu putus pada kedua susunan.',
          )
        if (!/tetap|nominal|asumsi/i.test(value))
          add(
            'Asumsi model lampu belum dinyatakan.',
            'Jelaskan bahwa perhitungan memakai hambatan nominal tetap; lampu pijar nyata bersifat non-ohmik.',
          )
      } else {
        if (!/seri/i.test(value) || !/24\s*(v|volt)/i.test(value))
          add(
            'Hubungan susunan baterai dengan kebutuhan motor belum cukup jelas untuk ditinjau.',
            'Jelaskan sambungan kutub sumber dan tegangan pada kedua ujung motor.',
          )
        if (
          !/konverter|converter|dc.?dc|salah satu baterai|satu baterai|titik tengah/i.test(
            value,
          )
        )
          add(
            'Cara memperoleh suplai lampu belum dijelaskan secara spesifik.',
            'Jelaskan jalur suplai lampu dan bagaimana tegangan kerjanya dipertahankan.',
          )
        if (
          /salah satu baterai|satu baterai|titik tengah/i.test(value) &&
          !/seimbang|pengosongan/i.test(value)
        )
          add(
            'Pengambilan suplai dari sebagian sumber memerlukan evaluasi tambahan.',
            'Tinjau pengosongan dan keseimbangan kedua baterai jika beban tidak sama.',
          )
        if (!/korslet|korsleting|hubungan singkat|short.?circuit/i.test(value))
          add(
            'Risiko hubungan singkat belum dijelaskan.',
            'Hubungkan jalur berhambatan sangat kecil dengan arus berlebih dan pemanasan.',
          )
        if (
          !/sekring|sekering|fuse/i.test(value) ||
          !/memutus|putus|leleh/i.test(value)
        )
          add(
            'Mekanisme proteksi sekering belum cukup dijelaskan.',
            'Uraikan fungsi sekering dan posisinya terhadap jalur arus utama.',
          )
      }
      if (!findings.length)
        strengths.push(
          'Aspek utama rubrik telah disebut dalam tulisan. Kesesuaian argumen dan sambungan masih memerlukan tinjauan makna.',
        )
    }
    return {
      id: q.id,
      // Unrecognized wording is a review request, not evidence of incorrectness.
      status: needsRevision ? 'perlu-revisi' : 'perlu-ditinjau',
      strengths,
      findings,
      topicIds: q.id === 'lamps' ? [4, 6] : [5, 6],
    }
  })
}
export function gradeSummative(raw: unknown) {
  const parsed = summativeInputSchema.safeParse(raw)
  if (!parsed.success) return { valid: false as const }
  const input = parsed.data
  const choices = summativeQuestions.map((q) => ({
    id: q.id,
    correct: input.answers[q.id] === keys[q.id],
    feedback:
      input.answers[q.id] === keys[q.id] ? explanations[q.id] : q.reminder,
  }))
  return {
    valid: true as const,
    review: {
      choices,
      correctCount: choices.filter((q) => q.correct).length,
      essays: inspectSummativeEssays(input.essays),
    },
  }
}
