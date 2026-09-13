import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { exportAll } from '@/lib/storage/db'
import { clearHistory } from '@/lib/storage/history'
import { clearDoshaProfile } from '@/lib/storage/profile'
import { logAudit } from '@/lib/audit/log'
import { ShieldCheck, Download, Trash2, UserX, Lock, Database, FileClock } from 'lucide-react'

export function Privacy() {
  const { user, setConsent, deleteAccount } = useAuth()
  const { notify } = useToast()
  const navigate = useNavigate()
  const [confirmDelete, setConfirmDelete] = useState(false)

  if (!user) return null

  const doExport = () => {
    const data = exportAll()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ayursage-export-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    logAudit('privacy.export', { userId: user.id, actorEmail: user.email })
    notify('Your data has been exported.', 'success')
  }

  const doClearHistory = () => {
    clearHistory(user.id)
    clearDoshaProfile(user.id)
    logAudit('privacy.delete_history', { userId: user.id, actorEmail: user.email, meta: { scope: 'all' } })
    notify('History and constitution data cleared.', 'success')
  }

  const doDeleteAccount = () => {
    clearHistory(user.id)
    clearDoshaProfile(user.id)
    deleteAccount()
    notify('Your account and data have been deleted.', 'success')
    navigate('/')
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-semibold text-sage-900">
          <ShieldCheck className="h-7 w-7 text-sage-500" /> Privacy & data
        </h1>
        <p className="mt-1 max-w-2xl text-sage-600">
          You are in control. Your health inputs never leave this device unless you export them yourself.
        </p>
      </div>

      {/* How data is handled */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { icon: Lock, title: 'On-device only', body: 'Assessments, history, and constitution live in your browser’s local storage.' },
          { icon: Database, title: 'Minimal by design', body: 'Passwords are salted + PBKDF2-hashed. No health content is ever sent to a server.' },
          { icon: FileClock, title: 'Metadata-only audit', body: 'Audit logs record actions (e.g. “assessment run”) — never your symptoms or free text.' },
        ].map((c) => (
          <div key={c.title} className="card p-5">
            <div className="mb-3 grid h-10 w-10 place-items-center rounded-lg bg-sage-100 text-sage-600">
              <c.icon className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-sage-900">{c.title}</h3>
            <p className="mt-1 text-sm text-sage-600">{c.body}</p>
          </div>
        ))}
      </div>

      {/* Consent */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-sage-900">Consent</h2>
        <label className="mt-4 flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={user.consentDataStorage}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-sage-300 text-sage-600 focus:ring-sage-400"
          />
          <span className="text-sm text-sage-700">
            I consent to AyurSage storing my wellness inputs locally on this device to provide personalised guidance and
            history.{' '}
            {user.consentAt && (
              <span className="block text-xs text-sage-400">Last updated {new Date(user.consentAt).toLocaleString()}</span>
            )}
          </span>
        </label>
      </div>

      {/* Portability + erasure */}
      <div className="card divide-y divide-sage-100">
        <div className="flex flex-wrap items-center justify-between gap-3 p-5">
          <div>
            <h3 className="font-semibold text-sage-900">Export your data</h3>
            <p className="text-sm text-sage-600">Download everything AyurSage stores about you as JSON.</p>
          </div>
          <button onClick={doExport} className="btn-secondary">
            <Download className="h-4 w-4" /> Export JSON
          </button>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 p-5">
          <div>
            <h3 className="font-semibold text-sage-900">Clear health data</h3>
            <p className="text-sm text-sage-600">Delete all assessment history and constitution results. Keeps your account.</p>
          </div>
          <button onClick={doClearHistory} className="btn-secondary text-clay-700">
            <Trash2 className="h-4 w-4" /> Clear health data
          </button>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 p-5">
          <div>
            <h3 className="font-semibold text-red-700">Delete account</h3>
            <p className="text-sm text-sage-600">Permanently remove your account and all associated data from this device.</p>
          </div>
          {confirmDelete ? (
            <div className="flex items-center gap-2">
              <button onClick={() => setConfirmDelete(false)} className="btn-ghost">
                Cancel
              </button>
              <button onClick={doDeleteAccount} className="btn-danger">
                <UserX className="h-4 w-4" /> Confirm delete
              </button>
            </div>
          ) : (
            <button onClick={() => setConfirmDelete(true)} className="btn-danger">
              <UserX className="h-4 w-4" /> Delete account
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
