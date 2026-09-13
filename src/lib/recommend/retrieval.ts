import type { Herb, Formulation } from '@/types'
import { HERBS } from '@/data/herbs'
import { FORMULATIONS } from '@/data/formulations'
import { tokenize } from '@/lib/text'

// ─────────────────────────────────────────────────────────────────────────────
// In-browser retrieval layer ("local pgvector").
//
// Each knowledge-base document is embedded as a sparse TF-IDF vector over a
// shared vocabulary. Queries are embedded the same way and ranked by cosine
// similarity. This mirrors the production design (pgvector + cosine distance)
// while running fully client-side with zero external calls — so retrieval is
// deterministic, explainable, and works offline in the standalone preview.
// ─────────────────────────────────────────────────────────────────────────────

export type DocKind = 'herb' | 'formulation'

export interface KbDocument {
  id: string
  kind: DocKind
  name: string
  /** Weighted concept tokens (indications repeated to boost their weight). */
  tokens: string[]
  ref: Herb | Formulation
}

function herbDoc(h: Herb): KbDocument {
  const tokens: string[] = []
  // Indications are the primary retrieval signal — weight them heavily.
  for (const ind of h.indications) {
    tokens.push(...tokenize(ind), ...tokenize(ind), ...tokenize(ind))
  }
  for (const a of h.actions) tokens.push(...tokenize(a))
  tokens.push(...tokenize(h.summary))
  tokens.push(...tokenize(h.category))
  tokens.push(...tokenize(h.name), ...tokenize(h.sanskrit))
  return { id: h.id, kind: 'herb', name: h.name, tokens, ref: h }
}

function formulationDoc(f: Formulation): KbDocument {
  const tokens: string[] = []
  for (const ind of f.indications) tokens.push(...tokenize(ind), ...tokenize(ind), ...tokenize(ind))
  tokens.push(...tokenize(f.summary))
  tokens.push(...tokenize(f.type))
  tokens.push(...tokenize(f.name), ...tokenize(f.sanskrit))
  return { id: f.id, kind: 'formulation', name: f.name, tokens, ref: f }
}

export const KB_DOCUMENTS: KbDocument[] = [
  ...HERBS.map(herbDoc),
  ...FORMULATIONS.map(formulationDoc),
]

// ── Build IDF over the corpus ────────────────────────────────────────────────
const DOC_FREQ: Record<string, number> = {}
for (const doc of KB_DOCUMENTS) {
  for (const term of new Set(doc.tokens)) {
    DOC_FREQ[term] = (DOC_FREQ[term] ?? 0) + 1
  }
}
const N = KB_DOCUMENTS.length
function idf(term: string): number {
  const df = DOC_FREQ[term] ?? 0
  return Math.log((N + 1) / (df + 1)) + 1
}

export type Vector = Record<string, number>

function toVector(tokens: string[]): Vector {
  const tf: Record<string, number> = {}
  for (const t of tokens) tf[t] = (tf[t] ?? 0) + 1
  const vec: Vector = {}
  const maxTf = Math.max(1, ...Object.values(tf))
  for (const [term, count] of Object.entries(tf)) {
    vec[term] = (0.5 + 0.5 * (count / maxTf)) * idf(term)
  }
  return vec
}

function norm(vec: Vector): number {
  let s = 0
  for (const v of Object.values(vec)) s += v * v
  return Math.sqrt(s) || 1
}

export function cosine(a: Vector, b: Vector): number {
  let dot = 0
  const [small, large] = Object.keys(a).length < Object.keys(b).length ? [a, b] : [b, a]
  for (const [term, va] of Object.entries(small)) {
    const vb = large[term]
    if (vb) dot += va * vb
  }
  return dot / (norm(a) * norm(b))
}

// Precompute document vectors once at module load.
const DOC_VECTORS: Record<string, Vector> = {}
for (const doc of KB_DOCUMENTS) DOC_VECTORS[doc.id] = toVector(doc.tokens)

export interface RetrievalHit {
  doc: KbDocument
  similarity: number
  /** Which query tokens actually matched this document. */
  overlap: string[]
}

/**
 * Retrieve the most relevant KB documents for a set of concept tokens.
 * `queryTokens` should already be canonicalised (see extractConcepts/tokenize).
 */
export function retrieve(queryTokens: string[], opts?: { kind?: DocKind; topK?: number }): RetrievalHit[] {
  const topK = opts?.topK ?? 8
  if (queryTokens.length === 0) return []
  const qVec = toVector(queryTokens)
  const qTerms = new Set(queryTokens)

  const hits: RetrievalHit[] = KB_DOCUMENTS.filter((d) => !opts?.kind || d.kind === opts.kind).map(
    (doc) => {
      const sim = cosine(qVec, DOC_VECTORS[doc.id])
      const overlap = [...new Set(doc.tokens)].filter((t) => qTerms.has(t))
      return { doc, similarity: sim, overlap }
    },
  )

  return hits
    .filter((h) => h.similarity > 0.001)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK)
}
