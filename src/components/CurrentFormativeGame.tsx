import { lazy, Suspense } from 'react'
import type { useDynamicLearning } from '../hooks/useDynamicLearning'
import { MISSIONS_DATA } from '../data/currentGame'
import { checkpointDone } from '../data/checkpoints'
import { passedQuestion } from '../data/attempts'
const CircuitQuestGame = lazy(() => import('./CircuitQuestGame.jsx'))
export function CurrentFormativeGame({
  store,
  onBack,
  onReview,
  onNext,
}: {
  store: ReturnType<typeof useDynamicLearning>
  onBack: () => void
  onReview: (id?: number) => void
  onNext: () => void
}) {
  const saved = store.learning.checkpoints?.[1]
  const solved = saved?.solved ?? []
  const complete = checkpointDone(store.learning, 1)
  const next = MISSIONS_DATA.findIndex(
    (m) =>
      !solved.includes(m.id) &&
      !passedQuestion(store.learning.questions?.[`piko:${m.id}`]),
  )
  return (
    <section className="content-card learning-detail quiz-detail current-formative-game">
      <span className="section-kicker">FORMATIF 1 · TIGA SUBMATERI</span>
      <h1>Formative Checkpoint 1</h1>
      <h2>Circuit Quest — Petualangan Piko</h2>
      <Suspense fallback={<p role="status">Menyiapkan permainan Piko…</p>}>
        <CircuitQuestGame
          initialMission={complete || next === -1 ? 3 : next}
          initialScore={solved.length * 100}
          onAnswer={store.answerCurrentGame}
          onFinish={store.completeCurrentGame}
          onComplete={onNext}
          onReview={onReview}
          wrongCounts={Object.fromEntries(
            MISSIONS_DATA.map((m) => [
              m.id,
              store.learning.questions?.[`piko:${m.id}`]?.wrong ?? 0,
            ]),
          )}
          supportMissions={MISSIONS_DATA.filter(
            (m) =>
              store.learning.questions?.[`piko:${m.id}`]?.status ===
              'reinforcement',
          ).map((m) => m.id)}
          onSkip={(id) => store.continueWithSupport('piko', id)}
        />
      </Suspense>
      {next === -1 && !complete && (
        <button className="primary-button" onClick={store.completeCurrentGame}>
          Simpan penyelesaian formatif
        </button>
      )}
      {store.storageError && (
        <p role="alert">
          Progres game belum dapat disimpan. Jangan tutup halaman; coba kembali
          setelah penyimpanan tersedia.
        </p>
      )}
      {complete && (
        <div className="learning-completion">
          <p className="success-note">
            Kuis formatif selesai. Progres belajarmu tetap tersimpan.
          </p>
          <button className="primary-button" onClick={onNext}>
            Lanjut ke Rangkaian Listrik Seri dan Paralel
          </button>
        </div>
      )}
      <button className="text-button" onClick={onBack}>
        Kembali ke daftar belajar
      </button>
    </section>
  )
}
