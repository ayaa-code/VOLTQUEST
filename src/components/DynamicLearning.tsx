import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FlaskConical,
  LockKeyhole,
  Play,
  Sparkles,
} from 'lucide-react'
import { CircuitAnimation } from './CircuitAnimation'
import { PhetLab } from './PhetLab'
import {
  dynamicTopics,
  summativeEssays,
  summativeQuestions,
} from '../data/dynamicElectricity'
import { useDynamicLearning } from '../hooks/useDynamicLearning'
import './MissionPathCards.css'

type View =
  | { type: 'home' }
  | { type: 'catalog'; path: LearningPath }
  | { type: 'material'; id: number }
  | { type: 'challenge'; id: number }
  | { type: 'quiz'; id: number }
  | { type: 'summative' }

type LearningPath = 'material' | 'challenge' | 'quiz'

const stateText = (done: boolean, ready: boolean) =>
  done ? 'Selesai' : ready ? 'Siap dikerjakan' : 'Terkunci'

export function DynamicLearning({ profileId }: { profileId: string }) {
  const store = useDynamicLearning(profileId)
  const [view, setView] = useState<View>({ type: 'home' })
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [view])
  const { learning } = store
  const materialReady = (id: number) =>
    id === 1 ||
    learning.materials.includes(id) ||
    Boolean(learning.quizzes[id - 1]?.complete)
  const challengeReady = (id: number) => learning.materials.includes(id)
  const quizReady = (id: number) =>
    learning.materials.includes(id) &&
    (id === 1 || learning.quizzes[id - 1]?.complete)
  const allQuizDone = dynamicTopics.every(
    (topic) => learning.quizzes[topic.id]?.complete,
  )
  const next = ((): View => {
    for (const topic of dynamicTopics) {
      if (!learning.materials.includes(topic.id))
        return { type: 'material', id: topic.id }
      if (!learning.quizzes[topic.id]?.complete)
        return { type: 'quiz', id: topic.id }
    }
    return { type: 'summative' }
  })()
  if (view.type === 'catalog')
    return (
      <PathCatalog
        path={view.path}
        learning={learning}
        materialReady={materialReady}
        challengeReady={challengeReady}
        quizReady={quizReady}
        summativeReady={allQuizDone}
        onBack={() => setView({ type: 'home' })}
        onOpen={(nextView) => setView(nextView)}
      />
    )
  if (view.type !== 'home')
    return (
      <LearningPanel
        key={`${view.type}:${'id' in view ? view.id : ''}`}
        view={view}
        onBack={() => setView({ type: 'home' })}
        onOpen={setView}
        store={store}
        materialReady={materialReady}
        challengeReady={challengeReady}
        quizReady={quizReady}
        summativeReady={allQuizDone}
      />
    )

  const materialCount = learning.materials.length
  const challengeCount = learning.challenges.length
  const quizCount = Object.values(learning.quizzes).filter(
    (quiz) => quiz.complete,
  ).length
  const units = 6 * 3 + 1
  const done =
    materialCount +
    challengeCount +
    quizCount +
    (learning.summative.submitted ? 1 : 0)
  const nextLabel =
    next.type === 'material'
      ? `pelajari ${dynamicTopics[next.id - 1].title}`
      : next.type === 'challenge'
        ? `selesaikan Challenge ${next.id}`
        : next.type === 'quiz'
          ? `kerjakan Kuis Formatif ${next.id}`
          : 'kerjakan asesmen sumatif'
  return (
    <main className="dashboard page-enter dynamic-dashboard">
      {store.storageError && (
        <p className="learning-alert" role="alert">
          Progres Listrik Dinamis belum dapat disimpan di browser ini.
        </p>
      )}
      <section className="dashboard-hero learning-hero">
        <div className="hero-copy">
          <span className="hero-tag">
            <span /> LISTRIK DINAMIS
          </span>
          <h1>Selamat datang, Ilmuwan Muda! ⚡</h1>
          <p>Setiap rasa ingin tahu adalah awal dari penemuan hebat.</p>
        </div>
        <div className="hero-art hero-interactive">
          <CircuitAnimation variant="dashboard" />
        </div>
      </section>

      <section
        className="learning-path-grid"
        aria-label="Jalur belajar Listrik Dinamis"
      >
        <PathCard
          icon="📚"
          title="Learning Path"
          variant="lessons"
          number="01"
          action="Explore Lessons"
          steps={dynamicTopics.map((topic) => ({
            title: topic.title,
            done: learning.materials.includes(topic.id),
            ready: materialReady(topic.id),
          }))}
          onOpen={() => setView({ type: 'catalog', path: 'material' })}
        />
        <PathCard
          icon="🔬"
          title="PhET Challenge"
          variant="challenge"
          number="02"
          action="Start Challenge"
          steps={dynamicTopics.map((topic) => ({
            title: topic.title,
            done: learning.challenges.includes(topic.id),
            ready: challengeReady(topic.id),
          }))}
          onOpen={() => setView({ type: 'catalog', path: 'challenge' })}
        />
        <PathCard
          icon="📝"
          title="Quizzes & Assessment"
          variant="assessment"
          number="03"
          action="Test Your Knowledge"
          steps={[
            ...dynamicTopics.map((topic) => ({
              title: topic.title,
              done: Boolean(learning.quizzes[topic.id]?.complete),
              ready: Boolean(quizReady(topic.id)),
            })),
            {
              title: 'Sumatif Listrik Dinamis',
              done: learning.summative.submitted,
              ready: allQuizDone,
            },
          ]}
          onOpen={() => setView({ type: 'catalog', path: 'quiz' })}
        />
      </section>

      <section
        className="content-card learning-progress"
        aria-labelledby="learning-progress-title"
      >
        <div>
          <span className="section-kicker">
            <Sparkles size={16} /> PROGRES BELAJAR LISTRIK DINAMIS
          </span>
          <h2 id="learning-progress-title">Kamu sudah berada di mana?</h2>
          <p>Langkah berikutnya: {nextLabel}.</p>
          <button className="text-button" onClick={() => setView(next)}>
            Buka tahap berikutnya <ArrowRight size={16} />
          </button>
        </div>
        <div
          className="learning-meter"
          role="progressbar"
          aria-label="Progres Listrik Dinamis"
          aria-valuenow={done}
          aria-valuemin={0}
          aria-valuemax={units}
        >
          <span style={{ width: `${(done / units) * 100}%` }} />
        </div>
        <strong>{Math.round((done / units) * 100)}%</strong>
        <ol className="learning-timeline">
          <li className={materialCount === 6 ? 'done' : ''}>
            Materi <small>{materialCount}/6</small>
          </li>
          <li className={challengeCount === 6 ? 'done' : ''}>
            Challenge <small>{challengeCount}/6</small>
          </li>
          <li className={quizCount === 6 ? 'done' : ''}>
            Formatif <small>{quizCount}/6</small>
          </li>
          <li className={learning.summative.submitted ? 'done' : ''}>
            Sumatif{' '}
            <small>
              {learning.summative.submitted
                ? 'Selesai'
                : allQuizDone
                  ? 'Terbuka'
                  : 'Terkunci'}
            </small>
          </li>
        </ol>
      </section>
    </main>
  )
}

