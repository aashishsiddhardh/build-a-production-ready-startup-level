import { describe, it, expect } from 'vitest';
import { runTriage } from '@/engine/triage';

describe('emergency triage (deterministic safety)', () => {
  it('returns self-care with no flags', () => {
    const res = runTriage({ redFlagAnswers: {}, narrative: 'I feel a bit tired and bloated.' });
    expect(res.level).toBe('self-care');
    expect(res.blockRecommendations).toBe(false);
  });

  it('flags an explicit chest-pain answer as an emergency and blocks recommendations', () => {
    const res = runTriage({ redFlagAnswers: { 'chest-pain': true }, narrative: '' });
    expect(res.level).toBe('emergency');
    expect(res.blockRecommendations).toBe(true);
    expect(res.matchedFlags.some((f) => f.id === 'chest-pain')).toBe(true);
  });

  it('detects emergency keywords in free text', () => {
    const res = runTriage({ redFlagAnswers: {}, narrative: 'I have crushing chest pain and shortness of breath' });
    expect(res.level).toBe('emergency');
    expect(res.blockRecommendations).toBe(true);
  });

  it('detects self-harm language and routes to crisis support', () => {
    const res = runTriage({ redFlagAnswers: {}, narrative: 'I want to end my life' });
    expect(res.level).toBe('emergency');
    expect(res.blockRecommendations).toBe(true);
  });

  it('treats persistent/worsening symptoms as urgent and still blocks herbs', () => {
    const res = runTriage({ redFlagAnswers: { persistent: true }, narrative: '' });
    expect(res.level).toBe('urgent');
    expect(res.blockRecommendations).toBe(true);
  });

  it('does not downgrade an emergency when both urgent and emergency match', () => {
    const res = runTriage({ redFlagAnswers: { persistent: true, 'chest-pain': true }, narrative: '' });
    expect(res.level).toBe('emergency');
  });

  it('is case-insensitive for keyword detection', () => {
    const res = runTriage({ redFlagAnswers: {}, narrative: 'SUDDEN FACE DROOP and SLURRED SPEECH' });
    expect(res.level).toBe('emergency');
  });

  it('does not false-positive on benign wellness text', () => {
    const res = runTriage({
      redFlagAnswers: { 'chest-pain': false, breathing: false },
      narrative: 'I want better sleep and more energy in the mornings.',
    });
    expect(res.level).toBe('self-care');
  });
});
