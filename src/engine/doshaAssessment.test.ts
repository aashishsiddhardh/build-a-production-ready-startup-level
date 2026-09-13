import { describe, it, expect } from 'vitest';
import { analyzeDosha } from '@/engine/doshaAssessment';

describe('dosha analysis', () => {
  it('defaults to a balanced tridoshic profile with no answers', () => {
    const res = analyzeDosha({}, []);
    expect(res.prakriti.vata + res.prakriti.pitta + res.prakriti.kapha).toBeGreaterThanOrEqual(99);
    expect(res.imbalance).toBeNull();
  });

  it('identifies the dominant dosha from answers', () => {
    const res = analyzeDosha({ frame: 'vata', skin: 'vata', appetite: 'pitta' }, []);
    expect(res.dominantDosha).toBe('vata');
    expect(res.prakriti.vata).toBeGreaterThan(res.prakriti.kapha);
  });

  it('infers the current imbalance from concerns', () => {
    // acid-reflux + skin-issues are pitta-associated.
    const res = analyzeDosha({}, ['acid-reflux', 'skin-issues']);
    expect(res.imbalance).toBe('pitta');
  });

  it('normalizes prakriti percentages to roughly 100', () => {
    const res = analyzeDosha({ frame: 'kapha', skin: 'kapha', appetite: 'vata', sleep: 'pitta' }, []);
    const total = res.prakriti.vata + res.prakriti.pitta + res.prakriti.kapha;
    expect(total).toBeGreaterThanOrEqual(99);
    expect(total).toBeLessThanOrEqual(101);
  });
});
