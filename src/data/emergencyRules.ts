import type { RedFlagRule } from '@/types'

// ─────────────────────────────────────────────────────────────────────────────
// Deterministic emergency triage rules.
//
// These are intentionally conservative. If ANY emergency rule matches, the
// system withholds all Ayurvedic recommendations and shows escalation guidance.
// This layer is pure data + exact matching — no AI, no probabilities.
//
// Triggers are matched against (a) structured red-flag checkboxes the user ticks
// and (b) normalised keywords extracted from free text / assistant messages.
// ─────────────────────────────────────────────────────────────────────────────

export const RED_FLAG_RULES: RedFlagRule[] = [
  {
    id: 'cardiac',
    level: 'emergency',
    title: 'Possible cardiac emergency',
    triggers: [
      'chest pain',
      'chest pressure',
      'chest tightness',
      'pain radiating to arm',
      'pain radiating to jaw',
      'crushing chest',
    ],
    guidance:
      'Chest pain or pressure can signal a heart attack. Call your local emergency number now. Do not wait and do not use herbal remedies.',
  },
  {
    id: 'stroke',
    level: 'emergency',
    title: 'Possible stroke (FAST)',
    triggers: [
      'face drooping',
      'slurred speech',
      'sudden weakness',
      'one-sided weakness',
      'sudden numbness',
      'sudden confusion',
      'sudden vision loss',
      'trouble speaking',
    ],
    guidance:
      'Sudden face drooping, arm weakness, or speech difficulty may indicate a stroke. Call emergency services immediately — every minute matters.',
  },
  {
    id: 'breathing',
    level: 'emergency',
    title: 'Severe breathing difficulty',
    triggers: [
      'difficulty breathing',
      'shortness of breath at rest',
      'cannot breathe',
      'gasping',
      'blue lips',
      'choking',
    ],
    guidance:
      'Severe difficulty breathing is a medical emergency. Call emergency services now. If prescribed a rescue inhaler or epinephrine, use it as directed.',
  },
  {
    id: 'anaphylaxis',
    level: 'emergency',
    title: 'Possible severe allergic reaction',
    triggers: ['swelling of throat', 'swelling of tongue', 'anaphylaxis', 'hives all over', 'throat closing'],
    guidance:
      'Throat/tongue swelling with breathing trouble suggests anaphylaxis. Use epinephrine if available and call emergency services immediately.',
  },
  {
    id: 'bleeding',
    level: 'emergency',
    title: 'Severe or uncontrolled bleeding',
    triggers: ['severe bleeding', 'uncontrolled bleeding', 'vomiting blood', 'coughing blood', 'blood in stool black'],
    guidance:
      'Heavy or uncontrolled bleeding, or vomiting/coughing blood, needs emergency care. Call emergency services now.',
  },
  {
    id: 'neuro',
    level: 'emergency',
    title: 'Serious neurological signs',
    triggers: [
      'worst headache of my life',
      'sudden severe headache',
      'seizure',
      'loss of consciousness',
      'fainting',
      'unresponsive',
      'stiff neck with fever',
    ],
    guidance:
      'A sudden “worst-ever” headache, seizure, fainting, or fever with a stiff neck needs urgent evaluation. Call emergency services.',
  },
  {
    id: 'abdomen',
    level: 'emergency',
    title: 'Severe abdominal pain',
    triggers: ['severe abdominal pain', 'rigid abdomen', 'severe stomach pain'],
    guidance:
      'Sudden severe abdominal pain, especially with a rigid abdomen, can be a surgical emergency. Seek urgent medical care.',
  },
  {
    id: 'mental_health',
    level: 'emergency',
    title: 'Thoughts of self-harm',
    triggers: [
      'suicidal',
      'want to die',
      'kill myself',
      'end my life',
      'self harm',
      'hurt myself',
      'no reason to live',
    ],
    guidance:
      'You deserve immediate support. Please contact a suicide & crisis line now (in the US/Canada dial 988), or your local emergency number. You are not alone.',
  },
  {
    id: 'pregnancy_emergency',
    level: 'emergency',
    title: 'Pregnancy warning signs',
    triggers: ['heavy vaginal bleeding', 'severe pregnancy pain', 'no fetal movement', 'water broke early'],
    guidance:
      'Heavy bleeding or severe pain in pregnancy needs emergency care. Contact your obstetric provider or emergency services now.',
  },
  {
    id: 'infection_urgent',
    level: 'urgent',
    title: 'Signs of serious infection',
    triggers: ['high fever', 'fever above 103', 'persistent high fever', 'shaking chills', 'confusion with fever'],
    guidance:
      'A high or persistent fever, especially with confusion or shaking chills, should be evaluated by a clinician promptly (same day).',
  },
  {
    id: 'dehydration_urgent',
    level: 'urgent',
    title: 'Possible significant dehydration',
    triggers: ['cannot keep fluids down', 'no urination', 'severe dizziness standing'],
    guidance:
      'Inability to keep fluids down or very reduced urination can mean dehydration. Please seek prompt medical care.',
  },
]

/** Keywords that indicate the person is a child/infant — we route these to a clinician. */
export const PEDIATRIC_KEYWORDS = ['my baby', 'my infant', 'newborn', 'toddler', 'my child']
