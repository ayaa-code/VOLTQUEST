import { z } from 'zod'

export const summativeQuestions = [
  {
    id: 'wire',
    topicId: 3,
    question:
      'Dua kawat tembaga X dan Y memiliki panjang dan jari-jari L, r serta 2L, 2r. Keduanya diuji pada tegangan yang sama. Pernyataan yang benar adalah…',
    options: [
      'Hambatan kawat Y dua kali hambatan kawat X.',
      'Arus kawat Y dua kali arus kawat X.',
      'Daya kawat X dua kali daya kawat Y.',
      'Hambatan jenis kawat Y dua kali hambatan jenis kawat X.',
      'Kedua kawat menghasilkan kalor sama besar dalam waktu sama.',
    ],
    reminder:
      'Gunakan R = ρL/A dan A = πr², kemudian hubungkan hambatan dengan arus pada tegangan tetap.',
  },
  {
    id: 'loop',
    topicId: 5,
    question:
      'Pada rangkaian dua loop berikut, kedua sumber ideal berkutub positif di atas. E₁ = 18 V, E₂ = 12 V, R₁ = 3 Ω, R₂ = 6 Ω, dan R₃ = 6 Ω. Berapa besar arus pada R₃ di cabang tengah?',
    options: ['1,0 A', '1,5 A', '2,0 A', '2,5 A', '3,0 A'],
    reminder:
      'Ambil jalur bawah sebagai acuan potensial. Terapkan hukum arus Kirchhoff di simpul A, lalu gunakan beda potensial pada cabang tengah.',
  },
  {
    id: 'safety',
    topicId: 6,
    question:
      'Microwave 1100 W, teko 880 W, dan air fryer 1320 W digunakan bersama pada sumber 220 V dengan MCB 10 A. Dengan model daya nominal, pernyataan yang benar adalah…',
    options: [
      'Arus total masih di bawah batas MCB.',
      'Arus total 15 A melebihi batas MCB sehingga proteksi perlu memutus aliran.',
      'Semua alat lebih aman jika diseri.',
      'Hambatan total membuat arus turun di bawah 10 A.',
      'Tegangan tiap alat menjadi 73,3 V dan aman.',
    ],
    reminder:
      'Jumlahkan daya alat, gunakan I = Ptotal/V, lalu bandingkan dengan batas arus MCB. Waktu trip MCB nyata mengikuti karakteristik perangkat.',
  },
] as const

export const summativeEssays = [
  {
    id: 'lamps',
    topicId: 4,
    title: 'Penerangan kantor',
    question:
      'Kantor membutuhkan daya penerangan nominal total minimal 120 W. Bandingkan tiga lampu pijar identik 40 W/220 V yang dipasang paralel (opsi A) dan seri (opsi B) pada sumber 220 V. Hitung daya total, pilih opsi yang memenuhi kebutuhan, dan jelaskan keadaan lampu lain ketika satu lampu putus.',
    assumption:
      'Gunakan model hambatan lampu tetap pada nilai nominal. Lampu putus dimodelkan sebagai rangkaian terbuka. Daya listrik bukan pengukuran langsung tingkat pencahayaan ruangan.',
    rubric: [
      'Rumus, langkah hitung, serta satuan daya kedua susunan.',
      'Asumsi hambatan dan pembagian tegangan.',
      'Pemilihan susunan berdasarkan kebutuhan.',
      'Akibat satu lampu putus pada setiap susunan.',
    ],
  },
  {
    id: 'batteries',
    topicId: 5,
    title: 'Rancangan sumber kendaraan',
    question:
      'Rancang uraian solusi dua baterai identik 12 V untuk motor 24 V dan lampu indikator 12 V. Jelaskan sambungan sumber dan beban, cara memperoleh tegangan lampu yang sesuai, risiko hubungan singkat, serta fungsi dan posisi sekering.',
    assumption:
      'Ini analisis model rangkaian, bukan panduan merakit baterai kendaraan. Jika mengambil suplai dari satu baterai, pertimbangkan ketidakseimbangan pengosongan; solusi konverter DC–DC juga dapat dianalisis.',
    rubric: [
      'Susunan sumber dan tegangan motor.',
      'Suplai lampu dan alasan teknisnya.',
      'Risiko hubungan singkat serta ketidakseimbangan sumber.',
      'Fungsi dan posisi sekering terhadap arus berlebih.',
    ],
  },
] as const
export type EssayId = (typeof summativeEssays)[number]['id']
export const MAX_ESSAY_LENGTH = 6000
export type SummativeInput = {
  answers: Record<string, number>
  essays: Record<EssayId, string>
}
const essayFields = {
  lamps: z.string().trim().min(1).max(MAX_ESSAY_LENGTH),
  batteries: z.string().trim().min(1).max(MAX_ESSAY_LENGTH),
}
export const summativeInputSchema = z
  .object({
    answers: z
      .object({
        wire: z.number().int().min(0).max(4),
        loop: z.number().int().min(0).max(4),
        safety: z.number().int().min(0).max(4),
      })
      .strict(),
    essays: z.object(essayFields).strict(),
  })
  .strict()
