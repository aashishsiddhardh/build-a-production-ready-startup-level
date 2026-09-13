import type { RecommendationResult } from '@/types'
import { RecommendationCard } from '@/components/RecommendationCard'
import { EmergencyBanner, DisclaimerCard } from '@/components/Disclaimer'
import { DOSHA_LABELS } from '@/data/reference'
import { EmptyState } from '@/components/ui'
import { Salad, Sunrise, Activity, Brain, Ban, Flower2, Leaf } from 'lucide-react'

function LifestyleColumn({
  icon,
  title,
  items,
}: {
  icon: React.ReactNode
  title: string
  items: string[]
}) {
  return (
    <div className="card p-5">
      <div className="mb-3 flex items-center gap-2">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-sage-100 text-sage-600">{icon}</div>
        <h3 className="font-semibold text-sage-900">{title}</h3>
      </div>
      <ul className="space-y-2">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2 text-sm text-sage-700">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sage-400" />
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function ResultsView({ result }: { result: RecommendationResult }) {
  const { triage, recommendations, excluded, lifestyle, dominantDosha, disclaimers } = result
  const blocked = triage.blockRecommendations

  return (
    <div className="space-y-6">
      {(triage.level !== 'routine' || triage.matched.length > 0) && <EmergencyBanner triage={triage} />}

      {blocked ? (
        <>
          <div className="card p-6 text-center">
            <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-sage-100 text-sage-600">
              <Leaf className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-sage-900">Herbal suggestions are withheld here</h3>
            <p className="mx-auto mt-1 max-w-md text-sm text-sage-600">
              Because your responses include a safety flag, AyurSage intentionally does not provide herbal
              recommendations. Your wellbeing comes first — please follow the guidance above.
            </p>
          </div>
          <DisclaimerCard items={disclaimers} />
        </>
      ) : (
        <>
          {/* Summary header */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold text-sage-900">
                {recommendations.length} personalised suggestion{recommendations.length === 1 ? '' : 's'}
              </h2>
              <p className="text-sm text-sage-500">
                Each was checked against your conditions and medications before scoring.
              </p>
            </div>
            {dominantDosha && (
              <span className="inline-flex items-center gap-2 rounded-full border border-sage-200 bg-white px-3.5 py-2 text-sm font-medium text-sage-700 shadow-sm">
                <Flower2 className="h-4 w-4 text-sage-500" />
                Dominant dosha: <strong className="text-sage-900">{DOSHA_LABELS[dominantDosha].name}</strong>
              </span>
            )}
          </div>

          {recommendations.length === 0 ? (
            <EmptyState
              icon={<Leaf className="h-6 w-6" />}
              title="No matching herbs for this profile"
              body="We couldn't find a safe, relevant match. Try adding more detail about your concern, or explore the knowledge base and lifestyle guidance below."
            />
          ) : (
            <div className="space-y-4">
              {recommendations.map((rec, i) => (
                <RecommendationCard key={rec.herb.id} rec={rec} rank={i + 1} />
              ))}
            </div>
          )}

          {/* Excluded for safety */}
          {excluded.length > 0 && (
            <div className="rounded-2xl border border-sage-200 bg-sage-50/60 p-5">
              <div className="mb-3 flex items-center gap-2 text-sage-800">
                <Ban className="h-5 w-5 text-clay-500" />
                <h3 className="font-semibold">Filtered out for your safety ({excluded.length})</h3>
              </div>
              <p className="mb-3 text-sm text-sage-600">
                Full transparency: these otherwise-relevant herbs were removed by the deterministic safety layer.
              </p>
              <ul className="space-y-2">
                {excluded.map((e) => (
                  <li key={e.herb.id} className="rounded-xl border border-sage-100 bg-white p-3 text-sm">
                    <span className="font-medium text-sage-800">{e.herb.name}</span>
                    <span className="text-sage-600"> — {e.reasons.map((r) => r.message).join(' ')}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Lifestyle */}
          <div>
            <h2 className="mb-4 text-2xl font-semibold text-sage-900">Lifestyle, diet & yoga</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <LifestyleColumn icon={<Salad className="h-5 w-5" />} title="Diet & nutrition" items={lifestyle.diet} />
              <LifestyleColumn icon={<Sunrise className="h-5 w-5" />} title="Daily routine" items={lifestyle.routine} />
              <LifestyleColumn icon={<Activity className="h-5 w-5" />} title="Yoga & breathwork" items={lifestyle.yoga} />
              <LifestyleColumn icon={<Brain className="h-5 w-5" />} title="Mind & stress" items={lifestyle.mindfulness} />
            </div>
          </div>

          <DisclaimerCard items={disclaimers} />
        </>
      )}
    </div>
  )
}
