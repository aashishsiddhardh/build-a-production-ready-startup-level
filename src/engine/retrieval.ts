import type { RetrievedChunk } from '@/lib/types';
import { HERBS } from '@/data/herbs';
import { CONCERN_MAP } from '@/data/conditions';
import { EVIDENCE_META } from '@/lib/types';

/**
 * A tiny, dependency-free in-browser vector store.
 *
 * In production (see /backend) these embeddings live in PostgreSQL + pgvector.
 * For the zero-config client demo we build TF-IDF vectors over the knowledge
 * base and rank chunks by cosine similarity — the same retrieval contract the
 * conversational assistant depends on.
 */

const STOPWORDS = new Set(
  'a an and are as at be but by for from has have in into is it its of on or that the this to was were will with your you can may might should could would use used using help helps support supports'.split(
    ' ',
  ),
);

function stem(token: string): string {
  return token
    .replace(/(ations|ition|ments|ing|edly|ed|es|ly|s)$/i, '')
    .replace(/i$/i, 'y');
}

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOPWORDS.has(t))
    .map(stem);
}

export interface DocChunk {
  id: string;
  herbId: string;
  text: string;
  tf: Map<string, number>;
}

/** Build human-readable chunks from a herb record. */
function chunksForHerb(herbId: string): { id: string; herbId: string; text: string }[] {
  const herb = HERBS.find((h) => h.id === herbId)!;
  const concernLabels = herb.targets.map((t) => CONCERN_MAP[t]?.label ?? t).join(', ');
  const contra = herb.contraindications.map((c) => `${c.flag} (${c.severity}): ${c.reason}`).join(' ');
  const inter = herb.interactions.map((i) => `${i.drugClass}: ${i.effect}`).join(' ');
  return [
    {
      id: `${herb.id}-overview`,
      herbId: herb.id,
      text: `${herb.commonName} (${herb.sanskritName}, ${herb.latinName}). ${herb.summary} Qualities: ${herb.qualities.join(', ')}. Commonly used for ${concernLabels}. Common forms: ${herb.commonForms.join(', ')}.`,
    },
    {
      id: `${herb.id}-evidence`,
      herbId: herb.id,
      text: `${herb.commonName} evidence level is ${EVIDENCE_META[herb.evidence].label}. ${herb.evidenceNote}`,
    },
    {
      id: `${herb.id}-safety`,
      herbId: herb.id,
      text: `${herb.commonName} safety. Contraindications: ${contra || 'none recorded'}. Interactions: ${inter || 'none recorded'}. Notes: ${herb.safetyNotes.join(' ')}`,
    },
  ];
}

function buildIndex() {
  const rawChunks = HERBS.flatMap((h) => chunksForHerb(h.id));
  const df = new Map<string, number>();
  const perDoc: { id: string; herbId: string; text: string; terms: string[] }[] = [];

  for (const c of rawChunks) {
    const terms = tokenize(c.text);
    perDoc.push({ ...c, terms });
    for (const t of new Set(terms)) df.set(t, (df.get(t) ?? 0) + 1);
  }

  const N = perDoc.length;
  const idf = new Map<string, number>();
  for (const [term, count] of df) idf.set(term, Math.log((N + 1) / (count + 1)) + 1);

  const chunks: (DocChunk & { norm: number })[] = perDoc.map((d) => {
    const counts = new Map<string, number>();
    for (const t of d.terms) counts.set(t, (counts.get(t) ?? 0) + 1);
    const tf = new Map<string, number>();
    let sumSq = 0;
    for (const [term, count] of counts) {
      const w = (count / d.terms.length) * (idf.get(term) ?? 0);
      tf.set(term, w);
      sumSq += w * w;
    }
    return { id: d.id, herbId: d.herbId, text: d.text, tf, norm: Math.sqrt(sumSq) || 1 };
  });

  return { chunks, idf };
}

const INDEX = buildIndex();

function queryVector(query: string): { vec: Map<string, number>; norm: number } {
  const terms = tokenize(query);
  const counts = new Map<string, number>();
  for (const t of terms) counts.set(t, (counts.get(t) ?? 0) + 1);
  const vec = new Map<string, number>();
  let sumSq = 0;
  for (const [term, count] of counts) {
    const w = (count / (terms.length || 1)) * (INDEX.idf.get(term) ?? 0);
    if (w > 0) {
      vec.set(term, w);
      sumSq += w * w;
    }
  }
  return { vec, norm: Math.sqrt(sumSq) || 1 };
}

/** Retrieve the top-k most relevant knowledge-base chunks for a query. */
export function retrieve(query: string, k = 4): RetrievedChunk[] {
  const { vec, norm } = queryVector(query);
  if (vec.size === 0) return [];

  const scored = INDEX.chunks.map((chunk) => {
    let dot = 0;
    // Iterate over the smaller map for efficiency.
    const [small, big] = vec.size < chunk.tf.size ? [vec, chunk.tf] : [chunk.tf, vec];
    for (const [term, w] of small) {
      const other = big.get(term);
      if (other) dot += w * other;
    }
    const score = dot / (norm * chunk.norm);
    return { id: chunk.id, herbId: chunk.herbId, text: chunk.text, score };
  });

  return scored
    .filter((s) => s.score > 0.02)
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}
