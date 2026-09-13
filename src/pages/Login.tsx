import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { Brand, Spinner } from '@/components/ui'
import { DEMO_ADMIN_CREDS } from '@/lib/auth/auth'
import { KeyRound, Mail, ArrowRight, Info } from 'lucide-react'

export function Login() {
  const { login } = useAuth()
  const { notify } = useToast()
  const navigate = useNavigate()
  const location = useLocation() as { state?: { from?: string } }
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const res = await login(email, password)
    setBusy(false)
    if (res.ok) {
      notify('Welcome back!', 'success')
      navigate(location.state?.from ?? '/app', { replace: true })
    } else {
      setError(res.error ?? 'Sign in failed.')
    }
  }

  const useDemo = () => {
    setEmail(DEMO_ADMIN_CREDS.email)
    setPassword(DEMO_ADMIN_CREDS.password)
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-12">
      <Link to="/" className="mx-auto mb-8">
        <Brand />
      </Link>
      <div className="card p-6 sm:p-8">
        <h1 className="text-2xl font-semibold text-sage-900">Sign in</h1>
        <p className="mt-1 text-sm text-sage-500">Access your private wellness profile.</p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="label" htmlFor="email">
              Email
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sage-400" />
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input pl-9"
                placeholder="you@example.com"
              />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sage-400" />
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input pl-9"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

          <button type="submit" disabled={busy} className="btn-primary w-full py-3">
            {busy ? <Spinner /> : <>Sign in <ArrowRight className="h-4 w-4" /></>}
          </button>
        </form>

        <div className="mt-5 flex items-start gap-2 rounded-xl border border-sage-100 bg-sage-50 p-3 text-xs text-sage-600">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-sage-400" />
          <div>
            <p className="font-medium text-sage-700">Explore the admin dashboard</p>
            <p className="mt-0.5">
              Seeded demo admin — <span className="font-mono">{DEMO_ADMIN_CREDS.email}</span>.{' '}
              <button type="button" onClick={useDemo} className="font-semibold text-sage-700 underline">
                Fill credentials
              </button>
            </p>
          </div>
        </div>
      </div>
      <p className="mt-6 text-center text-sm text-sage-600">
        New here?{' '}
        <Link to="/register" className="font-semibold text-sage-700 hover:underline">
          Create a profile
        </Link>
      </p>
    </div>
  )
}
