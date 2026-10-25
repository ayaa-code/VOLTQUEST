import { useCallback, useEffect, useRef, useState } from 'react'
import { experiments, parseMeasurement } from '../data/experiments'
import type { ReflectionReview } from '../data/reflectionReview'
import type { MissionReport } from '../data/missionReport'

export const DRAFT_KEY = 'voltquest.experiments.v1'
export type Draft = {
  updatedAt?: number
  step: number
  prediction: string
  predictionText: string
  review?: ReflectionReview
  report?: MissionReport
  predictionReason: string
  initialPrediction: { choice: string; reason: string; text?: string } | null
  observations: Record<string, string>
  comparison: string
  observationStatus: 'draft' | 'recorded' | 'skipped'
  reflectionReason: string
  answer: number | null
}
type Store = { version: 1; profiles: Record<string, Record<string, Draft>> }
const fresh = (): Draft => ({
  step: 0,
  prediction: '',
  predictionText: '',
  predictionReason: '',
  initialPrediction: null,
  observations: {},
  comparison: '',
  observationStatus: 'draft',
  reflectionReason: '',
  answer: null,
})
const object = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value)
const text = (value: unknown, length = 800) =>
  typeof value === 'string' ? value.slice(0, length) : ''
function sanitize(value: unknown, missionId: number): Draft {
  if (!object(value)) return fresh()
  const config = experiments[missionId]
  const observations: Record<string, string> = {}
  for (const field of config.groups.flatMap((group) => group.fields)) {
    const raw = object(value.observations)
      ? text(value.observations[field.id], 80)
      : ''
    observations[field.id] =
      field.choices && !field.choices.includes(raw) ? '' : raw
  }
  const choice = (raw: unknown) =>
    typeof raw === 'string' &&
    (config.choices.includes(raw) || raw === 'Belum yakin')
      ? raw
      : ''
  const initial = object(value.initialPrediction)
    ? choice(value.initialPrediction.choice)
    : ''
  return {
    updatedAt:
      typeof value.updatedAt === 'number' && Number.isFinite(value.updatedAt)
        ? value.updatedAt
        : undefined,
    step:
      Number.isInteger(value.step) &&
      Number(value.step) >= 0 &&
      Number(value.step) <= 3
        ? Number(value.step)
        : 0,
    prediction: choice(value.prediction),
    report:
      object(value.report) &&
      typeof value.report.id === 'string' &&
      value.report.missionId === missionId &&
      object(value.report.input) &&
      Array.isArray(value.report.findings)
        ? (value.report as MissionReport)
        : undefined,
    predictionText: text(value.predictionText),
    review:
      object(value.review) &&
      value.review.source === 'local' &&
      typeof value.review.at === 'number' &&
      typeof value.review.reason === 'string'
        ? (value.review as ReflectionReview)
        : undefined,
    predictionReason: text(value.predictionReason),
    initialPrediction: initial
      ? {
          choice: initial,
          text: text((value.initialPrediction as Record<string, unknown>).text),
          reason: text(
            (value.initialPrediction as Record<string, unknown>).reason,
          ),
        }
      : null,
    observations,
    comparison: text(value.comparison),
    observationStatus:
      value.observationStatus === 'skipped'
        ? 'skipped'
        : value.observationStatus === 'recorded' &&
            config.groups
              .flatMap((group) => group.fields)
              .every((field) => {
                const raw = observations[field.id]
                const n = parseMeasurement(raw)
                return field.choices
                  ? field.choices.includes(raw)
                  : n !== null && (!field.positive || n > 0)
              })
          ? 'recorded'
          : 'draft',
    reflectionReason: text(value.reflectionReason),
    answer:
      Number.isInteger(value.answer) &&
      Number(value.answer) >= 0 &&
      Number(value.answer) <= 3
        ? Number(value.answer)
        : null,
  }
}
function read(): { store: Store; notice: string; blocked: boolean } {
  const store: Store = { version: 1, profiles: {} }
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (!raw) return { store, notice: '', blocked: false }
    const value: unknown = JSON.parse(raw)
    if (object(value) && value.version !== 1)
      return {
        store,
        notice:
          'Versi draf belum didukung. Data lama tidak ditimpa; perubahan hanya ada selama halaman misi ini terbuka.',
        blocked: true,
      }
    if (!object(value) || !object(value.profiles))
      throw new Error('Invalid draft store')
    for (const [profile, drafts] of Object.entries(value.profiles)) {
      if (
        (!profile.startsWith('student:') &&
          !profile.startsWith('account:') &&
          profile !== 'demo:admin') ||
        !object(drafts)
      )
        continue
      const safe: Record<string, Draft> = {}
      for (const id of [1, 2, 3, 4, 5])
        if (Object.hasOwn(drafts, String(id)))
          safe[id] = sanitize(drafts[id], id)
      store.profiles[profile] = safe
    }
    return { store, notice: '', blocked: false }
  } catch {
    return {
      store,
      notice:
        'Draf tidak dapat dibaca. Mulai draf baru; progres XP dan badge tetap terpisah. Jika penyimpanan tetap gagal, perubahan hanya ada selama halaman misi ini terbuka.',
      blocked: true,
    }
  }
}
export function useExperimentDraft(profileId: string, missionId: number) {
  const [loaded] = useState(read)
  const [draft, setDraft] = useState(
    () => loaded.store.profiles[profileId]?.[missionId] ?? fresh(),
  )
  const current = useRef(draft)
  const [saved, setSaved] = useState(
    !!loaded.store.profiles[profileId]?.[missionId] && !loaded.blocked,
  )
  const [error, setError] = useState('')
  function update(patch: Partial<Draft>) {
    const next = { ...current.current, ...patch, updatedAt: Date.now() }
    current.current = next
    setDraft(next)
    setSaved(false)
    const latest = read()
    if (latest.blocked) {
      setError(latest.notice || loaded.notice)
      return false
    }
    try {
      // Merge the newest store so edits in another mission/profile are not overwritten by a stale snapshot.
      latest.store.profiles[profileId] = {
        ...latest.store.profiles[profileId],
        [missionId]: next,
      }
      localStorage.setItem(DRAFT_KEY, JSON.stringify(latest.store))
      window.dispatchEvent(new Event('voltquest:draft-saved'))
      setSaved(true)
      setError('')
      return true
    } catch {
      setError(
        'Draf belum tersimpan di browser. Perubahan hanya ada selama halaman misi ini terbuka; kembali ke dashboard atau memuat ulang dapat menghilangkannya.',
      )
      return false
    }
  }
  return {
    draft,
    update,
    saved,
    notice: loaded.notice,
    error,
    retrySave: () => update({}),
  }
}

export function useLastExperiment(profileId: string) {
  const find = useCallback(() => {
    const drafts = read().store.profiles[profileId] ?? {}
    return Object.entries(drafts).sort(
      (a, b) => (b[1].updatedAt ?? 0) - (a[1].updatedAt ?? 0),
    )[0]?.[0]
  }, [profileId])
  const [last, setLast] = useState(find)
  useEffect(() => {
    const refresh = () => setLast(find())
    window.addEventListener('storage', refresh)
    window.addEventListener('voltquest:draft-saved', refresh)
    return () => {
      window.removeEventListener('storage', refresh)
      window.removeEventListener('voltquest:draft-saved', refresh)
    }
  }, [find])
  return last ? Number(last) : undefined
}
