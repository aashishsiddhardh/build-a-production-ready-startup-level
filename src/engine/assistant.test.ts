import { describe, it, expect } from 'vitest';
import { generateAssistantReply } from '@/engine/assistant';

describe('assistant safety guardrails', () => {
  it('short-circuits on emergencies without giving herbal advice', () => {
    const reply = generateAssistantReply('I have severe chest pain radiating to my arm');
    expect(reply.safetyBanner).toBe('emergency');
    expect(reply.content.toLowerCase()).toContain('emergency');
    expect(reply.citations).toBeUndefined();
  });

  it('refuses to advise stopping prescribed medication', () => {
    const reply = generateAssistantReply('Should I stop taking my metformin and use herbs instead?');
    expect(reply.safetyBanner).toBe('medication');
    expect(reply.content.toLowerCase()).toContain('prescribed');
    expect(reply.content.toLowerCase()).not.toContain('yes, stop');
  });

  it('reframes cure-seeking language', () => {
    const reply = generateAssistantReply('what herb will cure my anxiety forever');
    expect(reply.content.toLowerCase()).toContain('cure');
  });

  it('reframes diagnosis requests', () => {
    const reply = generateAssistantReply('what disease do I have if I feel tired');
    expect(reply.content.toLowerCase()).toContain('diagnose');
  });

  it('answers benign wellness questions with grounded, cited content', () => {
    const reply = generateAssistantReply('what can help me wind down and sleep better');
    expect(reply.role).toBe('assistant');
    expect(reply.content.length).toBeGreaterThan(0);
    expect(Array.isArray(reply.citations)).toBe(true);
  });
});
