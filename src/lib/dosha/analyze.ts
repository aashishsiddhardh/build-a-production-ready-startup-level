import type { Dosha } from '@/types'
import { DOSHA_QUESTIONS } from '@/data/doshaQuestions'

export interface DoshaAnalysis {
  scores: Record<Dosha, number>
  /** 0..1 normalised proportions for charts. */
  proportions: Record<Dosha, number>
  dominant: Dosha | null
  secondary: Dosha | null
  /** True when two doshas are close (dual-constitution). */
  isDual: boolean
}

/**
 * Turn questionnaire answers (question id -> chosen dosha) into a constitutional
 * profile. Pure and deterministic.
 */
export function analyzeDosha(answers: Record<string, Dosha>): DoshaAnalysis {
  const scores: Record<Dosha, number> = { vata: 0, pitta: 0, kapha: 0 }
  for (const q of DOSHA_QUESTIONS) {
    const a = answers[q.id]
    if (a) scores[a] += 1
  }
  const total = scores.vata + scores.pitta + scores.kapha
  const proportions: Record<Dosha, number> = {
    vata: total ? scores.vata / total : 0,
    pitta: total ? scores.pitta / total : 0,
    kapha: total ? scores.kapha / total : 0,
  }

  const ranked = (Object.keys(scores) as Dosha[]).sort((a, b) => scores[b] - scores[a])
  const dominant = total ? ranked[0] : null
  const secondary = total ? ranked[1] : null
  const isDual =
    dominant !== null && secondary !== null && scores[dominant] - scores[secondary] <= 1 && total > 0

  return { scores, proportions, dominant, secondary, isDual }
}
