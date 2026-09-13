import { useEffect, useMemo, useState } from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
  Legend,
} from 'recharts'
import type { AuditAction } from '@/types'
import { HERBS } from '@/data/herbs'
import { FORMULATIONS } from '@/data/formulations'
import { listUsers } from '@/lib/auth/auth'
import { getAuditLog } from '@/lib/audit/log'
import { logAudit } from '@/lib/audit/log'
import { EVIDENCE_LABEL } from '@/lib/recommend/scoring'
import { useAuth } from '@/context/AuthContext'
import { EvidenceBadge } from '@/components/ui'
import { Gauge, Users, ClipboardList, ShieldAlert, MessageSquare, Leaf, ScrollText } from 'lucide-react'

const ACTION_LABEL: Record<AuditAction, string> = {
  'auth.register': 'Registered',
  'auth.login': 'Signed in',
  'auth.logout': 'Signed out',
  'auth.login_failed': 'Failed sign-in',
  'assessment.run': 'Ran assessment',
  'assessment.blocked_emergency': 'Safety escalation',
  'assistant.query': 'Assistant query',
  'privacy.export': 'Exported data',
  'privacy.delete_history': 'Deleted history',
  'privacy.delete_account': 'Deleted account',
  'consent.update': 'Updated consent',
  'admin.view': 'Viewed admin',
}

const EVIDENCE_COLORS: Record<string, string> = {
  traditional: '#ad7657',
  preclinical: '#bd8f70',
  preliminary: '#dc8a1d',
  moderate: '#5a824c',
  strong: '#385230',
}

