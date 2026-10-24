import { lazy, Suspense } from 'react'
import type { useDynamicLearning } from '../hooks/useDynamicLearning'
import { MISSIONS_DATA } from '../data/currentGame'
const CircuitQuestGame = lazy(() => import('./CircuitQuestGame.jsx'))
export function CurrentFormativeGame({
  store,
  onBack,
  onReview,
  onNext,
}: {
  store: ReturnType<typeof useDynamicLearning>
  onBack: () => void
  onReview: () => void
  onNext: () => void
}) {
  const saved = store.learning.quizzes[1]
  const solved = saved?.game?.solved ?? []
  const next = MISSIONS_DATA.findIndex((m) => !solved.includes(m.id))
  return (
    <section className="content-card learning-detail quiz-detail current-formative-game">
      <span className="section-kicker">KUIS FORMATIF 01</span>
      <h1>Arus Listrik</h1>
      <h2>Circuit Quest — Petualangan Piko</h2>
      <Suspense fallback={<p role="status">Menyiapkan permainan Piko…</p>}>
        <CircuitQuestGame
          initialMission={next === -1 ? 3 : next}
          initialScore={solved.length * 100}
          onAnswer={store.answerCurrentGame}
          onFinish={store.completeCurrentGame}
          onComplete={onReview}
          onReview={onReview}
        />
      </Suspense>
      {solved.length === 3 && !saved?.complete && (
        <button className="primary-button" onClick={store.completeCurrentGame}>
          Simpan penyelesaian formatif
        </button>
      )}
      {saved?.answer && !saved.answer.startsWith('Circuit Quest:') && (
        <details>
          <summary>Jawaban formatif sebelumnya</summary>
          <p>{saved.answer}</p>
          <p>
            {saved.complete
              ? 'Sudah selesai pada versi sebelumnya.'
              : 'Belum selesai pada versi sebelumnya.'}
          </p>
        </details>
      )}
      {store.storageError && (
        <p role="alert">
          Progres game belum dapat disimpan. Jangan tutup halaman; coba kembali
          setelah penyimpanan tersedia.
        </p>
      )}
      {saved?.complete && (
        <div className="learning-completion">
          <p className="success-note">
            Kuis formatif selesai. Progres belajarmu tetap tersimpan.
          </p>
          <button className="primary-button" onClick={onNext}>
            Lanjut ke materi berikutnya
          </button>
        </div>
      )}
      <button className="text-button" onClick={onBack}>
        Kembali ke daftar belajar
      </button>
    </section>
  )
}
