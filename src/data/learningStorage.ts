import type { ProfileLearning } from '../hooks/useDynamicLearning'

export const LEARNING_KEY = 'voltquest.dynamic-electricity.v1'
export type LearningStore = {
  version: 1
  profiles: Record<string, ProfileLearning>
}
export const blankLearning = (): ProfileLearning => ({
  materials: [],
  challenges: [],
  challengeDrafts: {},
  quizzes: {},
  summative: { answers: {}, essays: ['', ''], submitted: false },
})
const object = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === 'object' && !Array.isArray(v)
const ids = (v: unknown) => Array.isArray(v) && v.every(Number.isInteger)

// Unknown or damaged records remain untouched. A readable older profile may omit
// fields added later; missing fields receive defaults, never invented completion.
export function readLearningStorage(storage: Pick<Storage, 'getItem'>): {
  store: LearningStore
  blocked: boolean
} {
  const empty: LearningStore = { version: 1, profiles: {} }
  try {
    const raw = storage.getItem(LEARNING_KEY)
    if (raw === null) return { store: empty, blocked: false }
    const value: unknown = JSON.parse(raw)
    if (!object(value) || value.version !== 1 || !object(value.profiles))
      return { store: empty, blocked: true }
    const profiles: Record<string, ProfileLearning> = {}
    for (const [id, p] of Object.entries(value.profiles)) {
      if (
        !object(p) ||
        (p.materials !== undefined && !ids(p.materials)) ||
        (p.challenges !== undefined && !ids(p.challenges)) ||
        (p.quizzes !== undefined && !object(p.quizzes)) ||
        (p.challengeDrafts !== undefined && !object(p.challengeDrafts)) ||
        (p.questions !== undefined && !object(p.questions)) ||
        (p.checkpoints !== undefined && !object(p.checkpoints)) ||
        (p.summative !== undefined &&
          (!object(p.summative) ||
            !object(p.summative.answers) ||
            !Array.isArray(p.summative.essays) ||
            !p.summative.essays.every((s) => typeof s === 'string') ||
            typeof p.summative.submitted !== 'boolean'))
      )
        return { store: empty, blocked: true }
      if (
        object(p.checkpoints) &&
        Object.values(p.checkpoints).some(
          (c) =>
            !object(c) ||
            !ids(c.solved) ||
            !object(c.answers) ||
            typeof c.complete !== 'boolean' ||
            typeof c.attempts !== 'number',
        )
      )
        return { store: empty, blocked: true }
      if (
        object(p.quizzes) &&
        Object.values(p.quizzes).some(
          (q) => !object(q) || typeof q.complete !== 'boolean',
        )
      )
        return { store: empty, blocked: true }
      Object.defineProperty(profiles, id, {
        value: { ...blankLearning(), ...p },
        enumerable: true,
        writable: true,
      })
    }
    return { store: { ...value, version: 1, profiles }, blocked: false }
  } catch {
    return { store: empty, blocked: true }
  }
}
