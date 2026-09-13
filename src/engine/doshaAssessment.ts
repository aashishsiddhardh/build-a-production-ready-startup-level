import type { Dosha, DoshaScores } from '@/lib/types';
import { PRAKRITI_QUESTIONS } from '@/data/doshas';
import { CONCERN_MAP } from '@/data/conditions';

export interface DoshaAnalysis {
  /** Normalized prakriti percentages (sum ~100). */
  prakriti: DoshaScores;
  dominantDosha: Dosha;
  /** The dosha most likely currently aggravated (vikriti), from concerns. */
  imbalance: Dosha | null;
}

const EMPTY: DoshaScores = { vata: 0, pitta: 0, kapha: 0 };

/**
 * Score the constitution (prakriti) from quiz answers and infer the current
 * likely imbalance (vikriti) from the selected concerns. Deterministic.
 */
export function analyzeDosha(
  prakritiAnswers: Record<string, Dosha>,
  concerns: string[],
): DoshaAnalysis {
  const counts: DoshaScores = { ...EMPTY };
  let answered = 0;

  for (const q of PRAKRITI_QUESTIONS) {
    const ans = prakritiAnswers[q.id];
    if (ans) {
      counts[ans] += 1;
      answered += 1;
    }
  }

  // Normalize to percentages; default to a balanced tridoshic profile if empty.
  let prakriti: DoshaScores;
  if (answered === 0) {
    prakriti = { vata: 34, pitta: 33, kapha: 33 };
  } else {
    prakriti = {
      vata: Math.round((counts.vata / answered) * 100),
      pitta: Math.round((counts.pitta / answered) * 100),
      kapha: Math.round((counts.kapha / answered) * 100),
    };
  }

  const dominantDosha = (Object.keys(prakriti) as Dosha[]).reduce((a, b) =>
    prakriti[a] >= prakriti[b] ? a : b,
  );

  // Infer imbalance from concerns: tally the dosha associated with each concern.
  const imbalanceCounts: DoshaScores = { ...EMPTY };
  for (const id of concerns) {
    const concern = CONCERN_MAP[id];
    if (concern?.associatedDosha) imbalanceCounts[concern.associatedDosha] += 1;
  }
  const totalImbalance = imbalanceCounts.vata + imbalanceCounts.pitta + imbalanceCounts.kapha;
  let imbalance: Dosha | null = null;
  if (totalImbalance > 0) {
    imbalance = (Object.keys(imbalanceCounts) as Dosha[]).reduce((a, b) =>
      imbalanceCounts[a] >= imbalanceCounts[b] ? a : b,
    );
  }

  return { prakriti, dominantDosha, imbalance };
}
