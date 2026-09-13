import { describe, it, expect } from 'vitest';
import { checkHerbSafety, deriveProfileFlags } from '@/engine/safety';
import { HERB_MAP } from '@/data/herbs';
import type { HealthProfile } from '@/lib/types';

const baseProfile: HealthProfile = {
  age: 35,
  sexAtBirth: 'female',
  pregnant: false,
  breastfeeding: false,
  conditions: [],
  medications: [],
  allergies: '',
};

describe('contraindication & interaction safety gate', () => {
  it('derives pregnancy and child flags from the profile', () => {
    const flags = deriveProfileFlags({ ...baseProfile, pregnant: true, age: 8 });
    expect(flags.has('pregnancy')).toBe(true);
    expect(flags.has('child')).toBe(true);
  });

  it('blocks ashwagandha in pregnancy (avoid contraindication)', () => {
    const res = checkHerbSafety(HERB_MAP.ashwagandha, { ...baseProfile, pregnant: true });
    expect(res.status).toBe('blocked');
    expect(res.contraindications.some((c) => c.flag === 'pregnancy')).toBe(true);
  });

  it('blocks licorice with diuretics (severe interaction)', () => {
    const res = checkHerbSafety(HERB_MAP.licorice, { ...baseProfile, medications: ['diuretic'] });
    expect(res.status).toBe('blocked');
    expect(res.interactions.some((i) => i.severity === 'severe')).toBe(true);
  });

  it('blocks licorice for people with hypertension (avoid)', () => {
    const res = checkHerbSafety(HERB_MAP.licorice, { ...baseProfile, conditions: ['hypertension'] });
    expect(res.status).toBe('blocked');
  });

  it('flags turmeric as caution with anticoagulants (moderate interaction)', () => {
    const res = checkHerbSafety(HERB_MAP.turmeric, { ...baseProfile, medications: ['anticoagulant'] });
    expect(res.status).toBe('caution');
    expect(res.interactions.length).toBeGreaterThan(0);
  });

  it('blocks guduchi for autoimmune conditions and liver disease', () => {
    expect(checkHerbSafety(HERB_MAP.guduchi, { ...baseProfile, conditions: ['autoimmune'] }).status).toBe('blocked');
    expect(checkHerbSafety(HERB_MAP.guduchi, { ...baseProfile, conditions: ['liver-disease'] }).status).toBe('blocked');
  });

  it('returns ok when nothing matches', () => {
    const res = checkHerbSafety(HERB_MAP.fennel, baseProfile);
    expect(res.status).toBe('ok');
    expect(res.contraindications).toHaveLength(0);
    expect(res.interactions).toHaveLength(0);
  });

  it('blocks neem for children (neem oil toxicity)', () => {
    const res = checkHerbSafety(HERB_MAP.neem, { ...baseProfile, age: 4 });
    expect(res.status).toBe('blocked');
  });
});
