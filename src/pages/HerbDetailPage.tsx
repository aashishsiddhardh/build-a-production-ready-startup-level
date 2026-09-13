import { Link, useParams } from 'react-router-dom';
import { HERB_MAP, HERBS } from '@/data/herbs';
import { CONCERN_MAP } from '@/data/conditions';
import { DOSHA_META } from '@/data/doshas';
import { EVIDENCE_META, type Dosha } from '@/lib/types';
import { EvidenceBadge } from '@/components/EvidenceBadge';
import { Disclaimer } from '@/components/Disclaimer';
import {
  ArrowLeft,
  Leaf,
  BookMarked,
  TriangleAlert,
  Pill,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

export default function HerbDetailPage() {
  const { id } = useParams();
  const herb = id ? HERB_MAP[id] : undefined;

  if (!herb) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="section-title">Not found</h1>
        <p className="mt-3 text-ink-600">We couldn't find that entry.</p>
        <Link to="/knowledge" className="btn-primary mt-6">Back to knowledge base</Link>
      </div>
    );
  }

  const related = HERBS.filter(
    (h) => h.id !== herb.id && h.targets.some((t) => herb.targets.includes(t)),
  ).slice(0, 3);

  const doshaEntries = Object.entries(herb.doshaEffect) as [Dosha, number][];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Link to="/knowledge" className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-sage-700">
        <ArrowLeft className="h-4 w-4" /> Knowledge base
      </Link>

      <header className="mt-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sage-100 text-sage-700">
            <Leaf className="h-7 w-7" />
          </div>
          <div>
            <h1 className="font-serif text-4xl font-semibold text-ink-900">{herb.commonName}</h1>
            <p className="text-ink-500">
              <span className="italic">{herb.latinName}</span> · {herb.sanskritName} ·{' '}
              {herb.category === 'formulation' ? 'Classical formulation' : 'Single herb'}
            </p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <EvidenceBadge level={herb.evidence} />
          {herb.qualities.map((q) => (
            <span key={q} className="chip border-sage-200 bg-white text-ink-600">{q}</span>
          ))}
        </div>
      </header>

      <p className="mt-6 text-lg leading-relaxed text-ink-700">{herb.summary}</p>

      {/* Evidence */}
      <Section icon={BookMarked} title="Evidence & transparency">
        <div className="rounded-xl border border-sage-100 bg-sage-50/50 p-4">
          <p className="text-sm text-ink-700">{herb.evidenceNote}</p>
          <div className="mt-3 flex items-center gap-2 text-sm">
            <span className="font-semibold text-ink-800">Grade:</span>
            <EvidenceBadge level={herb.evidence} />
            <span className="text-ink-500">— {EVIDENCE_META[herb.evidence].blurb}</span>
          </div>
        </div>
        <div className="mt-3">
          <p className="text-sm font-semibold text-ink-800">References</p>
          <ul className="mt-2 space-y-1.5">
            {herb.citations.map((c, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-ink-600">
                <span className="mt-0.5 rounded-md bg-clay-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-clay-700">
                  {c.kind.replace('-', ' ')}
                </span>
                <span>
                  {c.label}
                  {c.note && <span className="block text-xs text-ink-400">{c.note}</span>}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-ink-400">
            References point to categories of literature for education. Always verify against primary sources; this is
            not a clinical claim.
          </p>
        </div>
      </Section>

      {/* Dosha effect */}
      <Section icon={Sparkles} title="Effect on the doshas">
        <div className="grid gap-3 sm:grid-cols-3">
          {doshaEntries.map(([d, effect]) => {
            const meta = DOSHA_META[d];
            const label = effect < 0 ? 'Pacifies' : effect > 0 ? 'May increase' : 'Neutral';
            const tone =
              effect < 0 ? 'border-sage-200 bg-sage-50 text-sage-700' : effect > 0 ? 'border-clay-200 bg-clay-50 text-clay-700' : 'border-ink-100 bg-ink-50 text-ink-500';
            return (
              <div key={d} className={`rounded-xl border p-4 ${tone}`}>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: meta.color }} />
                  <span className="font-semibold">{meta.name}</span>
                </div>
                <p className="mt-1 text-sm">{label}</p>
              </div>
            );
          })}
        </div>
      </Section>

      {/* Uses / forms */}
      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div className="card p-5">
          <h3 className="flex items-center gap-2 font-semibold text-ink-900">
            <Sparkles className="h-4 w-4 text-sage-600" /> Traditionally used for
          </h3>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {herb.targets.map((t) => (
              <Link
                key={t}
                to={`/knowledge?concern=${t}`}
                className="rounded-full bg-sage-50 px-2.5 py-1 text-xs font-medium text-sage-700 hover:bg-sage-100"
              >
                {CONCERN_MAP[t]?.label ?? t}
              </Link>
            ))}
          </div>
        </div>
        <div className="card p-5">
          <h3 className="flex items-center gap-2 font-semibold text-ink-900">
            <Pill className="h-4 w-4 text-sage-600" /> Common forms
          </h3>
          <ul className="mt-3 space-y-1.5 text-sm text-ink-600">
            {herb.commonForms.map((f) => (
              <li key={f} className="flex gap-2"><span className="text-sage-400">•</span> {f}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Safety */}
      <Section icon={ShieldAlert} title="Safety, contraindications & interactions">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-turmeric-200 bg-turmeric-50/50 p-4">
            <h4 className="flex items-center gap-1.5 text-sm font-semibold text-turmeric-800">
              <TriangleAlert className="h-4 w-4" /> Avoid / use caution if
            </h4>
            {herb.contraindications.length ? (
              <ul className="mt-2 space-y-1.5 text-sm text-ink-700">
                {herb.contraindications.map((c) => (
                  <li key={c.flag}>
                    <span className="font-medium capitalize">{c.flag.replace(/-/g, ' ')}</span>{' '}
                    <span className={c.severity === 'avoid' ? 'text-clay-600' : 'text-turmeric-700'}>
                      ({c.severity})
                    </span>{' '}
                    — {c.reason}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-ink-500">No specific contraindications recorded for typical use.</p>
            )}
          </div>
          <div className="rounded-xl border border-clay-200 bg-clay-50/50 p-4">
            <h4 className="flex items-center gap-1.5 text-sm font-semibold text-clay-800">
              <Pill className="h-4 w-4" /> Drug interactions
            </h4>
            {herb.interactions.length ? (
              <ul className="mt-2 space-y-1.5 text-sm text-ink-700">
                {herb.interactions.map((i) => (
                  <li key={i.drugClass}>
                    <span className="font-medium capitalize">{i.drugClass.replace(/-/g, ' ')}</span>{' '}
                    <span className="text-clay-600">({i.severity})</span> — {i.effect}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-ink-500">No specific interactions recorded.</p>
            )}
          </div>
        </div>
        {herb.safetyNotes.length > 0 && (
          <ul className="mt-3 space-y-1 text-sm text-ink-600">
            {herb.safetyNotes.map((s, i) => (
              <li key={i} className="flex gap-2"><span className="text-clay-400">▸</span> {s}</li>
            ))}
          </ul>
        )}
      </Section>

      {related.length > 0 && (
        <Section icon={Leaf} title="Related in the knowledge base">
          <div className="grid gap-4 sm:grid-cols-3">
            {related.map((r) => (
              <Link key={r.id} to={`/knowledge/${r.id}`} className="card p-4 transition hover:border-sage-300">
                <h4 className="font-semibold text-ink-900">{r.commonName}</h4>
                <p className="mt-1 line-clamp-2 text-sm text-ink-500">{r.summary}</p>
                <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-sage-700">
                  View <ArrowRight className="h-3 w-3" />
                </span>
              </Link>
            ))}
          </div>
        </Section>
      )}

      <div className="mt-10">
        <Disclaimer />
      </div>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Leaf;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8">
      <h2 className="flex items-center gap-2 font-serif text-2xl font-semibold text-ink-900">
        <Icon className="h-5 w-5 text-sage-600" /> {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}
