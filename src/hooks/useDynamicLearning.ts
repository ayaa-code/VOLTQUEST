import { useRef, useState } from 'react'
import { learningAccess } from '../data/learningAccess'
import { MISSIONS_DATA } from '../data/currentGame'
import { checkEnergyAnswer, type CheckpointProgress } from '../data/checkpoints'
import {
  inspectWorksheet,
  snapshotOf,
  type WorksheetRecord,
} from '../data/challengeWorksheet'

type ChallengeDraft = {
  visited: boolean
  observation: string
  reflection: string
}
type QuizAttempt = {
  game?: { solved: number[]; answers: Record<string, string>; attempts: number }
  answer: string
  attempts: number
  complete: boolean
  draft?: string
}
export type ProfileLearning = {
  checkpoints?: Record<string, CheckpointProgress>
  worksheet?: WorksheetRecord
  materials: number[]
  challenges: number[]
  challengeDrafts: Record<string, ChallengeDraft>
  quizzes: Record<string, QuizAttempt>
  summative: {
    answers: Record<string, number>
    essays: string[]
    submitted: boolean
  }
}
type Saved = { version: 1; profiles: Record<string, ProfileLearning> }

const KEY = 'voltquest.dynamic-electricity.v1'
const blank = (): ProfileLearning => ({
  materials: [],
  challenges: [],
  challengeDrafts: {},
  quizzes: {},
  summative: { answers: {}, essays: ['', ''], submitted: false },
})

function read(): Saved {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) ?? '')
    if (
      value?.version !== 1 ||
      !value.profiles ||
      typeof value.profiles !== 'object'
    )
      return { version: 1, profiles: {} }
    return { version: 1, profiles: value.profiles }
  } catch {
    return { version: 1, profiles: {} }
  }
}

export function useDynamicLearning(profileId: string | null) {
  const [saved, setSaved] = useState<Saved>(read)
  const [storageError, setStorageError] = useState(false)
  const latest = useRef(saved)
  const learning = profileId ? (saved.profiles[profileId] ?? blank()) : blank()
  function update(change: (current: ProfileLearning) => ProfileLearning) {
    if (!profileId) return false
    const state = latest.current
    const current = state.profiles[profileId] ?? blank()
    const changed = change(current)
    if (changed === current) return false
    const next: Saved = {
      ...state,
      profiles: {
        ...state.profiles,
        [profileId]: changed,
      },
    }
    try {
      localStorage.setItem(KEY, JSON.stringify(next))
      latest.current = next
      setSaved(next)
      setStorageError(false)
      return true
    } catch {
      setStorageError(true)
      return false
    }
  }
  return {
    learning,
    storageError,
    profileId,
    answerEnergy: (id: number, values: string[]) =>
      update((current) => {
        if (!learningAccess(current).quizReady(2)) return current
        const old = current.checkpoints?.[2] ?? {
          solved: [],
          answers: {},
          attempts: 0,
          complete: false,
        }
        if (id < 1 || id > 3 || (id > 1 && !old.solved.includes(id - 1)))
          return current
        const solved = checkEnergyAnswer(id, values)
          ? [...new Set([...old.solved, id])]
          : old.solved
        return {
          ...current,
          checkpoints: {
            ...current.checkpoints,
            2: {
              ...old,
              solved,
              answers: { ...old.answers, [id]: values },
              attempts: old.attempts + 1,
            },
          },
        }
      }),
    completeEnergy: () =>
      update((current) => {
        const old = current.checkpoints?.[2]
        if (
          !old ||
          !learningAccess(current).quizReady(2) ||
          ![1, 2, 3].every((id) => old.solved.includes(id))
        )
          return current
        return {
          ...current,
          checkpoints: {
            ...current.checkpoints,
            2: { ...old, complete: true },
          },
        }
      }),
    answerCurrentGame: (missionId: number, key: string) =>
      update((current) => {
        if (!learningAccess(current).quizReady(1)) return current
        const mission = MISSIONS_DATA.find((m) => m.id === missionId)
        if (
          !mission ||
          !mission.question.options.some((option) => option.key === key)
        )
          return current
        const game = current.checkpoints?.[1] ?? {
          solved: [],
          answers: {},
          attempts: 0,
          complete: false,
        }
        if (missionId > 1 && !game.solved.includes(missionId - 1))
          return current
        const solved =
          key === mission.question.correctKey
            ? [...new Set([...game.solved, missionId])]
            : game.solved
        return {
          ...current,
          checkpoints: {
            ...current.checkpoints,
            1: {
              ...game,
              solved,
              answers: { ...game.answers, [missionId]: [key] },
              attempts: game.attempts + 1,
            },
          },
        }
      }),
    completeCurrentGame: () =>
      update((current) => {
        const old = current.checkpoints?.[1]
        if (
          !old ||
          !learningAccess(current).quizReady(1) ||
          !MISSIONS_DATA.every((m) => old.solved.includes(m.id))
        )
          return current
        return {
          ...current,
          checkpoints: {
            ...current.checkpoints,
            1: { ...old, complete: true },
          },
        }
      }),
    saveWorksheet: (record: WorksheetRecord) =>
      update((current) => {
        if (!learningAccess(current).challengeReady(1)) return current
        // Completion can only be granted by completeWorksheet, never arbitrary saves.
        return {
          ...current,
          worksheet: { ...record, completedAt: current.worksheet?.completedAt },
        }
      }),
    completeWorksheet: (snapshot: string) =>
      update((current) => {
        const record = current.worksheet
        if (
          !record ||
          !learningAccess(current).basicsDone ||
          !record.data.visited ||
          record.snapshot !== snapshot ||
          snapshotOf(record.data) !== snapshot ||
          record.reviewed !== snapshot ||
          !inspectWorksheet(record.data).valid
        )
          return current
        return {
          ...current,
          worksheet: {
            ...record,
            completedAt: record.completedAt ?? new Date().toISOString(),
          },
        }
      }),
    markMaterial: (id: number) =>
      update((current) =>
        current.materials.includes(id) ||
        !learningAccess(current).materialReady(id)
          ? current
          : { ...current, materials: [...current.materials, id] },
      ),
    saveQuizDraft: (id: number, draft: string) =>
      update((current) =>
        !learningAccess(current).quizReady(id)
          ? current
          : {
              ...current,
              quizzes: {
                ...current.quizzes,
                [id]: {
                  ...(current.quizzes[id] ?? {
                    answer: '',
                    attempts: 0,
                    complete: false,
                  }),
                  draft,
                },
              },
            },
      ),
    submitQuiz: (id: number, answer: string, correct: boolean) =>
      update((current) =>
        !learningAccess(current).quizReady(id)
          ? current
          : {
              ...current,
              quizzes: {
                ...current.quizzes,
                [id]: {
                  answer,
                  attempts: (current.quizzes[id]?.attempts ?? 0) + 1,
                  complete: current.quizzes[id]?.complete || correct,
                },
              },
            },
      ),
    saveSummative: (
      answers: Record<string, number>,
      essays: string[],
      submitted: boolean,
    ) =>
      update((current) =>
        !learningAccess(current).summativeReady
          ? current
          : {
              ...current,
              summative: { answers, essays, submitted },
            },
      ),
  }
}
