import { useRef, useState } from 'react'
import { learningAccess } from '../data/learningAccess'
import {
  passedQuestion,
  recordAnswer,
  questionKey,
  type QuestionProgress,
} from '../data/attempts'
import { gradeAnswer } from '../data/assessmentClient'
import { missions } from '../data/missions'
import { MISSIONS_DATA } from '../data/currentGame'
import {
  energyMissions,
  numericAnswer,
  type CheckpointProgress,
} from '../data/checkpoints'
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
  questions?: Record<string, QuestionProgress>
  phetVisited?: number[]
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
    const value = JSON.parse(
      localStorage.getItem(KEY) ?? '{"version":1,"profiles":{}}',
    )
    if (
      value?.version !== 1 ||
      !value.profiles ||
      typeof value.profiles !== 'object'
    )
      return { version: 1, profiles: {} }
    // Import only verified legacy mission completion; never infer success from old drafts.
    let legacy: { profiles?: Record<string, { completed?: number[] }> } = {}
    try {
      legacy = JSON.parse(localStorage.getItem('voltquest.v1') ?? '{}') ?? {}
    } catch {
      /* Retain readable learning progress even if legacy metadata is damaged. */
    }
    for (const [id, profile] of Object.entries(legacy.profiles ?? {})) {
      const completed = (profile as { completed?: number[] }).completed
      if (!Array.isArray(completed) || !completed.length) continue
      const learning = value.profiles[id] ?? blank()
      const questions = { ...learning.questions }
      for (const missionId of completed)
        if (
          [1, 2, 3, 4, 5].includes(missionId) &&
          !questions[`phet:${missionId}`]
        )
          questions[`phet:${missionId}`] = { wrong: 0, status: 'correct' }
      value.profiles[id] = { ...learning, questions }
    }
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
    answerPhet: async (id: number, answer: number, needsSupport = false) => {
      const grade = await gradeAnswer('phet', id, answer).catch(() => null)
      if (!grade) return { saved: false, correct: false }
      let duplicate = false
      const saved = update((current) => {
        const mission = missions.find((m) => m.id === id)
        if (
          !mission ||
          !Number.isInteger(answer) ||
          !mission.options[answer] ||
          !learningAccess(current, profileId).missionReady(id)
        )
          return current
        const key = questionKey('phet', id)
        const record = recordAnswer(
          current.questions?.[key],
          String(answer),
          grade.correct,
        )
        if (record && grade.correct && needsSupport)
          record.status = 'reinforcement'
        if (!record) duplicate = true
        return record
          ? { ...current, questions: { ...current.questions, [key]: record } }
          : current
      })
      return { ...grade, saved: saved || duplicate }
    },
    visitPhet: (id: number) =>
      update((current) =>
        current.phetVisited?.includes(id)
          ? current
          : { ...current, phetVisited: [...(current.phetVisited ?? []), id] },
      ),
    continueWithSupport: (kind: 'phet' | 'piko' | 'energy', id: number) =>
      update((current) => {
        const key = questionKey(kind, id),
          old = current.questions?.[key]
        const access = learningAccess(current, profileId)
        if (
          !old ||
          old.wrong < 4 ||
          old.status !== 'open' ||
          !(kind === 'phet'
            ? access.missionReady(id)
            : access.quizReady(kind === 'piko' ? 1 : 2))
        )
          return current
        return {
          ...current,
          questions: {
            ...current.questions,
            [key]: { ...old, status: 'reinforcement' },
          },
        }
      }),
    answerEnergy: async (id: number, values: string[]) => {
      const grade = await gradeAnswer('energy', id, values).catch(() => null)
      if (!grade) return { saved: false, correct: false }
      let duplicate = false
      const saved = update((current) => {
        if (!learningAccess(current, profileId).quizReady(2)) return current
        const old = current.checkpoints?.[2] ?? {
          solved: [],
          answers: {},
          attempts: 0,
          complete: false,
        }
        if (
          id < 1 ||
          id > 3 ||
          (id > 1 &&
            !old.solved.includes(id - 1) &&
            !passedQuestion(current.questions?.[questionKey('energy', id - 1)]))
        )
          return current
        if (
          values.length !==
            (id === 2 ? 2 : energyMissions[id - 1].labels.length) ||
          energyMissions[id - 1].labels.some(
            (_, i) => !Number.isFinite(numericAnswer(values[i] ?? '')),
          ) ||
          (id === 2 && !['masuk', 'keluar'].includes(values[1]))
        )
          return current
        const key = questionKey('energy', id),
          record = recordAnswer(
            current.questions?.[key],
            JSON.stringify(values),
            grade.correct,
          )
        if (!record) {
          duplicate = true
          return current
        }
        const solved = grade.correct
          ? [...new Set([...old.solved, id])]
          : old.solved
        return {
          ...current,
          questions: { ...current.questions, [key]: record },
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
      })
      return { ...grade, saved: saved || duplicate }
    },
    completeEnergy: () =>
      update((current) => {
        const old = current.checkpoints?.[2]
        if (
          !old ||
          !learningAccess(current, profileId).quizReady(2) ||
          ![1, 2, 3].every(
            (id) =>
              old.solved.includes(id) ||
              passedQuestion(current.questions?.[questionKey('energy', id)]),
          )
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
    answerCurrentGame: async (missionId: number, key: string) => {
      const grade = await gradeAnswer('piko', missionId, key).catch(() => null)
      if (!grade) return { saved: false, correct: false }
      let duplicate = false
      const saved = update((current) => {
        if (!learningAccess(current, profileId).quizReady(1)) return current
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
        if (
          missionId > 1 &&
          !game.solved.includes(missionId - 1) &&
          !passedQuestion(
            current.questions?.[questionKey('piko', missionId - 1)],
          )
        )
          return current
        const keyId = questionKey('piko', missionId),
          record = recordAnswer(current.questions?.[keyId], key, grade.correct)
        if (!record) {
          duplicate = true
          return current
        }
        const solved = grade.correct
          ? [...new Set([...game.solved, missionId])]
          : game.solved
        return {
          ...current,
          questions: { ...current.questions, [keyId]: record },
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
      })
      return { ...grade, saved: saved || duplicate }
    },
    completeCurrentGame: () =>
      update((current) => {
        const old = current.checkpoints?.[1]
        if (
          !old ||
          !learningAccess(current, profileId).quizReady(1) ||
          !MISSIONS_DATA.every(
            (m) =>
              old.solved.includes(m.id) ||
              passedQuestion(current.questions?.[questionKey('piko', m.id)]),
          )
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
        if (!learningAccess(current, profileId).challengeReady(1))
          return current
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
          !learningAccess(current, profileId).basicsDone ||
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
        !learningAccess(current, profileId).materialReady(id)
          ? current
          : { ...current, materials: [...current.materials, id] },
      ),
    saveQuizDraft: (id: number, draft: string) =>
      update((current) =>
        !learningAccess(current, profileId).quizReady(id)
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
        !learningAccess(current, profileId).quizReady(id)
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
        !learningAccess(current, profileId).summativeReady
          ? current
          : {
              ...current,
              summative: { answers, essays, submitted },
            },
      ),
  }
}
