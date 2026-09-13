/**
 * DETERMINISTIC emergency triage rules.
 *
 * This is the single most safety-critical part of the system. It is pure,
 * rule-based logic — NO AI, NO probability. If any emergency rule matches,
 * Ayurvedic recommendations are withheld and the user is directed to
 * appropriate emergency care. AI is never allowed to override these rules.
 */

export interface RedFlagQuestion {
  id: string;
  /** Question shown in the structured emergency screen. */
  prompt: string;
  level: 'emergency' | 'urgent';
  /** When answered "yes", the advice to surface. */
  advice: string;
  label: string;
}

/** Explicit yes/no screening questions asked during every assessment. */
export const RED_FLAG_QUESTIONS: RedFlagQuestion[] = [
  {
    id: 'chest-pain',
    label: 'Chest pain / pressure',
    prompt: 'Are you having chest pain, pressure, or tightness — especially spreading to the arm, jaw, or back, or with sweating or shortness of breath?',
    level: 'emergency',
    advice: 'These can be signs of a heart attack. Call your local emergency number now.',
  },
  {
    id: 'breathing',
    label: 'Difficulty breathing',
    prompt: 'Are you having serious difficulty breathing or shortness of breath at rest?',
    level: 'emergency',
    advice: 'Difficulty breathing is a medical emergency. Seek emergency care immediately.',
  },
  {
    id: 'stroke',
    label: 'Stroke signs',
    prompt: 'Do you have sudden face drooping, arm weakness, numbness on one side, trouble speaking, or sudden vision loss?',
    level: 'emergency',
    advice: 'These are warning signs of a stroke. Every minute matters — call emergency services immediately.',
  },
  {
    id: 'severe-bleeding',
    label: 'Severe bleeding',
    prompt: 'Do you have heavy uncontrolled bleeding, or are you vomiting or coughing up blood?',
    level: 'emergency',
    advice: 'Uncontrolled bleeding requires emergency care now.',
  },
  {
    id: 'anaphylaxis',
    label: 'Severe allergic reaction',
    prompt: 'Do you have swelling of the face, lips, tongue or throat, or hives together with trouble breathing?',
    level: 'emergency',
    advice: 'This may be a severe allergic reaction (anaphylaxis). Use an epinephrine auto-injector if prescribed and call emergency services.',
  },
  {
    id: 'self-harm',
    label: 'Thoughts of self-harm',
    prompt: 'Are you having thoughts of harming yourself or ending your life?',
    level: 'emergency',
    advice: 'You deserve immediate support. Please contact a suicide or crisis helpline in your country, or emergency services, right now. You are not alone.',
  },
  {
    id: 'fainting',
    label: 'Fainting / confusion',
    prompt: 'Have you fainted, or do you have new confusion, a stiff neck with high fever, or a seizure?',
    level: 'emergency',
    advice: 'These symptoms need urgent, in-person evaluation. Seek emergency care.',
  },
  {
    id: 'severe-pain',
    label: 'Sudden severe pain',
    prompt: 'Do you have sudden, severe abdominal, head, or body pain that is the worst you have ever felt?',
    level: 'emergency',
    advice: 'Sudden severe pain needs urgent medical assessment. Seek emergency care.',
  },
  {
    id: 'pregnancy-warning',
    label: 'Pregnancy warning signs',
    prompt: 'If pregnant: do you have heavy bleeding, severe abdominal pain, or severe headache with vision changes?',
    level: 'emergency',
    advice: 'These are pregnancy warning signs. Contact your obstetric provider or emergency services immediately.',
  },
  {
    id: 'persistent',
    label: 'Persistent / worsening symptoms',
    prompt: 'Have your symptoms lasted more than two weeks, or are they steadily getting worse, or do you have unexplained weight loss or blood in stool/urine?',
    level: 'urgent',
    advice: 'Please book an appointment with a licensed clinician soon for a proper evaluation before using wellness herbs.',
  },
];

/**
 * Keyword patterns scanned in the free-text narrative. Regex is intentionally
 * broad — false positives (directing someone to care) are acceptable; false
 * negatives are not.
 */
export interface KeywordRule {
  id: string;
  label: string;
  level: 'emergency' | 'urgent';
  patterns: RegExp[];
  advice: string;
}

export const KEYWORD_RULES: KeywordRule[] = [
  {
    id: 'kw-chest',
    label: 'Chest pain',
    level: 'emergency',
    patterns: [/chest pain/i, /chest tightness/i, /chest pressure/i, /crushing/i, /pain in.*(arm|jaw)/i, /heart attack/i],
    advice: 'Chest pain can signal a heart emergency. Call your local emergency number now.',
  },
  {
    id: 'kw-breathing',
    label: 'Breathing difficulty',
    level: 'emergency',
    patterns: [/can'?t breathe/i, /cannot breathe/i, /short(ness)? of breath/i, /gasping/i, /struggling to breathe/i, /suffocat/i],
    advice: 'Difficulty breathing is an emergency. Seek emergency care immediately.',
  },
  {
    id: 'kw-stroke',
    label: 'Stroke symptoms',
    level: 'emergency',
    patterns: [/face droop/i, /slurred speech/i, /can'?t speak/i, /numb.*(side|arm|face)/i, /sudden.*(weakness|vision loss)/i, /stroke/i],
    advice: 'These may be stroke warning signs. Call emergency services immediately.',
  },
  {
    id: 'kw-selfharm',
    label: 'Self-harm',
    level: 'emergency',
    patterns: [/suicid/i, /kill myself/i, /end my life/i, /harm myself/i, /self.?harm/i, /want to die/i, /no reason to live/i],
    advice: 'Please reach out for immediate help — contact a crisis line or emergency services now. Your life matters.',
  },
  {
    id: 'kw-bleeding',
    label: 'Severe bleeding',
    level: 'emergency',
    patterns: [/coughing up blood/i, /vomiting blood/i, /blood in.*(vomit|stool)/i, /uncontrolled bleeding/i, /bleeding heavily/i],
    advice: 'Bleeding of this kind requires emergency care right now.',
  },
  {
    id: 'kw-anaphylaxis',
    label: 'Allergic reaction',
    level: 'emergency',
    patterns: [/throat.*(swell|closing)/i, /anaphylax/i, /face.*swelling/i, /tongue.*swelling/i],
    advice: 'This may be a severe allergic reaction. Use prescribed epinephrine and call emergency services.',
  },
  {
    id: 'kw-highfever',
    label: 'High fever with red flags',
    level: 'emergency',
    patterns: [/stiff neck/i, /fever.*(confusion|rash|seizure)/i, /very high fever/i, /109|104|105|106/i],
    advice: 'High fever with these signs needs emergency evaluation.',
  },
  {
    id: 'kw-poison',
    label: 'Poisoning / overdose',
    level: 'emergency',
    patterns: [/overdose/i, /poison/i, /swallowed.*(chemical|pills)/i],
    advice: 'Contact your poison control center or emergency services immediately.',
  },
  {
    id: 'kw-persistent',
    label: 'Persistent symptoms',
    level: 'urgent',
    patterns: [/weeks/i, /getting worse/i, /losing weight/i, /unexplained weight/i, /months/i],
    advice: 'Persistent or worsening symptoms should be evaluated by a clinician before using wellness herbs.',
  },
];
