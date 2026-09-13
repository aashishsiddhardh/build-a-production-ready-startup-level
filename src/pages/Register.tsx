import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { Brand, Spinner } from '@/components/ui'
import { User, Mail, KeyRound, ArrowRight, ShieldCheck } from 'lucide-react'

export function Register() {
  const { register } = useAuth()
  const { notify } = useToast()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [consent, setConsent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const res = await register({ name, email, password, consent })
    setBusy(false)
    if (res.ok) {
      notify('Profile created. Welcome to AyurSage!', 'success')
      navigate('/app', { replace: true })
    } else {
      setError(res.error ?? 'Could not create your profile.')
    }
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-12">
      <Link to="/" className="mx-auto mb-8">
        <Brand />
      </Link>
      <div className="card p-6 sm:p-8">
        <h1 className="text-2xl font-semibold text-sage-900">Create your profile</h1>
        <p className="mt-1 text-sm text-sage-500">Private and on-device. Takes under a minute.</p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="label" htmlFor="name">Name</label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sage-400" />
              <input id="name" required value={name} onChange={(e) => setName(e.target.value)} className="input pl-9" placeholder="Your name" />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="email">Email</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sage-400" />
              <input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input pl-9" placeholder="you@example.com" />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="password">Password</label>
            <div className="relative">
              <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sage-400" />
              <input id="password" type="password" autoComplete="new-password" required value={password} onChange={(e) => setPassword(e.target.value)} className="input pl-9" placeholder="At least 8 characters" />
            </div>
            <p className="mt-1 text-xs text-sage-400">Stored only as a salted PBKDF2 hash on your device.</p>
          </div>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-sage-200 bg-sage-50/50 p-3">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-sage-300 text-sage-600 focus:ring-sage-400" />
            <span className="text-xs text-sage-600">
              I understand AyurSage provides <strong>educational wellness information, not medical advice</strong>, and I
              consent to storing my inputs locally on this device. I can export or delete them anytime.
            </span>
          </label>

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

          <button type="submit" disabled={busy} className="btn-primary w-full py-3">
            {busy ? <Spinner /> : <>Create profile <ArrowRight className="h-4 w-4" /></>}
          </button>
        </form>

        <div className="mt-5 flex items-center gap-2 text-xs text-sage-400">
          <ShieldCheck className="h-4 w-4" /> We never diagnose or prescribe. In an emergency, call your local emergency number.
        </div>
      </div>
      <p className="mt-6 text-center text-sm text-sage-600">
        Already have a profile?{' '}
        <Link to="/login" className="font-semibold text-sage-700 hover:underline">Sign in</Link>
      </p>
    </div>
  )
}