function PathCard({
  icon,
  title,
  variant,
  number,
  action,
  steps,
  onOpen,
}: {
  icon: string
  title: string
  variant: 'lessons' | 'challenge' | 'assessment'
  number: string
  action: string
  steps: { title: string; done: boolean; ready: boolean }[]
  onOpen: () => void
}) {
  const completed = steps.filter((step) => step.done).length
  const active = steps.findIndex((step) => !step.done && step.ready)
  const summaryId = `path-${variant}-progress`
  return (
    <article
      className={`learning-path-card mission-path-card mission-path-${variant}`}
    >
      <div className="mission-card-header" aria-hidden="true">
        <span className="mission-card-number">{number}</span>
        <span className="mission-card-emoji">{icon}</span>
      </div>
      <div className="mission-card-body">
        <h2>{title}</h2>
        <div className="mission-card-progress">
          <p id={summaryId} className="mission-card-count">
            <span className="sr-only">Completed: </span>
            {completed}
            <span> / {steps.length}</span>
          </p>
          <ol className="mission-card-steps" aria-label={`${title} progress`}>
            {steps.map((step, index) => {
              const state = step.done
                ? 'done'
                : index === active
                  ? 'active'
                  : step.ready
                    ? 'next'
                    : 'locked'
              const label = `${index + 1}. ${step.title}: ${state === 'done' ? 'Completed' : state === 'active' ? 'Ready to continue' : state === 'next' ? 'Available' : 'Locked'}`
              return (
                <li
                  key={step.title}
                  className={`mission-step ${state}`}
                  aria-label={label}
                  title={label}
                >
                  <span aria-hidden="true">
                    {state === 'done' ? (
                      <CheckCircle2 />
                    ) : state === 'locked' ? (
                      <LockKeyhole />
                    ) : (
                      <i />
                    )}
                  </span>
                </li>
              )
            })}
          </ol>
        </div>
        <button
          type="button"
          className="mission-card-action"
          onClick={onOpen}
          aria-label={action}
          aria-describedby={summaryId}
        >
          {action}
          <ArrowRight size={19} aria-hidden="true" />
        </button>
      </div>
    </article>
  )
}
function PathRow({
  label,
  state,
  onOpen,
}: {
  label: string
  state: string
  onOpen?: () => void
}) {
  const done = state === 'Selesai'
  return (
    <button
      type="button"
      className={`path-row ${state === 'Terkunci' ? 'locked' : ''}`}
      disabled={state === 'Terkunci'}
      onClick={onOpen}
    >
      <span>
        {done ? (
          <CheckCircle2 size={16} />
        ) : state === 'Terkunci' ? (
          <LockKeyhole size={15} />
        ) : (
          <Play size={15} />
        )}
      </span>
      <span>{label}</span>
      <small>{state}</small>
    </button>
  )
}

