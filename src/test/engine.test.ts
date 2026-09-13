import { describe, it, expect } from 'vitest'
import { generateRecommendations } from '@/lib/recommend/engine'
import type { AssessmentInput } from '@/types'

function baseInput(partial: Partial<AssessmentInput> = {}): AssessmentInput {
  return {
    symptoms: [],
    freeText: '',
    durationDays: 5,
    severity: 2,
    conditions: [],
    medications: [],
    pregnant: false,
    age: 40,
    goals: [],
    ...partial,
  }
}

describe('recommendation engine (end-to-end orchestration)', () => {
  it('withholds all recommendations when an emergency is present', () => {
    const res = generateRecommendations(
      baseInput({ symptoms: ['insomnia'], freeText: 'also severe chest pain right now' }),
    )
    expect(res.triage.blockRecommendations).toBe(true)
    expect(res.recommendations).toHaveLength(0)
    // Lifestyle + disclaimers still returned (general info), but no herbs.
    expect(res.disclaimers.length).toBeGreaterThan(0)
  })

  it('recommends and safety-filters for a routine sleep concern', () => {
    const res = generateRecommendations(
      baseInput({
        symptoms: ['insomnia', 'stress'],
        doshaScores: { vata: 5, pitta: 2, kapha: 1 },
      }),
    )
    expect(res.triage.blockRecommendations).toBe(false)
    expect(res.recommendations.length).toBeGreaterThan(0)
    // Every returned rec must be score-ordered.
    for (let i = 1; i < res.recommendations.length; i++) {
      expect(res.recommendations[i - 1].score).toBeGreaterThanOrEqual(res.recommendations[i].score)
    }
  })

  it('excludes contraindicated herbs but still returns safe ones (pregnancy)', () => {
    const res = generateRecommendations(
      baseInput({ symptoms: ['insomnia', 'stress'], pregnant: true }),
    )
    // Ashwagandha is avoid-in-pregnancy → must NOT be recommended.
    expect(res.recommendations.some((r) => r.herb.id === 'ashwagandha')).toBe(false)
    expect(res.excluded.some((e) => e.herb.id === 'ashwagandha')).toBe(true)
  })

  it('never recommends a herb that carries an avoid-level flag for the user', () => {
    const res = generateRecommendations(
      baseInput({ symptoms: ['sore_throat', 'cough'], conditions: ['hypertension'] }),
    )
    expect(res.recommendations.some((r) => r.herb.id === 'licorice')).toBe(false)
  })
})
