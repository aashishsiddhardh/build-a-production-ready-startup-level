import type { Dosha, EvidenceLevel, Herb, SafetyFlag, ScoreComponent } from '@/types'

// ─────────────────────────────────────────────────────────────────────────────
// Explainable recommendation scoring.
//
// Every recommendation exposes exactly how it was scored. The final score is a
// weighted sum of four transparent components, each in [0,1]:
//   • Symptom relevance   (retrieval similarity)
//   • Constitutional fit  (dosha alignment)
//   • Evidence strength   (transparent tier weighting)
//   • Safety margin       (penalty for non-blocking cautions)
// Blocking safety decisions happen BEFORE scoring — scoring never sees an item
// that failed a hard safety check.
// ─────────────────────────────────────────────────────────────────────────────

export const EVIDENCE_WEIGHT: Record<EvidenceLevel, number> = {
  traditional: 0.35,
  preclinical: 0.45,
  preliminary: 0.6,
  moderate: 0.85,
  strong: 1.0,
}

export const EVIDENCE_LABEL: Record<EvidenceLevel, string> = {
  traditional: 'Traditional use',
  preclinical: 'Preclinical signals',
  preliminary: 'Preliminary human data',
  moderate: 'Moderate human evidence',
  strong: 'Strong human evidence',
}

const WEIGHTS = {
  relevance: 0.45,
  constitution: 0.2,
  evidence: 0.25,
  safety: 0.1,
}

function constitutionFit(herb: Herb, dominant: Dosha | null): { value: number; detail: string } {
  if (!dominant) {
    return { value: 0.6, detail: 'No constitutional profile provided — neutral weighting applied.' }
  }
  const effect = herb.doshaEffect[dominant]
  if (effect === 'decrease') {
    return { value: 1, detail: `Pacifies your dominant ${dominant} — a strong constitutional fit.` }
  }
  if (effect === 'neutral') {
    return { value: 0.6, detail: `Neutral for your dominant ${dominant}.` }
  }
  return { value: 0.2, detail: `May increase ${dominant}, your dominant dosha — weaker constitutional fit.` }
}

function safetyMargin(cautions: SafetyFlag[]): { value: number; detail: string } {
  let value = 1
  for (const f of cautions) {
    if (f.severity === 'caution') value -= 0.3
    else if (f.severity === 'info') value -= 0.1
  }
  value = Math.max(0, value)
  const detail = cautions.length
    ? `${cautions.length} non-blocking caution(s) reduced the safety margin.`
    : 'No cautions apply to your profile.'
  return { value, detail }
}

export interface ScoreInput {
  herb: Herb
  relevance: number // cosine similarity from retrieval (0..~1)
  dominant: Dosha | null
  cautions: SafetyFlag[]
}

export interface ScoreOutput {
  score: number // 0..100
  components: ScoreComponent[]
}

export function scoreHerb({ herb, relevance, dominant, cautions }: ScoreInput): ScoreOutput {
  // Squash raw cosine into a friendlier 0..1 relevance signal.
  const relevanceValue = Math.max(0, Math.min(1, relevance / 0.6))
  const constitution = constitutionFit(herb, dominant)
  const evidenceValue = EVIDENCE_WEIGHT[herb.evidenceLevel]
  const safety = safetyMargin(cautions)

  const components: ScoreComponent[] = [
    {
      label: 'Symptom relevance',
      value: relevanceValue,
      weight: WEIGHTS.relevance,
      detail: 'How closely this herb’s traditional indications match what you described.',
    },
    {
      label: 'Constitutional fit',
      value: constitution.value,
      weight: WEIGHTS.constitution,
      detail: constitution.detail,
    },
    {
      label: 'Evidence strength',
      value: evidenceValue,
      weight: WEIGHTS.evidence,
      detail: `${EVIDENCE_LABEL[herb.evidenceLevel]} — ${herb.evidenceNote}`,
    },
    {
      label: 'Safety margin',
      value: safety.value,
      weight: WEIGHTS.safety,
      detail: safety.detail,
    },
  ]

  const raw = components.reduce((sum, c) => sum + c.value * c.weight, 0)
  const score = Math.round(raw * 100)
  return { score, components }
}