function PathCatalog({
  path,
  learning,
  materialReady,
  challengeReady,
  quizReady,
  summativeReady,
  onBack,
  onOpen,
}: {
  path: LearningPath
  learning: ReturnType<typeof useDynamicLearning>['learning']
  materialReady: (id: number) => boolean
  challengeReady: (id: number) => boolean
  quizReady: (id: number) => boolean
  summativeReady: boolean
  onBack: () => void
  onOpen: (view: View) => void
}) {
  const heading =
    path === 'material'
      ? 'Materi Listrik Dinamis'
      : path === 'challenge'
        ? 'Challenge Analisis PhET'
        : 'Kuis dan Asesmen'
  return (
    <main className="mission-page page-enter learning-page path-catalog-page">
      <button className="text-button back-button" onClick={onBack}>
        <ArrowLeft size={17} /> Kembali ke Listrik Dinamis
      </button>
      <section className="content-card path-catalog">
        <span className="section-kicker">DAFTAR TAHAP</span>
        <h1>{heading}</h1>
        <p>Pilih tahap yang sudah terbuka untuk melanjutkan pembelajaranmu.</p>
        <div className="path-rows">
          {dynamicTopics.map((topic) => {
            const done =
              path === 'material'
                ? learning.materials.includes(topic.id)
                : path === 'challenge'
                  ? learning.challenges.includes(topic.id)
                  : Boolean(learning.quizzes[topic.id]?.complete)
            const ready =
              path === 'material'
                ? materialReady(topic.id)
                : path === 'challenge'
                  ? challengeReady(topic.id)
                  : quizReady(topic.id)
            const label =
              path === 'material'
                ? topic.title
                : path === 'challenge'
                  ? `Challenge ${topic.id}: ${topic.title}`
                  : `Formatif ${topic.id}: ${topic.title}`
            return (
              <PathRow
                key={topic.id}
                label={label}
                state={stateText(done, ready)}
                onOpen={() => onOpen({ type: path, id: topic.id })}
              />
            )
          })}
          {path === 'quiz' && (
            <PathRow
              label="Sumatif Listrik Dinamis"
              state={stateText(learning.summative.submitted, summativeReady)}
              onOpen={() => onOpen({ type: 'summative' })}
            />
          )}
        </div>
      </section>
    </main>
  )
}

