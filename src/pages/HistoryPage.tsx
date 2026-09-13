import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { store } from '@/lib/storage';
import { CONCERN_MAP } from '@/data/conditions';
import { DOSHA_META } from '@/data/doshas';
import type { StoredAssessment } from '@/lib/types';
import { History, ArrowRight, Trash2, ClipboardList, ShieldAlert, Sparkles } from 'lucide-react';

export default function HistoryPage() {
  const { user } = useAuth();
  const [version, setVersion] = useState(0);

  const assessments = useMemo(
    () => (user ? store.getAssessmentsForUser(user.id) : []),
    [user, version],
  );

  const remove = (id: string) => {
    const all = store.getAssessments().filter((a) => a.id !== id);
    store.saveAssessments(all);
    setVersion((v) => v + 1);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <header className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sage-100 text-sage-700">
          <History className="h-5 w-5" />
        </div>
        <div>
          <h1 className="section-title">Your history</h1>
          <p className="text-sm text-ink-500">Past assessments and their safety-checked guidance.</p>
        </div>
      </header>

      {assessments.length === 0 ? (
        <div className="card mt-8 p-10 text-center">
          <ClipboardList className="mx-auto h-10 w-10 text-sage-300" />
          <h2 className="mt-3 font-serif text-xl font-semibold text-ink-900">No assessments yet</h2>
          <p className="mt-1 text-sm text-ink-500">Take your first assessment to see personalized guidance here.</p>
          <Link to="/assessment" className="btn-primary mt-5">Start assessment</Link>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {assessments.map((a) => (
            <HistoryRow key={a.id} a={a} onDelete={() => remove(a.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

function HistoryRow({ a, onDelete }: { a: StoredAssessment; onDelete: () => void }) {
  const emergency = a.triage.level === 'emergency';
  const urgent = a.triage.level === 'urgent';
  const top = a.recommendations[0];
  return (
    <div className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-ink-900">
            {new Date(a.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
          </span>
          <span className="text-xs text-ink-400">
            {new Date(a.createdAt).toLocaleTimeString(undefined, { timeStyle: 'short' })}
          </span>
          {emergency ? (
            <span className="chip border-clay-300 bg-clay-50 text-clay-700">
              <ShieldAlert className="h-3 w-3" /> Emergency guidance
            </span>
          ) : urgent ? (
            <span className="chip border-turmeric-300 bg-turmeric-50 text-turmeric-700">See a clinician</span>
          ) : (
            <span className="chip border-sage-200 bg-sage-50 text-sage-700">
              <Sparkles className="h-3 w-3" /> {a.recommendations.length} suggestions
            </span>
          )}
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {a.concerns.slice(0, 5).map((c) => (
            <span key={c} className="rounded-full bg-sage-50 px-2 py-0.5 text-xs text-sage-700">
              {CONCERN_MAP[c]?.label ?? c}
            </span>
          ))}
        </div>
        <p className="mt-2 text-xs text-ink-500">
          Dominant: <span className="font-medium text-ink-700">{DOSHA_META[a.dominantDosha].name}</span>
          {top && !emergency && !urgent && (
            <>
              {' '}· Top suggestion: <span className="font-medium text-ink-700">{top.herb.commonName}</span>
            </>
          )}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Link to={`/results/${a.id}`} className="btn-outline text-sm">
          View <ArrowRight className="h-3.5 w-3.5" />
        </Link>
        <button
          onClick={onDelete}
          className="rounded-full p-2 text-ink-400 transition hover:bg-clay-50 hover:text-clay-600"
          aria-label="Delete assessment"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
