import type { ProfileLearning } from '../hooks/useDynamicLearning'
import { checkpointDone } from './checkpoints'
import { isAdminDemo } from './demoAccess'
import { passedQuestion } from './attempts'

const ids = [1, 2, 3, 4, 5, 6]
export function learningAccess(
  learning: ProfileLearning,
  profileId?: string | null,
) {
  const demo = isAdminDemo(profileId)
  const missionsDone =
    Boolean(learning.worksheet?.completedAt) ||
    checkpointDone(learning, 1) ||
    [1, 3].every((id) => passedQuestion(learning.questions?.[`phet:${id}`]))
  const basicsDone =
    ids.every((id) => learning.materials.includes(id)) &&
    checkpointDone(learning, 1) &&
    checkpointDone(learning, 2)
  const challengesDone = Boolean(learning.worksheet?.completedAt)
  return {
    basicsDone: demo || basicsDone,
    missionsDone,
    missionReady: (id: number) =>
      [1, 2, 3, 4, 5].includes(id) &&
      (demo ||
        passedQuestion(learning.questions?.[`phet:${id}`]) ||
        (id === 1
          ? [1, 2, 3].every((n) => learning.materials.includes(n))
          : passedQuestion(
              learning.questions?.[
                `phet:${({ 3: 1, 2: 3, 4: 2, 5: 4 } as Record<number, number>)[id]}`
              ],
            ) &&
            (id === 3
              ? [1, 2, 3].every((n) => learning.materials.includes(n))
              : id === 5
                ? [4, 5, 6].every((n) => learning.materials.includes(n))
                : learning.materials.includes(id === 2 ? 4 : 6)))),
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
          ? [1, 2, 3].every((n) => learning.materials.includes(n)) &&
            missionsDone
          : checkpointDone(learning, 1) &&
            [4, 5, 6].every((n) => learning.materials.includes(n)))),
    challengeReady: (id: number) =>
      id === 1 &&
      (demo ||
        [1, 2, 3].every((id) => learning.materials.includes(id)) ||
        challengesDone ||
        learning.summative.submitted),
    summativeReady:
      demo ||
      learning.summative.submitted ||
      challengesDone ||
      checkpointDone(learning, 2),
  }
}

export const challengePrerequisite =
  'Pelajari Materi 1–3 untuk membuka misi Discovery Lab. Misi Komponen Rangkaian dan Hukum Ohm menjadi persiapan Formatif 1.'
export const summativePrerequisite =
  'Jalani Formative Checkpoint 2 untuk membuka asesmen sumatif.'
export const missionPrerequisite = (id: number) =>
  (
    ({
      1: 'Pelajari Materi 1–3 terlebih dahulu.',
      3: 'Selesaikan Komponen Rangkaian dan pelajari Materi 1–3 terlebih dahulu.',
      2: 'Selesaikan Hukum Ohm dan pelajari Rangkaian Seri–Paralel terlebih dahulu.',
      4: 'Selesaikan Seri dan Paralel dan pelajari Daya Listrik terlebih dahulu.',
      5: 'Selesaikan misi Energi Listrik dan pelajari seluruh materi rangkaian serta Daya Listrik terlebih dahulu.',
    }) as Record<number, string>
  )[id]