function LearningPanel({
  view,
  onBack,
  onOpen,
  store,
  materialReady,
  challengeReady,
  quizReady,
  summativeReady,
}: {
  view: Exclude<View, { type: 'home' } | { type: 'catalog' }>
  onBack: () => void
  onOpen: (view: View) => void
  store: ReturnType<typeof useDynamicLearning>
  materialReady: (id: number) => boolean
  challengeReady: (id: number) => boolean
  quizReady: (id: number) => boolean
  summativeReady: boolean
}) {
  const topic = 'id' in view ? dynamicTopics[view.id - 1] : null
  const blocked =
    topic &&
    ((view.type === 'material' && !materialReady(topic.id)) ||
      (view.type === 'challenge' && !challengeReady(topic.id)) ||
      (view.type === 'quiz' && !quizReady(topic.id)))
  return (
    <main className="mission-page page-enter learning-page">
      <button className="text-button back-button" onClick={onBack}>
        <ArrowLeft size={17} /> Kembali ke Listrik Dinamis
      </button>
      {blocked ? (
        <Locked topic={topic!} type={view.type} />
      ) : view.type === 'material' ? (
        <Material
          topic={topic!}
          done={store.learning.materials.includes(topic!.id)}
          onDone={() => store.markMaterial(topic!.id)}
          quizAvailable={quizReady(topic!.id)}
          onQuiz={() => onOpen({ type: 'quiz', id: topic!.id })}
          onBack={() => onOpen({ type: 'catalog', path: 'material' })}
        />
      ) : view.type === 'challenge' ? (
        <Challenge topic={topic!} store={store} onBack={onBack} />
      ) : view.type === 'quiz' ? (
        <Formative
          topic={topic!}
          store={store}
          onBack={() => onOpen({ type: 'catalog', path: 'quiz' })}
          onReview={() => onOpen({ type: 'material', id: topic!.id })}
          onChallenge={() => onOpen({ type: 'challenge', id: topic!.id })}
          onNext={() =>
            onOpen(
              topic!.id < dynamicTopics.length
                ? { type: 'material', id: topic!.id + 1 }
                : { type: 'summative' },
            )
          }
        />
      ) : summativeReady ? (
        <Summative store={store} onBack={onBack} />
      ) : (
        <section className="content-card">
          <LockKeyhole />
          <h1>Asesmen sumatif masih terkunci</h1>
          <p>
            Selesaikan enam kuis formatif secara berurutan untuk membukanya.
          </p>
        </section>
      )}
    </main>
  )
}
function Locked({
  topic,
  type,
}: {
  topic: (typeof dynamicTopics)[number]
  type: string
}) {
  return (
    <section className="content-card locked-panel">
      <LockKeyhole size={30} />
      <h1>Tahap ini belum terbuka</h1>
      <p>
        {type === 'material'
          ? `Selesaikan kuis formatif sebelumnya sebelum mempelajari ${topic.title}.`
          : type === 'challenge'
            ? `Selesaikan materi ${topic.title} terlebih dahulu.`
            : `Selesaikan materi ${topic.title} dan kuis formatif sebelumnya terlebih dahulu.`}
      </p>
    </section>
  )
}
function Material({
  topic,
  done,
  onDone,
  quizAvailable,
  onQuiz,
  onBack,
}: {
  topic: (typeof dynamicTopics)[number]
  done: boolean
  onDone: () => void
  quizAvailable: boolean
  onQuiz: () => void
  onBack: () => void
}) {
  return (
    <section className="content-card learning-detail">
      <span className="section-kicker">
        MATERI {String(topic.id).padStart(2, '0')}
      </span>
      <h1>{topic.title}</h1>
      <h2>Tujuan belajar</h2>
      <p>{topic.objective}</p>
      <h2>Konsep inti</h2>
      <p>{topic.lesson}</p>
      <div className="learning-summary">
        <strong>Ringkasan</strong>
        <p>{topic.summary}</p>
      </div>
      {done ? (
        <div className="learning-completion">
          <p className="success-note" role="status">
            <CheckCircle2 size={20} aria-hidden="true" /> Materi selesai.
            Sekarang cek pemahamanmu melalui kuis formatif.
          </p>
          {!quizAvailable && (
            <p>Selesaikan kuis formatif sebelumnya untuk membuka kuis ini.</p>
          )}
          <div className="learning-actions">
            <button
              className="primary-button"
              disabled={!quizAvailable}
              onClick={onQuiz}
            >
              Kerjakan Kuis Formatif <ArrowRight size={17} />
            </button>
          </div>
        </div>
      ) : (
        <button className="primary-button" onClick={onDone}>
          Tandai sudah dipelajari <CheckCircle2 size={17} />
        </button>
      )}
      <button className="text-button" onClick={onBack}>
        Kembali ke daftar materi <ArrowRight size={16} />
      </button>
    </section>
  )
}
function Challenge({
  topic,
  store,
  onBack,
}: {
  topic: (typeof dynamicTopics)[number]
  store: ReturnType<typeof useDynamicLearning>
  onBack: () => void
}) {
  const current = store.learning.challengeDrafts[topic.id] ?? {
    visited: false,
    observation: '',
    reflection: '',
  }
  const [draft, setDraft] = useState(current)
  const complete = store.learning.challenges.includes(topic.id)
  const save = (next: typeof draft) => {
    setDraft(next)
    store.saveChallenge(topic.id, next)
  }
  const canComplete =
    draft.visited &&
    draft.observation.trim().length >= 8 &&
    draft.reflection.trim().length >= 8
  return (
    <section className="learning-challenge">
      <section className="content-card learning-detail">
        <span className="section-kicker">
          CHALLENGE {String(topic.id).padStart(2, '0')}
        </span>
        <h1>{topic.title}</h1>
        <p>{topic.challenge}</p>
      </section>
      <PhetLab
        visited={draft.visited}
        onVisit={() => save({ ...draft, visited: true })}
      />
      <section className="content-card">
        <h2>Catatan analisismu</h2>
        <label className="guided-field">
          {topic.observationPrompt}
          <textarea
            value={draft.observation}
            onChange={(e) => save({ ...draft, observation: e.target.value })}
            placeholder="Tulis hasil yang benar-benar kamu amati."
          />
        </label>
        <label className="guided-field">
          {topic.reflectionPrompt}
          <textarea
            value={draft.reflection}
            onChange={(e) => save({ ...draft, reflection: e.target.value })}
            placeholder="Hubungkan pengamatanmu dengan konsep."
          />
        </label>
        {complete ? (
          <p className="success-note">
            <CheckCircle2 size={18} /> Challenge selesai. Catatanmu tersimpan.
          </p>
        ) : (
          <button
            disabled={!canComplete}
            className="primary-button"
            onClick={() => store.completeChallenge(topic.id)}
          >
            Selesaikan challenge <CheckCircle2 size={17} />
          </button>
        )}
        <p className="guided-help">
          VoltQuest tidak membaca hasil PhET otomatis; kamu mengisi pengamatan
          sendiri.
        </p>
        <button className="text-button" onClick={onBack}>
          Kembali ke progres
        </button>
      </section>
    </section>
  )
}
function Formative({
  topic,
  store,
  onBack,
  onReview,
  onChallenge,
  onNext,
}: {
  topic: (typeof dynamicTopics)[number]
  store: ReturnType<typeof useDynamicLearning>
  onBack: () => void
  onReview: () => void
  onChallenge: () => void
  onNext: () => void
}) {
  const saved = store.learning.quizzes[topic.id]
  const [answer, setAnswer] = useState(saved?.answer ?? '')
  const [checked, setChecked] = useState(Boolean(saved))
  const numeric = Number(answer.replace(',', '.'))
  const correct =
    Number.isFinite(numeric) && Math.abs(numeric - topic.answer) < 0.001
  function submit(e: React.FormEvent) {
    e.preventDefault()
    store.submitQuiz(topic.id, answer, correct)
    setChecked(true)
  }
  return (
    <section className="content-card learning-detail quiz-detail">
      <span className="section-kicker">
        KUIS FORMATIF {String(topic.id).padStart(2, '0')}
      </span>
      <h1>{topic.title}</h1>
      <p className="quiz-question">{topic.question}</p>
      <form onSubmit={submit}>
        <label className="guided-field">
          Jawaban angka <span>dalam {topic.unit}</span>
          <input
            inputMode="decimal"
            required
            value={answer}
            onChange={(e) => {
              setAnswer(e.target.value)
              setChecked(false)
            }}
            aria-describedby="quiz-reminder"
          />
        </label>
        <button className="primary-button">Periksa jawaban</button>
      </form>
      {checked && (
        <div
          className={correct ? 'quiz-feedback correct' : 'quiz-feedback'}
          role="status"
        >
          <strong>
            {correct ? 'Jawabanmu tepat.' : 'Belum tepat, mari revisi.'}
          </strong>
          <p>
            {correct
              ? topic.explanation
              : 'Ingat kembali materinya: ' + topic.reminder}
          </p>
          {!correct && (
            <button
              className="secondary-button"
              onClick={() => setChecked(false)}
            >
              Coba revisi jawaban
            </button>
          )}
          {correct && (
            <p className="success-note">
              <CheckCircle2 size={18} /> Kuis formatif selesai.
            </p>
          )}
        </div>
      )}
      {saved?.complete && (
        <div className="learning-actions quiz-next-actions">
          <button className="primary-button" onClick={onNext}>
            {topic.id < dynamicTopics.length
              ? 'Lanjut ke materi berikutnya'
              : 'Kerjakan asesmen sumatif'}{' '}
            <ArrowRight size={17} />
          </button>
          <button className="secondary-button" onClick={onChallenge}>
            Buka Challenge PhET <FlaskConical size={17} />
          </button>
          <button className="text-button" onClick={onBack}>
            Kembali ke daftar belajar
          </button>
        </div>
      )}
      <aside id="quiz-reminder" className="learning-summary">
        <strong>Ingat kembali materinya</strong>
        <p>{topic.summary}</p>
        <button className="text-button" onClick={onReview}>
          Pelajari kembali materi
        </button>
      </aside>
    </section>
  )
}
function Summative({
  store,
  onBack,
}: {
  store: ReturnType<typeof useDynamicLearning>
  onBack: () => void
}) {
  const initial = store.learning.summative
  const [answers, setAnswers] = useState(initial.answers)
  const [essays, setEssays] = useState(initial.essays)
  const [submitted, setSubmitted] = useState(initial.submitted)
  const wrong = summativeQuestions.filter(
    (question) => answers[question.id] !== question.answer,
  )
  const ready =
    summativeQuestions.every((question) =>
      Number.isInteger(answers[question.id]),
    ) && essays.every((essay) => essay.trim().length >= 20)
  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (wrong.length) {
      setSubmitted(false)
      store.saveSummative(answers, essays, false)
    } else {
      setSubmitted(true)
      store.saveSummative(answers, essays, true)
    }
  }
  return (
    <section className="content-card learning-detail summative-detail">
      <span className="section-kicker">ASESMEN SUMATIF</span>
      <h1>Listrik Dinamis</h1>
      <p>
        Selesaikan pilihan ganda dan uraian. Uraian disimpan untuk dibaca dengan
        rubrik; VoltQuest tidak mengklaim menilai uraian secara otomatis.
      </p>
      <form onSubmit={submit}>
        {summativeQuestions.map((q, index) => (
          <fieldset key={q.id}>
            <legend>
              {index + 1}. {q.question}
            </legend>
            {q.options.map((option, optionIndex) => (
              <label className="answer-option" key={option}>
                <input
                  type="radio"
                  name={q.id}
                  checked={answers[q.id] === optionIndex}
                  onChange={() =>
                    setAnswers({ ...answers, [q.id]: optionIndex })
                  }
                />
                <span>{option}</span>
              </label>
            ))}
            {submitted || Object.hasOwn(answers, q.id) ? (
              answers[q.id] === q.answer ? (
                <p className="answer-correct">Benar. {q.explanation}</p>
              ) : (
                <p className="answer-wrong">
                  Ingat kembali materinya: {q.reminder}
                </p>
              )
            ) : null}
          </fieldset>
        ))}
        {summativeEssays.map((question, index) => (
          <label className="guided-field" key={question}>
            Uraian {index + 4}. {question}
            <textarea
              value={essays[index] ?? ''}
              onChange={(e) => {
                const next = [...essays]
                next[index] = e.target.value
                setEssays(next)
              }}
              placeholder="Tulis langkah, alasan, dan satuan yang relevan."
            />
          </label>
        ))}
        <button className="primary-button" disabled={!ready}>
          Kirim asesmen sumatif <ArrowRight size={17} />
        </button>
      </form>
      {!submitted && wrong.length > 0 && (
        <div className="quiz-feedback">
          <strong>Masih ada jawaban pilihan ganda yang perlu direvisi.</strong>
          <p>
            Gunakan pengingat di bawah soal, lalu periksa kembali jawabanmu.
          </p>
        </div>
      )}
      {submitted && (
        <p className="success-note">
          <CheckCircle2 size={18} /> Asesmen tersimpan. Gunakan rubrik dokumen
          untuk meninjau dua jawaban uraian bersama guru atau secara mandiri.
        </p>
      )}
      <button className="text-button" onClick={onBack}>
        Kembali ke progres
      </button>
    </section>
  )
}
