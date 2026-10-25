// Server-only answer keys. Return an explanation only after a correct submission.
function number(raw: unknown) {
  if (typeof raw !== 'string') return NaN
  let value = raw
    .trim()
    .replace(/\s/g, '')
    .replace(/(?:kwh|ohm|Ω|c|a|v)$/i, '')
  if (/^\d{1,3}(\.\d{3})+$/.test(value)) value = value.replace(/\./g, '')
  value = value.replace(',', '.')
  return /^\d+(?:\.\d+)?$/.test(value) ? Number(value) : NaN
}
export function gradeAssessment(body: unknown) {
  if (!body || typeof body !== 'object') return { valid: false, correct: false }
  const { kind, id, answer } = body as {
    kind: string
    id: number
    answer: unknown
  }
  if (!Number.isInteger(id)) return { valid: false, correct: false }
  if (
    kind === 'piko' &&
    [1, 2, 3].includes(id) &&
    typeof answer === 'string' &&
    /^[A-E]$/.test(answer)
  ) {
    const correct = answer === ['B', 'D', 'D'][id - 1]
    return {
      valid: true,
      correct,
      explanation: correct
        ? [
            'Q = It = 2,5 × 7.200 = 18.000 C.',
            'Semua pengukuran memiliki V/I = 20 Ω, sehingga komponen ohmik.',
            'Luas B seperempat A. R B = 2 ÷ (1/4) × 10 = 80 Ω.',
          ][id - 1]
        : undefined,
    }
  }
  if (
    kind === 'phet' &&
    [1, 2, 3, 4, 5].includes(id) &&
    Number.isInteger(answer) &&
    Number(answer) >= 0 &&
    Number(answer) < 4
  ) {
    const correct = answer === [1, 2, 3, 2, 1][id - 1]
    return {
      valid: true,
      correct,
      explanation: correct
        ? [
            'Baterai menyediakan beda potensial. Rangkaian tertutup memungkinkan arus mengalir.',
            'Cabang paralel bekerja mandiri saat cabang lain terputus.',
            'R = V/I = 12/2 = 6 Ω.',
            'Untuk waktu sama, daya lebih kecil memakai energi lebih sedikit.',
            'Sakelar pada setiap cabang memungkinkan tiap ruang dikendalikan mandiri.',
          ][id - 1]
        : undefined,
    }
  }
  if (kind === 'energy' && [1, 2, 3].includes(id) && Array.isArray(answer)) {
    const expected = [[1.5, 6, 1], [4.5], [153]][id - 1]
    if (
      answer.length !== (id === 2 ? 2 : expected.length) ||
      !expected.every((_, i) => Number.isFinite(number(answer[i]))) ||
      (id === 2 && !['masuk', 'keluar'].includes(answer[1]))
    )
      return { valid: false, correct: false }
    const correct =
      expected.every((n, i) => Math.abs(number(answer[i]) - n) < 0.001) &&
      (id !== 2 || answer[1] === 'keluar')
    return {
      valid: true,
      correct,
      explanation: correct
        ? [
            'R paralel = 4 Ω; R total = 8 Ω. Arus utama 1,5 A, tegangan R3 6 V, arus R1 1 A.',
            'Arus masuk 8 A, arus keluar diketahui 3,5 A. I5 = 4,5 A keluar.',
            'Energi harian: 1 + 0,5 + 3,6 = 5,1 kWh. Selama 30 hari: 153 kWh.',
          ][id - 1]
        : undefined,
    }
  }
  return { valid: false, correct: false }
}
