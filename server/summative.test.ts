import { test } from 'node:test'
import assert from 'node:assert/strict'
import { gradeSummative, inspectSummativeEssays } from './summative.ts'
import {
  summativeInputSchema,
  summativeErrors,
  summativeDraft,
  summativeAIReviewSchema,
} from '../src/data/summative.ts'

const valid = {
  answers: { wire: 0, loop: 0, safety: 0 },
  essays: { lamps: 'Tidak tahu', batteries: 'Belum paham' },
}
test('submission accepts incorrect choices and short essays; review never invents an essay grade', () => {
  const result = gradeSummative(valid)
  assert.equal(result.valid, true)
  if (!result.valid) throw Error('valid fixture')
  assert.equal(result.review.correctCount, 0)
  assert.equal(result.review.essays.length, 2)
  assert.ok(
    result.review.essays.every(
      (r) => r.status === 'perlu-revisi' && r.findings.length > 0,
    ),
  )
  assert.equal('score' in result.review.essays[0], false)
  assert.equal(result.review.choices[1].feedback.includes('12 V'), false)
  assert.equal(JSON.stringify(result).includes('correctKey'), false)
})
test('required IDs, bounds, spaces, missing legacy slots and excessive input cannot bypass validation', () => {
  for (const essays of [
    {},
    [],
    { lamps: '  ', batteries: 'a' },
    { lamps: 'a' },
    { lamps: 'a'.repeat(6001), batteries: 'b' },
  ])
    assert.equal(
      summativeInputSchema.safeParse({ ...valid, essays }).success,
      false,
    )
  assert.equal(
    summativeInputSchema.safeParse({
      ...valid,
      answers: { ...valid.answers, wire: 5 },
    }).success,
    false,
  )
  const missing = summativeDraft({ answers: {}, essays: [], submitted: false })
  assert.deepEqual(Object.keys(summativeErrors(missing)).sort(), [
    'batteries',
    'lamps',
    'loop',
    'safety',
    'wire',
  ])
  const sparse: string[] = []
  sparse[1] = 'Jawaban kedua'
  assert.equal(
    summativeErrors(
      summativeDraft({
        answers: valid.answers,
        essays: sparse,
        submitted: false,
      }),
    ).lamps.length > 0,
    true,
  )
})
test('numerical feedback checks labelled watts and units, with honest semantic limits', () => {
  const [good, batteries] = inspectSummativeEssays({
    lamps:
      'Asumsi hambatan tetap. Daya paralel 120 W; daya seri 13,33 W. Saat satu putus, cabang lain pada paralel masih menyala.',
    batteries:
      'Dua sumber seri menyuplai motor 24 V. Konverter DC-DC untuk lampu. Korsleting menyebabkan arus berlebih dan sekering memutus jalur.',
  })
  assert.equal(good.status, 'perlu-ditinjau')
  assert.equal(
    good.strengths.some((s) => s.includes('konsisten')),
    true,
  )
  assert.equal(batteries.status, 'perlu-ditinjau')
  const [bad] = inspectSummativeEssays({
    ...valid.essays,
    lamps: 'Paralel 13,33 W; seri 120 W. Hambatan tetap, lampu putus.',
  })
  assert.equal(bad.status, 'perlu-revisi')
  assert.equal(
    bad.findings.filter((f) => f.explanation.includes('Angka daya')).length,
    2,
  )
  const [, tap] = inspectSummativeEssays({
    ...valid.essays,
    batteries:
      'Sumber seri untuk motor 24 V, lampu memakai satu baterai; korsleting dicegah dengan sekering yang memutus jalur.',
  })
  assert.ok(tap.findings.some((f) => f.suggestion.includes('keseimbangan')))
})
test('AI output requires exactly one result for each essay', () => {
  const essay = {
    id: 'lamps',
    status: 'perlu-ditinjau',
    strengths: [],
    findings: [],
    topicIds: [4],
  }
  assert.equal(
    summativeAIReviewSchema.safeParse({
      essays: [essay, essay],
      limitations: 'Telaah guru diperlukan.',
    }).success,
    false,
  )
})

test('alternative notation is accepted for review rather than declared wrong by missing keywords', () => {
  const [lamps] = inspectSummativeEssays({
    lamps:
      'Opsi A: P = 3 × 40 = 120 W. Opsi B: P = V²/(3R) = 13,33 W. Model R konstan; ketika filamen terputus, hanya cabang terkait yang terhenti pada opsi A.',
    batteries: 'Penjelasan sumber dan proteksi akan ditinjau guru.',
  })
  assert.equal(lamps.status, 'perlu-ditinjau')
  assert.ok(lamps.findings.length > 0)
})
