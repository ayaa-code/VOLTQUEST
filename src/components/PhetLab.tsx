import { useEffect, useRef, useState } from 'react'
import { ExternalLink, Maximize2, Minimize2, Play } from 'lucide-react'
import { PHET_URL } from '../data/missions'

export function PhetLab({
  onVisit,
  visited,
  startLabel = 'Mulai simulasi di sini',
}: {
  onVisit: () => void
  visited: boolean
  startLabel?: string
}) {
  const [opened, setOpened] = useState(false)
  const [loading, setLoading] = useState(false)
  const [slow, setSlow] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [message, setMessage] = useState('')
  const [reloadPrompt, setReloadPrompt] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const stage = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!loading) return
    const timer = window.setTimeout(() => setSlow(true), 18000)
    return () => window.clearTimeout(timer)
  }, [loading])
  useEffect(() => {
    const changed = () =>
      setFullscreen(document.fullscreenElement === stage.current)
    document.addEventListener('fullscreenchange', changed)
    return () => document.removeEventListener('fullscreenchange', changed)
  }, [])
  async function toggleFullscreen() {
    setMessage('')
    try {
      if (document.fullscreenElement === stage.current)
        await document.exitFullscreen()
      else if (stage.current?.requestFullscreen)
        await stage.current.requestFullscreen()
      else
        setMessage(
          'Layar penuh belum didukung browser ini. Gunakan tautan tab baru untuk area simulasi lebih luas.',
        )
    } catch {
      setMessage(
        'Layar penuh tidak dapat dibuka. Kamu tetap bisa memakai simulasi di sini atau di tab baru.',
      )
    }
  }
  return (
    <section className="content-card phet-lab" aria-labelledby="phet-heading">
      <span className="section-kicker">LABORATORIUM PHET</span>
      <h2 id="phet-heading">Coba Rangkaianmu</h2>
      <div ref={stage} className="phet-stage">
        {opened ? (
          <>
            <div className="phet-toolbar">
              {loading && <span role="status">Memuat bingkai simulasi…</span>}
              <button
                className="secondary-button"
                type="button"
                onClick={toggleFullscreen}
              >
                {fullscreen ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
                {fullscreen ? 'Keluar layar penuh' : 'Layar penuh'}
              </button>
            </div>
            <iframe
              key={attempt}
              title="Laboratorium PhET: Circuit Construction Kit DC"
              src={PHET_URL}
              allow="fullscreen"
              allowFullScreen
              onLoad={() => {
                setLoading(false)
                setSlow(false)
              }}
              onError={() => {
                setLoading(false)
                setSlow(true)
              }}
            />
          </>
        ) : (
          <div className="phet-placeholder">
            <Play size={32} aria-hidden="true" />
            <strong>Laboratorium listrikmu, di sini.</strong>
            <p>
              Simulasi membutuhkan internet. Tabel dan panduan tetap berada di
              VoltQuest.
            </p>
            <button
              className="primary-button"
              type="button"
              onClick={() => {
                setOpened(true)
                setLoading(true)
                onVisit()
              }}
            >
              <Play size={17} /> {startLabel}
            </button>
          </div>
        )}
      </div>
      {slow && (
        <p className="phet-notice" role="status">
          Simulasi belum tampil? Periksa koneksi atau gunakan tab baru. Isian
          tabel tetap tersimpan sebagai draf.
        </p>
      )}
      {opened && (
        <button
          className="text-button"
          type="button"
          onClick={() => setReloadPrompt(true)}
        >
          Coba muat simulasi
        </button>
      )}
      {reloadPrompt && (
        <div className="phet-notice" role="alert">
          <p>
            Memuat ulang akan mengulang susunan PhET yang sedang aktif. Isian
            VoltQuest tetap tersimpan.
          </p>
          <button
            type="button"
            className="secondary-button"
            onClick={() => {
              setAttempt((n) => n + 1)
              setLoading(true)
              setSlow(false)
              setReloadPrompt(false)
            }}
          >
            Muat ulang simulasi
          </button>{' '}
          <button
            type="button"
            className="text-button"
            onClick={() => setReloadPrompt(false)}
          >
            Batal
          </button>
        </div>
      )}
      {message && (
        <p className="phet-notice" role="status">
          {message}
        </p>
      )}
      <a
        className="text-button phet-fallback"
        href={PHET_URL}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onVisit}
      >
        Buka Laboratorium PhET <ExternalLink size={16} />
        <span className="visually-hidden">di tab baru</span>
      </a>
      <p className="phet-credit">
        Simulasi oleh PhET Interactive Simulations, University of Colorado
        Boulder.{' '}
        <a
          href="https://phet.colorado.edu/"
          target="_blank"
          rel="noopener noreferrer"
        >
          phet.colorado.edu
        </a>
      </p>
      <p className="guided-help">
        Susunan PhET belum dapat dipulihkan setelah refresh. Simpan screenshot
        sebagai acuan.
      </p>
      {visited && (
        <p className="lab-visited">
          Laboratorium pernah dibuka. Ini belum memverifikasi percobaanmu.
        </p>
      )}
    </section>
  )
}
