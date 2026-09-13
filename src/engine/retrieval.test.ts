import { describe, it, expect } from 'vitest';
import { retrieve, tokenize } from '@/engine/retrieval';

describe('in-browser vector store (RAG retrieval)', () => {
  it('tokenizes and drops stopwords', () => {
    const tokens = tokenize('The herb is used for stress and sleep');
    expect(tokens).not.toContain('the');
    expect(tokens).not.toContain('for');
    expect(tokens.length).toBeGreaterThan(0);
  });

  it('retrieves ashwagandha for a stress/sleep query', () => {
    const results = retrieve('I am stressed and cannot sleep', 5);
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((r) => r.herbId === 'ashwagandha')).toBe(true);
  });

  it('retrieves ginger or fennel for digestion/nausea queries', () => {
    const results = retrieve('nausea and bloating after eating', 5);
    const herbIds = results.map((r) => r.herbId);
    expect(herbIds.some((id) => ['ginger', 'fennel', 'triphala', 'amla'].includes(id))).toBe(true);
  });

  it('returns results ordered by descending similarity score', () => {
    const results = retrieve('joint pain and stiffness', 6);
    const scores = results.map((r) => r.score);
    expect(scores).toEqual([...scores].sort((a, b) => b - a));
  });

  it('returns an empty array for meaningless queries', () => {
    expect(retrieve('', 4)).toHaveLength(0);
    expect(retrieve('!!!', 4)).toHaveLength(0);
  });
});
