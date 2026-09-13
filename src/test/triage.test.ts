import { describe, it, expect } from 'vitest'
import { runTriage } from '@/lib/safety/triage'

describe('emergency triage (deterministic safety gate #1)', () => {
  it('flags chest pain in free text as an emergency and blocks recommendations', () => {
    const r = runTriage({ freeText: 'I have crushing chest pain radiating to my arm' })
    expect(r.level).toBe('emergency')
    expect(r.blockRecommendations).toBe(true)
    expect(r.matched.map((m) => m.id)).toContain('cardiac')
  })

  it('detects stroke (FAST) signs', () => {
    const r = runTriage({ freeText: 'sudden face drooping and slurred speech' })
    expect(r.level).toBe('emergency')
    expect(r.blockRecommendations).toBe(true)
  })

  it('treats self-harm statements as an emergency', () => {
    const r = runTriage({ freeText: 'I want to die and end my life' })
    expect(r.level).toBe('emergency')
    expect(r.matched.some((m) => m.id === 'mental_health')).toBe(true)
  })

  it('classifies high fever as urgent (not blocking) ', () => {
    const r = runTriage({ freeText: 'persistent high fever for 3 days' })
    expect(r.level).toBe('urgent')
    expect(r.blockRecommendations).toBe(false)
  })

  it('routes pediatric mentions away from herbal dosing', () => {
    const r = runTriage({ freeText: 'my baby has a mild cough' })
    expect(r.blockRecommendations).toBe(true)
  })

  it('returns routine with no red flags', () => {
    const r = runTriage({ freeText: 'mild bloating after meals' })
    expect(r.level).toBe('routine')
    expect(r.blockRecommendations).toBe(false)
    expect(r.matched).toHaveLength(0)
  })

  it('matches structured red-flag selections by rule id', () => {
    const r = runTriage({ redFlagSelections: ['cardiac'] })
    expect(r.level).toBe('emergency')
  })
})
