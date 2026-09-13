import { describe, it, expect } from 'vitest'
import { checkHerbSafety } from '@/lib/safety/contraindications'
import { HERB_BY_ID } from '@/data/herbs'
import type { AssessmentInput } from '@/types'

function baseInput(partial: Partial<AssessmentInput> = {}): AssessmentInput {
  return {
    symptoms: [],
    freeText: '',
    durationDays: 3,
    severity: 2,
    conditions: [],
    medications: [],
    pregnant: false,
    age: 35,
    goals: [],
    ...partial,
  }
}

describe('contraindication + interaction checking (deterministic safety gate #2)', () => {
  it('blocks ashwagandha in pregnancy', () => {
    const res = checkHerbSafety(HERB_BY_ID.ashwagandha, baseInput({ pregnant: true }))
    expect(res.blocked).toBe(true)
    expect(res.blockingFlags.some((f) => f.kind === 'pregnancy')).toBe(true)
  })

  it('blocks licorice with high blood pressure (contraindication)', () => {
    const res = checkHerbSafety(HERB_BY_ID.licorice, baseInput({ conditions: ['hypertension'] }))
    expect(res.blocked).toBe(true)
    expect(res.blockingFlags.some((f) => f.kind === 'contraindication')).toBe(true)
  })

  it('blocks licorice with antihypertensive medication (avoid-level interaction)', () => {
    const res = checkHerbSafety(HERB_BY_ID.licorice, baseInput({ medications: ['antihypertensive'] }))
    expect(res.blocked).toBe(true)
    expect(res.blockingFlags.some((f) => f.kind === 'interaction')).toBe(true)
  })

  it('flags turmeric + blood thinner as a caution (non-blocking)', () => {
    const res = checkHerbSafety(HERB_BY_ID.turmeric, baseInput({ medications: ['warfarin'] }))
    expect(res.blocked).toBe(false)
    expect(res.flags.some((f) => f.kind === 'interaction' && f.severity === 'caution')).toBe(true)
  })

  it('blocks guduchi with an autoimmune condition + immunosuppressant', () => {
    const res = checkHerbSafety(
      HERB_BY_ID.guduchi,
      baseInput({ conditions: ['autoimmune'], medications: ['immunosuppressant'] }),
    )
    expect(res.blocked).toBe(true)
  })

  it('does not block a clean profile for ginger', () => {
    const res = checkHerbSafety(HERB_BY_ID.ginger, baseInput({ symptoms: ['nausea'] }))
    expect(res.blocked).toBe(false)
  })

  it('detects contraindication from free text mention', () => {
    const res = checkHerbSafety(
      HERB_BY_ID.licorice,
      baseInput({ freeText: 'I have high blood pressure and want relief' }),
    )
    expect(res.blocked).toBe(true)
  })
})
