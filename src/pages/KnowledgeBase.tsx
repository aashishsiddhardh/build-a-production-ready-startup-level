import { useMemo, useState } from 'react'
import type { Herb } from '@/types'
import { HERBS } from '@/data/herbs'
import { FORMULATIONS } from '@/data/formulations'
import { HERB_BY_ID } from '@/data/herbs'
import { EvidenceBadge, EmptyState } from '@/components/ui'
import { HerbDetail } from '@/components/HerbDetail'
import { extractConcepts } from '@/lib/text'
import { retrieve } from '@/lib/recommend/retrieval'
import { Search, Leaf, FlaskConical, Filter } from 'lucide-react'

const DOSHA_FILTERS = [
  { key: 'vata', label: 'Pacifies Vata' },
  { key: 'pitta', label: 'Pacifies Pitta' },
  { key: 'kapha', label: 'Pacifies Kapha' },
] as const

export function KnowledgeBase({ embedded = false }: { embedded?: boolean }) {
  const [query, setQuery] = useState('')
  const [doshaFilter, setDoshaFilter] = useState<string | null>(null)
  const [selected, setSelected] = useState<Herb | null>(null)

  const filteredHerbs = useMemo(() => {
    let list = HERBS
    if (doshaFilter) list = list.filter((h) => h.doshaEffect[doshaFilter as 'vata'] === 'decrease')
    if (query.trim()) {
      const concepts = extractConcepts(query)
      const ranked = retrieve(concepts, { kind: 'herb', topK: HERBS.length })
      const order = new Map(ranked.map((r, i) => [r.doc.id, i]))
      const q = query.toLowerCase()
      list = list
        .filter(
          (h) =>
            order.has(h.id) ||
            h.name.toLowerCase().includes(q) ||
            h.latin.toLowerCase().includes(q) ||
            h.sanskrit.toLowerCase().includes(q) ||
            h.indications.some((i) => i.replace(/_/g, ' ').includes(q)),
        )
        .sort((a, b) => (order.get(a.id) ?? 999) - (order.get(b.id) ?? 999))
    }
    return list
  }, [query, doshaFilter])

  return (
    <div className={embedded ? '' : 'mx-auto max-w-6xl px-4 py-12 sm:px-6'}>
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-sage-900">Knowledge base</h1>
        <p className="mt-1 text-sage-600">
          {HERBS.length} herbs and {FORMULATIONS.length} classical formulations — with transparent evidence levels and
          safety notes.
        </p>
      </div>

      {/* Controls */}
      <div className="sticky top-16 z-10 mb-6 space-y-3 rounded-2xl border border-sage-100 bg-white/90 p-3 backdrop-blur">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sage-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, concern, or symptom (e.g. sleep, digestion, joints)…"
            className="input pl-9"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1 text-xs font-medium text-sage-400">
            <Filter className="h-3.5 w-3.5" /> Filter:
          </span>
          {DOSHA_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setDoshaFilter(doshaFilter === f.key ? null : f.key)}
              className={doshaFilter === f.key ? 'chip-on' : 'chip-off'}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Herb grid */}
      {filteredHerbs.length === 0 ? (
        <EmptyState icon={<Leaf className="h-6 w-6" />} title="No herbs match" body="Try a different search term or clear the filters." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredHerbs.map((h) => (
            <button
              key={h.id}
              onClick={() => setSelected(h)}
              className="card group flex flex-col p-5 text-left transition-shadow hover:shadow-md"
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-sage-900 group-hover:text-sage-700">{h.name}</h3>
                  <p className="text-xs italic text-sage-500">{h.latin}</p>
                </div>
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-sage-100 text-sage-600">
                  <Leaf className="h-4 w-4" />
                </div>
              </div>
              <p className="line-clamp-3 flex-1 text-sm text-sage-600">{h.summary}</p>
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <EvidenceBadge level={h.evidenceLevel} />
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Formulations */}
      <div className="mt-12">
        <h2 className="mb-4 flex items-center gap-2 text-2xl font-semibold text-sage-900">
          <FlaskConical className="h-6 w-6 text-clay-500" /> Classical formulations
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {FORMULATIONS.map((f) => (
            <div key={f.id} className="card p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-sage-900">{f.name}</h3>
                  <p className="text-xs text-sage-500">{f.type}</p>
                </div>
                <EvidenceBadge level={f.evidenceLevel} />
              </div>
              <p className="mt-2 text-sm text-sage-600">{f.summary}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {f.herbIds.map((id) => (
                  <span key={id} className="rounded-md bg-sage-100 px-2 py-0.5 text-xs font-medium text-sage-700">
                    {HERB_BY_ID[id]?.name ?? id}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-xs text-sage-500">{f.safetyNotes}</p>
            </div>
          ))}
        </div>
      </div>

      {selected && <HerbDetail herb={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
