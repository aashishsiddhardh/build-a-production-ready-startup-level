import type { User, StoredAssessment, AuditEntry, ChatMessage } from './types';

/**
 * A minimal, typed localStorage-backed persistence layer.
 *
 * In production this maps onto PostgreSQL tables behind the FastAPI service
 * (see /backend). The client interface is intentionally storage-agnostic so it
 * can be swapped for a real API without touching the UI.
 */

const NS = 'ayursage';
const KEYS = {
  users: `${NS}:users`,
  session: `${NS}:session`,
  assessments: `${NS}:assessments`,
  audit: `${NS}:audit`,
  chats: `${NS}:chats`,
} as const;

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or unavailable — non-fatal for a demo */
  }
}

export const store = {
  // Users -------------------------------------------------------------------
  getUsers(): User[] {
    return read<User[]>(KEYS.users, []);
  },
  saveUsers(users: User[]): void {
    write(KEYS.users, users);
  },
  getUserById(id: string): User | undefined {
    return this.getUsers().find((u) => u.id === id);
  },
  getUserByEmail(email: string): User | undefined {
    return this.getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());
  },
  upsertUser(user: User): void {
    const users = this.getUsers();
    const idx = users.findIndex((u) => u.id === user.id);
    if (idx >= 0) users[idx] = user;
    else users.push(user);
    this.saveUsers(users);
  },
  deleteUser(id: string): void {
    this.saveUsers(this.getUsers().filter((u) => u.id !== id));
    this.saveAssessments(this.getAssessments().filter((a) => a.userId !== id));
    const chats = this.getAllChats();
    delete chats[id];
    write(KEYS.chats, chats);
  },

  // Session -----------------------------------------------------------------
  getSession(): string | null {
    return read<string | null>(KEYS.session, null);
  },
  setSession(userId: string | null): void {
    write(KEYS.session, userId);
  },

  // Assessments -------------------------------------------------------------
  getAssessments(): StoredAssessment[] {
    return read<StoredAssessment[]>(KEYS.assessments, []);
  },
  saveAssessments(list: StoredAssessment[]): void {
    write(KEYS.assessments, list);
  },
  addAssessment(a: StoredAssessment): void {
    const list = this.getAssessments();
    list.unshift(a);
    this.saveAssessments(list);
  },
  getAssessmentsForUser(userId: string): StoredAssessment[] {
    return this.getAssessments().filter((a) => a.userId === userId);
  },

  // Audit -------------------------------------------------------------------
  getAudit(): AuditEntry[] {
    return read<AuditEntry[]>(KEYS.audit, []);
  },
  addAudit(entry: AuditEntry): void {
    const list = this.getAudit();
    list.unshift(entry);
    // Cap the local audit log to a reasonable size.
    write(KEYS.audit, list.slice(0, 500));
  },

  // Chats -------------------------------------------------------------------
  getAllChats(): Record<string, ChatMessage[]> {
    return read<Record<string, ChatMessage[]>>(KEYS.chats, {});
  },
  getChats(userId: string): ChatMessage[] {
    return this.getAllChats()[userId] ?? [];
  },
  saveChats(userId: string, messages: ChatMessage[]): void {
    const all = this.getAllChats();
    all[userId] = messages.slice(-100);
    write(KEYS.chats, all);
  },
};
