import { test } from 'node:test'
import assert from 'node:assert/strict'
import { gradeAssessment } from './assessment.ts'
test('grading returns no key or explanation on wrong or invalid answers', () => {
  for (const [kind, id, answer] of [
    ['piko', 1, 'A'],
    ['phet', 3, 0],
    ['energy', 1, ['2', '6', '1']],
    ['energy', 2, ['4.5', 'masuk']],
  ]) {
    const result = gradeAssessment({ kind, id, answer })
    assert.equal(result.valid, true)
    assert.equal(result.correct, false)
    assert.equal(result.explanation, undefined)
    assert.equal('answer' in result, false)
    assert.equal('correctKey' in result, false)
  }
  for (const answer of [[], [''], ['NaN'], ['Infinity'], ['4.5', 'unknown']])
    assert.equal(
      gradeAssessment({ kind: 'energy', id: 2, answer }).valid,
      false,
    )
})
test('all six formative and five mission keys are verified only by server', () => {
  for (const [kind, id, answer] of [
    ['piko', 1, 'B'],
    ['piko', 2, 'D'],
    ['piko', 3, 'D'],
    ['energy', 1, ['1,5 A', '6 V', '1 A']],
    ['energy', 2, ['4,5', 'keluar']],
    ['energy', 3, ['153 kWh']],
    ...[1, 2, 3, 4, 5].map((id, i) => ['phet', id, [1, 2, 3, 2, 1][i]]),
  ])
    assert.equal(gradeAssessment({ kind, id, answer }).correct, true)
})
