import type { Role, Session, StoredUser, User } from '@/types'
import { KEYS, read, write } from '@/lib/storage/db'
import { hashPassword, uuid, verifyPassword } from '@/lib/crypto'
import { logAudit } from '@/lib/audit/log'

const SESSION_DAYS = 7

// A seeded local admin so the admin dashboard is explorable out of the box.
// Framed clearly in the UI as a local demo credential — change before any real use.
const DEMO_ADMIN = {
  email: 'admin@ayursage.local',
  password: 'AyurSage#Admin1',
  name: 'AyurSage Admin',
}

function getUsers(): StoredUser[] {
  return read<StoredUser[]>(KEYS.users, [])
}

function saveUsers(users: StoredUser[]): void {
  write(KEYS.users, users)
}

export function toPublicUser(u: StoredUser): User {
  const { passwordHash: _h, salt: _s, ...pub } = u
  void _h
  void _s
  return pub
}

export async function ensureSeedAdmin(): Promise<void> {
  const users = getUsers()
  if (users.some((u) => u.role === 'admin')) return
  const { hash, salt } = await hashPassword(DEMO_ADMIN.password)
  const admin: StoredUser = {
    id: uuid(),
    email: DEMO_ADMIN.email,
    name: DEMO_ADMIN.name,
    role: 'admin',
    createdAt: new Date().toISOString(),
    consentDataStorage: true,
    consentAt: new Date().toISOString(),
    passwordHash: hash,
    salt,
  }
  saveUsers([admin, ...users])
}

export const DEMO_ADMIN_CREDS = { email: DEMO_ADMIN.email, password: DEMO_ADMIN.password }

function newSession(userId: string): Session {
  const now = Date.now()
  return {
    userId,
    issuedAt: new Date(now).toISOString(),
    expiresAt: new Date(now + SESSION_DAYS * 86400_000).toISOString(),
  }
}

export function getSession(): Session | null {
  const s = read<Session | null>(KEYS.session, null)
  if (!s) return null
  if (new Date(s.expiresAt).getTime() < Date.now()) {
    write(KEYS.session, null)
    return null
  }
  return s
}

export function getCurrentUser(): User | null {
  const session = getSession()
  if (!session) return null
  const u = getUsers().find((x) => x.id === session.userId)
  return u ? toPublicUser(u) : null
}

export interface RegisterInput {
  name: string
  email: string
  password: string
  consent: boolean
}

export async function register(input: RegisterInput): Promise<{ ok: true; user: User } | { ok: false; error: string }> {
  const email = input.email.trim().toLowerCase()
  const name = input.name.trim()
  if (!name) return { ok: false, error: 'Please enter your name.' }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { ok: false, error: 'Please enter a valid email.' }
  if (input.password.length < 8) return { ok: false, error: 'Password must be at least 8 characters.' }
  if (!input.consent) return { ok: false, error: 'Consent is required to create a local account.' }

  const users = getUsers()
  if (users.some((u) => u.email === email)) return { ok: false, error: 'An account with this email already exists.' }

  const { hash, salt } = await hashPassword(input.password)
  const nowIso = new Date().toISOString()
  const stored: StoredUser = {
    id: uuid(),
    email,
    name,
    role: 'user',
    createdAt: nowIso,
    consentDataStorage: true,
    consentAt: nowIso,
    passwordHash: hash,
    salt,
  }
  saveUsers([...users, stored])
  write(KEYS.session, newSession(stored.id))
  logAudit('auth.register', { userId: stored.id, actorEmail: email })
  return { ok: true, user: toPublicUser(stored) }
}

export async function login(
  emailRaw: string,
  password: string,
): Promise<{ ok: true; user: User } | { ok: false; error: string }> {
  const email = emailRaw.trim().toLowerCase()
  const users = getUsers()
  const user = users.find((u) => u.email === email)
  if (!user) {
    logAudit('auth.login_failed', { actorEmail: email, meta: { reason: 'no_such_user' } })
    return { ok: false, error: 'Invalid email or password.' }
  }
  const ok = await verifyPassword(password, user.passwordHash, user.salt)
  if (!ok) {
    logAudit('auth.login_failed', { userId: user.id, actorEmail: email, meta: { reason: 'bad_password' } })
    return { ok: false, error: 'Invalid email or password.' }
  }
  write(KEYS.session, newSession(user.id))
  logAudit('auth.login', { userId: user.id, actorEmail: email })
  return { ok: true, user: toPublicUser(user) }
}

export function logout(): void {
  const current = getCurrentUser()
  logAudit('auth.logout', { userId: current?.id ?? null, actorEmail: current?.email ?? null })
  write(KEYS.session, null)
}

export function updateConsent(userId: string, consent: boolean): User | null {
  const users = getUsers()
  const idx = users.findIndex((u) => u.id === userId)
  if (idx === -1) return null
  users[idx].consentDataStorage = consent
  users[idx].consentAt = new Date().toISOString()
  saveUsers(users)
  logAudit('consent.update', { userId, actorEmail: users[idx].email, meta: { consent } })
  return toPublicUser(users[idx])
}

export function deleteAccount(userId: string): void {
  const users = getUsers().filter((u) => u.id !== userId)
  saveUsers(users)
  write(KEYS.session, null)
  logAudit('privacy.delete_account', { userId })
}

export function listUsers(): User[] {
  return getUsers().map(toPublicUser)
}

export function isAdmin(user: User | null): boolean {
  return user?.role === 'admin'
}

export type { Role }
