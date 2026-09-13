import type {
  AssessmentInput,
  AssessmentResult,
  Recommendation,
  ScoreFactor,
  Herb,
  Dosha,
  LifestyleGuidance,
} from '@/lib/types';
import { EVIDENCE_META } from '@/lib/types';
import { HERBS } from '@/data/herbs';
import { CONCERN_MAP } from '@/data/conditions';
import { DOSHA_META } from '@/data/doshas';
import { LIFESTYLE_LIBRARY, UNIVERSAL_GUIDANCE } from '@/data/lifestyle';
import { SCORING, DISCLAIMER_VERSION } from '@/lib/constants';
import { runTriage } from './triage';
import { analyzeDosha } from './doshaAssessment';
import { checkHerbSafety } from './safety';
import { uid } from '@/lib/id';

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

/**
 * Score a single herb for a user, returning a transparent factor breakdown.
 * Returns null when the herb is blocked for safety (handled separately) — here
 * we assume it has already passed the safety gate.
 */
function scoreHerb(
  herb: Herb,
  concerns: string[],
  imbalance: Dosha | null,
  dominant: Dosha,
  cautionActive: boolean,
): { score: number; factors: ScoreFactor[]; matchedConcerns: string[] } {
  const factors: ScoreFactor[] = [];

  // 1) Concern match — the primary relevance signal.
  const matchedConcerns = concerns.filter((c) => herb.targets.includes(c));
  const concernPoints = Math.min(
    matchedConcerns.length * SCORING.perConcernMatch,
    SCORING.maxConcernPoints,
  );
  if (matchedConcerns.length > 0) {
    const labels = matchedConcerns.map((c) => CONCERN_MAP[c]?.label ?? c).join(', ');
    factors.push({
      label: 'Matches your concerns',
      detail: `Traditionally used for: ${labels}.`,
      weight: concernPoints,
    });
  }

  // 2) Dosha alignment with the current imbalance (vikriti).
  if (imbalance) {
    const effect = herb.doshaEffect[imbalance];
    if (effect < 0) {
      factors.push({
        label: `Pacifies ${DOSHA_META[imbalance].name}`,
        detail: `Its qualities help balance the ${DOSHA_META[imbalance].name} pattern behind your concerns.`,
        weight: SCORING.pacifyImbalance,
      });
    } else if (effect > 0) {
      factors.push({
        label: `May aggravate ${DOSHA_META[imbalance].name}`,
        detail: `This herb can increase ${DOSHA_META[imbalance].name}, which is already elevated for you.`,
        weight: SCORING.aggravateImbalance,
      });
    }
  }

  // 3) Constitutional (prakriti) alignment — smaller weight.
  if (herb.doshaEffect[dominant] < 0) {
    factors.push({
      label: `Suits your ${DOSHA_META[dominant].name} constitution`,
      detail: `Balancing for your dominant ${DOSHA_META[dominant].name} nature.`,
      weight: SCORING.pacifyDominant,
    });
  }

  // 4) Evidence bonus — reward stronger evidence transparently.
  const evBonus = SCORING.evidenceBonus[herb.evidence];
  if (evBonus > 0) {
    factors.push({
      label: `Evidence: ${EVIDENCE_META[herb.evidence].label}`,
      detail: EVIDENCE_META[herb.evidence].blurb,
      weight: evBonus,
    });
  }

  // 5) Caution penalty (herb passed the hard gate but has a soft caution).
  if (cautionActive) {
    factors.push({
      label: 'Personal caution applies',
      detail: 'A contraindication or interaction requires professional guidance before use.',
      weight: SCORING.cautionPenalty,
    });
  }

  const raw = factors.reduce((sum, f) => sum + f.weight, 0);
  const score = clamp(Math.round(raw), 0, 100);
  return { score, factors, matchedConcerns };
}

function buildRationale(herb: Herb, matchedConcerns: string[], imbalance: Dosha | null): string {
  const concernText =
    matchedConcerns.length > 0
      ? matchedConcerns.map((c) => CONCERN_MAP[c]?.label.toLowerCase() ?? c).join(', ')
      : 'general wellbeing';
  const doshaText = imbalance
    ? ` It has a ${DOSHA_META[imbalance].name}-balancing quality that fits the pattern behind your concerns.`
    : '';
  return `${herb.commonName} is traditionally associated with ${concernText}.${doshaText} Evidence level: ${EVIDENCE_META[herb.evidence].label}. This is educational information, not a prescription.`;
}

function buildLifestyle(imbalance: Dosha | null, dominant: Dosha): LifestyleGuidance[] {
  const focus = imbalance ?? dominant;
  return [...LIFESTYLE_LIBRARY[focus], UNIVERSAL_GUIDANCE];
}

/**
 * The end-to-end recommendation pipeline.
 *
 * Order of operations enforces the safety-first architecture:
 *   1. Deterministic triage — can withhold ALL recommendations.
 *   2. Deterministic dosha analysis.
 *   3. Deterministic per-herb safety gate — removes unsafe herbs entirely.
 *   4. Deterministic scoring + explainability over the remaining herbs.
 */
export function generateRecommendations(input: AssessmentInput): AssessmentResult {
  const triage = runTriage(input);
  const { prakriti, dominantDosha, imbalance } = analyzeDosha(input.prakritiAnswers, input.concerns);

  const base: Omit<AssessmentResult, 'recommendations' | 'withheldForSafety' | 'lifestyle'> = {
    id: uid('asmt'),
    createdAt: new Date().toISOString(),
    triage,
    prakriti,
    dominantDosha,
    imbalance,
    concerns: input.concerns,
    profileSnapshot: input.profile,
    disclaimerVersion: DISCLAIMER_VERSION,
  };

  // Safety gate: if triage blocks, we produce NO herbal recommendations.
  if (triage.blockRecommendations) {
    return {
      ...base,
      recommendations: [],
      withheldForSafety: [],
      lifestyle: [],
    };
  }

  const withheldForSafety: { herb: string; reason: string }[] = [];
  const recs: Recommendation[] = [];

  for (const herb of HERBS) {
    const safety = checkHerbSafety(herb, input.profile);

    if (safety.status === 'blocked') {
      const reason =
        safety.contraindications.find((c) => c.severity === 'avoid')?.reason ??
        safety.interactions.find((i) => i.severity === 'severe')?.effect ??
        'A serious contraindication applies to your profile.';
      withheldForSafety.push({ herb: herb.commonName, reason });
      continue;
    }

    const { score, factors, matchedConcerns } = scoreHerb(
      herb,
      input.concerns,
      imbalance,
      dominantDosha,
      safety.status === 'caution',
    );

    // Only surface herbs that are actually relevant to the user's concerns.
    if (matchedConcerns.length === 0 || score < SCORING.minScoreToRecommend) continue;

    recs.push({
      herb,
      score,
      factors,
      matchedConcerns,
      safety,
      rationale: buildRationale(herb, matchedConcerns, imbalance),
    });
  }

  recs.sort((a, b) => b.score - a.score);
  const recommendations = recs.slice(0, SCORING.maxRecommendations);

  return {
    ...base,
    recommendations,
    withheldForSafety,
    lifestyle: buildLifestyle(imbalance, dominantDosha),
  };
}
