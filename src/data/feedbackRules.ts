import { missions } from './missions'
import type { Mission } from './missions'
import { confirmations, RULE_VERSION } from './confirmations'
import { findPractice } from './practice'

export type FeedbackAttempt = {
  id: string
  revision: string
  missionId: number
  answerId: string
  confirmationId: string
  draftResponseId: string | null
  responseId: string | null
  valid: boolean
  ruleVersion: number
}
export type RecommendationRef = {
  profileId: string
  missionId: number
  attemptId: string
  revision: string
  confirmationId: string
  responseId: string
  ruleId: string
  exerciseId: string
  ruleVersion: number
}
export function getConfirmation(mission: Mission) {
  const config = confirmations.find((entry) => entry.missionId === mission.id)
  if (
    !config ||
    config.missionQuestion !== mission.question ||
    config.answers.length !== mission.options.length ||
    !config.answers.every(
      (answer, index) => answer.label === mission.options[index],
    ) ||
    config.answers[mission.correct]?.id !== config.correctAnswerId
  )
    return null
  return config
}
export function getFeedbackOutcome(attempt: FeedbackAttempt) {
  const mission = missions.find((entry) => entry.id === attempt.missionId)
  const config = mission && getConfirmation(mission)
  if (
    !config ||
    !attempt.valid ||
    attempt.ruleVersion !== RULE_VERSION ||
    config.id !== attempt.confirmationId
  )
    return null
  const answer = config.answers.find((entry) => entry.id === attempt.answerId)
  const response = config.options.find(
    (entry) => entry.id === attempt.responseId,
  )
  if (!answer || !response || !findPractice(response.exerciseId)) return null
  const kind =
    response.id === 'unsure'
      ? 'uncertain'
      : answer.indication === response.id
        ? 'supported'
        : answer.id === config.correctAnswerId &&
            response.id === config.conceptResponseId
          ? 'consistent'
          : 'not-supported'
  return {
    kind,
    response,
    ruleId: `${config.id}/${response.id}`,
    reason: `Kamu memilih “${response.label}” pada konfirmasi. Latihan ini membantu meninjau konsep pada konfirmasi tersebut.`,
    feedback:
      kind === 'consistent'
        ? 'Alasan yang kamu pilih sejalan dengan jawaban refleksi. Coba terapkan pada situasi lain; kesesuaian ini belum membuktikan seluruh konsep sudah dikuasai.'
        : response.feedback +
          (answer.id === 'ohm-24' && response.id === 'divide'
            ? ' Pilihan salah sebelumnya tidak membuktikan kamu memakai perkalian.'
            : ''),
  }
}
export function recommendationFor(
  profileId: string,
  attempt: FeedbackAttempt,
): RecommendationRef | null {
  const outcome = getFeedbackOutcome(attempt)
  if (!outcome || !attempt.responseId) return null
  return {
    profileId,
    missionId: attempt.missionId,
    attemptId: attempt.id,
    revision: attempt.revision,
    confirmationId: attempt.confirmationId,
    responseId: attempt.responseId,
    ruleId: outcome.ruleId,
    exerciseId: outcome.response.exerciseId,
    ruleVersion: RULE_VERSION,
  }
}
export function parseRecommendation(value: unknown): RecommendationRef | null {
  if (!value || typeof value !== 'object') return null
  const ref = value as RecommendationRef
  if (
    typeof ref.profileId !== 'string' ||
    !ref.profileId.startsWith('student:') ||
    !Number.isInteger(ref.missionId) ||
    ref.missionId < 1 ||
    ref.missionId > 5 ||
    ref.ruleVersion !== RULE_VERSION
  )
    return null
  if (
    ![
      ref.attemptId,
      ref.revision,
      ref.confirmationId,
      ref.responseId,
      ref.ruleId,
      ref.exerciseId,
    ].every(
      (field) =>
        typeof field === 'string' && field.length > 0 && field.length < 150,
    )
  )
    return null
  return {
    profileId: ref.profileId,
    missionId: ref.missionId,
    attemptId: ref.attemptId,
    revision: ref.revision,
    confirmationId: ref.confirmationId,
    responseId: ref.responseId,
    ruleId: ref.ruleId,
    exerciseId: ref.exerciseId,
    ruleVersion: RULE_VERSION,
  }
}
