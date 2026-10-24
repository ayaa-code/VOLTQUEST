import type { ProfileLearning } from '../hooks/useDynamicLearning'

const ids = [1, 2, 3, 4, 5, 6]
export function learningAccess(learning: ProfileLearning) {
  const basicsDone = ids.every(
    (id) => learning.materials.includes(id) && learning.quizzes[id]?.complete,
  )
  const challengesDone = Boolean(learning.worksheet?.completedAt)
  return {
    basicsDone,
    materialReady: (id: number) =>
      ids.includes(id) &&
      (id === 1 ||
        learning.materials.includes(id) ||
        Boolean(learning.quizzes[id - 1]?.complete)),
    quizReady: (id: number) =>
      ids.includes(id) &&
      (Boolean(learning.quizzes[id]?.complete) ||
        (learning.materials.includes(id) &&
          (id === 1 || Boolean(learning.quizzes[id - 1]?.complete)))),
    challengeReady: (id: number) => id === 1 && basicsDone,
    summativeReady:
      learning.summative.submitted || (basicsDone && challengesDone),
  }
}

export const challengePrerequisite =
  'Selesaikan enam materi dan enam tes formatif untuk membuka satu Challenge eksplorasi PhET.'
export const summativePrerequisite =
  'Selesaikan enam materi, enam tes formatif, dan satu Challenge untuk membuka asesmen sumatif.'
