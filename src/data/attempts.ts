export type QuestionProgress = {
  wrong: number
  status: 'open' | 'correct' | 'reinforcement'
  last?: string
  at?: number
}
export const passedQuestion = (q?: QuestionProgress) =>
  q?.status === 'correct' || q?.status === 'reinforcement'
export function recordAnswer(
  old: QuestionProgress | undefined,
  answer: string,
  correct: boolean,
  at = Date.now(),
): QuestionProgress | null {
  if (old?.last === answer && at - (old.at ?? 0) < 900) return null
  return {
    wrong: (old?.wrong ?? 0) + (correct || old?.status === 'correct' ? 0 : 1),
    status:
      correct || old?.status === 'correct'
        ? 'correct'
        : old?.status === 'reinforcement'
          ? 'reinforcement'
          : 'open',
    last: answer,
    at,
  }
}
export const questionKey = (kind: 'phet' | 'piko' | 'energy', id: number) =>
  `${kind}:${id}`