export function Admin() {
  const { user } = useAuth()
  const [, setTick] = useState(0)

  useEffect(() => {
    if (user) logAudit('admin.view', { userId: user.id, actorEmail: user.email })
    setTick((t) => t + 1)
  }, [user])

  const users = useMemo(() => listUsers(), [])
  const audit = useMemo(() => getAuditLog(), [])

  const evidenceData = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const h of HERBS) counts[h.evidenceLevel] = (counts[h.evidenceLevel] ?? 0) + 1
    return (['traditional', 'preclinical', 'preliminary', 'moderate', 'strong'] as const).map((k) => ({
      key: k,
      name: EVIDENCE_LABEL[k],
      value: counts[k] ?? 0,
    }))
  }, [])

  const actionCounts = useMemo(() => {
    const c: Record<string, number> = {}
    for (const e of audit) c[e.action] = (c[e.action] ?? 0) + 1
    return c
  }, [audit])

  const triageData = useMemo(() => {
    const runs = actionCounts['assessment.run'] ?? 0
    const blocked = actionCounts['assessment.blocked_emergency'] ?? 0
    return [
      { name: 'Standard', value: runs, color: '#5a824c' },
      { name: 'Safety escalation', value: blocked, color: '#c2410c' },
    ].filter((d) => d.value > 0)
  }, [actionCounts])

  const metrics = [
    { icon: Users, label: 'Registered users', value: users.length, accent: 'bg-sage-100 text-sage-600' },
    { icon: ClipboardList, label: 'Assessments run', value: (actionCounts['assessment.run'] ?? 0) + (actionCounts['assessment.blocked_emergency'] ?? 0), accent: 'bg-turmeric-100 text-turmeric-700' },
    { icon: ShieldAlert, label: 'Safety escalations', value: actionCounts['assessment.blocked_emergency'] ?? 0, accent: 'bg-red-100 text-red-600' },
    { icon: MessageSquare, label: 'Assistant queries', value: actionCounts['assistant.query'] ?? 0, accent: 'bg-clay-100 text-clay-700' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-semibold text-sage-900">
          <Gauge className="h-7 w-7 text-sage-500" /> Admin dashboard
        </h1>
        <p className="mt-1 text-sage-600">Operational overview. All content is metadata — no user health data is shown.</p>
      </div>

      {/* Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => (
          <div key={m.label} className="card p-5">
            <div className={`mb-3 grid h-10 w-10 place-items-center rounded-lg ${m.accent}`}>
              <m.icon className="h-5 w-5" />
            </div>
            <p className="text-3xl font-bold text-sage-900">{m.value}</p>
            <p className="text-sm text-sage-500">{m.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Evidence distribution */}
        <div className="card p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-sage-900">
            <Leaf className="h-5 w-5 text-sage-500" /> Knowledge-base evidence levels
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={evidenceData} margin={{ top: 8, right: 8, left: -18, bottom: 8 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#5a824c' }} interval={0} angle={-12} textAnchor="end" height={54} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#5a824c' }} />
                <Tooltip cursor={{ fill: '#f3f7f2' }} contentStyle={{ borderRadius: 12, border: '1px solid #e3ecdf', fontSize: 13 }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {evidenceData.map((d) => (
                    <Cell key={d.key} fill={EVIDENCE_COLORS[d.key]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-xs text-sage-400">
            {HERBS.length} herbs · {FORMULATIONS.length} formulations. Evidence tiers describe strength of support, never fabricated citations.
          </p>
        </div>

        {/* Triage outcomes */}
        <div className="card p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-sage-900">
            <ShieldAlert className="h-5 w-5 text-sage-500" /> Triage outcomes
          </h2>
          {triageData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={triageData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3}>
                    {triageData.map((d) => (
                      <Cell key={d.name} fill={d.color} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e3ecdf', fontSize: 13 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="grid h-64 place-items-center text-center text-sm text-sage-400">
              No assessments recorded yet. Run one to populate this chart.
            </div>
          )}
        </div>
      </div>

      {/* Users */}
      <div className="card overflow-hidden">
        <div className="flex items-center gap-2 border-b border-sage-100 p-5">
          <Users className="h-5 w-5 text-sage-500" />
          <h2 className="text-lg font-semibold text-sage-900">Users ({users.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-sage-100 text-left text-xs uppercase tracking-wide text-sage-400">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Role</th>
                <th className="px-5 py-3 font-medium">Consent</th>
                <th className="px-5 py-3 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-sage-50 last:border-0">
                  <td className="px-5 py-3 font-medium text-sage-800">{u.name}</td>
                  <td className="px-5 py-3 text-sage-600">{u.email}</td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${u.role === 'admin' ? 'bg-sage-600 text-white' : 'bg-sage-100 text-sage-600'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sage-600">{u.consentDataStorage ? 'Granted' : 'Withdrawn'}</td>
                  <td className="px-5 py-3 text-sage-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit log */}
      <div className="card overflow-hidden">
        <div className="flex items-center gap-2 border-b border-sage-100 p-5">
          <ScrollText className="h-5 w-5 text-sage-500" />
          <h2 className="text-lg font-semibold text-sage-900">Audit log</h2>
          <span className="ml-auto text-xs text-sage-400">{audit.length} events · metadata only</span>
        </div>
        {audit.length === 0 ? (
          <p className="p-6 text-center text-sm text-sage-400">No events recorded yet.</p>
        ) : (
          <ul className="max-h-96 divide-y divide-sage-50 overflow-y-auto">
            {audit.slice(0, 200).map((e) => (
              <li key={e.id} className="flex items-center gap-3 px-5 py-3 text-sm">
                <span className="w-40 shrink-0 text-xs text-sage-400">{new Date(e.at).toLocaleString()}</span>
                <span className="w-36 shrink-0 font-medium text-sage-800">{ACTION_LABEL[e.action] ?? e.action}</span>
                <span className="min-w-0 flex-1 truncate text-sage-500">
                  {e.actorEmail ?? '—'}
                  {Object.keys(e.meta).length > 0 && (
                    <span className="ml-2 text-xs text-sage-400">
                      {Object.entries(e.meta).map(([k, v]) => `${k}=${v}`).join(' · ')}
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-xl border border-sage-100 bg-sage-50/60 p-4 text-xs text-sage-500">
        <EvidenceBadge level="strong" /> <span className="ml-2">Reminder: this demo persists to local storage. The bundled FastAPI reference backend implements the same tables with PostgreSQL + pgvector and Row-Level Security.</span>
      </div>
    </div>
  )
}
