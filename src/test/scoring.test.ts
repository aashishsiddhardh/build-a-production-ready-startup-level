import { describe, it, expect } from 'vitest'
import { scoreHerb, EVIDENCE_WEIGHT } from '@/lib/recommend/scoring'
import { retrieve } from '@/lib/recommend/retrieval'
import { HERB_BY_ID } from '@/data/herbs'

describe('explainable scoring', () => {
  it('produces four transparent components that sum via weights', () => {
    const { score, components } = scoreHerb({
      herb: HERB_BY_ID.ashwagandha,
      relevance: 0.5,
      dominant: 'vata',
      cautions: [],
    })
    expect(components).toHaveLength(4)
    const totalWeight = components.reduce((s, c) => s + c.weight, 0)
    expect(totalWeight).toBeCloseTo(1, 5)
    expect(score).toBeGreaterThan(0)
    expect(score).toBeLessThanOrEqual(100)
  })

  it('rewards herbs that pacify the dominant dosha', () => {
    // Ashwagandha decreases vata; scoring vata-dominant should beat kapha-dominant
    // (ashwagandha increases kapha).
    const vata = scoreHerb({ herb: HERB_BY_ID.ashwagandha, relevance: 0.5, dominant: 'vata', cautions: [] })
    const kapha = scoreHerb({ herb: HERB_BY_ID.ashwagandha, relevance: 0.5, dominant: 'kapha', cautions: [] })
    expect(vata.score).toBeGreaterThan(kapha.score)
  })

  it('penalises cautions via the safety-margin component', () => {
    const clean = scoreHerb({ herb: HERB_BY_ID.turmeric, relevance: 0.5, dominant: null, cautions: [] })
    const caution = scoreHerb({
      herb: HERB_BY_ID.turmeric,
      relevance: 0.5,
      dominant: null,
      cautions: [{ kind: 'interaction', severity: 'caution', message: 'x' }],
    })
    expect(caution.score).toBeLessThan(clean.score)
  })

  it('weights stronger evidence higher', () => {
    expect(EVIDENCE_WEIGHT.strong).toBeGreaterThan(EVIDENCE_WEIGHT.moderate)
    expect(EVIDENCE_WEIGHT.moderate).toBeGreaterThan(EVIDENCE_WEIGHT.preliminary)
    expect(EVIDENCE_WEIGHT.preliminary).toBeGreaterThan(EVIDENCE_WEIGHT.traditional)
  })
})

describe('retrieval (local vector store)', () => {
  it('retrieves sleep herbs for an insomnia query', () => {
    const hits = retrieve(['insomnia', 'stress'], { kind: 'herb', topK: 5 })
    const ids = hits.map((h) => h.doc.id)
    expect(ids).toContain('ashwagandha')
    expect(hits[0].similarity).toBeGreaterThan(0)
  })

  it('retrieves digestive herbs for indigestion', () => {
    const hits = retrieve(['indigestion'], { kind: 'herb', topK: 5 })
    const ids = hits.map((h) => h.doc.id)
    expect(ids.some((id) => ['ginger', 'fennel', 'cumin', 'peppermint'].includes(id))).toBe(true)
  })

  it('returns nothing for an empty query', () => {
    expect(retrieve([], {})).toHaveLength(0)
  })
})
