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
    <article className="card overflow-hidden animate-fade-in transition-shadow duration-300 hover:shadow-soft">
      <div className="p-4 sm:p-6">
        <div className="flex gap-4 sm:gap-5">
          {/* Score gauge */}
          <div className="flex shrink-0 flex-col items-center gap-1.5">
            <ScoreMeter score={rec.score} />
            <span className="text-[10px] font-semibold uppercase tracking-wide text-ink-400">Fit score</span>
          </div>

          {/* Main content */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <span className="inline-flex h-5 shrink-0 items-center rounded-md bg-sage-100 px-1.5 text-[11px] font-bold tabular-nums text-sage-700">
                #{rank}
              </span>
              <h3 className="text-lg font-semibold text-ink-900 sm:text-xl">{herb.commonName}</h3>
              <span className="text-sm italic text-ink-400">{herb.latinName}</span>
            </div>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-600">{herb.summary}</p>

            <div className="mt-3 flex flex-wrap gap-2">
              <EvidenceBadge level={herb.evidence} />
              <SafetyPill status={safety.status} />
              {herb.category === 'formulation' && (
                <span className="chip border-sage-200 bg-white font-semibold text-sage-700">
                  <Leaf className="h-3.5 w-3.5 shrink-0" /> Classical formulation
                </span>
              )}
            </div>

            {rec.matchedConcerns.length > 0 && (
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-medium text-ink-400">Matches:</span>
                {rec.matchedConcerns.map((c) => (
                  <span key={c} className="rounded-full bg-sage-50 px-2.5 py-1 text-xs font-medium text-sage-700">
                    {CONCERN_MAP[c]?.label ?? c}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {safety.status !== 'ok' && (
          <div className="mt-4 rounded-xl border border-turmeric-200 bg-turmeric-50/70 p-3.5 text-sm text-ink-700">
            <div className="mb-1.5 flex items-center gap-1.5 font-semibold text-turmeric-800">
              <TriangleAlert className="h-4 w-4 shrink-0" /> Personalized safety note
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
          className="mt-4 inline-flex items-center gap-1.5 rounded-full text-sm font-semibold text-sage-700 transition hover:text-sage-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-sage-400 focus-visible:ring-offset-2"
          aria-expanded={open}
        >
          <Sparkles className="h-4 w-4" />
          Why this recommendation?
          <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} />
        </button>

        {open && (
          <div className="mt-3 space-y-3 rounded-xl border border-sage-100 bg-sage-50/50 p-4 animate-fade-in">
            <p className="text-sm leading-relaxed text-ink-700">{rec.rationale}</p>
            <div className="space-y-1.5">
              {factors.map((f, i) => (
                <div key={i} className="flex items-start justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <span className="font-medium text-ink-800">{f.label}</span>
                    <span className="ml-1.5 text-ink-500">{f.detail}</span>
                  </div>
                  <span
                    className={cn(
                      'mt-0.5 shrink-0 rounded-md px-1.5 py-0.5 text-xs font-semibold tabular-nums',
                      f.weight >= 0 ? 'bg-sage-100 text-sage-700' : 'bg-clay-100 text-clay-700',
                    )}
                  >
                    {f.weight >= 0 ? '+' : ''}
                    {f.weight}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between border-t border-sage-200 pt-2.5 text-sm font-semibold text-ink-900">
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
    </article>
  );
}
