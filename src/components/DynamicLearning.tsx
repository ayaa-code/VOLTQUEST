import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  LockKeyhole,
  Play,
  Sparkles,
} from 'lucide-react'
import { CircuitAnimation } from './CircuitAnimation'
import { ChallengeWorksheet } from './ChallengeWorksheet'
import { AssistantChat } from './AssistantChat'
import { CurrentFormativeGame } from './CurrentFormativeGame'
import { EnergyControlRoom } from './EnergyControlRoom'
import { checkpointDone } from '../data/checkpoints'
import {
  dynamicTopics,
  summativeEssays,
  summativeQuestions,
} from '../data/dynamicElectricity'
import { useDynamicLearning } from '../hooks/useDynamicLearning'
import {
  learningAccess,
  challengePrerequisite,
  summativePrerequisite,
} from '../data/learningAccess'
import { LessonContent, LessonResources } from './LessonContent'
import './MissionPathCards.css'
import './PathCatalog.css'
import './JourneyProgress.css'
import { missions } from '../data/missions'
import { MissionView } from './MissionView'
import { passedQuestion } from '../data/attempts'

type View =
  | { type: 'home' }
  | { type: 'catalog'; path: LearningPath }
  | { type: 'material'; id: number }
  | { type: 'challenge'; id: number }
  | { type: 'quiz'; id: number }
  | { type: 'summative' }
  | { type: 'mission'; id: number }

type LearningPath = 'material' | 'challenge' | 'quiz'

const stateText = (done: boolean, ready: boolean) =>
  done ? 'Selesai' : ready ? 'Siap dikerjakan' : 'Terkunci'

