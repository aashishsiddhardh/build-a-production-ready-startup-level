import type { ChatMessage } from '@/lib/types';
import { retrieve } from './retrieval';
import { runTriage } from './triage';
import { HERB_MAP } from '@/data/herbs';
import { EVIDENCE_META } from '@/lib/types';
import { uid } from '@/lib/id';
import { SAFETY_DISCLAIMER } from '@/lib/constants';

/**
 * Detect intent to stop / replace prescribed medication. We look for a
 * "stop-like" verb AND a medication noun anywhere in the message (robust to
 * word order and intervening words like "my"), plus a few fixed phrases.
 */
const MED_STOP_VERBS = /\b(stop|stopping|quit|quitting|skip|skipping|discontinue|ditch|swap|replace|replacing)\b/i;
const MED_STOP_OFF = /\b(come|get|go)\s+off\b/i;
const MED_NOUNS =
  /\b(medications?|meds|medicine|medicines|pills?|drugs?|insulin|statins?|metformin|prescriptions?|chemo|chemotherapy|doses?|tablets?|antidepressants?|blood ?thinners?)\b/i;
const MED_INSTEAD = /\binstead of (my |the )?(medication|medicine|doctor|chemo|insulin|treatment|meds)\b/i;

function wantsToStopMedication(message: string): boolean {
  if (MED_INSTEAD.test(message)) return true;
  const hasNoun = MED_NOUNS.test(message);
  return hasNoun && (MED_STOP_VERBS.test(message) || MED_STOP_OFF.test(message));
}

const CURE_PATTERNS = [/\bcure\b/i, /\bcures\b/i, /permanently fix/i, /get rid of .* forever/i];
const DIAGNOSE_PATTERNS = [/what disease/i, /do i have/i, /diagnose/i, /what'?s wrong with me/i];

export interface AssistantContext {
  /** Optional first-name for a warmer tone. */
  userName?: string | null;
}

/**
 * Compose an assistant reply.
 *
 * Guardrails run BEFORE any content generation and can fully short-circuit the
 * response. Only after they pass do we retrieve from the knowledge base and
 * compose a grounded, cited answer. The composer never diagnoses, never claims
 * cures, and never invents citations — it only cites herbs actually retrieved.
 */
export function generateAssistantReply(message: string, _ctx: AssistantContext = {}): ChatMessage {
  const now = new Date().toISOString();

  // --- Guardrail 1: emergency triage on the raw message ---------------------
  const triage = runTriage({ redFlagAnswers: {}, narrative: message });
  if (triage.level === 'emergency') {
    const advice = triage.matchedFlags.map((f) => `• ${f.advice}`).join('\n');
    return {
      id: uid('msg'),
      role: 'assistant',
      content:
        `This sounds like it could be a medical emergency, so I can’t offer wellness suggestions here.\n\n${advice}\n\n` +
        `Please contact your local emergency number or go to the nearest emergency department right now. Your safety comes first.`,
      ts: now,
      safetyBanner: 'emergency',
    };
  }

  // --- Guardrail 2: never advise stopping/altering medication ---------------
  if (wantsToStopMedication(message)) {
    return {
      id: uid('msg'),
      role: 'assistant',
      content:
        `I’m not able to advise stopping, skipping, or replacing any prescribed medication — doing so can be dangerous.\n\n` +
        `Please keep taking your medication as prescribed and talk with the clinician who prescribed it before making any change. ` +
        `If you’d like, I can share general Ayurvedic wellness practices that people sometimes use *alongside* conventional care, with your doctor’s awareness.`,
      ts: now,
      safetyBanner: 'medication',
    };
  }

  // --- Guardrail 3: reframe diagnosis / cure requests -----------------------
  const wantsDiagnosis = DIAGNOSE_PATTERNS.some((re) => re.test(message));
  const wantsCure = CURE_PATTERNS.some((re) => re.test(message));

  // --- Retrieval-augmented, grounded composition ----------------------------
  const chunks = retrieve(message, 5);

  const preface: string[] = [];
  if (wantsDiagnosis) {
    preface.push(
      'I can’t diagnose conditions or tell you what’s wrong — that needs a licensed clinician. What I can do is share general Ayurvedic wellness information.',
    );
  }
  if (wantsCure) {
    preface.push(
      'A quick note on language: Ayurveda offers supportive wellness practices, but I can’t promise that any herb will cure a condition.',
    );
  }

  if (chunks.length === 0) {
    return {
      id: uid('msg'),
      role: 'assistant',
      content:
        (preface.length ? preface.join('\n\n') + '\n\n' : '') +
        `I don’t have specific knowledge-base information matching that. If you describe how you’re feeling (for example: sleep, digestion, stress, energy), I can point you to relevant herbs and lifestyle practices — or you can take the full assessment for personalized, safety-checked suggestions.`,
      ts: now,
      safetyBanner: 'general',
    };
  }

  // Group retrieved chunks by herb and take the strongest 2–3 herbs.
  const byHerb = new Map<string, number>();
  for (const c of chunks) byHerb.set(c.herbId, Math.max(byHerb.get(c.herbId) ?? 0, c.score));
  const topHerbs = [...byHerb.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([id]) => id);

  const lines: string[] = [];
  if (preface.length) lines.push(preface.join('\n\n'));
  lines.push('Here’s what the AyurSage knowledge base has that’s relevant:');

  const citations: { label: string; herbId?: string }[] = [];
  for (const herbId of topHerbs) {
    const herb = HERB_MAP[herbId];
    if (!herb) continue;
    const ev = EVIDENCE_META[herb.evidence];
    const safety = herb.contraindications.length
      ? ` Use caution if any of these apply to you: ${herb.contraindications.map((c) => c.flag.replace(/-/g, ' ')).join(', ')}.`
      : '';
    lines.push(
      `\n**${herb.commonName}** (${herb.latinName}) — ${herb.summary} Evidence: ${ev.label}.${safety}`,
    );
    citations.push({ label: `${herb.commonName} · ${ev.label}`, herbId: herb.id });
  }

  lines.push(
    `\nThese are general educational notes, not personalized medical advice. For suggestions filtered against your health profile and medications, take the guided assessment.`,
  );

  return {
    id: uid('msg'),
    role: 'assistant',
    content: lines.join('\n'),
    ts: now,
    citations,
    safetyBanner: 'general',
  };
}

export const ASSISTANT_STARTERS = [
  'What can help me wind down and sleep better?',
  'I feel bloated after meals — any gentle ideas?',
  'Which herbs support focus and a calm mind?',
  'What does “evidence level” mean here?',
];

export { SAFETY_DISCLAIMER };
