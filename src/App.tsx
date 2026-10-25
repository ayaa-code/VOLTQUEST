import { lazy, Suspense, useEffect, useState } from 'react'
import {
  ArrowRight,
  BookOpen,
  ChevronRight,
  CircleHelp,
  ExternalLink,
  FlaskConical,
  GraduationCap,
  Home,
  Leaf,
  LogOut,
  Search,
  Trophy,
  UserRound,
  X,
  Zap,
} from 'lucide-react'
import { missions } from './data/missions'
import { isAdminDemo } from './data/demoAccess'
const PracticeHub = lazy(() =>
  import('./components/PracticeHub').then((module) => ({
    default: module.PracticeHub,
  })),
)
import type { RecommendationRef } from './data/feedbackRules'
import { Brand, ProgressBar, MissionCard } from './components/LearningUI'
import { CircuitAnimation } from './components/CircuitAnimation'
import { DynamicLearning } from './components/DynamicLearning'
import { LoginPage } from './components/LoginPage'
import { Dialog } from './components/Dialog'
import { useProgress } from './hooks/useProgress'
import './App.css'
import './theme.css'
import { LearningGuide } from './components/LearningGuide'
import './components/LearningRefinements.css'

type Modal = 'guide' | 'profile' | 'help' | 'class' | null
// The former mission dashboard remains in the source while legacy mission URLs
// are supported, but the Listrik Dinamis journey is the active dashboard.
const legacyDashboardVisible = false
function App() {
  const { profile, profileId, storageError, login, logout, complete } =
    useProgress()
  const [loginForm, setLoginForm] = useState(false)
  const [name, setName] = useState('')
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'available' | 'completed'>('all')
  const [selected, setSelected] = useState<number | null>(() => {
    const match = window.location.hash.match(
      /^#(?:misi-|latihan-misi-)([1-5])$/,
    )
    return match ? Number(match[1]) : null
  })
  const [progressOpen, setProgressOpen] = useState(false)
  const [homeRevision, setHomeRevision] = useState(0)
  function resetHome() {
    setPracticeRecommendation(null)
    setPracticeOpen(false)
    setSelected(null)
    setModal(null)
    setProgressOpen(false)
    setHomeRevision((v) => v + 1)
  }
  const [modal, setModal] = useState<Modal>(null)
  const [practiceOpen, setPracticeOpen] = useState(() =>
    /^#latihan(?:-misi-[1-5])?$/.test(window.location.hash),
  )
  const [classCode, setClassCode] = useState('')
  const [practiceRecommendation, setPracticeRecommendation] =
    useState<RecommendationRef | null>(null)
  const [classNotice, setClassNotice] = useState(false)
  const count = profile?.completed.length ?? 0
  const currentMission = missions.find((m) => m.id === selected)
  const nextMission = missions.find((m) => !profile?.completed.includes(m.id))
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [selected, practiceOpen, profile?.name])
  useEffect(() => {
    window.history.replaceState(
      null,
      '',
      `${window.location.pathname}${window.location.search}${profile ? (practiceOpen ? `#latihan${selected ? `-misi-${selected}` : ''}` : selected ? `#misi-${selected}` : '') : ''}`,
    )
  }, [selected, practiceOpen, profile])
  function openMission(id: number) {
    setPracticeRecommendation(null)
    setPracticeOpen(false)
    setSelected(id)
    setModal(null)
    setProgressOpen(false)
  }
  const visibleMissions = missions.filter(
    (m) =>
      m.title
        .toLocaleLowerCase('id-ID')
        .includes(query.trim().toLocaleLowerCase('id-ID')) &&
      (filter === 'all' ||
        (filter === 'completed'
          ? profile?.completed.includes(m.id)
          : !profile?.completed.includes(m.id))),
  )
  return (
    <>
      {storageError && (
        <div role="alert" className="storage-warning">
          Penyimpanan browser tidak tersedia. Progres hanya tersimpan selama
          sesi ini.
        </div>
      )}
      {!profile ? (
        <LoginPage
          onLogin={login}
          legacy={loginForm}
          initialName={name}
          onLegacy={setLoginForm}
          onClass={() => {
            setClassNotice(false)
            setModal('class')
          }}
        />
      ) : (
        <div className="app-shell">
          <header className="app-header">
            <div className="header-inner">
              <button
                className="brand-home"
                aria-label="Beranda VoltQuest"
                onClick={resetHome}
              >
                <Brand small />
              </button>
              <nav className="desktop-nav" aria-label="Navigasi utama">
                <button
                  className={!modal && !progressOpen ? 'active' : ''}
                  onClick={resetHome}
                >
                  <Home size={17} /> Jelajah
                </button>
                <button
                  className={modal === 'guide' ? 'active' : ''}
                  onClick={() => setModal('guide')}
                >
                  <BookOpen size={18} /> Panduan Belajar
                </button>
                <button
                  className={progressOpen && !modal ? 'active' : ''}
                  onClick={() => {
                    setPracticeOpen(false)
                    setSelected(null)
                    setModal(null)
                    setProgressOpen(true)
                  }}
                  aria-current={progressOpen && !modal ? 'page' : undefined}
                >
                  <Trophy size={18} /> Progres
                </button>
              </nav>
              <div className="header-right">
                {isAdminDemo(profileId) && (
                  <span className="section-kicker">Demo</span>
                )}
                <button
                  className="avatar"
                  onClick={() => setModal('profile')}
                  aria-label="Buka profil siswa"
                >
                  {profile.name.charAt(0).toLocaleUpperCase('id-ID')}
                </button>
              </div>
            </div>
          </header>
          {practiceOpen ? (
            <Suspense fallback={<p role="status">Menyiapkan latihan…</p>}>
              <PracticeHub
                key={profileId!}
                profileId={profileId!}
                sourceMissionId={selected}
                initialRecommendation={
                  practiceRecommendation?.profileId === profileId
                    ? practiceRecommendation
                    : null
                }
                onReturn={() => {
                  setPracticeRecommendation(null)
                  setPracticeOpen(false)
                }}
                onDashboard={() => {
                  setPracticeRecommendation(null)
                  setPracticeOpen(false)
                  setSelected(null)
                }}
                onNextMission={() => {
                  setPracticeRecommendation(null)
                  setPracticeOpen(false)
                  setSelected(
                    selected && selected < 5
                      ? selected + 1
                      : (nextMission?.id ?? 1),
                  )
                }}
              />
            </Suspense>
          ) : currentMission ? (
            <DynamicLearning
              key={`${profileId}:${homeRevision}`}
              profileId={profileId!}
              initialMissionId={currentMission.id}
              onReward={complete}
              progressOnly={progressOpen}
              onLeaveProgress={() => setProgressOpen(false)}
            />
          ) : (
            <>
              <DynamicLearning
                key={`${profileId}:${homeRevision}`}
                profileId={profileId!}
                onReward={complete}
                progressOnly={progressOpen}
                onLeaveProgress={() => setProgressOpen(false)}
              />
              {legacyDashboardVisible && (
                <main className="dashboard page-enter">
                  <section className="greeting">
                    <div>
                      <span className="eyebrow greeting-kicker">
                        SELAMAT DATANG, PENJELAJAH
                      </span>
                      <h1>
                        Halo, {profile!.name}! <span className="wave">✦</span>
                      </h1>
                      <p>Mau belajar apa hari ini?</p>
                    </div>
                    <span className="phase-chip">
                      <GraduationCap size={17} /> Fisika Fase F
                    </span>
                  </section>
                  <section className="dashboard-hero">
                    <div className="hero-copy">
                      <span className="hero-tag">
                        <span /> SEKOLAH TANGGUH ENERGI
                      </span>
                      <h2>
                        Amati rangkaian,
                        <br />
                        jelaskan temuanmu.
                      </h2>
                      <p>
                        Coba di PhET. Amati perubahan.
                        <br />
                        Hubungkan temuanmu dengan konsep.
                      </p>
                      <button
                        className="primary-button"
                        onClick={() => openMission(nextMission?.id ?? 1)}
                      >
                        {count === 5
                          ? 'Jelajahi misi lagi'
                          : count
                            ? 'Lanjutkan petualangan'
                            : 'Mulai misi pertama'}
                        <ArrowRight size={17} />
                      </button>
                      <span className="hero-footnote">
                        <FlaskConical size={14} /> Panduan eksperimen dan
                        refleksi
                      </span>
                    </div>
                    <div className="hero-art hero-interactive">
                      <CircuitAnimation variant="dashboard" />
                    </div>
                  </section>
                  <section
                    className="content-card practice-invite"
                    aria-labelledby="practice-invite-title"
                  >
                    <div>
                      <span className="section-kicker">
                        <BookOpen size={16} /> LATIHAN PILIHANMU
                      </span>
                      <h2 id="practice-invite-title">
                        Ingin mencoba situasi lain?
                      </h2>
                      <p>
                        Pilih satu dari lima fokus konsep. Latihan opsional
                        tanpa tambahan XP.
                      </p>
                    </div>
                    <button
                      className="secondary-button"
                      onClick={() => setPracticeOpen(true)}
                    >
                      Buka latihan mandiri <ArrowRight size={17} />
                    </button>
                  </section>
                  <section
                    className="missions-section"
                    aria-labelledby="mission-list-title"
                  >
                    <div className="section-heading">
                      <div>
                        <span className="eyebrow">
                          LANGKAH KECIL, PENEMUAN BESAR
                        </span>
                        <h2 id="mission-list-title">
                          Pilih misi<span className="mission-count">05</span>
                        </h2>
                      </div>
                      <button
                        className="text-button"
                        onClick={() => {
                          setQuery('')
                          setFilter('all')
                        }}
                      >
                        Lihat semua <ArrowRight size={15} />
                      </button>
                    </div>
                    <div className="mission-controls">
                      <div className="filter-tabs" aria-label="Filter misi">
                        {(
                          [
                            { id: 'all', label: 'Semua misi' },
                            { id: 'available', label: 'Belum selesai' },
                            { id: 'completed', label: 'Selesai' },
                          ] as const
                        ).map((item) => (
                          <button
                            key={item.id}
                            aria-pressed={filter === item.id}
                            className={filter === item.id ? 'active' : ''}
                            onClick={() => setFilter(item.id)}
                          >
                            {item.label}
                            {item.id === 'completed' && count > 0 && (
                              <span>{count}</span>
                            )}
                          </button>
                        ))}
                      </div>
                      <label className="search-field">
                        <Search size={17} />
                        <input
                          aria-label="Cari misi"
                          placeholder="Cari misi"
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                        />
                        {query && (
                          <button
                            aria-label="Hapus pencarian"
                            onClick={() => setQuery('')}
                          >
                            <X size={15} />
                          </button>
                        )}
                      </label>
                    </div>
                    <div className="mission-grid">
                      {visibleMissions.map((mission) => (
                        <MissionCard
                          key={mission.id}
                          mission={mission}
                          completed={profile!.completed.includes(mission.id)}
                          onSelect={() => openMission(mission.id)}
                        />
                      ))}
                    </div>
                    {visibleMissions.length === 0 && (
                      <div className="empty-state">
                        <Search size={26} />
                        <h3>
                          {filter === 'completed' && !query
                            ? 'Badge pertamamu menunggu!'
                            : 'Belum ada misi yang cocok'}
                        </h3>
                        <p>
                          {filter === 'completed' && !query
                            ? 'Selesaikan satu misi dan rayakan langkah pertamamu.'
                            : 'Coba kata kunci lain atau tampilkan semua misi.'}
                        </p>
                        <button
                          className="text-button"
                          onClick={() => {
                            setQuery('')
                            setFilter('all')
                          }}
                        >
                          Tampilkan semua misi <ArrowRight size={15} />
                        </button>
                      </div>
                    )}
                  </section>
                  <section className="progress-card">
                    <div className="progress-trophy">
                      <Trophy size={29} strokeWidth={1.5} />
                    </div>
                    <div className="progress-main">
                      <div className="progress-heading">
                        <h2>Progres belajarmu</h2>
                        <span>{count}/5 misi</span>
                      </div>
                      <ProgressBar count={count} />
                      <p>
                        {count === 5
                          ? 'Luar biasa! Kamu menuntaskan seluruh petualangan.'
                          : count
                            ? 'Terus berlatih. Coba jelaskan alasan jawabanmu!'
                            : 'Petualangan hebat dimulai dari satu misi.'}
                      </p>
                    </div>
                    <div className="progress-xp">
                      <Zap size={19} fill="currentColor" />
                      <strong>{count * 100}</strong>
                      <span>Total XP</span>
                    </div>
                    <button
                      className="progress-arrow icon-button"
                      aria-label="Lihat detail progres"
                      onClick={() => {
                        setPracticeOpen(false)
                        setSelected(null)
                        setModal(null)
                        setProgressOpen(true)
                      }}
                      aria-current={progressOpen && !modal ? 'page' : undefined}
                    >
                      <ChevronRight size={21} />
                    </button>
                  </section>
                  <div className="learning-tip">
                    <span className="tip-icon">
                      <Leaf size={19} />
                    </span>
                    <p>
                      <strong>Tahukah kamu?</strong> Mematikan lampu di ruang
                      kosong adalah langkah kecil untuk sekolah yang lebih hemat
                      energi.
                    </p>
                    <span className="tip-spark">✦</span>
                  </div>
                </main>
              )}
            </>
          )}
          <footer className="app-footer">
            <span>
              VoltQuest <span>·</span> Belajar. Jelajahi. Nyalakan perubahan.
            </span>
            <button onClick={() => setModal('help')}>
              <CircleHelp size={15} /> Tentang VoltQuest
            </button>
          </footer>
          <nav className="mobile-nav" aria-label="Navigasi mobile">
            <button
              className={!modal && !progressOpen ? 'active' : ''}
              onClick={resetHome}
            >
              <Home size={20} />
              Jelajah
            </button>
            <button
              className={modal === 'guide' ? 'active' : ''}
              onClick={() => setModal('guide')}
            >
              <BookOpen size={21} />
              Panduan Belajar
            </button>
            <button
              className={progressOpen && !modal ? 'active' : ''}
              aria-current={progressOpen && !modal ? 'page' : undefined}
              onClick={() => {
                setPracticeOpen(false)
                setSelected(null)
                setModal(null)
                setProgressOpen(true)
              }}
            >
              <Trophy size={20} />
              Progres
            </button>
            <button
              className={modal === 'profile' ? 'active' : ''}
              onClick={() => setModal('profile')}
            >
              <UserRound size={20} />
              Profil
            </button>
          </nav>
        </div>
      )}
      {modal === 'guide' && profile && (
        <Dialog title="Panduan Belajar" onClose={() => setModal(null)}>
          <LearningGuide />
        </Dialog>
      )}
      {modal === 'profile' && profile && (
        <Dialog title="Profil penjelajah" onClose={() => setModal(null)}>
          <div className="profile-info">
            <span className="avatar large">
              {profile.name.charAt(0).toLocaleUpperCase('id-ID')}
            </span>
            <h3>{profile.name}</h3>
            {isAdminDemo(profileId) && (
              <span className="section-kicker">Demo</span>
            )}
            <p>Penjelajah Fisika Fase F</p>
            <span className="profile-stats">
              {count} misi selesai <span>·</span> {count * 100} XP
            </span>
          </div>
          <p className="profile-note">
            Ini profil demo lokal. Masuk dengan akun atau nama profil yang sama
            di browser ini untuk melanjutkan progresmu.
          </p>
          <button
            className="secondary-button"
            onClick={() => {
              logout()
              setPracticeRecommendation(null)
              setPracticeOpen(false)
              setSelected(null)
              setModal(null)
              setProgressOpen(false)
              setName(profile.name)
              setLoginForm(profileId?.startsWith('student:') ?? false)
              setQuery('')
              setFilter('all')
            }}
          >
            <LogOut size={17} /> Keluar dari profil
          </button>
        </Dialog>
      )}
      {modal === 'help' && (
        <Dialog title="Tentang VoltQuest" onClose={() => setModal(null)}>
          <div className="about-content">
            <Brand small />
            <p>
              VoltQuest mendampingi eksperimen listrik dinamis untuk siswa SMA /
              MA Fase F melalui misi Sekolah Tangguh Energi.
            </p>
            <p>
              Baca masalah sekolah dan panduannya, coba rangkaian di PhET, lalu
              hubungkan pengamatanmu dengan jawaban refleksi. Saat ini petunjuk
              tersedia per misi.
            </p>
            <p>
              XP dan badge menandai misi yang selesai. Jawaban benar pertama
              memberi 100 XP; mengulang misi tidak menambah XP. Satu jawaban
              benar belum menunjukkan penguasaan seluruh konsep.
            </p>
            <p>
              Nama dan progres profil demo disimpan di browser ini. Gunakan
              browser dan perangkat yang sama untuk melanjutkan.
            </p>
            <p>
              Laboratorium simulasi merupakan karya{' '}
              <a
                href="https://phet.colorado.edu/"
                target="_blank"
                rel="noopener noreferrer"
              >
                PhET Interactive Simulations <ExternalLink size={12} />
              </a>
              , University of Colorado Boulder. VoltQuest menyediakan panduan
              dan refleksi. Simulasi dapat dijalankan di dalam halaman misi atau
              di tab baru. Isi tabel dari pengukuranmu sendiri; VoltQuest tidak
              membaca aktivitas atau angka PhET secara otomatis.
            </p>
          </div>
        </Dialog>
      )}
      {modal === 'class' && (
        <Dialog title="Punya kode kelas?" onClose={() => setModal(null)}>
          <div className="class-content">
            <span className="modal-hero-icon">
              <GraduationCap size={32} />
            </span>
            <p>
              Kamu sedang menggunakan demo VoltQuest. Koneksi ke kelas guru
              belum tersedia, tetapi semua misi bisa kamu jelajahi.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                setClassNotice(true)
              }}
            >
              <label htmlFor="class-code">Kode dari guru</label>
              <input
                id="class-code"
                value={classCode}
                maxLength={20}
                onChange={(e) => {
                  setClassCode(e.target.value)
                  setClassNotice(false)
                }}
                placeholder="Contoh: FISIKA-01"
                required
              />
              <button className="secondary-button" disabled={!classCode.trim()}>
                Periksa kode
              </button>
            </form>
            {classNotice && (
              <p className="class-notice" role="status">
                Kode belum dapat diverifikasi pada mode demo. Lanjutkan dengan
                profil lokal untuk mencoba misi.
              </p>
            )}
            <button
              className="primary-button"
              onClick={() => {
                setModal(null)
                setProgressOpen(false)
                setLoginForm(true)
              }}
            >
              Lanjutkan ke demo <ArrowRight size={17} />
            </button>
          </div>
        </Dialog>
      )}
    </>
  )
}
export default App
