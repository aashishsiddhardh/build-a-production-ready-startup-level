import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  ClipboardList,
  MessageCircleHeart,
  BookOpenText,
  History,
  ArrowRight,
  Sparkles,
  Flower2,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { getHistory } from '@/lib/storage/history'
import { getDoshaProfile } from '@/lib/storage/profile'
import { DOSHA_LABELS } from '@/data/reference'
import { HERBS } from '@/data/herbs'
import { FORMULATIONS } from '@/data/formulations'
import { Bar } from '@/components/ui'

const QUICK = [
  { to: '/app/assessment', icon: ClipboardList, title: 'New assessment', body: 'Structured symptom & health check with safety screening.', accent: 'bg-sage-100 text-sage-600' },
  { to: '/app/assistant', icon: MessageCircleHeart, title: 'Ask the assistant', body: 'Grounded answers about herbs and lifestyle.', accent: 'bg-turmeric-100 text-turmeric-700' },
  { to: '/app/knowledge', icon: BookOpenText, title: 'Knowledge base', body: `Browse ${HERBS.length} herbs & ${FORMULATIONS.length} formulations.`, accent: 'bg-clay-100 text-clay-700' },
  { to: '/app/history', icon: History, title: 'My history', body: 'Revisit past assessments and guidance.', accent: 'bg-sage-100 text-sage-600' },
]

export function Dashboard() {
  const { user } = useAuth()
  const history = useMemo(() => (user ? getHistory(user.id) : []), [user])
  const dosha = useMemo(() => (user ? getDoshaProfile(user.id) : null), [user])
  const greeting = getGreeting()

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-medium text-sage-500">{greeting}</p>
        <h1 className="mt-1 text-3xl font-semibold text-sage-900">{user?.name?.split(' ')[0] ?? 'Welcome'}</h1>
        <p className="mt-2 max-w-2xl text-sage-600">
          Your safety-first wellness companion. Begin with an assessment or ask a question — every suggestion is checked
          for contraindications and interactions before you see it.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {QUICK.map((q) => (
          <Link key={q.to} to={q.to} className="card group flex items-center gap-4 p-5 transition-shadow hover:shadow-md">
            <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${q.accent}`}>
              <q.icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-sage-900">{q.title}</h3>
              <p className="truncate text-sm text-sage-500">{q.body}</p>
            </div>
            <ArrowRight className="h-5 w-5 shrink-0 text-sage-300 transition-transform group-hover:translate-x-1" />
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Constitution */}
        <div className="card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-sage-900">
              <Flower2 className="h-5 w-5 text-sage-500" /> Your constitution
            </h2>
            <Link to="/app/assessment" className="text-sm font-semibold text-sage-600 hover:underline">
              {dosha ? 'Retake' : 'Discover'}
            </Link>
          </div>
          {dosha ? (
            <div className="space-y-3">
              {(['vata', 'pitta', 'kapha'] as const).map((d) => (
                <div key={d}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium text-sage-800">
                      {DOSHA_LABELS[d].name}
                      {dosha.analysis.dominant === d && (
                        <span className="ml-2 rounded-full bg-sage-100 px-2 py-0.5 text-xs font-semibold text-sage-600">
                          dominant
                        </span>
                      )}
                    </span>
                    <span className="tabular-nums text-sage-500">{Math.round(dosha.analysis.proportions[d] * 100)}%</span>
                  </div>
                  <Bar
                    value={dosha.analysis.proportions[d]}
                    className={d === 'vata' ? 'bg-clay-400' : d === 'pitta' ? 'bg-turmeric-500' : 'bg-sage-500'}
                  />
                </div>
              ))}
              {dosha.analysis.dominant && (
                <p className="pt-1 text-sm text-sage-600">{DOSHA_LABELS[dosha.analysis.dominant].blurb}</p>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-sage-200 bg-sage-50/50 p-5 text-center">
              <p className="text-sm text-sage-600">
                Take the short constitution quiz inside an assessment to personalise your guidance.
              </p>
              <Link to="/app/assessment" className="btn-secondary mt-3">
                <Sparkles className="h-4 w-4" /> Find your dosha
              </Link>
            </div>
          )}
        </div>

        {/* Recent */}
        <div className="card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-sage-900">
              <History className="h-5 w-5 text-sage-500" /> Recent assessments
            </h2>
            <Link to="/app/history" className="text-sm font-semibold text-sage-600 hover:underline">
              View all
            </Link>
          </div>
          {history.length === 0 ? (
            <div className="rounded-xl border border-dashed border-sage-200 bg-sage-50/50 p-5 text-center text-sm text-sage-600">
              No assessments yet. Your first one takes just a minute.
            </div>
          ) : (
            <ul className="space-y-2">
              {history.slice(0, 4).map((h) => (
                <li key={h.id}>
                  <Link to="/app/history" className="flex items-center justify-between rounded-xl border border-sage-100 p-3 hover:bg-sage-50">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-sage-800">
                        {h.result.triage.blockRecommendations
                          ? 'Routed to care (safety)'
                          : `${h.result.recommendations.length} suggestions`}
                      </p>
                      <p className="truncate text-xs text-sage-500">
                        {h.input.symptoms.slice(0, 3).map((s) => s.replace(/_/g, ' ')).join(', ') || 'General wellness'}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-sage-400">{new Date(h.createdAt).toLocaleDateString()}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}
