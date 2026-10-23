import { useEffect, useRef, useState } from 'react'
import { findPractice } from '../data/practice'
import { parseRecommendation } from '../data/feedbackRules'
import type { RecommendationRef } from '../data/feedbackRules'
import { FEEDBACK_KEY, resolveRecommendation } from '../data/feedbackStorage'

export const PRACTICE_KEY = 'voltquest.practice.v1'
export type PracticeRecord = {
  selectedId: string | null
  submitted: boolean
  lastSubmittedId: string | null
  firstSubmittedId: string | null
  submissions: number
}
type PracticeProfile = {
  activeId: string | null
  source: RecommendationRef | null
  records: Record<string, PracticeRecord>
}
type PracticeStore = { version: 1; profiles: Record<string, PracticeProfile> }
const freshProfile = (): PracticeProfile => ({
  activeId: null,
  records: {},
  source: null,
})
const freshRecord = (): PracticeRecord => ({
  selectedId: null,
  submitted: false,
  lastSubmittedId: null,
  firstSubmittedId: null,
  submissions: 0,
})
const isObject = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value)
function sanitize(value: unknown): PracticeProfile {
  if (!isObject(value)) return freshProfile()
  const records: Record<string, PracticeRecord> = {}
  if (isObject(value.records))
    for (const [id, raw] of Object.entries(value.records)) {
      const exercise = findPractice(id)
      if (!exercise || !isObject(raw)) continue
      const option = (id: unknown) =>
        typeof id === 'string' &&
        exercise.options.some((entry) => entry.id === id)
          ? id
          : null
      const last = option(raw.lastSubmittedId)
      const first = option(raw.firstSubmittedId)
      const selected = option(raw.selectedId)
      const submissions =
        Number.isSafeInteger(raw.submissions) &&
        Number(raw.submissions) > 0 &&
        last &&
        first
          ? Number(raw.submissions)
          : 0
      records[id] = {
        selectedId: selected,
        submitted:
          raw.submitted === true && submissions > 0 && selected === last,
        lastSubmittedId: submissions ? last : null,
        firstSubmittedId: submissions ? first : null,
        submissions,
      }
    }
  return {
    activeId: findPractice(value.activeId)?.id ?? null,
    records,
    source: parseRecommendation(value.source),
  }
}
function readStore(): {
  store: PracticeStore
  blocked: boolean
  notice: string
} {
  const store: PracticeStore = { version: 1, profiles: {} }
  try {
    const raw = localStorage.getItem(PRACTICE_KEY)
    if (!raw) return { store, blocked: false, notice: '' }
    const value: unknown = JSON.parse(raw)
    if (!isObject(value) || !Number.isInteger(value.version))
      throw new Error('Invalid practice data')
    if (value.version !== 1)
      return {
        store,
        blocked: true,
        notice:
          'Versi data latihan belum didukung. Data lama tidak ditimpa; perubahan hanya ada selama halaman latihan ini terbuka.',
      }
    if (!isObject(value.profiles)) throw new Error('Invalid practice profiles')
    for (const [profileId, profile] of Object.entries(value.profiles)) {
      if (profileId.startsWith('student:'))
        store.profiles[profileId] = sanitize(profile)
    }
    return { store, blocked: false, notice: '' }
  } catch {
    return {
      store,
      blocked: false,
      notice:
        'Data latihan tidak dapat dibaca. Kamu dapat mulai latihan baru; progres misi dan draf eksperimen tetap terpisah. Perubahan akan dicoba disimpan saat kamu berinteraksi.',
    }
  }
}
export function usePractice(
  profileId: string,
  initialRecommendation?: RecommendationRef | null,
) {
  const [loaded] = useState(readStore)
  const [profile, setProfile] = useState(
    () => loaded.store.profiles[profileId] ?? freshProfile(),
  )
  const current = useRef(profile)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [, refreshEvidence] = useState(0)
  useEffect(() => {
    const refresh = (event: StorageEvent) => {
      if (
        event.key === null ||
        event.key === FEEDBACK_KEY ||
        event.key === 'voltquest.experiments.v1'
      )
        refreshEvidence((value) => value + 1)
    }
    window.addEventListener('storage', refresh)
    return () => window.removeEventListener('storage', refresh)
  }, [])
  function commit(
    activeId: string | null,
    changed: Record<string, PracticeRecord> = {},
    source: RecommendationRef | null = current.current.source,
  ) {
    const next = {
      activeId,
      source,
      records: { ...current.current.records, ...changed },
    }
    current.current = next
    setProfile(next)
    setSaved(false)
    const latest = readStore()
    if (loaded.blocked || latest.blocked) {
      setError(latest.blocked ? latest.notice : loaded.notice)
      return
    }
    try {
      latest.store.profiles[profileId] = {
        activeId,
        source,
        records: { ...latest.store.profiles[profileId]?.records, ...changed },
      }
      localStorage.setItem(PRACTICE_KEY, JSON.stringify(latest.store))
      setSaved(true)
      setError('')
    } catch {
      setError(
        'Latihan belum tersimpan di browser. Perubahan dapat hilang saat memuat ulang atau meninggalkan halaman latihan ini.',
      )
    }
  }
  function open(id: string, source: RecommendationRef | null = null) {
    if (findPractice(id))
      commit(
        id,
        {},
        source &&
          source.exerciseId === id &&
          resolveRecommendation(profileId, source)
          ? source
          : null,
      )
  }
  const started = useRef(false)
  useEffect(() => {
    if (initialRecommendation && !started.current) {
      started.current = true
      // A deliberate recommendation click opens/saves a question, never submits an answer.
      open(initialRecommendation.exerciseId, initialRecommendation)
    }
    // The launch intent is handled once per mounted practice page.
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  function select(id: string) {
    const exercise = findPractice(current.current.activeId)
    if (!exercise?.options.some((option) => option.id === id)) return
    const record = current.current.records[exercise.id] ?? freshRecord()
    commit(exercise.id, {
      [exercise.id]: { ...record, selectedId: id, submitted: false },
    })
  }
  function submit() {
    const exercise = findPractice(current.current.activeId)
    if (!exercise) return
    const record = current.current.records[exercise.id]
    if (!record?.selectedId || record.submitted) return
    commit(exercise.id, {
      [exercise.id]: {
        ...record,
        submitted: true,
        lastSubmittedId: record.selectedId,
        firstSubmittedId: record.firstSubmittedId ?? record.selectedId,
        submissions: Math.min(record.submissions + 1, Number.MAX_SAFE_INTEGER),
      },
    })
  }
  function repeat() {
    const id = current.current.activeId
    if (!id) return
    const record = current.current.records[id] ?? freshRecord()
    commit(id, { [id]: { ...record, selectedId: null, submitted: false } })
  }
  const active = findPractice(profile.activeId)
  const record = active
    ? (profile.records[active.id] ?? freshRecord())
    : freshRecord()
  const sent = Object.entries(profile.records).filter(
    ([, record]) => record.submissions > 0,
  )
  return {
    active,
    record,
    open,
    select,
    submit,
    repeat,
    chooseFocus: () => commit(null, {}, null),
    recommendationOutcome:
      profile.source && active?.id === profile.source.exerciseId
        ? resolveRecommendation(profileId, profile.source)
        : null,
    staleRecommendation:
      !!profile.source && !resolveRecommendation(profileId, profile.source),
    uniqueCount: sent.length,
    lastCorrectCount: sent.filter(
      ([id, record]) => findPractice(id)?.correctId === record.lastSubmittedId,
    ).length,
    records: profile.records,
    saved,
    notice: !saved ? loaded.notice : '',
    error,
  }
}
