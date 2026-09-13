import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Logo } from '@/components/Logo';
import { Disclaimer } from '@/components/Disclaimer';
import { Loader2, Mail, Lock, User as UserIcon, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(
    params.get('mode') === 'register' ? 'register' : 'login',
  );
  const redirect = params.get('redirect') || '/assessment';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res =
        mode === 'login'
          ? await login(email, password)
          : await register(name, email, password);
      if (res.ok) navigate(redirect, { replace: true });
      else setError(res.error ?? 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  };

  const fillDemo = (kind: 'user' | 'admin') => {
    setMode('login');
    setEmail(kind === 'admin' ? 'admin@ayursage.demo' : 'demo@ayursage.demo');
    setPassword(kind === 'admin' ? 'admin1234' : 'wellness123');
    setError(null);
  };

  return (
    <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2">
      <div className="hidden lg:block">
        <Logo />
        <h1 className="mt-8 max-w-md font-serif text-4xl font-semibold leading-tight text-ink-900">
          Your calm, evidence-graded path to Ayurvedic wellbeing.
        </h1>
        <p className="mt-4 max-w-md text-ink-600">
          Create a free account to save your assessments and history. We protect your health data with privacy
          controls and full audit logging.
        </p>
        <div className="mt-8 grid max-w-md grid-cols-2 gap-3">
          <button onClick={() => fillDemo('user')} className="card p-4 text-left transition hover:border-sage-300">
            <div className="text-xs font-semibold uppercase tracking-wide text-sage-600">Demo user</div>
            <div className="mt-1 text-sm text-ink-700">demo@ayursage.demo</div>
          </button>
          <button onClick={() => fillDemo('admin')} className="card p-4 text-left transition hover:border-sage-300">
            <div className="text-xs font-semibold uppercase tracking-wide text-turmeric-600">Demo admin</div>
            <div className="mt-1 text-sm text-ink-700">admin@ayursage.demo</div>
          </button>
        </div>
      </div>

      <div className="mx-auto w-full max-w-md">
        <div className="card p-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-serif text-2xl font-semibold text-ink-900">
              {mode === 'login' ? 'Welcome back' : 'Create your account'}
            </h2>
          </div>

          <form onSubmit={submit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="label" htmlFor="name">Full name</label>
                <div className="relative">
                  <UserIcon className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-ink-400" />
                  <input
                    id="name"
                    className="input pl-10"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Asha Patel"
                    autoComplete="name"
                  />
                </div>
              </div>
            )}
            <div>
              <label className="label" htmlFor="email">Email</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-ink-400" />
                <input
                  id="email"
                  type="email"
                  className="input pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </div>
            </div>
            <div>
              <label className="label" htmlFor="password">Password</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-ink-400" />
                <input
                  id="password"
                  type="password"
                  className="input pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'register' ? 'At least 8 characters' : '••••••••'}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  required
                />
              </div>
            </div>

            {error && (
              <p className="rounded-xl bg-clay-50 px-3 py-2 text-sm text-clay-700">{error}</p>
            )}

            <button type="submit" className="btn-primary w-full" disabled={busy}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
              {mode === 'login' ? 'Sign in' : 'Create account'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-ink-500">
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setError(null);
              }}
              className="font-semibold text-sage-700 hover:text-sage-800"
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>

        <p className="mt-4 text-center text-xs text-ink-400 lg:hidden">
          Demo: demo@ayursage.demo / wellness123
        </p>

        <div className="mt-6">
          <Disclaimer compact />
        </div>
        <p className="mt-4 text-center text-xs text-ink-400">
          <Link to="/" className="hover:text-sage-700">← Back to home</Link>
        </p>
      </div>
    </div>
  );
}
