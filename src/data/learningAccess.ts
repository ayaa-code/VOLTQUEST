import type { ProfileLearning } from '../hooks/useDynamicLearning'
import { checkpointDone } from './checkpoints'
import { isAdminDemo } from './demoAccess'

const ids = [1, 2, 3, 4, 5, 6]
export function learningAccess(
  learning: ProfileLearning,
  profileId?: string | null,
) {
  const demo = isAdminDemo(profileId)
  const basicsDone =
    ids.every((id) => learning.materials.includes(id)) &&
    checkpointDone(learning, 1) &&
    checkpointDone(learning, 2)
  const challengesDone = Boolean(learning.worksheet?.completedAt)
  return {
    basicsDone: demo || basicsDone,
    materialReady: (id: number) =>
      ids.includes(id) &&
      (demo ||
        id === 1 ||
        learning.materials.includes(id) ||
        (id === 4
          ? checkpointDone(learning, 1)
          : learning.materials.includes(id - 1))),
    quizReady: (id: number) =>
      [1, 2].includes(id) &&
      (demo ||
        checkpointDone(learning, id) ||
        (id === 1
          ? [1, 2, 3].every((n) => learning.materials.includes(n))
          : checkpointDone(learning, 1) &&
            [4, 5, 6].every((n) => learning.materials.includes(n)))),
    challengeReady: (id: number) =>
      id === 1 &&
      (demo || basicsDone || challengesDone || learning.summative.submitted),
    summativeReady: demo || learning.summative.submitted || challengesDone,
  }
}

export const challengePrerequisite =
  'Selesaikan enam materi dan dua Formative Checkpoint untuk membuka Challenge eksplorasi PhET.'
export const summativePrerequisite =
  'Selesaikan dua Formative Checkpoint dan Challenge untuk membuka asesmen sumatif.'
