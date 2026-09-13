import type { AuditAction, AuditEntry, User } from './types';
import { store } from './storage';
import { uid } from './id';

/**
 * Append-only audit trail. Every privacy-relevant or safety-relevant action is
 * recorded (locally here; in production this is a write-only Postgres table).
 * We never record raw health free-text or passwords in the audit meta.
 */
export function logAudit(
  action: AuditAction,
  actor: Pick<User, 'id' | 'email'> | null,
  meta: Record<string, string | number | boolean | null> = {},
): AuditEntry {
  const entry: AuditEntry = {
    id: uid('audit'),
    ts: new Date().toISOString(),
    userId: actor?.id ?? null,
    actorEmail: actor?.email ?? null,
    action,
    meta,
  };
  store.addAudit(entry);
  return entry;
}
