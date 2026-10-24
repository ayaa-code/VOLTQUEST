import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
} from 'lucide-react'
import { Brand } from './LearningUI'
import {
  authenticate,
  DEMO,
  registerLocal,
  rememberedEmail,
  rememberEmail,
  resetLocal,
} from '../data/localAuth'
import './LoginPage.css'

type Mode = 'login' | 'register' | 'reset' | 'legacy'
export function LoginPage({
  onLogin,
  onClass,
  legacy,
  initialName,
  onLegacy,
}: {
  onLogin: (name: string, accountId?: string) => void
  onClass: () => void
  legacy: boolean
  initialName: string
  onLegacy: (legacy: boolean) => void
}) {
  const [mode, setMode] = useState<Mode>(legacy ? 'legacy' : 'login')
  const [email, setEmail] = useState(rememberedEmail)
  const [password, setPassword] = useState('')
  const [name, setName] = useState(initialName)
  const [remember, setRemember] = useState(() => !!rememberedEmail())
  const [show, setShow] = useState(false)
  const [code, setCode] = useState('')
  const [recovery, setRecovery] = useState('')
  const [phase, setPhase] = useState<'idle' | 'loading' | 'success'>('idle')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [notice, setNotice] = useState('')
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mounted = useRef(true)
  const locked = useRef(false)
  const form = useRef<HTMLFormElement>(null)
  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
      if (timer.current) clearTimeout(timer.current)
    }
  }, [])
  useEffect(() => {
    if (legacy) {
      // A class-dialog action can request the existing local-profile flow.
      // oxlint-disable-next-line react/set-state-in-effect
      setMode('legacy')
    }
  }, [legacy])
  function changeMode(next: Mode) {
    if (locked.current) return
    setMode(next)
    setErrors({})
    setNotice('')
    setPassword('')
    setShow(false)
    setCode('')
    onLegacy(next === 'legacy')
  }
  function finish(displayName: string, accountId?: string) {
    setPhase('success')
    timer.current = setTimeout(() => {
      if (mounted.current) onLogin(displayName, accountId)
    }, 650)
  }
  async function submit(event: FormEvent) {
    event.preventDefault()
    if (locked.current) return
    const cleanEmail = email.trim().toLowerCase()
    const invalid: Record<string, string> = {}
    if ((mode === 'register' || mode === 'legacy') && !name.trim())
      invalid.name = 'Tulis nama panggilanmu.'
    if (mode !== 'legacy') {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail))
        invalid.email = 'Masukkan alamat email yang valid.'
      if (password.length < 8)
        invalid.password = 'Kata sandi minimal 8 karakter.'
      if (mode === 'reset' && !code.trim())
        invalid.code = 'Masukkan kode pemulihan saat mendaftar.'
    }
    setErrors(invalid)
    setNotice('')
    if (Object.keys(invalid).length) {
      requestAnimationFrame(() =>
        form.current
          ?.querySelector<HTMLInputElement>('[aria-invalid="true"]')
          ?.focus(),
      )
      return
    }
    locked.current = true
    setPhase('loading')
    try {
      if (mode === 'legacy') {
        finish(name.trim())
        return
      }
      if (mode === 'register') {
        const recoveryCode = await registerLocal(
          cleanEmail,
          password,
          name.trim(),
        )
        if (!mounted.current) return
        setRecovery(recoveryCode)
        setPassword('')
        setPhase('idle')
        locked.current = false
      } else if (mode === 'reset') {
        await resetLocal(cleanEmail, code, password)
        if (!mounted.current) return
        setMode('login')
        setPassword('')
        setCode('')
        setPhase('idle')
        locked.current = false
        setNotice(
          'Kata sandi lokal diperbarui. Silakan masuk dengan kata sandi baru.',
        )
      } else {
        const displayName = await authenticate(cleanEmail, password)
        if (!mounted.current) return
        // Remember only the email; never store a plaintext password.
        try {
          rememberEmail(cleanEmail, remember)
        } catch {
          /* Login still works without remembered email. */
        }
        // Hold the local transition briefly so loading and success remain perceivable.
        timer.current = setTimeout(() => {
          if (mounted.current) finish(displayName, `account:${cleanEmail}`)
        }, 420)
      }
    } catch (error) {
      if (!mounted.current) return
      locked.current = false
      setPhase('idle')
      setErrors({
        form:
          error instanceof Error &&
          error.name !== 'QuotaExceededError' &&
          error.name !== 'SecurityError'
            ? error.message
            : 'Penyimpanan perangkat tidak tersedia. Gunakan akun demo atau profil lama.',
      })
    }
  }
  const busy = phase !== 'idle'
  const errorProps = (key: string) => ({
    'aria-invalid': !!errors[key],
    'aria-describedby': errors[key] ? `auth-${key}-error` : undefined,
  })
  const errorText = (key: string) =>
    errors[key] && (
      <p className="auth-field-error" id={`auth-${key}-error`}>
        {errors[key]}
      </p>
    )
  return (
    <main className="electric-login">
      <div className="electric-shell">
        <section className="auth-column" aria-labelledby="auth-title">
          <div className="auth-card">
            <div className="auth-brand">
              <Brand small />
            </div>
            <h2 id="auth-title">
              {recovery
                ? 'Akunmu siap!'
                : mode === 'register'
                  ? 'Mulai perjalananmu.'
                  : mode === 'reset'
                    ? 'Pulihkan aksesmu.'
                    : mode === 'legacy'
                      ? 'Lanjutkan jelajahmu.'
                      : 'Selamat datang!'}
            </h2>
            <p className="auth-subtitle">
              {recovery
                ? 'Simpan kode ini untuk memulihkan kata sandimu.'
                : mode === 'register'
                  ? 'Buat akun belajar di perangkat ini.'
                  : mode === 'reset'
                    ? 'Gunakan kode pemulihan akun lokalmu.'
                    : mode === 'legacy'
                      ? 'Gunakan nama yang sama untuk membuka progres lama.'
                      : 'Masuk untuk melanjutkan pembelajaran.'}
            </p>
            {recovery ? (
              <div className="auth-recovery">
                <label htmlFor="recovery-result">Kode pemulihan</label>
                <input
                  id="recovery-result"
                  value={recovery}
                  readOnly
                  onFocus={(e) => e.target.select()}
                />
                <p>
                  Simpan di tempatmu sendiri. Kode ini tidak dikirim melalui
                  email.
                </p>
                <button
                  className="auth-submit"
                  onClick={() => {
                    setRecovery('')
                    setMode('login')
                    setNotice('Akun lokal dibuat. Silakan masuk.')
                    setPassword('')
                  }}
                >
                  Sudah disimpan, lanjut masuk <ArrowRight size={18} />
                </button>
              </div>
            ) : (
              <form ref={form} onSubmit={submit} noValidate aria-busy={busy}>
                <fieldset disabled={busy}>
                  {(mode === 'register' || mode === 'legacy') && (
                    <div className="auth-field">
                      <label htmlFor="auth-name">Siapa nama panggilanmu?</label>
                      <input
                        id="auth-name"
                        placeholder="Tulis namamu di sini"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        autoComplete="given-name"
                        maxLength={40}
                        required
                        {...errorProps('name')}
                      />
                      {errorText('name')}
                    </div>
                  )}
                  {mode !== 'legacy' && (
                    <>
                      <div className="auth-field">
                        <label htmlFor="auth-email">Email</label>
                        <div className="auth-input-wrap">
                          <Mail size={18} />
                          <input
                            id="auth-email"
                            type="email"
                            inputMode="email"
                            placeholder="Masukkan email"
                            autoComplete="username"
                            autoCapitalize="none"
                            spellCheck={false}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            maxLength={254}
                            required
                            {...errorProps('email')}
                          />
                        </div>
                        {errorText('email')}
                      </div>
                      {mode === 'reset' && (
                        <div className="auth-field">
                          <label htmlFor="auth-code">Kode pemulihan</label>
                          <input
                            id="auth-code"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder="Kode yang disimpan saat mendaftar"
                            autoComplete="off"
                            required
                            {...errorProps('code')}
                          />
                          {errorText('code')}
                        </div>
                      )}
                      <div className="auth-field">
                        <label htmlFor="auth-password">
                          {mode === 'reset' ? 'Kata sandi baru' : 'Kata sandi'}
                        </label>
                        <div className="auth-input-wrap">
                          <LockKeyhole size={18} />
                          <input
                            id="auth-password"
                            type={show ? 'text' : 'password'}
                            placeholder="Masukkan kata sandi"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete={
                              mode === 'login'
                                ? 'current-password'
                                : 'new-password'
                            }
                            minLength={8}
                            maxLength={128}
                            required
                            {...errorProps('password')}
                          />
                          <button
                            type="button"
                            className="auth-eye"
                            aria-label={
                              show
                                ? 'Sembunyikan kata sandi'
                                : 'Tampilkan kata sandi'
                            }
                            aria-pressed={show}
                            onClick={() => setShow(!show)}
                          >
                            {show ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                        {errorText('password')}
                      </div>
                    </>
                  )}
                  {mode === 'login' && (
                    <div className="auth-options">
                      <label className="auth-remember">
                        <input
                          type="checkbox"
                          checked={remember}
                          onChange={(e) => setRemember(e.target.checked)}
                        />{' '}
                        Ingat saya
                      </label>
                      <button type="button" onClick={() => changeMode('reset')}>
                        Lupa kata sandi?
                      </button>
                    </div>
                  )}
                  {mode === 'login' && (
                    <p className="auth-remember-hint">
                      Ingat saya menyimpan email di perangkat ini.
                    </p>
                  )}
                  {errors.form && (
                    <p className="auth-error" role="alert">
                      {errors.form}
                    </p>
                  )}
                  {notice && (
                    <p className="auth-notice" role="status">
                      {notice}
                    </p>
                  )}
                  <button className="auth-submit" type="submit" disabled={busy}>
                    {phase === 'loading' ? (
                      <>
                        <LoaderCircle className="auth-spinner" size={18} />{' '}
                        Memproses…
                      </>
                    ) : phase === 'success' ? (
                      <>
                        <Check size={18} /> Berhasil masuk
                      </>
                    ) : (
                      <>
                        {mode === 'register'
                          ? 'Daftar'
                          : mode === 'reset'
                            ? 'Simpan kata sandi baru'
                            : 'Masuk'}
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </fieldset>
                <p className="auth-transition" role="status" aria-live="polite">
                  {phase === 'loading'
                    ? 'Menyiapkan perjalananmu…'
                    : phase === 'success'
                      ? 'Koneksi siap. Membuka misi…'
                      : ''}
                </p>
              </form>
            )}
            {!recovery && (
              <>
                <p className="auth-signup">
                  {mode === 'login' ? (
                    <>
                      Belum punya akun?{' '}
                      <button
                        disabled={busy}
                        onClick={() => changeMode('register')}
                      >
                        Daftar
                      </button>
                    </>
                  ) : (
                    <button disabled={busy} onClick={() => changeMode('login')}>
                      Kembali ke login email
                    </button>
                  )}
                </p>
                <div className="auth-demo">
                  <button
                    disabled={busy}
                    onClick={() => {
                      changeMode('login')
                      setEmail(DEMO.email)
                      setPassword(DEMO.password)
                    }}
                  >
                    Coba dengan akun demo <ArrowRight size={14} />
                  </button>
                  <details>
                    <summary>Lihat akun demo</summary>
                    <p>
                      Email: <strong>{DEMO.email}</strong>
                      <br />
                      Kata sandi: <strong>{DEMO.password}</strong>
                    </p>
                  </details>
                </div>
                {mode !== 'legacy' && (
                  <button
                    disabled={busy}
                    className="auth-legacy"
                    onClick={() => changeMode('legacy')}
                  >
                    Buka profil lama tanpa email
                  </button>
                )}
              </>
            )}
            <p className="auth-local-note">
              Mode demo lokal · Akun dan progres tersimpan di browser ini.
              Gunakan kata sandi khusus demo.
            </p>
            <button
              className="electric-class"
              disabled={busy}
              onClick={onClass}
            >
              Sudah punya kelas? <span>Masukkan kode dari guru.</span>
            </button>
          </div>
        </section>
      </div>
    </main>
  )
}
