import { useEffect, useRef, useState } from 'react'
import {
  Download,
  ExternalLink,
  Pause,
  Play,
  Square,
  Volume2,
} from 'lucide-react'
import { lessons, lessonReferences } from '../data/lessons'
import { useLessonSpeech } from '../hooks/useLessonSpeech'
import './LessonContent.css'

type YoutubePlayer = { destroy: () => void }
type YoutubeApi = {
  Player: new (
    element: HTMLElement,
    options: {
      events: {
        onStateChange: (event: { data: number }) => void
        onError: (event: { data: number }) => void
      }
    },
  ) => YoutubePlayer
}
type YoutubeWindow = Window & {
  YT?: YoutubeApi
  onYouTubeIframeAPIReady?: () => void
}
let youtubePromise: Promise<YoutubeApi> | undefined
function youtubeApi(): Promise<YoutubeApi> {
  const host = window as YoutubeWindow
  if (host.YT?.Player) return Promise.resolve(host.YT)
  if (youtubePromise) return youtubePromise
  youtubePromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    const previous = host.onYouTubeIframeAPIReady
    const fail = () => {
      clearTimeout(timeout)
      script.remove()
      host.onYouTubeIframeAPIReady = previous
      youtubePromise = undefined
      reject(new Error('YouTube API unavailable'))
    }
    const timeout = window.setTimeout(fail, 12000)
    host.onYouTubeIframeAPIReady = () => {
      previous?.()
      clearTimeout(timeout)
      host.onYouTubeIframeAPIReady = previous
      if (host.YT?.Player) resolve(host.YT)
      else fail()
    }
    script.src = 'https://www.youtube.com/iframe_api'
    script.async = true
    script.onerror = fail
    document.head.append(script)
  })
  return youtubePromise
}

function LessonVideo({
  topicId,
  onPlay,
}: {
  topicId: number
  onPlay: () => void
}) {
  const lesson = lessons[topicId]
  const mount = useRef<HTMLDivElement>(null)
  const [message, setMessage] = useState('')
  useEffect(() => {
    const container = mount.current!
    let alive = true
    let player: YoutubePlayer | undefined
    const iframe = document.createElement('iframe')
    iframe.title = `Video pembelajaran ${lesson.title}`
    iframe.src = `https://www.youtube-nocookie.com/embed/${lesson.videoId}?enablejsapi=1&autoplay=1&playsinline=1&origin=${encodeURIComponent(location.origin)}`
    iframe.allow =
      'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen'
    iframe.allowFullscreen = true
    iframe.referrerPolicy = 'strict-origin-when-cross-origin'
    iframe.onerror = () => {
      if (alive)
        setMessage(
          'Pemutar belum dapat dimuat. Periksa koneksi atau gunakan tautan YouTube di bawah.',
        )
    }
    container.append(iframe)
    youtubeApi()
      .then((api) => {
        if (!alive) return
        player = new api.Player(iframe, {
          events: {
            onStateChange: (event) => {
              if (alive && event.data === 1) onPlay()
            },
            onError: () => {
              if (alive)
                setMessage(
                  'Video tidak dapat diputar di halaman ini. Video mungkin tidak tersedia atau pemiliknya membatasi penyematan. Gunakan tautan YouTube di bawah.',
                )
            },
          },
        })
      })
      .catch(() => {
        if (alive)
          setMessage(
            'Status pemutar YouTube belum dapat diperiksa. Jika video tidak berjalan, gunakan tautan YouTube di bawah.',
          )
      })
    return () => {
      alive = false
      player?.destroy()
      container.replaceChildren()
    }
  }, [lesson, onPlay])
  return (
    <>
      <div className="lesson-video-frame" ref={mount} />
      {message && (
        <p className="lesson-video-message" role="status">
          {message}
        </p>
      )}
    </>
  )
}

