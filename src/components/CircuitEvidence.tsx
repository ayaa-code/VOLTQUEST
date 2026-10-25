import { useEffect, useRef, useState } from 'react'

import { evidenceStorage as evidence } from '../data/evidenceStorage'
import { verifiedImage } from '../data/imageFiles'

export function CircuitEvidence({
  profileId,
  missionId,
}: {
  profileId: string
  missionId: number
}) {
  const key = JSON.stringify([profileId, missionId])
  const [blob, setBlob] = useState<Blob>()
  const preview = useRef<HTMLImageElement>(null)
  const [busy, setBusy] = useState(true)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const pending = useRef(false)
  useEffect(() => {
    let active = true
    evidence(key, 'read')
      .then((value) => {
        if (active) {
          setBlob(value)
          setSaved(!!value)
        }
      })
      .catch(() => {
        if (active)
          setError(
            'Bukti belum dapat dibaca. Periksa izin penyimpanan browser.',
          )
      })
      .finally(() => {
        if (active) setBusy(false)
      })
    return () => {
      active = false
    }
  }, [key])
  useEffect(() => {
    if (!blob || !preview.current) return
    const url = URL.createObjectURL(blob)
    preview.current.src = url
    return () => URL.revokeObjectURL(url)
  }, [blob])
  async function save(file: Blob) {
    if (pending.current) return
    pending.current = true
    setBusy(true)
    setError('')
    setSaved(false)
    try {
      await evidence(key, 'write', file)
      window.dispatchEvent(new Event('voltquest:evidence-changed'))
      setSaved(true)
    } catch {
      setError(
        'Bukti belum tersimpan. Periksa ruang dan izin penyimpanan, lalu coba lagi.',
      )
    } finally {
      pending.current = false
      setBusy(false)
    }
  }
  async function select(file?: File) {
    if (!file) return
    setBusy(true)
    setError('')
    try {
      const valid = await verifiedImage(file)
      setBlob(valid)
      await save(valid)
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Gambar belum dapat dibaca. Coba lagi.',
      )
      setBusy(false)
    }
  }
  async function remove() {
    if (pending.current) return
    pending.current = true
    setBusy(true)
    setError('')
    try {
      await evidence(key, 'delete')
      window.dispatchEvent(new Event('voltquest:evidence-changed'))
      setBlob(undefined)
      setSaved(false)
    } catch {
      setError('Bukti belum dapat dihapus. Coba lagi.')
    } finally {
      pending.current = false
      setBusy(false)
    }
  }
  return (
    <section className="circuit-evidence" aria-label="Bukti rangkaian">
      <h3>Simpan bukti rangkaian</h3>
      <p>
        Gunakan menu PhET → Screenshot atau tangkapan layar perangkat, lalu
        unggah sebagai acuan menyusun ulang rangkaian, bukan berkas pemulihan
        simulasi. PNG, JPEG, atau WebP, maksimal 6 MB.
      </p>
      <label className="evidence-upload">
        {blob ? 'Ganti screenshot' : 'Unggah screenshot'}
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          disabled={busy}
          onChange={(e) => {
            void select(e.target.files?.[0])
            e.target.value = ''
          }}
        />
      </label>
      {blob && (
        <img
          ref={preview}
          className="evidence-preview"
          alt="Bukti rangkaian yang kamu unggah untuk misi ini"
        />
      )}
      <p role="status">
        {busy
          ? 'Memproses bukti…'
          : error
            ? error
            : saved
              ? 'Bukti tersimpan di perangkat ini.'
              : blob
                ? 'Bukti belum tersimpan.'
                : 'Belum ada screenshot.'}
      </p>
      {blob && (
        <div className="step-actions">
          {!saved && !busy && (
            <button
              type="button"
              className="secondary-button"
              onClick={() => void save(blob)}
            >
              Coba simpan bukti lagi
            </button>
          )}
          <button
            type="button"
            className="text-button"
            disabled={busy}
            onClick={() => void remove()}
          >
            Hapus screenshot
          </button>
        </div>
      )}
    </section>
  )
}
