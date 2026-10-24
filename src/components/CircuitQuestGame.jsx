import { useState, useEffect, useRef, useCallback } from 'react'
import { MISSIONS_DATA } from '../data/currentGame'
import './CircuitQuestGame.css'

/** @param {{onComplete:()=>void,onReview:()=>void,onFinish:()=>boolean,onAnswer:(id:number,key:string)=>boolean,initialMission?:number,initialScore?:number}} props */
export function CircuitQuestGame({
  onComplete,
  onReview,
  onFinish,
  onAnswer,
  initialMission = 0,
  initialScore = 0,
}) {
  // State utama Reaktif untuk UI Panel & HUD
  const [missionIndex, setMissionIndex] = useState(Math.min(initialMission, 2))
  const [score, setScore] = useState(initialScore)
  const [lives, setLives] = useState(3)
  const [accuPercent, setAccuPercent] = useState(
    initialMission >= 3
      ? 100
      : initialMission === 2
        ? 66
        : initialMission === 1
          ? 33
          : 0,
  )
  const [collectedCount, setCollectedCount] = useState(0)

  // Status layar: 'PLAYING' | 'QUESTION' | 'RETRY' | 'COMPLETED'
  const [uiStatus, setUiStatus] = useState(
    initialMission >= 3 ? 'COMPLETED' : 'PLAYING',
  )
  const [saveError, setSaveError] = useState('')
  const livesRef = useRef(3)
  const rootRef = useRef(null)
  useEffect(() => {
    if (!window.matchMedia('(any-pointer: coarse)').matches) return
    const frame = requestAnimationFrame(() =>
      rootRef.current?.scrollIntoView({ block: 'start', behavior: 'instant' }),
    )
    return () => cancelAnimationFrame(frame)
  }, [])
  const [wrongKeys, setWrongKeys] = useState([])
  const [feedback, setFeedback] = useState(null)
  const [questionSolved, setQuestionSolved] = useState(false)

  // Visual state tombol sentuh
  const [activeKeys, setActiveKeys] = useState({
    left: false,
    right: false,
    jump: false,
  })

  const canvasRef = useRef(null)

  // Ref mutable untuk loop animasi 60fps tanpa memicu re-render berlebih
  const gameRef = useRef({
    piko: {
      x: 65,
      y: 380,
      vx: 0,
      vy: 0,
      w: 44,
      h: 48,
      onGround: false,
      facing: 1,
      walkPhase: 0,
      blinkTimer: 0,
      sadTimer: 0,
      invincibleTimer: 0,
    },
    keys: { left: false, right: false, jump: false },
    items: MISSIONS_DATA[Math.min(initialMission, 2)].items.map((it) => ({
      ...it,
      collected: false,
    })),
    time: 0,
  })

  const currentMission = MISSIONS_DATA[missionIndex]

  // Fungsi mereset / memuat level misi
  const initMissionLevel = useCallback((idx) => {
    const mission = MISSIONS_DATA[idx]
    const g = gameRef.current
    g.piko.x = 65
    g.piko.y = 380
    g.piko.vx = 0
    g.piko.vy = 0
    g.piko.onGround = false
    g.piko.facing = 1
    g.piko.sadTimer = 0
    g.piko.invincibleTimer = 0
    g.items = mission.items.map((it) => ({ ...it, collected: false }))
    g.keys = { left: false, right: false, jump: false }
    setActiveKeys({ left: false, right: false, jump: false })

    setCollectedCount(0)
    setWrongKeys([])
    setFeedback(null)
    setQuestionSolved(false)
    setUiStatus('PLAYING')
  }, [])

  // Event Listener Keyboard (A/D, Panah, Spasi)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        uiStatus !== 'PLAYING' ||
        (!rootRef.current?.contains(document.activeElement) &&
          document.activeElement !== document.body) ||
        e.target.closest('input,textarea,select,button,dialog,a') ||
        (e.code === 'Space' && e.target.tagName === 'BUTTON')
      )
        return
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'Space'].includes(e.code))
        e.preventDefault()
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        gameRef.current.keys.left = true
        setActiveKeys((p) => ({ ...p, left: true }))
      }
      if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        gameRef.current.keys.right = true
        setActiveKeys((p) => ({ ...p, right: true }))
      }
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault()
        gameRef.current.keys.jump = true
        setActiveKeys((p) => ({ ...p, jump: true }))
      }
    }

    const handleKeyUp = (e) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        gameRef.current.keys.left = false
        setActiveKeys((p) => ({ ...p, left: false }))
      }
      if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        gameRef.current.keys.right = false
        setActiveKeys((p) => ({ ...p, right: false }))
      }
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        gameRef.current.keys.jump = false
        setActiveKeys((p) => ({ ...p, jump: false }))
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    const clear = () => {
      gameRef.current.keys = { left: false, right: false, jump: false }
      setActiveKeys({ left: false, right: false, jump: false })
    }
    window.addEventListener('blur', clear)
    document.addEventListener('visibilitychange', clear)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('blur', clear)
      document.removeEventListener('visibilitychange', clear)
    }
  }, [uiStatus])

  // Helper pengurangan nyawa saat terkena genangan listrik kecil atau salah jawab
  const reduceLife = useCallback(() => {
    gameRef.current.piko.sadTimer = 95
    const next = livesRef.current - 1
    livesRef.current = Math.max(0, next)
    setLives(livesRef.current)
    if (next <= 0) {
      gameRef.current.keys = { left: false, right: false, jump: false }
      setUiStatus('RETRY')
    }
  }, [])

  // Loop Fisika & Ilustrasi Canvas 2D
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    let animId

    const updatePhysics = () => {
      const g = gameRef.current
      const piko = g.piko
      const mission = MISSIONS_DATA[missionIndex]

      g.time += 0.05
      piko.blinkTimer = (piko.blinkTimer + 1) % 190
      if (piko.sadTimer > 0) piko.sadTimer--
      if (piko.invincibleTimer > 0) piko.invincibleTimer--

      // Jika sudah selesai semua misi, Piko lompat gembira otomatis di dekat lampu yang menyala
      if (uiStatus === 'COMPLETED') {
        piko.x = 390
        piko.facing = 1
        piko.y = 412 - Math.abs(Math.sin(g.time * 2.2)) * 34
        piko.onGround = false
        return
      }

      if (uiStatus !== 'PLAYING') return

      // Gerak Kiri / Kanan
      const moveSpeed = 4.3
      if (g.keys.left) {
        piko.vx = -moveSpeed
        piko.facing = -1
        piko.walkPhase += 0.26
      } else if (g.keys.right) {
        piko.vx = moveSpeed
        piko.facing = 1
        piko.walkPhase += 0.26
      } else {
        piko.vx *= 0.76
        if (Math.abs(piko.vx) < 0.1) piko.vx = 0
      }

      // Lompat
      if (g.keys.jump && piko.onGround) {
        piko.vy = -11.6
        piko.onGround = false
        g.keys.jump = false
      }

      // Gravitasi
      piko.vy += 0.52
      piko.x += piko.vx
      piko.y += piko.vy

      // Batas Kiri & Kanan
      if (piko.x < 18) piko.x = 18
      if (piko.x > 835) piko.x = 835

      // Pijakan Platform (Papan Rangkaian, Resistor, Jalur Kabel)
      piko.onGround = false
      mission.platforms.forEach((plat) => {
        if (
          piko.x + piko.w - 8 > plat.x &&
          piko.x + 8 < plat.x + plat.w &&
          piko.y + piko.h >= plat.y &&
          piko.y + piko.h <= plat.y + plat.h + 14 &&
          piko.vy >= 0
        ) {
          piko.y = plat.y - piko.h
          piko.vy = 0
          piko.onGround = true
        }
      })

      // Mengumpulkan Elektron / Energy Cell / Pemindai
      let newlyCollected = false
      g.items.forEach((item) => {
        if (!item.collected) {
          const dx = piko.x + piko.w / 2 - item.x
          const dy = piko.y + piko.h / 2 - item.y
          if (Math.hypot(dx, dy) < 36) {
            item.collected = true
            newlyCollected = true
          }
        }
      })

      if (newlyCollected) {
        const countNow = g.items.filter((i) => i.collected).length
        setCollectedCount(countNow)
      }

      // Genangan Listrik Kecil (Hambatan ramah)
      mission.puddles.forEach((pud) => {
        if (
          piko.invincibleTimer === 0 &&
          piko.x + piko.w - 10 > pud.x &&
          piko.x + 10 < pud.x + pud.w &&
          piko.y + piko.h >= pud.y
        ) {
          piko.invincibleTimer = 70
          piko.vy = -7.5
          piko.vx = -piko.facing * 5
          reduceLife()
        }
      })

      // Cek apakah Piko sampai di Gerbang Pertanyaan setelah semua item terkumpul
      const totalCollected = g.items.filter((i) => i.collected).length
      const distGate = Math.abs(piko.x + piko.w / 2 - mission.gateX)
      if (distGate < 38 && totalCollected >= mission.targetCount) {
        g.keys = { left: false, right: false, jump: false }
        setActiveKeys({ left: false, right: false, jump: false })
        setUiStatus('QUESTION')
      }
    }

    /**
     * Menggambar Ilustrasi Buku Pelajaran Modern dengan Palet VoltQuest
     */
    const drawScene = () => {
      const g = gameRef.current
      const compact = window.matchMedia('(max-width: 680px)').matches
      const decorativeTime = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches
        ? 0
        : g.time
      const sceneWidth = compact ? 520 : 900
      if (canvas.width !== sceneWidth) canvas.width = sceneWidth
      const camera = Math.max(
        0,
        Math.min(900 - sceneWidth, g.piko.x + g.piko.w / 2 - sceneWidth / 2),
      )
      ctx.setTransform(1, 0, 0, 1, -camera, 0)
      canvas.dataset.playerX = String(g.piko.x)
      canvas.dataset.playerY = String(g.piko.y)
      canvas.dataset.grounded = String(g.piko.onGround)
      const mission = MISSIONS_DATA[missionIndex]
      const isAllComplete = accuPercent >= 100 || uiStatus === 'COMPLETED'

      drawNature(ctx)
      // 3. Ilustrasi Baterai Accu & Lampu Kecil di Papan Rangkaian
      drawIllustrativeBatteryAndLamp(
        ctx,
        accuPercent,
        isAllComplete,
        decorativeTime,
      )

      // 4. Gambar Platform (Board, Resistor, Jalur Kabel)
      mission.platforms.forEach((plat) => drawPlatform(ctx, plat))

      // 5. Gambar Hambatan Genangan Listrik Kecil
      mission.puddles.forEach((pud) =>
        drawElectricPuddle(ctx, pud, decorativeTime),
      )

      // 6. Gambar Item (Elektron Biru Lucu / Energy Cell Hijau / Kaca Pembesar Listrik)
      g.items.forEach((item) => {
        if (!item.collected) {
          drawCollectibleItem(ctx, item, mission.itemType, decorativeTime)
        }
      })

      // 7. Gambar Gerbang Pertanyaan
      const allItemsReady = g.items.every((i) => i.collected)
      drawQuestionGate(ctx, mission.gateX, allItemsReady, decorativeTime)

      // 8. Gambar Karakter Utama: PIKO
      drawPikoMascot(ctx, g.piko, g.time, uiStatus === 'COMPLETED')
    }

    let previous = 0
    const loop = (timestamp) => {
      if (document.hidden) {
        previous = timestamp
        animId = requestAnimationFrame(loop)
        return
      }
      if (timestamp - previous < 1000 / 60) {
        animId = requestAnimationFrame(loop)
        return
      }
      previous = timestamp
      updatePhysics()
      drawScene()
      animId = requestAnimationFrame(loop)
    }

    animId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(animId)
  }, [missionIndex, uiStatus, accuPercent, reduceLife])

  // Handler saat menjawab pilihan ganda di Panel Soal
  const handleSelectOption = (optionKey) => {
    if (questionSolved || wrongKeys.includes(optionKey)) return
    const q = currentMission.question
    if (!onAnswer(currentMission.id, optionKey)) {
      setSaveError('Jawaban belum dapat disimpan. Coba lagi.')
      return
    }
    setSaveError('')

    if (optionKey === q.correctKey) {
      setQuestionSolved(true)
      setScore((prev) => prev + 100)
      setAccuPercent(currentMission.accuTargetAfter)
      setFeedback({ type: 'correct', text: q.correctFeedback })
    } else {
      setWrongKeys((prev) => [...prev, optionKey])
      setFeedback({ type: 'wrong', text: q.wrongFeedback })
      reduceLife()
    }
  }

  // Lanjut setelah menjawab soal dengan benar
  const handleProceedNextMission = () => {
    if (missionIndex < MISSIONS_DATA.length - 1) {
      const nextIdx = missionIndex + 1
      setMissionIndex(nextIdx)
      initMissionLevel(nextIdx)
    } else {
      if (onFinish()) setUiStatus('COMPLETED')
      else setSaveError('Progres belum dapat disimpan. Coba lagi.')
    }
  }

  // Ulangi misi saat nyawa habis
  const handleRetryCurrentMission = () => {
    setLives(3)
    livesRef.current = 3
    initMissionLevel(missionIndex)
  }

  // Main Lagi dari Misi 1
  const handlePlayAgainFull = () => {
    setScore(0)
    setLives(3)
    livesRef.current = 3
    setAccuPercent(0)
    setMissionIndex(0)
    initMissionLevel(0)
  }

  // Handler Tombol Kontrol Sentuh
  const bindTouchKey = (keyName, isDown) => (e) => {
    e.preventDefault()
    if (isDown && uiStatus !== 'PLAYING') return
    if (isDown) e.currentTarget.setPointerCapture(e.pointerId)
    gameRef.current.keys[keyName] = isDown
    setActiveKeys((p) => ({ ...p, [keyName]: isDown }))
  }

  return (
    <div
      className="cq-container"
      ref={rootRef}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget))
          gameRef.current.keys = { left: false, right: false, jump: false }
      }}
    >
      {saveError && <p role="alert">{saveError}</p>}

      {/* BAGIAN ATAS: PROGRESS, BATERAI ACCU, SKOR, & 3 HATI */}
      <div className="cq-topbar">
        <div className="cq-topbar-left">
          <div className="cq-badge">
            <span>⚡ {currentMission.subtitle}</span>
          </div>
          <span className="cq-item-progress">
            {collectedCount}/{currentMission.targetCount} item
          </span>
        </div>

        <div className="cq-topbar-right">
          {/* Indikator Energi Accu Berbentuk Baterai */}
          <div className="cq-accu-widget" title="Energi Accu">
            <span className="cq-battery-label">Accu:</span>
            <div className="cq-battery-shell">
              <div
                className="cq-battery-fill"
                style={{ width: `${accuPercent}%` }}
              />
            </div>
            <span className="cq-battery-label">{accuPercent}%</span>
          </div>

          {/* Skor */}
          <div className="cq-badge">
            <span>Skor: {score}</span>
          </div>

          {/* Tiga Ikon Hati Kecil sebagai Nyawa */}
          <div className="cq-hearts" aria-label={`Nyawa: ${lives} dari 3`}>
            {[0, 1, 2].map((idx) => (
              <svg
                key={idx}
                viewBox="0 0 24 24"
                className={`cq-heart-icon ${idx >= lives ? 'cq-heart-lost' : ''}`}
              >
                <path
                  d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                  fill="#FF8FA3"
                  stroke="#163449"
                  strokeWidth="2"
                />
              </svg>
            ))}
          </div>
        </div>
      </div>

      {/* BAGIAN TENGAH: AREA PERMAINAN 2D */}
      <div className="cq-stage-wrapper">
        <canvas
          ref={canvasRef}
          width={900}
          height={520}
          className="cq-canvas"
          tabIndex={0}
          aria-label="Area permainan Piko. A atau panah kiri untuk kiri, D atau panah kanan untuk kanan, dan spasi untuk melompat."
        />

        {/* PANEL SOAL (KARTU PUTIH-KREM RAPI SAAT SAMPAI DI GERBANG) */}
        {uiStatus === 'QUESTION' && (
          <div className="cq-overlay">
            <div className="cq-card">
              <span className="cq-card-tag">
                {currentMission.title} • Gerbang Pertanyaan
              </span>
              <h3 className="cq-card-title">{currentMission.subtitle}</h3>
              <p className="cq-question-text">
                {currentMission.question.prompt}
              </p>

              <div className="cq-options-list">
                {currentMission.question.options.map((opt) => {
                  const isCorrectSelected =
                    questionSolved &&
                    opt.key === currentMission.question.correctKey
                  const isWrongSelected = wrongKeys.includes(opt.key)
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      disabled={questionSolved || isWrongSelected}
                      onClick={() => handleSelectOption(opt.key)}
                      className={`cq-option-btn ${
                        isCorrectSelected
                          ? 'cq-option-correct'
                          : isWrongSelected
                            ? 'cq-option-wrong'
                            : ''
                      }`}
                    >
                      <span className="cq-option-key">{opt.key}</span>
                      <span>{opt.text}</span>
                    </button>
                  )
                })}
              </div>

              {feedback && (
                <div
                  className={`cq-feedback-box ${
                    feedback.type === 'correct' ? 'cq-feedback-correct' : ''
                  }`}
                  role="status"
                >
                  {feedback.type === 'wrong' && (
                    <strong>Belum tepat, mari revisi. </strong>
                  )}
                  {feedback.text}
                </div>
              )}

              {feedback?.type === 'wrong' && (
                <aside className="cq-feedback-box">
                  <strong>Ingat kembali materinya</strong>
                  <p>
                    {
                      [
                        'Arah elektron berlawanan dengan arus konvensional pada rangkaian luar sumber DC.',
                        'Gunakan Q = It. Ubah waktu dari jam menjadi sekon sebelum menghitung.',
                        'Hitung Q = It terlebih dahulu, kemudian n = Q/e dengan e = 1,6 × 10⁻¹⁹ C.',
                      ][missionIndex]
                    }
                  </p>
                  <button
                    className="cq-btn cq-btn-secondary"
                    onClick={onReview}
                  >
                    Pelajari kembali materi
                  </button>
                </aside>
              )}
              {questionSolved && (
                <div className="cq-btn-row">
                  <button
                    type="button"
                    className="cq-btn cq-btn-primary"
                    onClick={handleProceedNextMission}
                  >
                    {missionIndex < MISSIONS_DATA.length - 1
                      ? 'Lanjut ke Misi Berikutnya'
                      : 'Selesaikan Pengisian Accu'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PANEL KETIKA SEMUA NYAWA HABIS */}
        {uiStatus === 'RETRY' && (
          <div className="cq-overlay">
            <div className="cq-card cq-card-center">
              <span className="cq-card-tag">{currentMission.title}</span>
              <h3 className="cq-card-title">Piko perlu mencoba lagi</h3>
              <p
                style={{
                  color: '#40566A',
                  fontSize: '0.94rem',
                  margin: '8px 0 18px',
                }}
              >
                Jangan khawatir! Yuk bantu Piko melewati jalur rangkaian dan
                menjawab dengan tepat.
              </p>
              <div className="cq-btn-row">
                <button
                  type="button"
                  className="cq-btn cq-btn-primary"
                  onClick={handleRetryCurrentMission}
                >
                  Ulangi Misi
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PANEL AKHIR GAME SETELAH MISI KETIGA */}
        {uiStatus === 'COMPLETED' && (
          <div
            className="cq-overlay"
            style={{ backgroundColor: 'rgba(227, 242, 255, 0.55)' }}
          >
            <div className="cq-card cq-card-center">
              <span className="cq-card-tag">Accu Terisi 100% ⚡</span>
              <h3 className="cq-card-title">Accu Berhasil Diisi!</h3>
              <p
                style={{
                  color: '#40566A',
                  fontSize: '0.95rem',
                  margin: '4px 0 8px',
                }}
              >
                Kamu telah menyelesaikan misi arus listrik.
              </p>
              <div className="cq-score-pill">Skor Akhir: {score}</div>
              <div className="cq-btn-row">
                <button
                  type="button"
                  className="cq-btn cq-btn-secondary"
                  onClick={handlePlayAgainFull}
                >
                  Main Lagi
                </button>
                <button
                  type="button"
                  className="cq-btn cq-btn-primary"
                  onClick={onComplete}
                >
                  Kembali ke Materi
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* BAGIAN BAWAH: TOMBOL KONTROL LAYAR SENTUH BULAT */}
      <div className="cq-controls-bar">
        <div className="cq-dpad-group">
          <button
            type="button"
            aria-label="Gerak Kiri"
            className={`cq-ctrl-circle cq-ctrl-move ${activeKeys.left ? 'cq-ctrl-active' : ''}`}
            onPointerDown={bindTouchKey('left', true)}
            onPointerUp={bindTouchKey('left', false)}
            onPointerCancel={bindTouchKey('left', false)}
            onLostPointerCapture={bindTouchKey('left', false)}
          >
            ◀<span style={{ fontSize: '0.68rem', fontWeight: 600 }}>Kiri</span>
          </button>

          <button
            type="button"
            aria-label="Gerak Kanan"
            className={`cq-ctrl-circle cq-ctrl-move ${activeKeys.right ? 'cq-ctrl-active' : ''}`}
            onPointerDown={bindTouchKey('right', true)}
            onPointerUp={bindTouchKey('right', false)}
            onPointerCancel={bindTouchKey('right', false)}
            onLostPointerCapture={bindTouchKey('right', false)}
          >
            ▶<span style={{ fontSize: '0.68rem', fontWeight: 600 }}>Kanan</span>
          </button>
        </div>

        <div className="cq-ctrl-hint">
          Gunakan tombol bulat atau keyboard <strong>A / D / Panah</strong>{' '}
          untuk bergerak &amp; <strong>Spasi</strong> untuk melompat
        </div>

        <button
          type="button"
          aria-label="Lompat"
          className={`cq-ctrl-circle cq-ctrl-jump ${activeKeys.jump ? 'cq-ctrl-active' : ''}`}
          onPointerDown={bindTouchKey('jump', true)}
          onPointerUp={bindTouchKey('jump', false)}
          onPointerCancel={bindTouchKey('jump', false)}
          onLostPointerCapture={bindTouchKey('jump', false)}
        >
          ▲<span style={{ fontSize: '0.72rem', fontWeight: 700 }}>Lompat</span>
        </button>
      </div>
    </div>
  )
}

/**
 * ============================================================================
 * FUNGSI-FUNGSI ILUSTRASI CANVAS 2D (PIKO, BATERAI, LAMPU, RESISTOR, ELEKTRON)
 * ============================================================================
 */

function drawNature(ctx) {
  ctx.fillStyle = '#bce8ff'
  ctx.fillRect(0, 0, 900, 520)
  ctx.fillStyle = '#fffefa'
  for (const [x, y] of [
    [150, 65],
    [420, 90],
    [730, 55],
  ]) {
    ctx.beginPath()
    ctx.ellipse(x, y, 60, 18, 0, 0, Math.PI * 2)
    ctx.ellipse(x - 20, y - 10, 25, 20, 0, 0, Math.PI * 2)
    ctx.ellipse(x + 14, y - 16, 30, 24, 0, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.fillStyle = '#afd779'
  ctx.beginPath()
  ctx.moveTo(0, 460)
  ctx.quadraticCurveTo(130, 170, 370, 460)
  ctx.quadraticCurveTo(650, 180, 900, 460)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = '#86bd71'
  ctx.beginPath()
  ctx.moveTo(0, 460)
  ctx.quadraticCurveTo(400, 260, 900, 460)
  ctx.closePath()
  ctx.fill()
  for (const [x, y] of [
    [65, 400],
    [850, 380],
  ]) {
    ctx.fillStyle = '#92744f'
    ctx.fillRect(x - 5, y - 62, 10, 62)
    ctx.fillStyle = '#4d9656'
    ctx.beginPath()
    ctx.arc(x, y - 90, 33, 0, Math.PI * 2)
    ctx.fill()
  }
}
function drawIllustrativeBatteryAndLamp(ctx, accuPercent, isLampLit, time) {
  ctx.save()

  // 1. Baterai Ilustratif di Kiri Atas Papan
  const bx = 55
  const by = 185
  const bw = 76
  const bh = 95

  // Kutub Baterai
  ctx.fillStyle = '#145B7D'
  ctx.strokeStyle = '#163449'
  ctx.lineWidth = 2.5
  ctx.fillRect(bx + 12, by - 10, 16, 10)
  ctx.strokeRect(bx + 12, by - 10, 16, 10)

  ctx.fillStyle = '#2E6A35'
  ctx.fillRect(bx + bw - 28, by - 10, 16, 10)
  ctx.strokeRect(bx + bw - 28, by - 10, 16, 10)

  // Badan Baterai (#FFFEFA)
  ctx.fillStyle = '#FFFEFA'
  ctx.beginPath()
  ctx.roundRect(bx, by, bw, bh, 10)
  ctx.fill()
  ctx.stroke()

  // Isi Energi Accu (#2E6A35)
  const fillH = Math.max(0, ((bh - 12) * accuPercent) / 100)
  if (fillH > 0) {
    ctx.fillStyle = '#2E6A35'
    ctx.beginPath()
    ctx.roundRect(bx + 6, by + bh - 6 - fillH, bw - 12, fillH, 6)
    ctx.fill()
  }

  // Teks Accu
  ctx.fillStyle = accuPercent > 50 ? '#FFFEFA' : '#163449'
  ctx.font = 'bold 13px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(`ACCU`, bx + bw / 2, by + bh / 2 - 4)
  ctx.fillText(`${accuPercent}%`, bx + bw / 2, by + bh / 2 + 13)

  // 2. Lampu Kecil di Papan Rangkaian (Menyala kuning lembut saat 100%)
  const lx = 465
  const ly = 398

  if (isLampLit) {
    // Pancaran Kuning Lembut
    const pulse = Math.sin(time * 3) * 4
    ctx.fillStyle = 'rgba(255, 224, 102, 0.45)'
    ctx.beginPath()
    ctx.arc(lx, ly - 18, 38 + pulse, 0, Math.PI * 2)
    ctx.fill()
  }

  // Kubah Bohlam
  ctx.fillStyle = isLampLit ? '#FFE066' : '#FFFEFA'
  ctx.strokeStyle = '#163449'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.arc(lx, ly - 18, 20, Math.PI * 0.85, Math.PI * 0.15, false)
  ctx.lineTo(lx + 11, ly + 4)
  ctx.lineTo(lx - 11, ly + 4)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()

  // Filamen Bohlam
  ctx.strokeStyle = isLampLit ? '#163449' : '#40566A'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(lx - 6, ly + 2)
  ctx.lineTo(lx - 6, ly - 14)
  ctx.lineTo(lx, ly - 20)
  ctx.lineTo(lx + 6, ly - 14)
  ctx.lineTo(lx + 6, ly + 2)
  ctx.stroke()

  // Dudukan Lampu
  ctx.fillStyle = '#145B7D'
  ctx.strokeStyle = '#163449'
  ctx.lineWidth = 2.5
  ctx.fillRect(lx - 13, ly + 4, 26, 14)
  ctx.strokeRect(lx - 13, ly + 4, 26, 14)

  ctx.fillStyle = '#40566A'
  ctx.font = 'bold 11px sans-serif'
  ctx.textAlign = 'center'

  ctx.restore()
}

function drawPlatform(ctx, plat) {
  ctx.save()
  if (plat.type === 'board') {
    // Lantai Papan Rangkaian Utama
    ctx.fillStyle = '#a58257'
    ctx.strokeStyle = '#163449'
    ctx.lineWidth = 3
    ctx.fillRect(plat.x, plat.y, plat.w, plat.h)
    ctx.beginPath()
    ctx.moveTo(plat.x, plat.y)
    ctx.lineTo(plat.x + plat.w, plat.y)
    ctx.stroke()

    // Garis Jalur Kabel Hijau & Biru di Sepanjang Papan Bawah
    ctx.strokeStyle = '#4d8f3b'
    ctx.lineWidth = 8
    ctx.beginPath()
    ctx.moveTo(20, plat.y + 18)
    ctx.lineTo(plat.w - 20, plat.y + 18)
    ctx.stroke()

    ctx.strokeStyle = '#145B7D'
    ctx.beginPath()
    ctx.moveTo(20, plat.y + 34)
    ctx.lineTo(plat.w - 20, plat.y + 34)
    ctx.stroke()
  } else if (plat.type === 'resistor') {
    // Kaki Kawat Resistor di Kiri & Kanan
    ctx.strokeStyle = '#163449'
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.moveTo(plat.x - 14, plat.y + plat.h / 2)
    ctx.lineTo(plat.x + plat.w + 14, plat.y + plat.h / 2)
    ctx.stroke()

    // Badan Resistor Krem (#FFFEFA)
    ctx.fillStyle = '#FFFEFA'
    ctx.strokeStyle = '#163449'
    ctx.lineWidth = 2.5
    ctx.beginPath()
    ctx.roundRect(plat.x, plat.y, plat.w, plat.h, 10)
    ctx.fill()
    ctx.stroke()

    // Gelang Warna Resistor Sesuai Palet VoltQuest
    const bands = ['#2E6A35', '#145B7D', '#FFE066', '#163449']
    bands.forEach((col, idx) => {
      ctx.fillStyle = col
      ctx.fillRect(plat.x + 24 + idx * 28, plat.y + 2, 10, plat.h - 4)
    })
  } else {
    // Platform Jalur Kabel Biru (#145B7D)
    ctx.fillStyle = '#145B7D'
    ctx.strokeStyle = '#163449'
    ctx.lineWidth = 2.5
    ctx.beginPath()
    ctx.roundRect(plat.x, plat.y, plat.w, plat.h, 10)
    ctx.fill()
    ctx.stroke()

    // Titik Baut Kecil di Ujung Platform
    ctx.fillStyle = '#FFFEFA'
    ctx.beginPath()
    ctx.arc(plat.x + 12, plat.y + plat.h / 2, 4, 0, Math.PI * 2)
    ctx.arc(plat.x + plat.w - 12, plat.y + plat.h / 2, 4, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()
}

function drawElectricPuddle(ctx, pud, time) {
  ctx.save()
  // Genangan Listrik Kecil di Lantai
  ctx.fillStyle = '#BDDBE5'
  ctx.strokeStyle = '#145B7D'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.ellipse(
    pud.x + pud.w / 2,
    pud.y + pud.h / 2 + 2,
    pud.w / 2,
    pud.h / 2,
    0,
    0,
    Math.PI * 2,
  )
  ctx.fill()
  ctx.stroke()

  // Ikon Zig-Zag Kecil Kuning Lembut
  const hop = Math.sin(time * 4 + pud.x) * 2
  ctx.strokeStyle = '#163449'
  ctx.fillStyle = '#FFE066'
  ctx.lineWidth = 2
  const cx = pud.x + pud.w / 2
  const cy = pud.y - 2 + hop
  ctx.beginPath()
  ctx.moveTo(cx + 2, cy - 8)
  ctx.lineTo(cx - 5, cy)
  ctx.lineTo(cx + 1, cy)
  ctx.lineTo(cx - 3, cy + 8)
  ctx.lineTo(cx + 6, cy - 1)
  ctx.lineTo(cx, cy - 1)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()
  ctx.restore()
}

function drawCollectibleItem(ctx, item, itemType, time) {
  ctx.save()
  const bob = Math.sin(time * 2.6 + item.x) * 5
  ctx.translate(item.x, item.y + bob)

  if (itemType === 'electron') {
    // Ikon Elektron Kecil Berbentuk Bola Biru Lucu dengan Mata
    ctx.fillStyle = '#145B7D'
    ctx.strokeStyle = '#163449'
    ctx.lineWidth = 2.5
    ctx.beginPath()
    ctx.arc(0, 0, 15, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()

    // Mata Kecil Lucu
    ctx.fillStyle = '#FFFEFA'
    ctx.beginPath()
    ctx.arc(-4, -2, 2.5, 0, Math.PI * 2)
    ctx.arc(4, -2, 2.5, 0, Math.PI * 2)
    ctx.fill()

    // Tanda Minus (-)
    ctx.strokeStyle = '#FFFEFA'
    ctx.lineWidth = 2.5
    ctx.beginPath()
    ctx.moveTo(-5, 6)
    ctx.lineTo(5, 6)
    ctx.stroke()
  } else if (itemType === 'cell') {
    // Energy Cell Hijau (#2E6A35)
    ctx.fillStyle = '#2E6A35'
    ctx.strokeStyle = '#163449'
    ctx.lineWidth = 2.5
    ctx.beginPath()
    ctx.roundRect(-13, -16, 26, 32, 6)
    ctx.fill()
    ctx.stroke()

    // Tutup Baterai Atas
    ctx.fillStyle = '#FFFEFA'
    ctx.fillRect(-6, -21, 12, 5)
    ctx.strokeRect(-6, -21, 12, 5)

    // Petir Kuning Lembut di Tengah Cell
    ctx.fillStyle = '#FFE066'
    ctx.beginPath()
    ctx.moveTo(2, -9)
    ctx.lineTo(-5, 1)
    ctx.lineTo(1, 1)
    ctx.lineTo(-2, 10)
    ctx.lineTo(6, -1)
    ctx.lineTo(0, -1)
    ctx.closePath()
    ctx.fill()
  } else if (itemType === 'scanner') {
    // Alat Pemindai Lucu Berbentuk Kaca Pembesar Listrik
    ctx.strokeStyle = '#163449'
    ctx.lineWidth = 5
    ctx.beginPath()
    ctx.moveTo(10, 10)
    ctx.lineTo(22, 22)
    ctx.stroke()

    ctx.fillStyle = '#FFFEFA'
    ctx.strokeStyle = '#145B7D'
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.arc(0, 0, 18, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()

    // Elektron Kecil di Dalam Lensa Kaca Pembesar
    ctx.fillStyle = '#2E6A35'
    ctx.beginPath()
    ctx.arc(-5, -3, 4, 0, Math.PI * 2)
    ctx.arc(5, 4, 4, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.restore()
}

function drawQuestionGate(ctx, gateX, isReady, time) {
  ctx.save()
  const gy = 345
  const gh = 115

  // Tiang Gerbang Soal
  ctx.fillStyle = '#FFFEFA'
  ctx.strokeStyle = '#163449'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.roundRect(gateX - 22, gy, 44, gh, 12)
  ctx.fill()
  ctx.stroke()

  // Indikator Pintu
  ctx.fillStyle = isReady ? '#2E6A35' : '#BDDBE5'
  ctx.beginPath()
  ctx.roundRect(gateX - 14, gy + 10, 28, gh - 20, 8)
  ctx.fill()

  // Lencana Tanda Tanya / Petir di Atas Gerbang
  const bounce = isReady ? Math.sin(time * 3) * 3 : 0
  ctx.fillStyle = '#FFE066'
  ctx.strokeStyle = '#163449'
  ctx.lineWidth = 2.5
  ctx.beginPath()
  ctx.arc(gateX, gy - 16 + bounce, 14, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()

  ctx.fillStyle = '#163449'
  ctx.font = 'bold 15px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('?', gateX, gy - 15 + bounce)

  ctx.font = 'bold 11px sans-serif'
  ctx.fillStyle = '#163449'
  ctx.fillText(isReady ? 'MASUK!' : 'GERBANG', gateX, gy - 36)
  ctx.restore()
}

/**
 * Menggambar Karakter Utama "Piko" (Makhluk Listrik Kecil Bulat yang Sangat Lucu)
 */
function drawPikoMascot(ctx, piko, time, isCelebrating) {
  ctx.save()

  const cx = piko.x + piko.w / 2
  const cy = piko.y + piko.h / 2

  // Goyangan lembut saat diam (idle sway)
  const isMoving = Math.abs(piko.vx) > 0.25
  const isJumping = !piko.onGround || isCelebrating
  const isSad = piko.sadTimer > 0
  const idleBob = !isMoving && !isJumping ? Math.sin(time * 2.2) * 2.2 : 0

  ctx.translate(cx, cy + idleBob)
  ctx.scale(piko.facing, 1)

  // 1. Sepatu Kecil Warna Hijau (#2E6A35) dengan Animasi Kaki Lucu
  const leftFootOffset = isMoving ? Math.sin(piko.walkPhase) * 6 : 0
  const rightFootOffset = isMoving ? -Math.sin(piko.walkPhase) * 6 : 0

  ctx.fillStyle = '#2E6A35'
  ctx.strokeStyle = '#163449'
  ctx.lineWidth = 2.5

  // Sepatu Kiri
  ctx.beginPath()
  ctx.ellipse(-9 + leftFootOffset, 20, 8, 5.5, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()

  // Sepatu Kanan
  ctx.beginPath()
  ctx.ellipse(9 + rightFootOffset, 20, 8, 5.5, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()

  // 2. Tubuh Bulat Seperti Tetesan Listrik / Kacang Kecil (Kuning Lembut #FFE066, Outline Navy #163449)
  ctx.fillStyle = '#FFE066'
  ctx.strokeStyle = '#163449'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.arc(0, 1, 20, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()

  // Jambul Tetesan Kecil Lucu di Atas Kepala Piko
  ctx.beginPath()
  ctx.arc(0, -19, 5.5, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()

  // 3. Ikon Petir Kecil di Dada Piko
  ctx.fillStyle = '#FFFEFA'
  ctx.strokeStyle = '#163449'
  ctx.lineWidth = 1.6
  ctx.beginPath()
  ctx.moveTo(2, 5)
  ctx.lineTo(-4, 12)
  ctx.lineTo(1, 12)
  ctx.lineTo(-2, 18)
  ctx.lineTo(5, 10)
  ctx.lineTo(0, 10)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()

  // 4. Pipi Merah Muda Kecil
  ctx.fillStyle = '#FF9EBB'
  ctx.beginPath()
  ctx.ellipse(-11, -1, 4.2, 2.6, 0, 0, Math.PI * 2)
  ctx.ellipse(11, -1, 4.2, 2.6, 0, 0, Math.PI * 2)
  ctx.fill()

  // 5. Dua Mata Besar Bulat (Berkedip saat diam, gembira saat melompat)
  const isBlinking = piko.blinkTimer > 182 && !isJumping && !isSad

  ctx.strokeStyle = '#163449'
  ctx.fillStyle = '#163449'
  ctx.lineWidth = 2.4

  if (isBlinking) {
    // Kedip ramah
    ctx.beginPath()
    ctx.moveTo(-10, -5)
    ctx.lineTo(-4, -5)
    ctx.moveTo(4, -5)
    ctx.lineTo(10, -5)
    ctx.stroke()
  } else if (isJumping && !isSad) {
    // Mata melengkung gembira saat melompat
    ctx.beginPath()
    ctx.arc(-7, -5, 3.8, Math.PI, 0, false)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(7, -5, 3.8, Math.PI, 0, false)
    ctx.stroke()
  } else {
    // Dua mata bulat besar dengan kilau putih kecil
    ctx.beginPath()
    ctx.arc(-7, -6, 3.8, 0, Math.PI * 2)
    ctx.arc(7, -6, 3.8, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#FFFEFA'
    ctx.beginPath()
    ctx.arc(-8.2, -7.4, 1.4, 0, Math.PI * 2)
    ctx.arc(5.8, -7.4, 1.4, 0, Math.PI * 2)
    ctx.fill()
  }

  // 6. Ekspresi Mulut (Ramah, Gembira saat melompat, atau Sedih imut sebentar saat salah)
  ctx.strokeStyle = '#163449'
  ctx.lineWidth = 2.2
  ctx.beginPath()
  if (isSad) {
    // Lengkung sedih imut
    ctx.arc(0, 3, 3.8, Math.PI * 1.15, Math.PI * 1.85, false)
    ctx.stroke()
  } else if (isJumping) {
    // Mulut terbuka gembira "D"
    ctx.fillStyle = '#FF8FA3'
    ctx.arc(0, -1, 4.5, 0, Math.PI, false)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
  } else {
    // Senyum ramah
    ctx.arc(0, -2, 4, Math.PI * 0.15, Math.PI * 0.85, false)
    ctx.stroke()
  }

  ctx.restore()
}

export default CircuitQuestGame
