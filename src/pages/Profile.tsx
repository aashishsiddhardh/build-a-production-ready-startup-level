import { useMemo } from 'react'
import { useAuth } from '@/context/AuthContext'
import { getHistory } from '@/lib/storage/history'
import { getDoshaProfile } from '@/lib/storage/profile'
import { DOSHA_LABELS } from '@/data/reference'
import { Settings2, Mail, Shield, CalendarDays, Flower2 } from 'lucide-react'

export function Profile() {
  const { user } = useAuth()
  const history = useMemo(() => (user ? getHistory(user.id) : []), [user])
  const dosha = useMemo(() => (user ? getDoshaProfile(user.id) : null), [user])
  if (!user) return null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-semibold text-sage-900">
          <Settings2 className="h-7 w-7 text-sage-500" /> Profile
        </h1>
        <p className="mt-1 text-sage-600">Your account details and wellness snapshot.</p>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-sage-600 text-2xl font-semibold text-white">
            {user.name[0]?.toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-sage-900">{user.name}</h2>
            <p className="text-sm text-sage-500">{user.role === 'admin' ? 'Administrator' : 'Member'}</p>
          </div>
        </div>
        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <Detail icon={<Mail className="h-4 w-4" />} label="Email" value={user.email} />
          <Detail icon={<Shield className="h-4 w-4" />} label="Role" value={user.role} />
          <Detail icon={<CalendarDays className="h-4 w-4" />} label="Member since" value={new Date(user.createdAt).toLocaleDateString()} />
          <Detail
            icon={<Flower2 className="h-4 w-4" />}
            label="Constitution"
            value={dosha?.analysis.dominant ? DOSHA_LABELS[dosha.analysis.dominant].name : 'Not assessed'}
          />
        </dl>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Assessments" value={history.length} />
        <Stat label="Suggestions received" value={history.reduce((n, h) => n + h.result.recommendations.length, 0)} />
        <Stat label="Safety escalations" value={history.filter((h) => h.result.triage.blockRecommendations).length} />
      </div>
    </div>
  )
}

function Detail({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-sage-100 bg-sage-50/50 p-3">
      <div className="grid h-9 w-9 place-items-center rounded-lg bg-white text-sage-500">{icon}</div>
      <div>
        <dt className="text-xs text-sage-400">{label}</dt>
        <dd className="text-sm font-medium capitalize text-sage-800">{value}</dd>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="card p-5 text-center">
      <p className="text-3xl font-bold text-sage-900">{value}</p>
      <p className="mt-1 text-sm text-sage-500">{label}</p>
    </div>
  )
}
