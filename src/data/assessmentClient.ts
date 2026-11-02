import { summativeReviewSchema, type SummativeInput } from './summative'

export async function gradeSummative(
  input: SummativeInput,
  signal: AbortSignal,
) {
  const response = await fetch('/api/assessment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ kind: 'summative', input }),
    signal: AbortSignal.any([signal, AbortSignal.timeout(15000)]),
  })
  if (!response.ok)
    throw new Error(
      'Pemeriksaan belum berhasil. Draf tetap tersimpan di perangkat; coba kirim lagi.',
    )
  const body = await response.json()
  const parsed = summativeReviewSchema.safeParse(body.review)
  if (body.valid !== true || !parsed.success)
    throw new Error(
      'Hasil pemeriksaan tidak valid. Draf tetap tersimpan; coba lagi.',
    )
  return parsed.data
}

export async function gradeAnswer(
  kind: 'phet' | 'piko' | 'energy',
  id: number,
  answer: unknown,
) {
  const response = await fetch('/api/assessment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ kind, id, answer }),
    signal: AbortSignal.timeout(12000),
  })
  if (!response.ok)
    throw new Error(
      'Jawaban belum dapat diperiksa. Periksa koneksi dan coba lagi.',
    )
  const result = await response.json()
  if (result.valid !== true || typeof result.correct !== 'boolean')
    throw new Error('Isian belum valid.')
  return result as { valid: true; correct: boolean; explanation?: string }
}