export function LessonContent({ topicId }: { topicId: number }) {
  const lesson = lessons[topicId]
  const speech = useLessonSpeech(lesson)
  const [videoActive, setVideoActive] = useState(false)
  return (
    <div className="lesson-content">
      <section className="lesson-audio" aria-label="Pembacaan materi">
        <h2>
          <Volume2 size={18} aria-hidden="true" /> Dengarkan materi
        </h2>
        {!speech.supported ? (
          <p>
            Browser ini belum mendukung pembacaan suara. Kamu tetap dapat
            membaca seluruh materi di bawah.
          </p>
        ) : (
          <>
            <div className="lesson-audio-controls">
              {speech.status !== 'reading' && speech.status !== 'paused' && (
                <button
                  className="secondary-button"
                  onClick={() => {
                    setVideoActive(false)
                    speech.start()
                  }}
                >
                  <Play size={16} /> Dengarkan materi
                </button>
              )}
              {speech.status === 'reading' && (
                <button className="secondary-button" onClick={speech.pause}>
                  <Pause size={16} /> Jeda
                </button>
              )}
              {speech.status === 'paused' && (
                <button className="secondary-button" onClick={speech.resume}>
                  <Play size={16} /> Lanjutkan
                </button>
              )}
              <button
                className="secondary-button"
                onClick={speech.stop}
                disabled={
                  speech.status !== 'reading' && speech.status !== 'paused'
                }
              >
                <Square size={15} /> Hentikan
              </button>
              <label>
                Kecepatan baca{' '}
                <select
                  value={speech.rate}
                  onChange={(event) =>
                    speech.setRate(Number(event.target.value))
                  }
                >
                  <option value={0.8}>0,8×</option>
                  <option value={1}>1×</option>
                  <option value={1.2}>1,2×</option>
                </select>
              </label>
            </div>
            {(speech.status === 'finished' || speech.status === 'error') && (
              <p className="lesson-audio-status" role="status">
                {speech.status === 'finished'
                  ? 'Pembacaan materi selesai.'
                  : speech.status === 'error'
                    ? 'Pembacaan terhenti. Coba mulai kembali atau baca teks di bawah.'
                    : ''}
              </p>
            )}
          </>
        )}
      </section>
      <article
        className="lesson-manuscript"
        aria-label={`Materi lengkap ${lesson.title}`}
      >
        {lesson.blocks.map((block, index) =>
          block.kind === 'heading' ? (
            <h2 key={index}>{block.text}</h2>
          ) : block.kind === 'formula' ? (
            <div className="lesson-formula" key={index}>
              <p aria-label={block.spoken}>{block.text}</p>
            </div>
          ) : (
            <p key={index}>{block.text}</p>
          ),
        )}
      </article>
      <section className="lesson-video" aria-label={`Video ${lesson.title}`}>
        <h2>Video pembelajaran</h2>
        {lesson.videoNotice && (
          <p className="lesson-video-message">{lesson.videoNotice}</p>
        )}
        {videoActive ? (
          <>
            <LessonVideo topicId={topicId} onPlay={speech.stop} />
            <button
              className="text-button"
              onClick={() => setVideoActive(false)}
            >
              Tutup video
            </button>
          </>
        ) : (
          <button
            className="lesson-video-preview"
            onClick={() => {
              speech.stop()
              setVideoActive(true)
            }}
            aria-label={`Putar video ${lesson.title}`}
          >
            <span className="lesson-video-play">
              <Play size={32} aria-hidden="true" />
            </span>
            <strong>{lesson.title}</strong>
            <span>Putar video di sini · YouTube</span>
          </button>
        )}
        <a
          className="text-button"
          href={`https://www.youtube.com/watch?v=${lesson.videoId}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Tonton di YouTube <ExternalLink size={16} />
        </a>
        <p className="lesson-video-note">
          Jika video tidak tersedia atau tidak mengizinkan pemutaran di sini,
          coba tautan YouTube. Ketersediaan video mengikuti pengaturan
          pemiliknya.
        </p>
      </section>
      {topicId === 6 && <LessonResources />}
    </div>
  )
}

export function LessonResources() {
  return (
    <section
      className="content-card lesson-resources"
      aria-label="E-book dan Referensi"
    >
      <h2>E-book dan Referensi</h2>
      <div className="lesson-ebook">
        <button
          className="secondary-button"
          disabled
          aria-describedby="ebook-availability"
        >
          <Download size={17} /> Download E-book
        </button>
        <p id="ebook-availability">E-book belum tersedia.</p>
      </div>
      <h3>Sumber referensi</h3>
      <p>
        Naskah utama disediakan oleh penyusun VoltQuest. Konsep dan aturan tanda
        ditinjau dengan bagian berikut dari{' '}
        <cite>University Physics Volume 2</cite>, OpenStax.
      </p>
      <ul>
        {lessonReferences.map((reference) => (
          <li key={reference.url}>
            <a href={reference.url} target="_blank" rel="noopener noreferrer">
              {reference.title} <ExternalLink size={13} aria-hidden="true" />
            </a>
          </li>
        ))}
      </ul>
      <h3>Video pendamping</h3>
      <ul>
        {Object.values(lessons).map((lesson) => (
          <li key={lesson.videoId}>
            <a
              href={`https://www.youtube.com/watch?v=${lesson.videoId}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {lesson.title} <ExternalLink size={13} aria-hidden="true" />
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
