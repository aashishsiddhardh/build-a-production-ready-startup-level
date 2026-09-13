import type { AuditAction, AuditEvent } from '@/types'
import { KEYS, read, write } from '@/lib/storage/db'
import { uuid } from '@/lib/crypto'

// Append-only audit log. IMPORTANT: audit entries store metadata only — never
// raw health inputs, free-text symptoms, or credentials. This lets the admin
// dashboard show *what happened* without exposing sensitive content.

const MAX_EVENTS = 1000

export function logAudit(
  action: AuditAction,
  opts: { userId?: string | null; actorEmail?: string | null; meta?: Record<string, string | number | boolean> } = {},
): AuditEvent {
  const event: AuditEvent = {
    id: uuid(),
    at: new Date().toISOString(),
    userId: opts.userId ?? null,
    actorEmail: opts.actorEmail ?? null,
    action,
    meta: opts.meta ?? {},
  }
  const events = read<AuditEvent[]>(KEYS.audit, [])
  events.push(event)
  // Cap the log to avoid unbounded growth in localStorage.
  const trimmed = events.slice(-MAX_EVENTS)
  write(KEYS.audit, trimmed)
  return event
}

export function getAuditLog(): AuditEvent[] {
  return read<AuditEvent[]>(KEYS.audit, []).slice().reverse()
}

export function clearAuditLog(): void {
  write<AuditEvent[]>(KEYS.audit, [])
}