const note = z.string().trim().min(1).max(1800)
export const essayReviewSchema = z
  .object({
    id: z.enum(['lamps', 'batteries']),
    status: z.enum(['perlu-revisi', 'perlu-ditinjau']),
    strengths: z.array(note).max(6),
    findings: z
      .array(z.object({ explanation: note, suggestion: note }).strict())
      .max(8),
    topicIds: z.array(z.number().int().min(1).max(6)).min(1).max(6),
  })
  .strict()
export const summativeReviewSchema = z
  .object({
    choices: z
      .array(
        z
          .object({
            id: z.enum(['wire', 'loop', 'safety']),
            correct: z.boolean(),
            feedback: note,
          })
          .strict(),
      )
      .length(3),
    correctCount: z.number().int().min(0).max(3),
    essays: z.array(essayReviewSchema).length(2),
  })
  .strict()
  .refine(
    (v) =>
      new Set(v.choices.map((q) => q.id)).size === 3 &&
      new Set(v.essays.map((e) => e.id)).size === 2 &&
      v.correctCount === v.choices.filter((q) => q.correct).length,
  )
export const summativeAIReviewSchema = z
  .object({ essays: z.array(essayReviewSchema).length(2), limitations: note })
  .strict()
  .refine((v) => new Set(v.essays.map((e) => e.id)).size === 2)
export type SummativeReview = z.infer<typeof summativeReviewSchema>
export type SummativeAIReview = z.infer<typeof summativeAIReviewSchema>
export const submissionSchema = z
  .object({
    id: z.string().min(1).max(100),
    at: z.number().finite(),
    input: summativeInputSchema,
    review: summativeReviewSchema,
    ai: summativeAIReviewSchema.optional(),
    aiAt: z.number().finite().optional(),
  })
  .strict()
export type SummativeSubmission = z.infer<typeof submissionSchema>
export type SummativeProgress = {
  answers: Record<string, number>
  essays: string[]
  essayAnswers?: Record<EssayId, string>
  submitted: boolean
  submission?: SummativeSubmission
  history?: SummativeSubmission[]
}
export function summativeDraft(saved: SummativeProgress): SummativeInput {
  return {
    answers: { ...saved.answers },
    essays: Object.fromEntries(
      summativeEssays.map((q, i) => [
        q.id,
        saved.essayAnswers?.[q.id] ?? saved.essays[i] ?? '',
      ]),
    ) as Record<EssayId, string>,
  }
}
export const summativeKey = (input: SummativeInput) =>
  JSON.stringify({
    answers: summativeQuestions.map((q) => input.answers[q.id] ?? null),
    essays: summativeEssays.map((q) => input.essays[q.id].trim()),
  })
export function summativeErrors(input: SummativeInput) {
  const errors: Record<string, string> = {}
  for (const q of summativeQuestions)
    if (
      !Number.isInteger(input.answers[q.id]) ||
      !q.options[input.answers[q.id]]
    )
      errors[q.id] = 'Pilih satu jawaban untuk soal ini.'
  for (const q of summativeEssays) {
    if (!input.essays[q.id]?.trim())
      errors[q.id] = 'Tuliskan jawaban uraianmu sebelum mengirim.'
    else if (input.essays[q.id].length > MAX_ESSAY_LENGTH)
      errors[q.id] = `Batasi jawaban hingga ${MAX_ESSAY_LENGTH} karakter.`
  }
  return errors
}
