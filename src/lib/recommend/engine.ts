import type {
  AssessmentInput,
  Dosha,
  Recommendation,
  RecommendationResult,
  SafetyFlag,
} from '@/types'
import { SYMPTOMS } from '@/data/reference'
import { HERB_BY_ID } from '@/data/herbs'
import { runTriage } from '@/lib/safety/triage'
import { checkHerbSafety } from '@/lib/safety/contraindications'
import { retrieve } from '@/lib/recommend/retrieval'
import { scoreHerb, EVIDENCE_LABEL } from '@/lib/recommend/scoring'
import { buildLifestyle } from '@/lib/recommend/lifestyle'
import { extractConcepts, tokenize } from '@/lib/text'

const SYMPTOM_LABEL: Record<string, string> = Object.fromEntries(
  SYMPTOMS.map((s) => [s.key, s.label]),
)

// Map wellness goals to canonical concept tokens to enrich retrieval.
const GOAL_CONCEPTS: Record<string, string[]> = {
  better_sleep: ['insomnia'],
  digestion: ['indigestion'],
  stress_resilience: ['stress'],
  energy: ['fatigue'],
  immunity: ['low', 'immunity'],
  focus: ['brain', 'fog'],
  skin: ['skin', 'breakouts'],
  joint_comfort: ['joint', 'stiffness'],
}

export const STANDARD_DISCLAIMERS = [
  'AyurSage provides general educational wellness information based on Ayurvedic tradition and does not diagnose, treat, prescribe, or cure any condition.',
  'These suggestions are not a substitute for professional medical advice. Talk to a qualified healthcare provider — especially before combining herbs with medications, during pregnancy or breastfeeding, or if you have a chronic condition.',
  'Never stop or change a prescribed medication based on this information. Introduce anything new one at a time, start low, and stop if you notice an adverse reaction.',
  'Herbal product quality varies. Choose reputable, tested sources and confirm identity and dosing with a qualified practitioner.',
]

function dominantDosha(input: AssessmentInput): Dosha | null {
  const s = input.doshaScores
  if (!s) return null
  const ranked = (Object.keys(s) as Dosha[]).sort((a, b) => s[b] - s[a])
  if (!ranked.length || s[ranked[0]] === 0) return null
  return ranked[0]
}

function buildQueryTokens(input: AssessmentInput): string[] {
  const tokens: string[] = []
  for (const sym of input.symptoms) {
    tokens.push(...tokenize(sym))
    // Boost selected symptoms so they dominate retrieval.
    tokens.push(...tokenize(sym))
  }
  for (const g of input.goals) tokens.push(...(GOAL_CONCEPTS[g] ?? []))
  if (input.freeText) tokens.push(...extractConcepts(input.freeText))
  return tokens
}

function rationale(
  name: string,
  matchedLabels: string[],
  evidenceLabel: string,
  constitutionDetail: string,
  cautions: SafetyFlag[],
): string {
  const parts: string[] = []
  if (matchedLabels.length) {
    parts.push(
      `${name} is traditionally associated with ${matchedLabels.slice(0, 3).join(', ')}${
        matchedLabels.length > 3 ? ', and related concerns' : ''
      }.`,
    )
  } else {
    parts.push(`${name} relates to the concerns you described.`)
  }
  parts.push(`Evidence tier: ${evidenceLabel.toLowerCase()}.`)
  parts.push(constitutionDetail)
  if (cautions.length) {
    parts.push(`Please note the ${cautions.length} caution(s) shown above before use.`)
  }
  return parts.join(' ')
}

export function generateRecommendations(input: AssessmentInput): RecommendationResult {
  const generatedAt = new Date().toISOString()

  // ── Gate #1: emergency triage (deterministic) ──
  const triage = runTriage({
    redFlagSelections: input.symptoms, // structured red-flag keys share the symptom channel
    freeText: input.freeText,
  })

  const dominant = dominantDosha(input)
  const lifestyle = buildLifestyle(input, dominant)

  if (triage.blockRecommendations) {
    return {
      triage,
      dominantDosha: dominant,
      recommendations: [],
      excluded: [],
      lifestyle,
      disclaimers: STANDARD_DISCLAIMERS,
      generatedAt,
    }
  }

  // ── Retrieval ──
  const queryTokens = buildQueryTokens(input)
  const hits = retrieve(queryTokens, { kind: 'herb', topK: 12 })

  const recommendations: Recommendation[] = []
  const excluded: RecommendationResult['excluded'] = []

  for (const hit of hits) {
    const herb = HERB_BY_ID[hit.doc.id]
    if (!herb) continue

    // ── Gate #2: contraindications + interactions (deterministic) ──
    const safety = checkHerbSafety(herb, input)
    if (safety.blocked) {
      excluded.push({ herb, reasons: safety.blockingFlags })
      continue
    }

    const cautions = safety.flags // all remaining flags are caution/info
    const matchedKeys = herb.indications.filter((k) => input.symptoms.includes(k))
    const matchedLabels = matchedKeys.map((k) => SYMPTOM_LABEL[k] ?? k)

    const { score, components } = scoreHerb({
      herb,
      relevance: hit.similarity,
      dominant,
      cautions,
    })

    recommendations.push({
      herb,
      score,
      components,
      matchedSymptoms: matchedLabels,
      cautions,
      rationale: rationale(
        herb.name,
        matchedLabels,
        EVIDENCE_LABEL[herb.evidenceLevel],
        components[1].detail,
        cautions,
      ),
    })
  }

  recommendations.sort((a, b) => b.score - a.score)

  return {
    triage,
    dominantDosha: dominant,
    recommendations: recommendations.slice(0, 6),
    excluded,
    lifestyle,
    disclaimers: STANDARD_DISCLAIMERS,
    generatedAt,
  }
}
