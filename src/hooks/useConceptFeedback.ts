import { useEffect, useRef, useState } from 'react'
import type { Mission } from '../data/missions'
import {
  getConfirmation,
  getFeedbackOutcome,
  recommendationFor,
} from '../data/feedbackRules'
import type { FeedbackAttempt } from '../data/feedbackRules'
import { FEEDBACK_KEY, readFeedbackStore } from '../data/feedbackStorage'
import { RULE_VERSION } from '../data/confirmations'

export function useConceptFeedback(
  profileId: string,
  mission: Mission,
  currentAnswer: number | null,
) {
  const [loaded] = useState(readFeedbackStore)
  const [attempt, setAttempt] = useState<FeedbackAttempt | null>(
    () => loaded.store.profiles[profileId]?.[mission.id] ?? null,
  )
  const current = useRef(attempt)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const config = getConfirmation(mission)
  useEffect(() => {
    function refresh(event: StorageEvent) {
      if (
        event.key !== null &&
        event.key !== FEEDBACK_KEY &&
        event.key !== 'voltquest.experiments.v1'
      )
        return
      let next: FeedbackAttempt | null =
        readFeedbackStore().store.profiles[profileId]?.[mission.id] ?? null
      try {
        const raw = JSON.parse(
          localStorage.getItem('voltquest.experiments.v1') ?? 'null',
        )
        if (
          raw?.version !== 1 ||
          raw.profiles?.[profileId]?.[mission.id]?.answer !== currentAnswer
        )
          next = null
      } catch {
        next = null
      }
      current.current = next
      setAttempt(next)
      setSaved(false)
    }
    window.addEventListener('storage', refresh)
    return () => window.removeEventListener('storage', refresh)
  }, [profileId, mission.id, currentAnswer])
  function commit(next: FeedbackAttempt) {
    current.current = next
    setAttempt(next)
    setSaved(false)
    const latest = readFeedbackStore()
    if (loaded.blocked || latest.blocked) {
      setError(latest.blocked ? latest.notice : loaded.notice)
      return
    }
    try {
      latest.store.profiles[profileId] = {
        ...latest.store.profiles[profileId],
        [mission.id]: next,
      }
      localStorage.setItem(FEEDBACK_KEY, JSON.stringify(latest.store))
      setSaved(true)
      setError('')
    } catch {
      setError(
        'Konfirmasi belum tersimpan di browser. Perubahan dapat hilang saat meninggalkan misi atau memuat ulang. Latihan mandiri tetap tersedia.',
      )
    }
  }
  function begin(answer: number) {
    if (!config?.answers[answer]) return
    commit({
      id: crypto.randomUUID(),
      revision: crypto.randomUUID(),
      missionId: mission.id,
      answerId: config.answers[answer].id,
      confirmationId: config.id,
      draftResponseId: null,
      responseId: null,
      valid: true,
      ruleVersion: RULE_VERSION,
    })
  }
  function invalidate() {
    if (current.current?.valid)
      commit({
        ...current.current,
        valid: false,
        responseId: null,
        draftResponseId: null,
        revision: crypto.randomUUID(),
      })
  }
  const active =
    attempt?.valid &&
    config &&
    currentAnswer !== null &&
    config.answers[currentAnswer]?.id === attempt.answerId
      ? attempt
      : null
  function choose(id: string) {
    if (!active || !config?.options.some((entry) => entry.id === id)) return
    commit({
      ...active,
      draftResponseId: id,
      responseId: null,
      revision: crypto.randomUUID(),
    })
  }
  function confirm() {
    const latest = current.current
    if (
      !latest?.valid ||
      !latest.draftResponseId ||
      !config?.options.some((entry) => entry.id === latest.draftResponseId)
    )
      return
    commit({
      ...latest,
      responseId: latest.draftResponseId,
      revision: crypto.randomUUID(),
    })
  }
  return {
    config,
    active,
    outcome: active ? getFeedbackOutcome(active) : null,
    recommendation: active ? recommendationFor(profileId, active) : null,
    begin,
    invalidate,
    choose,
    confirm,
    saved,
    error,
    notice: !saved ? loaded.notice : '',
  }
}
