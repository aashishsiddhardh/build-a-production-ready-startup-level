import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { HERBS } from '@/data/herbs';
import { CONCERNS, CONCERN_MAP } from '@/data/conditions';
import { EVIDENCE_META, type EvidenceLevel } from '@/lib/types';
import { EvidenceBadge } from '@/components/EvidenceBadge';
import { Disclaimer } from '@/components/Disclaimer';
import { Search, Leaf, ArrowRight, X } from 'lucide-react';
import { retrieve } from '@/engine/retrieval';

const EVIDENCE_ORDER: EvidenceLevel[] = ['traditional', 'preclinical', 'preliminary-clinical', 'moderate-clinical'];

export default function KnowledgePage() {
  const [query, setQuery] = useState('');
  const [concern, setConcern] = useState<string | null>(null);
  const [evidence, setEvidence] = useState<EvidenceLevel | null>(null);
  const [category, setCategory] = useState<'all' | 'herb' | 'formulation'>('all');

  const results = useMemo(() => {
    let list = HERBS;
    if (category !== 'all') list = list.filter((h) => h.category === category);
    if (concern) list = list.filter((h) => h.targets.includes(concern));
    if (evidence) list = list.filter((h) => h.evidence === evidence);

    if (query.trim()) {
      // Semantic ranking via the in-browser vector store, then keep KB order.
      const ranked = retrieve(query, 30);
      const rankMap = new Map<string, number>();
      ranked.forEach((r, i) => {
        if (!rankMap.has(r.herbId)) rankMap.set(r.herbId, i);
      });
      const q = query.toLowerCase();
      list = list.filter(
        (h) =>
          rankMap.has(h.id) ||
          h.commonName.toLowerCase().includes(q) ||
          h.sanskritName.toLowerCase().includes(q) ||
          h.latinName.toLowerCase().includes(q),
      );
      list = [...list].sort((a, b) => (rankMap.get(a.id) ?? 99) - (rankMap.get(b.id) ?? 99));
    }
    return list;
  }, [query, concern, evidence, category]);

  const hasFilters = concern || evidence || category !== 'all' || query.trim();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <header className="max-w-2xl">
        <h1 className="section-title">Knowledge base</h1>
        <p className="mt-3 text-ink-600">
          Explore {HERBS.length} Ayurvedic herbs and classical formulations. Every entry shows a transparent evidence
          grade, contraindications and known drug interactions.
        </p>
      </header>

      {/* Search + filters */}
      <div className="mt-8 space-y-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-ink-400" />
          <input
            className="input py-3 pl-12 pr-10 text-base"
            placeholder="Search by name, concern, or how you feel…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-3 top-3 text-ink-400 hover:text-ink-600">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <FilterGroup label="Type">
            {(['all', 'herb', 'formulation'] as const).map((c) => (
              <Chip key={c} active={category === c} onClick={() => setCategory(c)}>
                {c === 'all' ? 'All' : c === 'herb' ? 'Herbs' : 'Formulations'}
              </Chip>
            ))}
          </FilterGroup>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="self-center text-xs font-semibold uppercase tracking-wide text-ink-400">Evidence</span>
          {EVIDENCE_ORDER.map((e) => (
            <Chip key={e} active={evidence === e} onClick={() => setEvidence(evidence === e ? null : e)}>
              {EVIDENCE_META[e].label}
            </Chip>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="self-center text-xs font-semibold uppercase tracking-wide text-ink-400">Concern</span>
          {CONCERNS.map((c) => (
            <Chip key={c.id} active={concern === c.id} onClick={() => setConcern(concern === c.id ? null : c.id)}>
              {c.label}
            </Chip>
          ))}
        </div>

        {hasFilters && (
          <button
            onClick={() => {
              setQuery('');
              setConcern(null);
              setEvidence(null);
              setCategory('all');
            }}
            className="text-sm font-medium text-clay-600 hover:text-clay-700"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Results */}
      <p className="mt-8 text-sm text-ink-500">{results.length} result{results.length === 1 ? '' : 's'}</p>
      <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((herb) => (
          <Link
            key={herb.id}
            to={`/knowledge/${herb.id}`}
            className="card group flex flex-col p-5 transition hover:-translate-y-0.5 hover:shadow-soft"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sage-100 text-sage-700">
                <Leaf className="h-5 w-5" />
              </div>
              <EvidenceBadge level={herb.evidence} withIcon={false} />
            </div>
            <h3 className="mt-3 text-lg font-semibold text-ink-900">{herb.commonName}</h3>
            <p className="text-xs italic text-ink-400">{herb.latinName}</p>
            <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-ink-600">{herb.summary}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {herb.targets.slice(0, 3).map((t) => (
                <span key={t} className="rounded-full bg-sage-50 px-2 py-0.5 text-[11px] font-medium text-sage-700">
                  {CONCERN_MAP[t]?.label ?? t}
                </span>
              ))}
            </div>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-sage-700 group-hover:gap-2">
              View monograph <ArrowRight className="h-3.5 w-3.5 transition-all" />
            </span>
          </Link>
        ))}
      </div>

      {results.length === 0 && (
        <div className="card mt-4 p-10 text-center text-ink-500">
          No entries match your filters. Try broadening your search.
        </div>
      )}

      <div className="mt-10">
        <Disclaimer />
      </div>
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-semibold uppercase tracking-wide text-ink-400">{label}</span>
      {children}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={
        active
          ? 'rounded-full border border-sage-600 bg-sage-700 px-3 py-1.5 text-xs font-medium text-white'
          : 'rounded-full border border-sage-200 bg-white px-3 py-1.5 text-xs font-medium text-ink-600 hover:border-sage-300'
      }
    >
      {children}
    </button>
  );
}
