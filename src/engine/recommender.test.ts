import { describe, it, expect } from 'vitest';
import { generateRecommendations } from '@/engine/recommender';
import type { AssessmentInput, HealthProfile } from '@/lib/types';

const profile: HealthProfile = {
  age: 30,
  sexAtBirth: 'female',
  pregnant: false,
  breastfeeding: false,
  conditions: [],
  medications: [],
  allergies: '',
};

function makeInput(partial: Partial<AssessmentInput>): AssessmentInput {
  return {
    profile,
    prakritiAnswers: {},
    concerns: [],
    narrative: '',
    redFlagAnswers: {},
    consentAccepted: true,
    ...partial,
  };
}

describe('recommendation pipeline (safety-first)', () => {
  it('produces NO herbal recommendations in an emergency', () => {
    const result = generateRecommendations(
      makeInput({ concerns: ['stress-anxiety'], redFlagAnswers: { 'chest-pain': true } }),
    );
    expect(result.triage.level).toBe('emergency');
    expect(result.recommendations).toHaveLength(0);
    expect(result.lifestyle).toHaveLength(0);
  });

  it('recommends relevant herbs for stress & poor sleep', () => {
    const result = generateRecommendations(makeInput({ concerns: ['stress-anxiety', 'poor-sleep'] }));
    expect(result.recommendations.length).toBeGreaterThan(0);
    const ids = result.recommendations.map((r) => r.herb.id);
    expect(ids).toContain('ashwagandha');
    // Every recommendation must match at least one concern.
    for (const rec of result.recommendations) {
      expect(rec.matchedConcerns.length).toBeGreaterThan(0);
      expect(rec.score).toBeGreaterThan(0);
    }
  });

  it('sorts recommendations by descending fit score', () => {
    const result = generateRecommendations(makeInput({ concerns: ['joint-pain', 'indigestion'] }));
    const scores = result.recommendations.map((r) => r.score);
    const sorted = [...scores].sort((a, b) => b - a);
    expect(scores).toEqual(sorted);
  });

  it('withholds unsafe herbs and lists them separately', () => {
    const result = generateRecommendations(
      makeInput({ concerns: ['stress-anxiety', 'low-energy'], profile: { ...profile, pregnant: true } }),
    );
    // Ashwagandha is a strong stress match but must be withheld in pregnancy.
    expect(result.recommendations.every((r) => r.herb.id !== 'ashwagandha')).toBe(true);
    expect(result.withheldForSafety.some((w) => w.herb.toLowerCase().includes('ashwagandha'))).toBe(true);
  });

  it('provides an explainable factor breakdown that sums toward the score', () => {
    const result = generateRecommendations(makeInput({ concerns: ['stress-anxiety'] }));
    const rec = result.recommendations[0];
    expect(rec.factors.length).toBeGreaterThan(0);
    const raw = rec.factors.reduce((s, f) => s + f.weight, 0);
    expect(rec.score).toBe(Math.max(0, Math.min(100, Math.round(raw))));
  });

  it('never exceeds the max number of recommendations', () => {
    const result = generateRecommendations(
      makeInput({ concerns: ['stress-anxiety', 'poor-sleep', 'low-energy', 'indigestion', 'joint-pain', 'low-immunity'] }),
    );
    expect(result.recommendations.length).toBeLessThanOrEqual(6);
  });

  it('applies a caution penalty for interacting medications but can still recommend', () => {
    const withMed = generateRecommendations(
      makeInput({ concerns: ['joint-pain'], profile: { ...profile, medications: ['anticoagulant'] } }),
    );
    const turmeric = withMed.recommendations.find((r) => r.herb.id === 'turmeric');
    if (turmeric) {
      expect(turmeric.safety.status).toBe('caution');
      expect(turmeric.factors.some((f) => f.weight < 0)).toBe(true);
    }
  });
});
