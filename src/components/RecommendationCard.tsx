import { useState } from 'react'
import type { Recommendation } from '@/types'
import { Bar, EvidenceBadge, ScoreRing, SeverityBadge } from '@/components/ui'
import { ChevronDown, Sparkles, Leaf } from 'lucide-react'

export function RecommendationCard({ rec, rank }: { rec: Recommendation; rank: number }) {
  const [open, setOpen] = useState(false)
  const h = rec.herb
  return (
    <div className="card animate-fade-in overflow-hidden">
      <div className="p-5">
        <div className="flex items-start gap-4">
          <ScoreRing score={rec.score} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-sage-400">#{rank}</span>
              <h3 className="text-lg font-semibold text-sage-900">{h.name}</h3>
              <span className="text-sm italic text-sage-500">{h.latin}</span>
            </div>
            <p className="mt-1 text-sm text-sage-600">{h.summary}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <EvidenceBadge level={h.evidenceLevel} />
              <span className="rounded-full border border-sage-200 bg-sage-50 px-2.5 py-1 text-xs font-medium text-sage-600">
                {h.category}
              </span>
            </div>
          </div>
        </div>

        {rec.matchedSymptoms.length > 0 && (
          <div className="mt-4 rounded-xl bg-sage-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-sage-500">Matches your input</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {rec.matchedSymptoms.map((m) => (
                <span key={m} className="rounded-md bg-white px-2 py-0.5 text-xs font-medium text-sage-700">
                  {m}
                </span>
              ))}
            </div>
          </div>
        )}

        <p className="mt-4 flex gap-2 text-sm text-sage-700">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-turmeric-500" />
          <span>{rec.rationale}</span>
        </p>

        {rec.cautions.length > 0 && (
          <div className="mt-4 space-y-2">
            {rec.cautions.map((c, i) => (
              <div
                key={i}
                className="flex items-start gap-2 rounded-xl border border-turmeric-200 bg-turmeric-50 p-3 text-sm text-turmeric-900"
              >
                <SeverityBadge severity={c.severity} />
                <span className="flex-1">{c.message}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between border-t border-sage-100 bg-sage-50/50 px-5 py-3 text-sm font-medium text-sage-700 hover:bg-sage-50"
      >
        <span>Why this score? · Transparent breakdown</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="space-y-4 border-t border-sage-100 bg-white px-5 py-4">
          {rec.components.map((c) => (
            <div key={c.label}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium text-sage-800">{c.label}</span>
                <span className="tabular-nums text-sage-500">
                  {Math.round(c.value * 100)}% · weight {Math.round(c.weight * 100)}%
                </span>
              </div>
              <Bar value={c.value} />
              <p className="mt-1 text-xs text-sage-500">{c.detail}</p>
            </div>
          ))}
          <div className="rounded-xl bg-sage-50 p-3 text-sm">
            <div className="flex items-center gap-2 text-sage-700">
              <Leaf className="h-4 w-4 text-sage-500" />
              <span className="font-medium">Typical form:</span>
              <span>{h.typicalForm}</span>
            </div>
            <p className="mt-2 text-xs text-sage-500">
              Final score = Σ (component × weight), scaled to 100. Safety-blocking items are removed before scoring.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
