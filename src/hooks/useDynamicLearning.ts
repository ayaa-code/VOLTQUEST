import { useEffect, useState } from 'react'
import { learningAccess } from '../data/learningAccess'

type ChallengeDraft = {
  visited: boolean
  observation: string
  reflection: string
}
type QuizAttempt = {
  answer: string
  attempts: number
  complete: boolean
  draft?: string
}
export type ProfileLearning = {
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
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(saved))
      // Persisting is an intentional side effect of a state change.
      // oxlint-disable-next-line react/set-state-in-effect
      setStorageError(false)
    } catch {
      // oxlint-disable-next-line react/set-state-in-effect
      setStorageError(true)
    }
  }, [saved])
  const learning = profileId ? (saved.profiles[profileId] ?? blank()) : blank()
  function update(change: (current: ProfileLearning) => ProfileLearning) {
    if (!profileId) return
    setSaved((state) => ({
      ...state,
      profiles: {
        ...state.profiles,
        [profileId]: change(state.profiles[profileId] ?? blank()),
      },
    }))
  }
  return {
    learning,
    storageError,
    markMaterial: (id: number) =>
      update((current) =>
        current.materials.includes(id) ||
        !learningAccess(current).materialReady(id)
          ? current
          : { ...current, materials: [...current.materials, id] },
      ),
    saveChallenge: (id: number, draft: ChallengeDraft) =>
      update((current) =>
        !learningAccess(current).challengeReady(id)
          ? current
          : {
              ...current,
              challengeDrafts: { ...current.challengeDrafts, [id]: draft },
            },
      ),
    completeChallenge: (id: number) =>
      update((current) =>
        current.challenges.includes(id) ||
        !learningAccess(current).challengeReady(id)
          ? current
          : { ...current, challenges: [...current.challenges, id] },
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
