import { useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { store } from '@/lib/storage';
import { logAudit } from '@/lib/audit';
import { useAuth } from '@/context/AuthContext';
import { DOSHA_META } from '@/data/doshas';
import { CONCERN_MAP } from '@/data/conditions';
import { EmergencyCard } from '@/components/EmergencyCard';
import { RecommendationCard } from '@/components/RecommendationCard';
import { DoshaBars } from '@/components/DoshaBars';
import { Disclaimer } from '@/components/Disclaimer';
import {
  Salad,
  Sun,
  Activity,
  Brain,
  ShieldX,
  MessageCircleHeart,
  ArrowRight,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import type { LifestyleGuidance } from '@/lib/types';

const CATEGORY_ICON = {
  diet: Salad,
  routine: Sun,
  yoga: Activity,
  mind: Brain,
} as const;

export default function ResultsPage() {
  const { id } = useParams();
  const { user } = useAuth();

  const assessment = useMemo(() => store.getAssessments().find((a) => a.id === id), [id]);

  useEffect(() => {
    if (assessment && user) logAudit('assessment.view', user, { id: assessment.id });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assessment?.id]);

  if (!assessment) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="section-title">Assessment not found</h1>
        <p className="mt-3 text-ink-600">This result may have been deleted or belongs to another account.</p>
        <Link to="/assessment" className="btn-primary mt-6">Start a new assessment</Link>
      </div>
    );
  }

  const { triage, prakriti, dominantDosha, imbalance, recommendations, withheldForSafety, lifestyle } = assessment;
  const blocked = triage.blockRecommendations;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="section-title">Your wellness guidance</h1>
          <p className="mt-1 text-sm text-ink-500">
            Generated {new Date(assessment.createdAt).toLocaleString()} · safety-checked
          </p>
        </div>
        <Link to="/assessment" className="btn-outline">
          <RefreshCw className="h-4 w-4" /> Retake
        </Link>
      </div>

      {/* Triage banner */}
      {triage.level !== 'self-care' ? (
        <div className="mt-6">
          <EmergencyCard triage={triage} />
        </div>
      ) : (
        <div className="mt-6 flex items-center gap-2 rounded-xl border border-sage-200 bg-sage-50 px-4 py-3 text-sm text-sage-800">
          <Sparkles className="h-4 w-4" /> {triage.guidance}
        </div>
      )}

      {/* Constitution */}
      <section className="mt-8 grid gap-6 lg:grid-cols-5">
        <div className="card p-6 lg:col-span-3">
          <h2 className="font-serif text-xl font-semibold text-ink-900">Your constitutional snapshot</h2>
          <p className="mt-1 text-sm text-ink-500">
            Dominant nature: <span className="font-semibold text-ink-800">{DOSHA_META[dominantDosha].name}</span>
            {imbalance && (
              <>
                {' '}· likely current imbalance:{' '}
                <span className="font-semibold" style={{ color: DOSHA_META[imbalance].color }}>
                  {DOSHA_META[imbalance].name}
                </span>
              </>
            )}
          </p>
          <div className="mt-5">
            <DoshaBars scores={prakriti} dominant={dominantDosha} />
          </div>
        </div>
        <div className="card p-6 lg:col-span-2">
          <h3 className="font-semibold text-ink-900">{DOSHA_META[dominantDosha].name} in balance</h3>
          <p className="mt-1 text-sm text-ink-600">{DOSHA_META[dominantDosha].balanced}</p>
          <h3 className="mt-4 font-semibold text-ink-900">When aggravated</h3>
          <p className="mt-1 text-sm text-ink-600">{DOSHA_META[dominantDosha].aggravated}</p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {assessment.concerns.map((c) => (
              <span key={c} className="rounded-full bg-sage-50 px-2.5 py-1 text-xs font-medium text-sage-700">
                {CONCERN_MAP[c]?.label ?? c}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Recommendations */}
      {!blocked && (
        <section className="mt-10">
          <div className="flex items-end justify-between">
            <h2 className="font-serif text-2xl font-semibold text-ink-900">
              Suggested herbs & formulations
            </h2>
            <span className="text-sm text-ink-500">{recommendations.length} shown</span>
          </div>
          <p className="mt-1 text-sm text-ink-500">
            Ranked by an explainable fit score and filtered against your health profile. Educational only — not a
            prescription.
          </p>

          {recommendations.length > 0 ? (
            <div className="mt-5 space-y-4">
              {recommendations.map((rec, i) => (
                <RecommendationCard key={rec.herb.id} rec={rec} rank={i + 1} />
              ))}
            </div>
          ) : (
            <div className="card mt-5 p-8 text-center text-ink-600">
              We didn't find a strong, safe herbal match for this combination. The lifestyle guidance below is a great
              place to start, and you can explore the knowledge base directly.
            </div>
          )}
        </section>
      )}

      {/* Withheld for safety */}
      {withheldForSafety.length > 0 && (
        <section className="mt-8">
          <div className="rounded-2xl border border-clay-200 bg-clay-50/50 p-6">
            <h3 className="flex items-center gap-2 font-semibold text-clay-800">
              <ShieldX className="h-5 w-5" /> Withheld for your safety ({withheldForSafety.length})
            </h3>
            <p className="mt-1 text-sm text-ink-600">
              These otherwise-relevant herbs were removed because of a contraindication or serious interaction with your
              profile.
            </p>
            <ul className="mt-3 space-y-2">
              {withheldForSafety.map((w) => (
                <li key={w.herb} className="rounded-xl bg-white/70 p-3 text-sm">
                  <span className="font-semibold text-ink-900">{w.herb}:</span>{' '}
                  <span className="text-ink-600">{w.reason}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Lifestyle */}
      {lifestyle.length > 0 && (
        <section className="mt-10">
          <h2 className="font-serif text-2xl font-semibold text-ink-900">Diet, routine & yoga</h2>
          <p className="mt-1 text-sm text-ink-500">
            Personalized to balance {imbalance ? DOSHA_META[imbalance].name : DOSHA_META[dominantDosha].name}.
          </p>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            {lifestyle.map((g) => (
              <LifestyleCard key={g.title} guidance={g} />
            ))}
          </div>
        </section>
      )}

      {/* Assistant CTA */}
      <section className="mt-10">
        <div className="flex flex-col items-start justify-between gap-4 rounded-2xl bg-sage-800 p-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <MessageCircleHeart className="h-8 w-8 text-turmeric-300" />
            <div>
              <h3 className="font-serif text-xl font-semibold text-white">Questions about your results?</h3>
              <p className="text-sm text-sage-100">Ask the AI assistant — grounded in the knowledge base, with safety guardrails.</p>
            </div>
          </div>
          <Link to="/assistant" className="btn-accent shrink-0">
            Open assistant <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <div className="mt-8">
        <Disclaimer />
      </div>
    </div>
  );
}

function LifestyleCard({ guidance }: { guidance: LifestyleGuidance }) {
  const Icon = CATEGORY_ICON[guidance.category];
  return (
    <div className="card p-5">
      <h3 className="flex items-center gap-2 font-semibold text-ink-900">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sage-100 text-sage-700">
          <Icon className="h-4 w-4" />
        </span>
        {guidance.title}
      </h3>
      <ul className="mt-3 space-y-1.5 text-sm text-ink-600">
        {guidance.items.map((item, i) => (
          <li key={i} className="flex gap-2">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-sage-400" /> {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
