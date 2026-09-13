import type { AssessmentInput, TriageResult, TriageLevel } from '@/lib/types';
import { RED_FLAG_QUESTIONS, KEYWORD_RULES } from '@/data/emergencyRules';

/**
 * Pure, deterministic triage. Given the explicit red-flag answers and the
 * free-text narrative, decide whether it is safe to offer Ayurvedic wellness
 * recommendations. AI output NEVER feeds into this function.
 *
 * Design principle: fail safe. Any emergency signal blocks recommendations.
 */
export function runTriage(input: Pick<AssessmentInput, 'redFlagAnswers' | 'narrative'>): TriageResult {
  const matched: { id: string; label: string; advice: string; level: 'emergency' | 'urgent' }[] = [];

  // 1) Explicit structured screening answers (highest signal).
  for (const q of RED_FLAG_QUESTIONS) {
    if (input.redFlagAnswers[q.id] === true) {
      matched.push({ id: q.id, label: q.label, advice: q.advice, level: q.level });
    }
  }

  // 2) Keyword scan of the free-text narrative (broad on purpose).
  const text = (input.narrative || '').toLowerCase();
  if (text.trim().length > 0) {
    for (const rule of KEYWORD_RULES) {
      if (rule.patterns.some((re) => re.test(text))) {
        // Avoid duplicate labels from the structured screen.
        if (!matched.some((m) => m.label === rule.label)) {
          matched.push({ id: rule.id, label: rule.label, advice: rule.advice, level: rule.level });
        }
      }
    }
  }

  const hasEmergency = matched.some((m) => m.level === 'emergency');
  const hasUrgent = matched.some((m) => m.level === 'urgent');

  let level: TriageLevel = 'self-care';
  if (hasEmergency) level = 'emergency';
  else if (hasUrgent) level = 'urgent';
  else level = 'self-care';

  const blockRecommendations = hasEmergency || hasUrgent;

  let headline = 'No emergency warning signs detected';
  let guidance =
    'Based on your answers we did not detect emergency warning signs. The wellness suggestions below are educational and general — they are not a diagnosis or treatment.';

  if (level === 'emergency') {
    headline = 'This may be a medical emergency';
    guidance =
      'One or more of your answers matches an emergency warning sign. AyurSage does not provide herbal recommendations in this situation. Please contact your local emergency number or go to the nearest emergency department now.';
  } else if (level === 'urgent') {
    headline = 'Please see a clinician before using wellness herbs';
    guidance =
      'Your answers suggest a situation that should be evaluated by a licensed healthcare professional first. For your safety, AyurSage is withholding herbal recommendations until you have been assessed.';
  }

  return {
    level,
    blockRecommendations,
    matchedFlags: matched.map(({ id, label, advice }) => ({ id, label, advice })),
    headline,
    guidance,
  };
}