export function DynamicLearning({
  profileId,
  progressOnly = false,
  initialMissionId,
  onLeaveProgress = () => {},
  onReward = () => {},
}: {
  profileId: string
  progressOnly?: boolean
  initialMissionId?: number
  onLeaveProgress?: () => void
  onReward?: (id: number) => void
}) {
  const store = useDynamicLearning(profileId)
  const [view, setView] = useState<View>(
    initialMissionId
      ? { type: 'mission', id: initialMissionId }
      : { type: 'home' },
  )
  const open = (next: View) => {
    onLeaveProgress()
    setView(next)
  }
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [view])
  const { learning } = store
  const { materialReady, challengeReady, quizReady, summativeReady } =
    learningAccess(learning, profileId)
  const next = ((): View => {
    for (const topic of dynamicTopics) {
      if (!learning.materials.includes(topic.id))
        return { type: 'material', id: topic.id }
      if (
        (topic.id === 3 || topic.id === 6) &&
        !checkpointDone(learning, topic.id / 3)
      )
        return topic.id === 3 &&
          !learningAccess(learning, profileId).missionsDone
          ? { type: 'challenge', id: 1 }
          : { type: 'quiz', id: topic.id / 3 }
    }
    return { type: 'summative' }
  })()
  if (!progressOnly && view.type === 'mission') {
    const mission = missions.find((m) => m.id === view.id)!
    const access = learningAccess(learning, profileId)
    if (!access.missionReady(mission.id))
      return (
        <main className="mission-page">
          <button
            className="text-button"
            onClick={() => open({ type: 'challenge', id: 1 })}
          >
            Kembali ke Challenge
          </button>
          <section className="content-card">
            <h1>Misi terkunci</h1>
            <p>Pelajari materi terkait terlebih dahulu.</p>
          </section>
        </main>
      )
    const record = learning.questions?.[`phet:${mission.id}`]
    return (
      <MissionView
        key={`${profileId}:phet:${mission.id}`}
        profileId={profileId}
        mission={mission}
        completed={record?.status === 'correct'}
        visited={learning.phetVisited?.includes(mission.id) ?? false}
        onComplete={() => {}}
        onVisit={() => store.visitPhet(mission.id)}
        onPractice={() => {}}
        onRecommended={() => {}}
        onBack={() => open({ type: 'challenge', id: 1 })}
        onNext={() =>
          open(
            mission.id === 1
              ? { type: 'mission', id: 3 }
              : mission.id === 3
                ? { type: 'quiz', id: 1 }
                : { type: 'challenge', id: 1 },
          )
        }
        assessment={{
          progress: record,
          onSubmit: async (answer) => {
            const result = await store.answerPhet(mission.id, answer)
            if (result.saved && result.correct) onReward(mission.id)
            return result
          },
          onSkip: () => store.continueWithSupport('phet', mission.id),
          onReview: () =>
            open({
              type: 'material',
              id:
                mission.id === 1
                  ? 1
                  : mission.id === 3
                    ? 2
                    : mission.id === 2
                      ? 4
                      : 6,
            }),
        }}
      />
    )
  }
  if (!progressOnly && view.type === 'catalog')
    return (
      <PathCatalog
        path={view.path}
        learning={learning}
        materialReady={materialReady}
        challengeReady={challengeReady}
        quizReady={quizReady}
        summativeReady={summativeReady}
        onBack={() => setView({ type: 'home' })}
        onOpen={(nextView) => setView(nextView)}
      />
    )
  if (
    !progressOnly &&
    view.type !== 'home' &&
    view.type !== 'catalog' &&
    view.type !== 'mission'
  )
    return (
      <LearningPanel
        key={`${view.type}:${'id' in view ? view.id : ''}`}
        view={view}
        onBack={() => setView({ type: 'home' })}
        onOpen={open}
        store={store}
        materialReady={materialReady}
        challengeReady={challengeReady}
        quizReady={quizReady}
        summativeReady={summativeReady}
      />
    )

  const materialCount = learning.materials.length
  const challengeCount = missions.filter((m) =>
    passedQuestion(learning.questions?.[`phet:${m.id}`]),
  ).length
  const quizCount = [1, 2].filter((id) => checkpointDone(learning, id)).length
  const units = 11
  const done =
    materialCount +
    (learningAccess(learning, profileId).missionsDone
      ? 2
      : [1, 3].filter((id) =>
          passedQuestion(learning.questions?.[`phet:${id}`]),
        ).length) +
    quizCount +
    (learning.summative.submitted ? 1 : 0)
  const nextLabel =
    next.type === 'material'
      ? `pelajari ${dynamicTopics[next.id - 1].title}`
      : next.type === 'challenge'
        ? 'jalani misi PhET'
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
      {!progressOnly && (
        <>
          <section className="dashboard-hero learning-hero">
            <div className="hero-copy">
              <span className="hero-tag">
                <span /> DYNAMIC ELECTRICITY
              </span>
              <h1>Welcome, Young Scientist! ⚡</h1>
              <p>Every great discovery begins with curiosity.</p>
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
              steps={missions.map((m) => ({
                title: m.title,
                done: passedQuestion(learning.questions?.[`phet:${m.id}`]),
                ready: learningAccess(learning, profileId).missionReady(m.id),
              }))}
              onOpen={() => setView({ type: 'challenge', id: 1 })}
            />
            <PathCard
              icon="📝"
              title="Quizzes & Assessment"
              variant="assessment"
              number="03"
              action="Test Your Knowledge"
              steps={[
                ...[1, 2].map((id) => ({
                  title: `Formative Checkpoint ${id}`,
                  done: checkpointDone(learning, id),
                  ready: Boolean(quizReady(id)),
                })),
                {
                  title: 'Sumatif Listrik Dinamis',
                  done: learning.summative.submitted,
                  ready: summativeReady,
                },
              ]}
              onOpen={() => setView({ type: 'catalog', path: 'quiz' })}
            />
          </section>
        </>
      )}
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
          <button className="text-button" onClick={() => open(next)}>
            Lanjutkan belajar <ArrowRight size={16} />
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
          <li className={challengeCount === 5 ? 'done' : ''}>
            Misi PhET <small>{challengeCount}/5</small>
          </li>
          <li className={quizCount === 2 ? 'done' : ''}>
            Formatif <small>{quizCount}/2</small>
          </li>
          <li className={learning.summative.submitted ? 'done' : ''}>
            Sumatif{' '}
            <small>
              {learning.summative.submitted
                ? 'Selesai'
                : summativeReady
                  ? 'Terbuka'
                  : 'Terkunci'}
            </small>
          </li>
        </ol>
        <div
          className="progress-checkpoints"
          aria-label="Status asesmen dan misi"
        >
          {[1, 2].map((id) => (
            <p key={id}>
              <strong>Formatif {id}</strong> ·{' '}
              {Object.entries(learning.questions ?? {}).some(
                ([key, q]) =>
                  key.startsWith(id === 1 ? 'piko:' : 'energy:') &&
                  q.status === 'reinforcement',
              )
                ? '⚑ Perlu penguatan'
                : checkpointDone(learning, id)
                  ? '✓ Selesai'
                  : quizReady(id)
                    ? '○ Terbuka'
                    : '🔒 Terkunci'}
            </p>
          ))}
          {missions.map((m) => {
            const q = learning.questions?.[`phet:${m.id}`]
            return (
              <p key={m.id}>
                {m.title} ·{' '}
                {q?.status === 'reinforcement'
                  ? '⚑ Perlu penguatan'
                  : q?.status === 'correct'
                    ? '✓ Jawaban benar'
                    : learningAccess(learning, profileId).missionReady(m.id)
                      ? '○ Terbuka'
                      : '🔒 Terkunci'}
              </p>
            )
          })}
          <small>
            Persentase menunjukkan perjalanan tahap, bukan nilai penguasaan.
          </small>
          {checkpointDone(learning, 1) &&
            ![1, 3].every((id) =>
              passedQuestion(learning.questions?.[`phet:${id}`]),
            ) && <small>Prasyarat misi diakui dari progres sebelumnya.</small>}
        </div>
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
  number,
}: {
  label: string
  state: string
  onOpen?: () => void
  number?: number
}) {
  const done = state === 'Selesai'
  return (
    <button
      type="button"
      className={`path-row ${state === 'Terkunci' ? 'locked' : state === 'Perlu penguatan' ? 'reinforcement' : done ? 'done' : 'ready'}`}
      disabled={state === 'Terkunci'}
      onClick={onOpen}
      aria-label={label}
    >
      <span className="path-row-number">
        {number ? (
          String(number).padStart(2, '0')
        ) : done ? (
          <CheckCircle2 size={16} />
        ) : state === 'Terkunci' ? (
          <LockKeyhole size={15} />
        ) : (
          <Play size={15} />
        )}
      </span>
      <span className="path-row-copy">
        <strong>{label}</strong>
        <small>
          {done ? (
            <CheckCircle2 size={13} />
          ) : state === 'Terkunci' ? (
            <LockKeyhole size={13} />
          ) : (
            <Play size={13} />
          )}{' '}
          {state}
        </small>
      </span>
      <ArrowRight className="path-row-arrow" size={18} aria-hidden="true" />
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
      <section className={`content-card path-catalog path-catalog-${path}`}>
        <header className="path-catalog-heading">
          <span className="section-kicker">DAFTAR TAHAP</span>
          <h1>{heading}</h1>
          <p>Pilih tahap yang tersedia untuk melanjutkan belajarmu.</p>
        </header>
        {path === 'challenge' && (
          <p className="learning-summary">{challengePrerequisite}</p>
        )}
        {path === 'quiz' && (
          <p className="learning-summary">{summativePrerequisite}</p>
        )}
        <div className="path-rows">
          {(path === 'challenge'
            ? dynamicTopics.slice(0, 1)
            : path === 'quiz'
              ? dynamicTopics.slice(0, 2)
              : dynamicTopics
          ).map((topic) => {
            const done =
              path === 'material'
                ? learning.materials.includes(topic.id)
                : path === 'challenge'
                  ? Boolean(learning.worksheet?.completedAt)
                  : checkpointDone(learning, topic.id)
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
                  ? 'Challenge'
                  : `Formative Checkpoint ${topic.id}`
            return (
              <PathRow
                key={topic.id}
                number={topic.id}
                label={label}
                state={stateText(done, ready)}
                onOpen={() => onOpen({ type: path, id: topic.id })}
              />
            )
          })}
          {path === 'quiz' && (
            <PathRow
              label="Sumatif Listrik Dinamis"
              number={3}
              state={stateText(learning.summative.submitted, summativeReady)}
              onOpen={() => onOpen({ type: 'summative' })}
            />
          )}
        </div>
        {path === 'challenge' &&
          Object.keys(learning.challengeDrafts).length > 0 && (
            <details>
              <summary>Catatan Challenge sebelumnya</summary>
              {Object.entries(learning.challengeDrafts).map(([id, draft]) => (
                <section key={id}>
                  <h2>{dynamicTopics[Number(id) - 1]?.title ?? id}</h2>
                  <p>{draft.observation}</p>
                  <p>{draft.reflection}</p>
                  <small>
                    {learning.challenges.includes(Number(id))
                      ? 'Selesai pada alur sebelumnya'
                      : 'Draf lama'}
                  </small>
                </section>
              ))}
            </details>
          )}
      </section>
      {path === 'material' && <LessonResources />}
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
  view: Exclude<
    View,
    { type: 'home' } | { type: 'catalog' } | { type: 'mission' }
  >
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
          quizAvailable={
            topic!.id === 3
              ? challengeReady(1)
              : topic!.id % 3 === 0
                ? quizReady(topic!.id / 3)
                : materialReady(topic!.id + 1)
          }
          onQuiz={() =>
            onOpen(
              topic!.id === 3
                ? { type: 'challenge', id: 1 }
                : topic!.id % 3 === 0
                  ? { type: 'quiz', id: topic!.id / 3 }
                  : { type: 'material', id: topic!.id + 1 },
            )
          }
          onBack={() => onOpen({ type: 'catalog', path: 'material' })}
        />
      ) : view.type === 'challenge' ? (
        <>
          <section className="content-card path-catalog">
            <span className="section-kicker">MISI PHET CHALLENGE</span>
            <h1>Eksplorasi listrik sekolah</h1>
            <p>
              Komponen Rangkaian dan Hukum Ohm wajib sebelum Formatif 1. Misi
              lain adalah penguatan setelah materi terkait.
            </p>
            <div className="path-rows">
              {[1, 3, 2, 4, 5].map((id) => {
                const mission = missions.find((m) => m.id === id)!,
                  q = store.learning.questions?.[`phet:${id}`]
                return (
                  <PathRow
                    key={id}
                    number={id}
                    label={mission.title}
                    state={
                      q?.status === 'reinforcement'
                        ? 'Perlu penguatan'
                        : stateText(
                            q?.status === 'correct',
                            learningAccess(
                              store.learning,
                              store.profileId,
                            ).missionReady(id),
                          )
                    }
                    onOpen={() => onOpen({ type: 'mission', id })}
                  />
                )
              })}
            </div>
          </section>
          <ChallengeWorksheet
            store={store}
            onBack={onBack}
            onSum={() => onOpen({ type: 'summative' })}
            onMaterial={(id) => onOpen({ type: 'material', id })}
          />
        </>
      ) : view.type === 'quiz' ? (
        topic!.id === 1 ? (
          <CurrentFormativeGame
            store={store}
            onBack={() => onOpen({ type: 'catalog', path: 'quiz' })}
            onReview={(id = 1) => onOpen({ type: 'material', id })}
            onNext={() => onOpen({ type: 'material', id: 4 })}
          />
        ) : (
          <EnergyControlRoom
            store={store}
            onBack={() => onOpen({ type: 'catalog', path: 'quiz' })}
            onReview={(id) => onOpen({ type: 'material', id })}
            onNext={() => onOpen({ type: 'summative' })}
          />
        )
      ) : summativeReady ? (
        <Summative store={store} onBack={onBack} />
      ) : (
        <section className="content-card">
          <LockKeyhole />
          <h1>Asesmen sumatif masih terkunci</h1>
          <p>{summativePrerequisite}</p>
        </section>
      )}
      {view.type === 'material' && !blocked && (
        <AssistantChat profileId={store.profileId!} topicId={topic!.id} />
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
            ? challengePrerequisite
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
      <LessonContent topicId={topic.id} />
      <div className="learning-summary">
        <strong>Ringkasan</strong>
        <p>{topic.summary}</p>
      </div>
      {done ? (
        <div className="learning-completion">
          <p className="success-note" role="status">
            <CheckCircle2 size={20} aria-hidden="true" /> Materi selesai.
            {topic.id === 3
              ? 'Lanjutkan eksplorasi melalui misi PhET.'
              : topic.id % 3 === 0
                ? 'Sekarang cek pemahamanmu melalui Formative Checkpoint.'
                : 'Lanjutkan ke submateri berikutnya.'}
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
              {topic.id === 3
                ? 'Mulai Misi PhET'
                : topic.id % 3 === 0
                  ? `Kerjakan Formative Checkpoint ${topic.id / 3}`
                  : 'Lanjut ke materi berikutnya'}{' '}
              <ArrowRight size={17} />
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
