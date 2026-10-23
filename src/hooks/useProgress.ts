import { useEffect, useState } from 'react'
type Profile = { name: string; completed: number[]; visited: number[] }
type SavedState = { active: string | null; profiles: Record<string, Profile> }
const STORAGE_KEY = 'voltquest.v1'
const emptyState: SavedState = { active: null, profiles: {} }
function readState(): SavedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyState
    const value = JSON.parse(raw)
    if (!value || typeof value.profiles !== 'object' || !value.profiles)
      return emptyState
    const profiles: Record<string, Profile> = {}
    for (const [key, profile] of Object.entries(value.profiles)) {
      const p = profile as Profile
      if (
        !p ||
        typeof p.name !== 'string' ||
        !Array.isArray(p.completed) ||
        !Array.isArray(p.visited)
      )
        continue
      profiles[key] = {
        name: p.name.slice(0, 40),
        completed: [
          ...new Set(
            p.completed.filter(
              (id) => Number.isInteger(id) && id >= 1 && id <= 5,
            ),
          ),
        ],
        visited: [
          ...new Set(
            p.visited.filter(
              (id) => Number.isInteger(id) && id >= 1 && id <= 5,
            ),
          ),
        ],
      }
    }
    return {
      active:
        typeof value.active === 'string' &&
        Object.hasOwn(profiles, value.active)
          ? value.active
          : null,
      profiles,
    }
  } catch {
    return emptyState
  }
}
export function useProgress() {
  const [state, setState] = useState<SavedState>(readState)
  const [storageError, setStorageError] = useState(false)
  useEffect(() => {
    // Storage is an external system; failures need to be reflected in the UI.
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
      // oxlint-disable-next-line react/set-state-in-effect
      setStorageError(false)
    } catch {
      // oxlint-disable-next-line react/set-state-in-effect
      setStorageError(true)
    }
  }, [state])
  const profile = state.active ? state.profiles[state.active] : null
  function login(name: string, accountId?: string) {
    const clean = name.trim().replace(/\s+/g, ' ')
    if (!clean) return
    const key = accountId ?? `student:${clean.toLocaleLowerCase('id-ID')}`
    setState((s) => ({
      active: key,
      profiles: {
        ...s.profiles,
        [key]: s.profiles[key] ?? { name: clean, completed: [], visited: [] },
      },
    }))
  }
  function update(id: number, field: 'completed' | 'visited') {
    setState((s) => {
      if (!s.active) return s
      const p = s.profiles[s.active]
      if (p[field].includes(id)) return s
      return {
        ...s,
        profiles: {
          ...s.profiles,
          [s.active]: { ...p, [field]: [...p[field], id] },
        },
      }
    })
  }
  return {
    profile,
    profileId: state.active,
    storageError,
    login,
    logout: () => setState((s) => ({ ...s, active: null })),
    complete: (id: number) => update(id, 'completed'),
    visit: (id: number) => update(id, 'visited'),
  }
}
