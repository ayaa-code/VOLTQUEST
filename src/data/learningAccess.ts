import type { ProfileLearning } from '../hooks/useDynamicLearning'

const ids = [1, 2, 3, 4, 5, 6]
export function learningAccess(learning: ProfileLearning) {
  const basicsDone = ids.every(
    (id) => learning.materials.includes(id) && learning.quizzes[id]?.complete,
  )
  const challengesDone = ids.every((id) => learning.challenges.includes(id))
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
    challengeReady: (id: number) =>
      ids.includes(id) &&
      (learning.challenges.includes(id) ||
        (basicsDone && (id === 1 || learning.challenges.includes(id - 1)))),
    summativeReady:
      learning.summative.submitted || (basicsDone && challengesDone),
  }
}

export const challengePrerequisite =
  'Selesaikan seluruh materi dan tes formatif untuk membuka Challenge PhET. Setelah itu, selesaikan Challenge sebelumnya untuk melanjutkan.'
export const summativePrerequisite =
  'Selesaikan seluruh materi, tes formatif, dan enam Challenge PhET untuk membuka asesmen sumatif.'
