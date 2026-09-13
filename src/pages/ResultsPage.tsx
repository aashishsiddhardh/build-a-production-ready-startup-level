import { useEffect, useMemo, type ReactNode } from 'react';
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
  ShieldCheck,
  MessageCircleHeart,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Leaf,
  Compass,
  Flame,
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
  const focusDosha = imbalance ?? dominantDosha;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      {/* Header */}
      <header className="rounded-2xl border border-sage-100 bg-gradient-to-br from-white to-sage-50/60 p-5 shadow-card sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wider text-sage-600">Assessment results</p>
            <h1 className="section-title mt-1">Your wellness guidance</h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink-500">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-sage-200 bg-white px-2.5 py-1 text-xs font-semibold text-sage-700">
                <ShieldCheck className="h-3.5 w-3.5" /> Safety-checked
              </span>
              <span className="text-xs text-ink-400">
                Generated {new Date(assessment.createdAt).toLocaleString()}
              </span>
            </div>
          </div>
          <Link to="/assessment" className="btn-outline shrink-0 self-start">
            <RefreshCw className="h-4 w-4" /> Retake
          </Link>
        </div>

        {/* At a glance */}
        <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            icon={<Compass className="h-4 w-4" />}
            label="Constitution"
            value={DOSHA_META[dominantDosha].name}
          />
          <StatCard
            icon={<Flame className="h-4 w-4" />}
            label="Current focus"
            value={imbalance ? DOSHA_META[imbalance].name : 'In balance'}
          />
          <StatCard
            icon={<Leaf className="h-4 w-4" />}
            label={blocked ? 'Herbal guidance' : 'Herbs suggested'}
            value={blocked ? 'Care-first' : String(recommendations.length)}
          />
          <StatCard
            icon={<ShieldX className="h-4 w-4" />}
            label="Filtered for safety"
            value={String(withheldForSafety.length)}
            tone={withheldForSafety.length > 0 ? 'clay' : 'sage'}
          />
        </dl>
      </header>

      {/* Triage banner */}
      {triage.level !== 'self-care' ? (
        <div className="mt-6">
          <EmergencyCard triage={triage} />
        </div>
      ) : (
        <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-sage-200 bg-sage-50 px-4 py-3 text-sm text-sage-800">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-sage-600" />
          <span>{triage.guidance}</span>
        </div>
      )}

      {/* Constitution */}
      <section className="mt-8 grid gap-5 lg:grid-cols-5">
        <div className="card p-5 sm:p-6 lg:col-span-3">
          <SectionHeader
            eyebrow="Constitutional snapshot"
            title={`You lean ${DOSHA_META[dominantDosha].name}`}
          />
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
        <div className="card p-5 sm:p-6 lg:col-span-2">
          <h3 className="flex items-center gap-2 font-semibold text-ink-900">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: DOSHA_META[dominantDosha].color }} />
            {DOSHA_META[dominantDosha].name} in balance
          </h3>
          <p className="mt-1 text-sm text-ink-600">{DOSHA_META[dominantDosha].balanced}</p>
          <h3 className="mt-4 font-semibold text-ink-900">When aggravated</h3>
          <p className="mt-1 text-sm text-ink-600">{DOSHA_META[dominantDosha].aggravated}</p>
          {assessment.concerns.length > 0 && (
            <div className="mt-4 border-t border-sage-100 pt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-400">Your concerns</p>
              <div className="flex flex-wrap gap-1.5">
                {assessment.concerns.map((c) => (
                  <span key={c} className="rounded-full bg-sage-50 px-2.5 py-1 text-xs font-medium text-sage-700">
                    {CONCERN_MAP[c]?.label ?? c}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Recommendations */}
      {!blocked && (
        <section className="mt-10">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <SectionHeader
              eyebrow="Personalized for you"
              title="Suggested herbs & formulations"
              as="h2"
            />
            <span className="rounded-full bg-sage-100 px-2.5 py-1 text-xs font-semibold text-sage-700">
              {recommendations.length} shown
            </span>
          </div>
          <p className="mt-1.5 text-sm text-ink-500">
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
            <div className="card mt-5 flex flex-col items-center gap-3 p-8 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-sage-100 text-sage-600">
                <Leaf className="h-6 w-6" />
              </span>
              <p className="max-w-md text-sm text-ink-600">
                We didn't find a strong, safe herbal match for this combination. The lifestyle guidance below is a
                great place to start, and you can explore the knowledge base directly.
              </p>
              <Link to="/knowledge" className="btn-outline mt-1">
                Browse the knowledge base <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </section>
      )}

      {/* Withheld for safety */}
      {withheldForSafety.length > 0 && (
        <section className="mt-8">
          <div className="rounded-2xl border border-clay-200 bg-clay-50/50 p-5 sm:p-6">
            <h3 className="flex items-center gap-2 font-semibold text-clay-800">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-clay-100 text-clay-700">
                <ShieldX className="h-5 w-5" />
              </span>
              Withheld for your safety ({withheldForSafety.length})
            </h3>
            <p className="mt-2 text-sm text-ink-600">
              These otherwise-relevant herbs were removed because of a contraindication or serious interaction with your
              profile.
            </p>
            <ul className="mt-4 space-y-2">
              {withheldForSafety.map((w) => (
                <li key={w.herb} className="flex flex-col gap-0.5 rounded-xl bg-white/80 p-3 text-sm sm:flex-row sm:gap-1.5">
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
          <SectionHeader
            eyebrow="Daily wellness"
            title="Diet, routine & yoga"
            as="h2"
          />
          <p className="mt-1.5 text-sm text-ink-500">
            Personalized to balance {DOSHA_META[focusDosha].name}.
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {lifestyle.map((g) => (
              <LifestyleCard key={g.title} guidance={g} />
            ))}
          </div>
        </section>
      )}

      {/* Assistant CTA */}
      <section className="mt-10">
        <div className="flex flex-col items-start justify-between gap-4 overflow-hidden rounded-2xl bg-gradient-to-br from-sage-800 to-sage-900 p-6 shadow-card sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 text-turmeric-300">
              <MessageCircleHeart className="h-6 w-6" />
            </span>
            <div>
              <h3 className="font-serif text-lg font-semibold text-white sm:text-xl">Questions about your results?</h3>
              <p className="mt-0.5 text-sm text-sage-100">
                Ask the AI assistant — grounded in the knowledge base, with safety guardrails.
              </p>
            </div>
          </div>
          <Link to="/assistant" className="btn-accent w-full shrink-0 sm:w-auto">
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

function StatCard({
  icon,
  label,
  value,
  tone = 'sage',
}: {
  icon: ReactNode;
  label: string;
  value: string;
  tone?: 'sage' | 'clay';
}) {
  const toneClass = tone === 'clay' ? 'bg-clay-100 text-clay-700' : 'bg-sage-100 text-sage-700';
  return (
    <div className="rounded-xl border border-sage-100 bg-white/80 p-3">
      <dt className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-ink-400">
        <span className={`flex h-6 w-6 items-center justify-center rounded-md ${toneClass}`}>{icon}</span>
        <span className="truncate">{label}</span>
      </dt>
      <dd className="mt-1.5 truncate text-lg font-semibold text-ink-900">{value}</dd>
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  as: Tag = 'h2',
}: {
  eyebrow: string;
  title: string;
  as?: 'h2' | 'h3';
}) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-wider text-sage-600">{eyebrow}</p>
      <Tag className="mt-0.5 font-serif text-xl font-semibold text-ink-900 sm:text-2xl">{title}</Tag>
    </div>
  );
}

function LifestyleCard({ guidance }: { guidance: LifestyleGuidance }) {
  const Icon = CATEGORY_ICON[guidance.category];
  return (
    <div className="card p-5 transition-shadow duration-300 hover:shadow-soft">
      <h3 className="flex items-center gap-2.5 font-semibold text-ink-900">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sage-100 text-sage-700">
          <Icon className="h-5 w-5" />
        </span>
        {guidance.title}
      </h3>
      <ul className="mt-3.5 space-y-2 text-sm text-ink-600">
        {guidance.items.map((item, i) => (
          <li key={i} className="flex gap-2.5">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sage-400" /> {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
