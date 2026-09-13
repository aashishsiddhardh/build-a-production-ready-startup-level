import type { User } from './types';
import { store } from './storage';
import { logAudit } from './audit';
import { generateSalt, hashPassword, verifyPassword } from './crypto';
import { uid } from './id';
import { DISCLAIMER_VERSION } from './constants';

export interface AuthResult {
  ok: boolean;
  user?: User;
  error?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function registerUser(
  name: string,
  email: string,
  password: string,
): Promise<AuthResult> {
  const cleanName = name.trim();
  const cleanEmail = email.trim().toLowerCase();

  if (cleanName.length < 2) return { ok: false, error: 'Please enter your name.' };
  if (!EMAIL_RE.test(cleanEmail)) return { ok: false, error: 'Please enter a valid email address.' };
  if (password.length < 8) return { ok: false, error: 'Password must be at least 8 characters.' };
  if (store.getUserByEmail(cleanEmail)) return { ok: false, error: 'An account with this email already exists.' };

  const salt = generateSalt();
  const passwordHash = await hashPassword(password, salt);

  const user: User = {
    id: uid('user'),
    email: cleanEmail,
    name: cleanName,
    role: 'user',
    createdAt: new Date().toISOString(),
    passwordHash,
    salt,
    consent: { disclaimerAcceptedAt: null, dataProcessingAt: null, version: DISCLAIMER_VERSION },
  };

  store.upsertUser(user);
  store.setSession(user.id);
  logAudit('auth.register', user, { email: user.email });
  return { ok: true, user };
}

export async function loginUser(email: string, password: string): Promise<AuthResult> {
  const cleanEmail = email.trim().toLowerCase();
  const user = store.getUserByEmail(cleanEmail);
  if (!user) return { ok: false, error: 'Invalid email or password.' };

  const valid = await verifyPassword(password, user.salt, user.passwordHash);
  if (!valid) return { ok: false, error: 'Invalid email or password.' };

  store.setSession(user.id);
  logAudit('auth.login', user, {});
  return { ok: true, user };
}

export function logoutUser(user: User | null): void {
  if (user) logAudit('auth.logout', user, {});
  store.setSession(null);
}

export function getCurrentUser(): User | null {
  const id = store.getSession();
  if (!id) return null;
  return store.getUserById(id) ?? null;
}

export function acceptConsent(user: User): User {
  const updated: User = {
    ...user,
    consent: {
      disclaimerAcceptedAt: new Date().toISOString(),
      dataProcessingAt: new Date().toISOString(),
      version: DISCLAIMER_VERSION,
    },
  };
  store.upsertUser(updated);
  logAudit('consent.accept', updated, { version: DISCLAIMER_VERSION });
  return updated;
}

let seeded = false;

/** Idempotently create demo accounts so the app is explorable out of the box. */
export async function seedDemoData(): Promise<void> {
  if (seeded) return;
  seeded = true;
  if (store.getUsers().length > 0) return;

  const now = new Date().toISOString();
  const mk = async (
    name: string,
    email: string,
    password: string,
    role: User['role'],
  ): Promise<User> => {
    const salt = generateSalt();
    const passwordHash = await hashPassword(password, salt);
    return {
      id: uid('user'),
      email,
      name,
      role,
      createdAt: now,
      passwordHash,
      salt,
      consent: { disclaimerAcceptedAt: now, dataProcessingAt: now, version: DISCLAIMER_VERSION },
    };
  };

  const admin = await mk('Dr. Meera Rao', 'admin@ayursage.demo', 'admin1234', 'admin');
  const demo = await mk('Asha Patel', 'demo@ayursage.demo', 'wellness123', 'user');
  store.saveUsers([admin, demo]);
}
