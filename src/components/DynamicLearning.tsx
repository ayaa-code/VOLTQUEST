import { useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
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

type View =
  | { type: 'home' }
  | { type: 'material'; id: number }
  | { type: 'challenge'; id: number }
  | { type: 'quiz'; id: number }
  | { type: 'summative' }

const stateText = (done: boolean, ready: boolean) =>
  done ? 'Selesai' : ready ? 'Siap dikerjakan' : 'Terkunci'

export function DynamicLearning({
  profileId,
  name,
}: {
  profileId: string
  name: string
}) {
  const store = useDynamicLearning(profileId)
  const [view, setView] = useState<View>({ type: 'home' })
  const { learning } = store
  const materialReady = (id: number) =>
    id === 1 || learning.materials.includes(id - 1)
  const challengeReady = (id: number) => learning.materials.includes(id)
  const quizReady = (id: number) =>
    learning.materials.includes(id) &&
    (id === 1 || learning.quizzes[id - 1]?.complete)
  const allQuizDone = dynamicTopics.every(
    (topic) => learning.quizzes[topic.id]?.complete,
  )
  const next = (() : View => {
    for (const topic of dynamicTopics) {
      if (!learning.materials.includes(topic.id))
        return { type: 'material', id: topic.id }
      if (!learning.challenges.includes(topic.id))
        return { type: 'challenge', id: topic.id }
      if (!learning.quizzes[topic.id]?.complete)
        return { type: 'quiz', id: topic.id }
    }
    return { type: 'summative' }
  })()
  if (view.type !== 'home')
    return (
      <LearningPanel
        view={view}
        onBack={() => setView({ type: 'home' })}
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
          <h1>
            Selamat datang, {name}! <span className="wave">✦</span>
          </h1>
          <h2>Petualangan Listrik Dinamis</h2>
          <p>
            Pelajari konsep, analisis rangkaian di PhET, lalu tunjukkan
            pemahamanmu lewat asesmen bertahap.
          </p>
          <p className="hero-stage">
            Tahapmu saat ini: <strong>{nextLabel}</strong>.
          </p>
          <button className="primary-button" onClick={() => setView(next)}>
            Lanjutkan belajar <ArrowRight size={17} />
          </button>
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
          icon={<BookOpen />}
          title="Materi Listrik Dinamis"
          count={`${materialCount}/6 selesai`}
          onOpen={() =>
            setView({
              type: 'material',
              id:
                dynamicTopics.find(
                  (topic) =>
                    materialReady(topic.id) &&
                    !learning.materials.includes(topic.id),
                )?.id ?? 1,
            })
          }
        >
          {dynamicTopics.map((topic) => (
            <PathRow
              key={topic.id}
              label={topic.title}
              state={stateText(
                learning.materials.includes(topic.id),
                materialReady(topic.id),
              )}
            />
          ))}
        </PathCard>
        <PathCard
          icon={<FlaskConical />}
          title="Challenge Analisis PhET"
          count={`${challengeCount}/6 selesai`}
          onOpen={() =>
            setView({
              type: 'challenge',
              id:
                dynamicTopics.find(
                  (topic) =>
                    challengeReady(topic.id) &&
                    !learning.challenges.includes(topic.id),
                )?.id ?? 1,
            })
          }
        >
          {dynamicTopics.map((topic) => (
            <PathRow
              key={topic.id}
              label={`Challenge ${topic.id}: ${topic.title}`}
              state={stateText(
                learning.challenges.includes(topic.id),
                challengeReady(topic.id),
              )}
            />
          ))}
        </PathCard>
        <PathCard
          icon={<ClipboardCheck />}
          title="Kuis dan Asesmen"
          count={`${quizCount}/6 formatif`}
          onOpen={() =>
            setView({
              type: 'quiz',
              id:
                dynamicTopics.find(
                  (topic) =>
                    quizReady(topic.id) &&
                    !learning.quizzes[topic.id]?.complete,
                )?.id ?? 1,
            })
          }
        >
          {dynamicTopics.map((topic) => (
            <PathRow
              key={topic.id}
              label={`Formatif ${topic.id}: ${topic.title}`}
              state={stateText(
                Boolean(learning.quizzes[topic.id]?.complete),
                quizReady(topic.id),
              )}
            />
          ))}
          <PathRow
            label="Sumatif Listrik Dinamis"
            state={stateText(learning.summative.submitted, allQuizDone)}
          />
        </PathCard>
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
  count,
  children,
  onOpen,
}: {
  icon: React.ReactNode
  title: string
  count: string
  children: React.ReactNode
  onOpen: () => void
}) {
  return (
    <section className="learning-path-card">
      <div className="path-card-icon">{icon}</div>
      <div>
        <h2>{title}</h2>
        <p>{count}</p>
      </div>
      <div className="path-rows">{children}</div>
      <button className="secondary-button" onClick={onOpen}>
        Buka tahap <ArrowRight size={16} />
      </button>
    </section>
  )
}
function PathRow({ label, state }: { label: string; state: string }) {
  const done = state === 'Selesai'
  return (
    <div className={`path-row ${state === 'Terkunci' ? 'locked' : ''}`}>
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
    </div>
  )
}

function LearningPanel({
  view,
  onBack,
  store,
  materialReady,
  challengeReady,
  quizReady,
  summativeReady,
}: {
  view: Exclude<View, { type: 'home' }>
  onBack: () => void
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
          onNext={onBack}
        />
      ) : view.type === 'challenge' ? (
        <Challenge topic={topic!} store={store} onBack={onBack} />
      ) : view.type === 'quiz' ? (
        <Formative topic={topic!} store={store} onBack={onBack} />
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
          ? `Selesaikan materi sebelumnya sebelum mempelajari ${topic.title}.`
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
  onNext,
}: {
  topic: (typeof dynamicTopics)[number]
  done: boolean
  onDone: () => void
  onNext: () => void
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
        <p className="success-note">
          <CheckCircle2 size={18} /> Materi ini sudah selesai dipelajari.
        </p>
      ) : (
        <button className="primary-button" onClick={onDone}>
          Tandai sudah dipelajari <CheckCircle2 size={17} />
        </button>
      )}
      <button className="text-button" onClick={onNext}>
        Lihat progres belajar <ArrowRight size={16} />
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
}: {
  topic: (typeof dynamicTopics)[number]
  store: ReturnType<typeof useDynamicLearning>
  onBack: () => void
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
      <aside id="quiz-reminder" className="learning-summary">
        <strong>Ingat kembali materinya</strong>
        <p>{topic.summary}</p>
        <button className="text-button" onClick={onBack}>
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
