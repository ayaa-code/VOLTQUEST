// Local prototype adapter. Replace this boundary with server authentication later.
// These records are NOT a security boundary: the device owner can edit storage.
export const DEMO = {
  email: 'siswa@voltquest.demo',
  password: 'VoltQuest123',
  name: 'Penjelajah',
}
const KEY = 'voltquest.accounts.v1'
const EMAIL_KEY = 'voltquest.remembered-email.v1'
type Account = { name: string; salt: string; digest: string; recovery: string }
type Accounts = Record<string, Account>
function accounts(): Accounts {
  const raw = localStorage.getItem(KEY)
  if (!raw) return {}
  let parsed
  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new Error(
      'Data akun lokal tidak dapat dibaca. Gunakan akun demo atau profil lama.',
    )
  }
  if (
    !parsed ||
    parsed.version !== 1 ||
    !parsed.accounts ||
    typeof parsed.accounts !== 'object' ||
    Array.isArray(parsed.accounts)
  )
    throw new Error(
      'Data akun lokal tidak dapat dibaca. Profil belajar lama tetap tersedia.',
    )
  return parsed.accounts
}
const hex = (buffer: ArrayBuffer) =>
  Array.from(new Uint8Array(buffer), (b) =>
    b.toString(16).padStart(2, '0'),
  ).join('')
async function hash(value: string, salt: string) {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(value),
    'PBKDF2',
    false,
    ['deriveBits'],
  )
  return hex(
    await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: encoder.encode(salt),
        iterations: 100000,
        hash: 'SHA-256',
      },
      key,
      256,
    ),
  )
}
function save(value: Accounts) {
  localStorage.setItem(KEY, JSON.stringify({ version: 1, accounts: value }))
}
export function rememberedEmail() {
  try {
    return localStorage.getItem(EMAIL_KEY) ?? ''
  } catch {
    return ''
  }
}
export function rememberEmail(email: string, remember: boolean) {
  if (remember) localStorage.setItem(EMAIL_KEY, email)
  else localStorage.removeItem(EMAIL_KEY)
}
export async function authenticate(email: string, password: string) {
  if (email === DEMO.email && password === DEMO.password) return DEMO.name
  const account = accounts()[email]
  if (
    !account ||
    typeof account.name !== 'string' ||
    !account.name.trim() ||
    typeof account.salt !== 'string' ||
    typeof account.digest !== 'string' ||
    (await hash(password, account.salt)) !== account.digest
  )
    throw new Error('Email atau kata sandi belum cocok. Coba lagi.')
  return account.name
}
export async function registerLocal(
  email: string,
  password: string,
  name: string,
) {
  if (email === DEMO.email || Object.hasOwn(accounts(), email))
    throw new Error(
      'Email ini sudah terdaftar di perangkat ini. Silakan masuk.',
    )
  const salt = crypto.randomUUID()
  const recovery = crypto.randomUUID()
  const record = {
    name,
    salt,
    digest: await hash(password, salt),
    recovery: await hash(recovery, salt),
  }
  // Re-read after hashing so another tab's new account is not overwritten.
  const latest = accounts()
  if (Object.hasOwn(latest, email))
    throw new Error('Email ini sudah terdaftar. Silakan masuk.')
  save({ ...latest, [email]: record })
  return recovery
}
export async function resetLocal(
  email: string,
  code: string,
  password: string,
) {
  const account = accounts()[email]
  if (!account || (await hash(code.trim(), account.salt)) !== account.recovery)
    throw new Error('Email atau kode pemulihan belum cocok.')
  const digest = await hash(password, account.salt)
  save({ ...accounts(), [email]: { ...account, digest } })
}
