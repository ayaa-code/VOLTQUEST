import type { ProfileLearning } from '../hooks/useDynamicLearning'
export type CheckpointProgress = {
  solved: number[]
  answers: Record<string, string[]>
  attempts: number
  complete: boolean
}
export const checkpointDone = (learning: ProfileLearning, id: number) =>
  Boolean(learning.checkpoints?.[id]?.complete) ||
  (id === 1 ? [1, 2, 3] : [4, 5, 6]).every((n) => learning.quizzes[n]?.complete)
export function numericAnswer(raw: string) {
  let value = raw
    .trim()
    .replace(/\s/g, '')
    .replace(/(?:kwh|ohm|Ω|c|a|v)$/i, '')
  if (/^\d{1,3}(\.\d{3})+$/.test(value)) value = value.replace(/\./g, '')
  value = value.replace(',', '.')
  return value !== '' && /^\d+(?:\.\d+)?$/.test(value) ? Number(value) : NaN
}
export const energyMissions = [
  {
    title: 'Series and Parallel Analyzer',
    topic: 4,
    prompt:
      'R1 = 6 Ω dan R2 = 12 Ω dipasang paralel, kemudian diserikan dengan R3 = 4 Ω pada sumber 12 V.',
    labels: ['Arus utama (A)', 'Tegangan R3 (V)', 'Arus R1 (A)'],
    reminder:
      'Hitung hambatan pengganti paralel, lalu jumlahkan dengan hambatan seri. Gunakan V = IR.',
  },
  {
    title: 'Junction Balance',
    topic: 5,
    prompt:
      'Arus masuk I1 = 3 A dan I2 = 5 A. Arus keluar I3 = 2 A, I4 = 1,5 A, dan I5. Tentukan besar dan arah I5.',
    labels: ['Arus I5 (A)'],
    reminder:
      'Pada titik percabangan, jumlah arus masuk sama dengan jumlah arus keluar.',
  },
  {
    title: 'Home Energy Monitor',
    topic: 6,
    prompt:
      'Lima lampu 20 W menyala 10 jam/hari, TV 100 W selama 5 jam/hari, dan kulkas 150 W selama 24 jam/hari. Hitung energi selama 30 hari.',
    labels: ['Energi selama 30 hari (kWh)'],
    reminder:
      'Gunakan E = P × t. Ubah watt menjadi kilowatt dan jumlahkan energi semua perangkat.',
  },
]
