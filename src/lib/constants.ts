export const DISCLAIMER_VERSION = '2024-11-01';

export const APP_NAME = 'AyurSage';

export const SAFETY_DISCLAIMER =
  'AyurSage provides general Ayurvedic wellness education only. It does not diagnose, treat, prescribe, or cure any condition, and it is not a substitute for professional medical advice. Never stop or change prescribed medication based on this tool. Always consult a licensed healthcare professional, and in an emergency contact your local emergency services.';

/** Scoring weights for the deterministic recommender (transparent + tunable). */
export const SCORING = {
  perConcernMatch: 22,
  maxConcernPoints: 66,
  pacifyImbalance: 14,
  aggravateImbalance: -18,
  pacifyDominant: 6,
  evidenceBonus: {
    'moderate-clinical': 10,
    'preliminary-clinical': 6,
    preclinical: 2,
    traditional: 0,
  } as const,
  cautionPenalty: -12,
  minScoreToRecommend: 20,
  maxRecommendations: 6,
};
