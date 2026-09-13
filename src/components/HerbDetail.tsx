import type { Herb } from '@/types'
import { EvidenceBadge, SeverityBadge } from '@/components/ui'
import { X, Flame, Snowflake, Minus } from 'lucide-react'

const DOSHA_ARROW = {
  decrease: { label: '↓', cls: 'text-sage-600' },
  increase: { label: '↑', cls: 'text-red-500' },
  neutral: { label: '=', cls: 'text-sage-400' },
}

export function HerbDetail({ herb, onClose }: { herb: Herb; onClose: () => void }) {
  const Virya = herb.virya === 'heating' ? Flame : herb.virya === 'cooling' ? Snowflake : Minus
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-sage-950/40 p-0 sm:items-center sm:p-4" onClick={onClose}>
      <div
        className="animate-scale-in max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-white sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 flex items-start justify-between gap-4 border-b border-sage-100 bg-white/95 p-5 backdrop-blur">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-semibold text-sage-900">{herb.name}</h2>
              <span className="text-sm italic text-sage-500">{herb.latin}</span>
            </div>
            <p className="mt-0.5 text-sm text-sage-500">
              {herb.sanskrit !== '—' ? `Sanskrit: ${herb.sanskrit} · ` : ''}
              {herb.category}
            </p>
          </div>
          <button className="btn-ghost" onClick={onClose} aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6 p-5">
          <p className="text-sage-700">{herb.summary}</p>

          <div className="flex flex-wrap gap-2">
            <EvidenceBadge level={herb.evidenceLevel} />
            <span className="inline-flex items-center gap-1.5 rounded-full border border-clay-200 bg-clay-50 px-2.5 py-1 text-xs font-medium text-clay-700">
              <Virya className="h-3.5 w-3.5" /> {herb.virya}
            </span>
            <span className="rounded-full border border-sage-200 bg-sage-50 px-2.5 py-1 text-xs font-medium text-sage-600">
              Taste: {herb.rasa.join(', ')}
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {(['vata', 'pitta', 'kapha'] as const).map((d) => {
              const eff = herb.doshaEffect[d]
              const a = DOSHA_ARROW[eff]
              return (
                <div key={d} className="rounded-xl border border-sage-100 bg-sage-50/50 p-3 text-center">
                  <p className="text-xs font-semibold uppercase tracking-wide text-sage-500">{d}</p>
                  <p className={`text-2xl font-bold ${a.cls}`}>{a.label}</p>
                  <p className="text-xs capitalize text-sage-500">{eff}</p>
                </div>
              )
            })}
          </div>

          <Section title="Traditionally used for">
            <div className="flex flex-wrap gap-1.5">
              {herb.indications.map((i) => (
                <span key={i} className="rounded-md bg-sage-100 px-2 py-1 text-xs font-medium text-sage-700">
                  {i.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </Section>

          <Section title="Evidence">
            <p className="text-sm text-sage-600">{herb.evidenceNote}</p>
          </Section>

          <Section title="Typical form">
            <p className="text-sm text-sage-600">{herb.typicalForm}</p>
          </Section>

          <Section title="Safety notes">
            <p className="text-sm text-sage-600">{herb.safetyNotes}</p>
            {herb.contraindications.length > 0 && (
              <p className="mt-2 text-sm text-sage-600">
                <span className="font-medium text-sage-800">Avoid with:</span>{' '}
                {herb.contraindications.map((c) => c.replace(/_/g, ' ')).join(', ')}.
              </p>
            )}
          </Section>

          {herb.drugInteractions.length > 0 && (
            <Section title="Possible drug interactions">
              <ul className="space-y-2">
                {herb.drugInteractions.map((d, i) => (
                  <li key={i} className="flex items-start gap-2 rounded-xl border border-sage-100 bg-sage-50/50 p-3 text-sm">
                    <SeverityBadge severity={d.severity} />
                    <span className="flex-1 text-sage-700">
                      <span className="font-medium text-sage-800">{d.drugClass}:</span> {d.mechanism}
                    </span>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          <div className="rounded-xl bg-turmeric-50 p-3 text-xs text-turmeric-900">
            This is educational information, not a recommendation or prescription. Confirm suitability, sourcing, and
            dosing with a qualified practitioner — especially alongside medications or during pregnancy.
          </div>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-sage-500">{title}</h3>
      {children}
    </div>
  )
}
