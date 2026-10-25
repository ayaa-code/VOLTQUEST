import { useEffect, useState } from 'react'
import type { Draft } from './useExperimentDraft'
import type { Mission } from '../data/missions'
import { evidenceStorage } from '../data/evidenceStorage'
import { imageSignature } from '../data/imageFiles'
import {
  inspectMission,
  missionInput,
  missionInputKey,
  type MissionReport,
} from '../data/missionReport'

export function useMissionReport(
  profileId: string,
  mission: Mission,
  draft: Draft,
  update: (patch: Partial<Draft>) => boolean,
) {
  const [open, setOpen] = useState(false),
    [error, setError] = useState(''),
    [signature, setSignature] = useState<string | null>(null)
  useEffect(() => {
    let active = true
    const refresh = () => {
      evidenceStorage(JSON.stringify([profileId, mission.id]), 'read')
        .then(imageSignature)
        .then((s) => {
          if (active) setSignature(s)
        })
        .catch(() => {
          if (active) setSignature(null)
        })
    }
    refresh()
    window.addEventListener('voltquest:evidence-changed', refresh)
    return () => {
      active = false
      window.removeEventListener('voltquest:evidence-changed', refresh)
    }
  }, [profileId, mission.id])
  async function save(choiceCorrect: boolean, support: boolean) {
    setError('')
    try {
      let image: Blob | undefined
      let evidenceUnavailable = false
      try {
        image = await evidenceStorage(
          JSON.stringify([profileId, mission.id]),
          'read',
        )
      } catch {
        evidenceUnavailable = true
      }
      const hash = await imageSignature(image),
        id = crypto.randomUUID(),
        key = JSON.stringify(['report', profileId, mission.id, id])
      if (image) await evidenceStorage(key, 'write', image)
      let name = 'Siswa'
      try {
        const value = JSON.parse(localStorage.getItem('voltquest.v1') ?? '{}')
          .profiles?.[profileId]?.name
        if (typeof value === 'string' && !value.includes('@'))
          name = value.slice(0, 80)
      } catch {
        /* Name is optional. */
      }
      const now = Date.now()
      const report: MissionReport = {
        id,
        missionId: mission.id,
        number: [1, 3, 2, 4, 5].indexOf(mission.id) + 1,
        title: mission.title,
        name,
        question: mission.question,
        answerText: draft.answer === null ? '' : mission.options[draft.answer],
        createdAt: draft.report?.createdAt ?? now,
        submittedAt: now,
        input: missionInput(draft),
        inputKey: missionInputKey(draft),
        choiceCorrect,
        status: support ? 'Perlu penguatan' : 'selesai',
        findings: inspectMission(mission.id, missionInput(draft)),
        evidenceKey: image ? key : '',
        evidenceSignature: hash,
      }
      if (evidenceUnavailable)
        report.findings.push({
          kind: 'informasi',
          text: 'Penyimpanan bukti belum dapat dibaca; gambar tidak dilampirkan dalam versi laporan ini.',
          suggestion:
            'Periksa izin penyimpanan perangkat dan kirim ulang laporan jika ingin menyertakan screenshot.',
        })
      if (!update({ report })) {
        setError(
          'Laporan belum tersimpan. Periksa penyimpanan perangkat lalu coba lagi.',
        )
        return false
      }
      setSignature(hash)
      setOpen(true)
      if (draft.report?.evidenceKey)
        void evidenceStorage(draft.report.evidenceKey, 'delete').catch(() => {})
      return true
    } catch {
      setError(
        'Bukti atau laporan belum dapat disimpan. Periksa izin dan ruang penyimpanan, lalu coba lagi.',
      )
      return false
    }
  }
  return { open, setOpen, error, save, signature }
}
