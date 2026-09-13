import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Recommendation } from '@/lib/types';
import { CONCERN_MAP } from '@/data/conditions';
import { EvidenceBadge } from './EvidenceBadge';
import { SafetyPill } from './SafetyPill';
import { ScoreMeter } from './ScoreMeter';
import { ChevronDown, Sparkles, Leaf, TriangleAlert, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/cn';

export function RecommendationCard({ rec, rank }: { rec: Recommendation; rank: number }) {
  const [open, setOpen] = useState(false);
  const { herb, factors, safety } = rec;

  return (
    <article className="card overflow-hidden animate-fade-in">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start">
        <div className="flex items-center gap-4 sm:flex-col sm:items-center">
          <ScoreMeter score={rec.score} />
          <span className="text-[11px] font-medium uppercase tracking-wide text-ink-400">
            #{rank} · fit score
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-xl font-semibold text-ink-900">{herb.commonName}</h3>
            <span className="text-sm italic text-ink-400">{herb.latinName}</span>
          </div>
          <p className="mt-1 text-sm leading-relaxed text-ink-600">{herb.summary}</p>

          <div className="mt-3 flex flex-wrap gap-2">
            <EvidenceBadge level={herb.evidence} />
            <SafetyPill status={safety.status} />
            {herb.category === 'formulation' && (
              <span className="chip border-sage-200 bg-white text-sage-700">
                <Leaf className="h-3.5 w-3.5" /> Classical formulation
              </span>
            )}
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {rec.matchedConcerns.map((c) => (
              <span key={c} className="rounded-full bg-sage-50 px-2.5 py-1 text-xs font-medium text-sage-700">
                {CONCERN_MAP[c]?.label ?? c}
              </span>
            ))}
          </div>

          {safety.status !== 'ok' && (
            <div className="mt-3 rounded-xl border border-turmeric-200 bg-turmeric-50/70 p-3 text-sm text-ink-700">
              <div className="mb-1 flex items-center gap-1.5 font-semibold text-turmeric-800">
                <TriangleAlert className="h-4 w-4" /> Personalized safety note
              </div>
              <ul className="ml-1 list-inside list-disc space-y-0.5">
                {safety.contraindications.map((c) => (
                  <li key={c.flag}>{c.reason}</li>
                ))}
                {safety.interactions.map((i) => (
                  <li key={i.drugClass}>
                    <span className="font-medium">{i.drugClass.replace(/-/g, ' ')}:</span> {i.effect}
                  </li>
                ))}
              </ul>
              <p className="mt-1.5 text-xs text-ink-500">
                Talk to a licensed professional before using — do not change any prescribed medication.
              </p>
            </div>
          )}

          <button
            onClick={() => setOpen((v) => !v)}
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-sage-700 hover:text-sage-800"
            aria-expanded={open}
          >
            <Sparkles className="h-4 w-4" />
            Why this recommendation?
            <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} />
          </button>

          {open && (
            <div className="mt-3 space-y-2 rounded-xl border border-sage-100 bg-sage-50/40 p-4 animate-fade-in">
              <p className="text-sm leading-relaxed text-ink-700">{rec.rationale}</p>
              <div className="mt-2 space-y-1.5">
                {factors.map((f, i) => (
                  <div key={i} className="flex items-center justify-between gap-3 text-sm">
                    <div className="min-w-0">
                      <span className="font-medium text-ink-800">{f.label}</span>
                      <span className="ml-1.5 text-ink-500">{f.detail}</span>
                    </div>
                    <span
                      className={cn(
                        'shrink-0 rounded-md px-1.5 py-0.5 text-xs font-semibold tabular-nums',
                        f.weight >= 0 ? 'bg-sage-100 text-sage-700' : 'bg-clay-100 text-clay-700',
                      )}
                    >
                      {f.weight >= 0 ? '+' : ''}
                      {f.weight}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between border-t border-sage-200 pt-2 text-sm font-semibold text-ink-900">
                <span>Fit score</span>
                <span className="tabular-nums">{rec.score} / 100</span>
              </div>
              <p className="text-xs text-ink-400">
                The fit score reflects how well this herb matches your concerns and constitution — it is not a
                measure of medical effectiveness or a guarantee of results.
              </p>
              <Link
                to={`/knowledge/${herb.id}`}
                className="inline-flex items-center gap-1 pt-1 text-sm font-semibold text-sage-700 hover:text-sage-800"
              >
                View full monograph <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
