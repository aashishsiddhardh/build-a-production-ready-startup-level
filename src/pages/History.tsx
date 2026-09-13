import { useMemo, useState } from 'react'
import type { HistoryEntry } from '@/types'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { getHistory, deleteHistoryEntry, clearHistory } from '@/lib/storage/history'
import { logAudit } from '@/lib/audit/log'
import { SYMPTOMS } from '@/data/reference'
import { ResultsView } from '@/components/ResultsView'
import { EmptyState } from '@/components/ui'
import { History as HistoryIcon, Trash2, ChevronLeft, ShieldAlert, Leaf } from 'lucide-react'

const SYMPTOM_LABEL: Record<string, string> = Object.fromEntries(SYMPTOMS.map((s) => [s.key, s.label]))

export function History() {
  const { user } = useAuth()
  const { notify } = useToast()
  const [entries, setEntries] = useState<HistoryEntry[]>(() => (user ? getHistory(user.id) : []))
  const [active, setActive] = useState<HistoryEntry | null>(null)

  const refresh = () => user && setEntries(getHistory(user.id))

  const remove = (id: string) => {
    if (!user) return
    deleteHistoryEntry(user.id, id)
    logAudit('privacy.delete_history', { userId: user.id, actorEmail: user.email, meta: { scope: 'entry' } })
    if (active?.id === id) setActive(null)
    refresh()
    notify('Entry deleted.', 'success')
  }

  const clearAll = () => {
    if (!user) return
    clearHistory(user.id)
    logAudit('privacy.delete_history', { userId: user.id, actorEmail: user.email, meta: { scope: 'all' } })
    setActive(null)
    setEntries([])
    notify('History cleared.', 'success')
  }

  const summary = useMemo(() => {
    if (!active) return ''
    const s = active.input.symptoms.filter((k) => SYMPTOM_LABEL[k]).map((k) => SYMPTOM_LABEL[k])
    return s.join(', ') || (active.input.freeText ? 'Described in text' : 'General wellness')
  }, [active])

  if (active) {
    return (
      <div className="space-y-6">
        <button onClick={() => setActive(null)} className="btn-ghost -ml-2 text-sage-600">
          <ChevronLeft className="h-4 w-4" /> Back to history
        </button>
        <div>
          <p className="text-sm text-sage-500">{new Date(active.createdAt).toLocaleString()}</p>
          <h1 className="text-2xl font-semibold text-sage-900">{summary}</h1>
        </div>
        <ResultsView result={active.result} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-semibold text-sage-900">
            <HistoryIcon className="h-7 w-7 text-sage-500" /> My history
          </h1>
          <p className="mt-1 text-sage-600">Your past assessments, stored privately on this device.</p>
        </div>
        {entries.length > 0 && (
          <button onClick={clearAll} className="btn-ghost text-red-600 hover:bg-red-50">
            <Trash2 className="h-4 w-4" /> Clear all
          </button>
        )}
      </div>

      {entries.length === 0 ? (
        <EmptyState
          icon={<HistoryIcon className="h-6 w-6" />}
          title="No history yet"
          body="Once you complete an assessment, it will appear here for you to revisit."
        />
      ) : (
        <ul className="space-y-3">
          {entries.map((e) => {
            const blocked = e.result.triage.blockRecommendations
            const symptoms = e.input.symptoms.filter((k) => SYMPTOM_LABEL[k]).map((k) => SYMPTOM_LABEL[k])
            return (
              <li key={e.id} className="card flex items-center gap-4 p-4">
                <div
                  className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${
                    blocked ? 'bg-red-50 text-red-600' : 'bg-sage-100 text-sage-600'
                  }`}
                >
                  {blocked ? <ShieldAlert className="h-5 w-5" /> : <Leaf className="h-5 w-5" />}
                </div>
                <button onClick={() => setActive(e)} className="min-w-0 flex-1 text-left">
                  <p className="truncate font-medium text-sage-900">
                    {blocked ? 'Routed to care (safety)' : `${e.result.recommendations.length} suggestions`}
                  </p>
                  <p className="truncate text-sm text-sage-500">
                    {symptoms.slice(0, 4).join(', ') || (e.input.freeText ? 'Described in text' : 'General wellness')}
                  </p>
                </button>
                <span className="hidden shrink-0 text-sm text-sage-400 sm:block">
                  {new Date(e.createdAt).toLocaleDateString()}
                </span>
                <button onClick={() => remove(e.id)} className="btn-ghost shrink-0 text-sage-400 hover:text-red-600" aria-label="Delete">
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
