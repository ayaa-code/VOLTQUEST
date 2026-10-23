import { missions } from './missions'
import {
  getConfirmation,
  getFeedbackOutcome,
  recommendationFor,
} from './feedbackRules'
import type { FeedbackAttempt, RecommendationRef } from './feedbackRules'
import { RULE_VERSION } from './confirmations'

export const FEEDBACK_KEY = 'voltquest.feedback.v1'
type FeedbackStore = {
  version: 1
  profiles: Record<string, Record<string, FeedbackAttempt>>
}
const object = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value)
const opaqueId = (value: unknown): value is string =>
  typeof value === 'string' && value.length > 0 && value.length < 150
function sanitize(value: unknown, missionId: number): FeedbackAttempt | null {
  const mission = missions.find((entry) => entry.id === missionId)
  const config = mission && getConfirmation(mission)
  if (
    !object(value) ||
    !config ||
    value.missionId !== missionId ||
    !opaqueId(value.id) ||
    !opaqueId(value.revision) ||
    value.confirmationId !== config.id ||
    value.ruleVersion !== RULE_VERSION ||
    !config.answers.some((entry) => entry.id === value.answerId)
  )
    return null
  const response = (id: unknown) =>
    typeof id === 'string' && config.options.some((entry) => entry.id === id)
      ? id
      : null
  const draftResponseId = response(value.draftResponseId)
  const responseId = response(value.responseId)
  return {
    id: value.id,
    revision: value.revision,
    missionId,
    answerId: value.answerId as string,
    confirmationId: config.id,
    draftResponseId,
    responseId: responseId === draftResponseId ? responseId : null,
    valid: value.valid === true,
    ruleVersion: RULE_VERSION,
  }
}
export function readFeedbackStore(): {
  store: FeedbackStore
  blocked: boolean
  notice: string
} {
  const store: FeedbackStore = { version: 1, profiles: {} }
  try {
    const raw = localStorage.getItem(FEEDBACK_KEY)
    if (!raw) return { store, blocked: false, notice: '' }
    const value: unknown = JSON.parse(raw)
    if (!object(value) || !Number.isInteger(value.version))
      throw new Error('Invalid feedback')
    if (value.version !== 1)
      return {
        store,
        blocked: true,
        notice:
          'Versi data konfirmasi belum didukung. Data tidak ditimpa; perubahan hanya ada selama halaman misi ini terbuka.',
      }
    if (!object(value.profiles)) throw new Error('Invalid profiles')
    for (const [id, profile] of Object.entries(value.profiles)) {
      if (!id.startsWith('student:') || !object(profile)) continue
      store.profiles[id] = {}
      for (const mission of missions) {
        const attempt = sanitize(profile[mission.id], mission.id)
        if (attempt) store.profiles[id][mission.id] = attempt
      }
    }
    return { store, blocked: false, notice: '' }
  } catch {
    return {
      store,
      blocked: false,
      notice:
        'Data konfirmasi tidak dapat dibaca. Kamu dapat mengirim jawaban lagi untuk memulai konfirmasi baru; progres misi, draf, dan riwayat latihan tetap terpisah.',
    }
  }
}
// Revalidate against the latest submitted confirmation AND the current persisted reflection draft.
// Any unavailable, malformed or future-version dependency falls back to manual practice.
export function resolveRecommendation(
  profileId: string,
  ref: RecommendationRef | null,
) {
  if (!ref || ref.profileId !== profileId) return null
  const loaded = readFeedbackStore()
  const attempt = loaded.store.profiles[profileId]?.[ref.missionId]
  if (loaded.blocked || !attempt) return null
  const expected = recommendationFor(profileId, attempt)
  if (
    !expected ||
    Object.entries(expected).some(
      ([key, value]) => ref[key as keyof RecommendationRef] !== value,
    )
  )
    return null
  try {
    const drafts: unknown = JSON.parse(
      localStorage.getItem('voltquest.experiments.v1') ?? 'null',
    )
    if (!object(drafts) || drafts.version !== 1 || !object(drafts.profiles))
      return null
    const profile = drafts.profiles[profileId]
    if (!object(profile) || !object(profile[ref.missionId])) return null
    const draft = profile[ref.missionId] as Record<string, unknown>
    const mission = missions.find((entry) => entry.id === ref.missionId)!
    const config = getConfirmation(mission)
    if (
      !config ||
      !Number.isInteger(draft.answer) ||
      config.answers[Number(draft.answer)]?.id !== attempt.answerId
    )
      return null
    return getFeedbackOutcome(attempt)
  } catch {
    return null
  }
}
