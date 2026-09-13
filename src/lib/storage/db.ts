// Small, typed persistence layer over localStorage. All app state (users,
// session, history, audit log, chats, dosha profile) lives under a single
// namespace so it can be exported or wiped as one unit for privacy controls.

const NS = 'ayursage'

export const KEYS = {
  users: `${NS}:users`,
  session: `${NS}:session`,
  history: `${NS}:history`,
  audit: `${NS}:audit`,
  chats: `${NS}:chats`,
  dosha: `${NS}:dosha`,
  theme: `${NS}:theme`,
} as const

function hasStorage(): boolean {
  try {
    return typeof window !== 'undefined' && !!window.localStorage
  } catch {
    return false
  }
}

export function read<T>(key: string, fallback: T): T {
  if (!hasStorage()) return fallback
  try {
    const raw = window.localStorage.getItem(key)
    if (raw == null) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function write<T>(key: string, value: T): void {
  if (!hasStorage()) return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Quota or serialization failure — non-fatal for the app.
  }
}

export function remove(key: string): void {
  if (!hasStorage()) return
  try {
    window.localStorage.removeItem(key)
  } catch {
    /* noop */
  }
}

/** Export every namespaced key as a portable object (privacy: data portability). */
export function exportAll(): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const key of Object.values(KEYS)) {
    out[key] = read<unknown>(key, null)
  }
  return out
}

/** Remove every namespaced key (privacy: right to erasure). */
export function wipeAll(): void {
  for (const key of Object.values(KEYS)) remove(key)
}
