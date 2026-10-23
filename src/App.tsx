import { useEffect, useState } from 'react'
import {
  ArrowRight,
  Award,
  BookOpen,
  Check,
  CheckCircle2,
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
import { MissionView } from './components/MissionView'
import { PracticeHub } from './components/PracticeHub'
import type { RecommendationRef } from './data/feedbackRules'
import { Brand, ProgressBar, MissionCard } from './components/LearningUI'
import { CircuitAnimation } from './components/CircuitAnimation'
import { DynamicLearning } from './components/DynamicLearning'
import { LoginPage } from './components/LoginPage'
import { Dialog } from './components/Dialog'
import { useProgress } from './hooks/useProgress'
import './App.css'

type Modal = 'badges' | 'profile' | 'progress' | 'help' | 'class' | null
// The former mission dashboard remains in the source while legacy mission URLs
// are supported, but the Listrik Dinamis journey is the active dashboard.
const legacyDashboardVisible = false
function App() {
  const { profile, profileId, storageError, login, logout, complete, visit } =
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
                onClick={() => {
                  setPracticeRecommendation(null)
                  setPracticeOpen(false)
                  setSelected(null)
                  setModal(null)
                }}
              >
                <Brand small />
              </button>
              <nav className="desktop-nav" aria-label="Navigasi utama">
                <button
                  className={!modal ? 'active' : ''}
                  onClick={() => {
                    setPracticeRecommendation(null)
                    setPracticeOpen(false)
                    setSelected(null)
                    setModal(null)
                  }}
                >
                  <Home size={17} /> Jelajah misi
                </button>
                <button
                  className={modal === 'badges' ? 'active' : ''}
                  onClick={() => setModal('badges')}
                >
                  <Award size={18} /> Badge saya
                </button>
              </nav>
              <div className="header-right">
                <span className="header-xp">
                  <Zap size={16} fill="currentColor" /> {count * 100}
                  <span> XP</span>
                </span>
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
          ) : currentMission ? (
            <MissionView
              key={`${profileId}:${currentMission.id}`}
              profileId={profileId!}
              mission={currentMission}
              completed={profile.completed.includes(currentMission.id)}
              visited={profile.visited.includes(currentMission.id)}
              onComplete={() => complete(currentMission.id)}
              onVisit={() => visit(currentMission.id)}
              onPractice={() => {
                setPracticeRecommendation(null)
                setPracticeOpen(true)
              }}
              onRecommended={(ref) => {
                setPracticeRecommendation(ref)
                setPracticeOpen(true)
              }}
              onBack={() => setSelected(null)}
              onNext={() =>
                setSelected(
                  currentMission.id < 5 ? currentMission.id + 1 : null,
                )
              }
            />
          ) : (
            <>
              <DynamicLearning profileId={profileId!} name={profile!.name} />
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
                      onClick={() => setModal('progress')}
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
              className={!modal ? 'active' : ''}
              onClick={() => {
                setPracticeRecommendation(null)
                setPracticeOpen(false)
                setSelected(null)
                setModal(null)
              }}
            >
              <Home size={20} />
              Jelajah
            </button>
            <button
              className={modal === 'badges' ? 'active' : ''}
              onClick={() => setModal('badges')}
            >
              <Award size={21} />
              Badge saya
            </button>
            <button
              className={modal === 'progress' ? 'active' : ''}
              onClick={() => setModal('progress')}
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
      {modal === 'badges' && profile && (
        <Dialog title="Badge Saya" onClose={() => setModal(null)}>
          <div className="modal-intro">
            <span className="modal-hero-icon">
              <Award size={34} />
            </span>
            <p>
              Setiap badge punya cerita penemuanmu.
              <br />
              <strong>{count} dari 5 badge berhasil dikumpulkan.</strong>
            </p>
          </div>
          <div className="badge-grid">
            {missions.map((m) => {
              const earned = profile.completed.includes(m.id)
              const Icon = m.icon
              return (
                <div
                  key={m.id}
                  className={`badge-item ${earned ? m.theme : 'locked'}`}
                >
                  <span className="badge-medal">
                    <Icon size={29} />
                    {earned && (
                      <CheckCircle2 size={15} className="badge-check" />
                    )}
                  </span>
                  <strong>{m.badge}</strong>
                  <small>
                    {earned ? 'Berhasil diraih' : `Selesaikan misi 0${m.id}`}
                  </small>
                </div>
              )
            })}
          </div>
          <button
            className="primary-button"
            onClick={() => {
              setModal(null)
              setPracticeRecommendation(null)
              setPracticeOpen(false)
              setSelected(null)
            }}
          >
            Jelajahi misi <ArrowRight size={17} />
          </button>
        </Dialog>
      )}
      {modal === 'progress' && profile && (
        <Dialog title="Progres belajarmu" onClose={() => setModal(null)}>
          <div className="progress-summary">
            <Trophy size={36} />
            <h3>
              {count === 5
                ? 'Pahlawan energi sekolah!'
                : 'Lihat langkah belajarmu.'}
            </h3>
            <p>
              {count} misi selesai · {count * 100} XP terkumpul
            </p>
            <ProgressBar count={count} />
          </div>
          <div className="progress-list">
            {missions.map((m) => (
              <button key={m.id} onClick={() => openMission(m.id)}>
                <span
                  className={
                    profile.completed.includes(m.id)
                      ? 'step-done'
                      : 'step-number'
                  }
                >
                  {profile.completed.includes(m.id) ? (
                    <Check size={15} />
                  ) : (
                    m.id
                  )}
                </span>
                <span>{m.title}</span>
                <small>
                  {profile.completed.includes(m.id) ? '100 XP' : 'Mulai'}
                </small>
                <ChevronRight size={15} />
              </button>
            ))}
          </div>
        </Dialog>
      )}
      {modal === 'profile' && profile && (
        <Dialog title="Profil penjelajah" onClose={() => setModal(null)}>
          <div className="profile-info">
            <span className="avatar large">
              {profile.name.charAt(0).toLocaleUpperCase('id-ID')}
            </span>
            <h3>{profile.name}</h3>
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
