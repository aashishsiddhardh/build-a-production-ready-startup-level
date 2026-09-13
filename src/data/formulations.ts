import type { Formulation } from '@/types'

// ─────────────────────────────────────────────────────────────────────────────
// Classic multi-herb formulations. Included for knowledge-base browsing and
// retrieval; the recommendation engine surfaces single herbs first for clarity,
// and formulations as "traditional combinations to discuss with a practitioner".
// ─────────────────────────────────────────────────────────────────────────────

export const FORMULATIONS: Formulation[] = [
  {
    id: 'triphala_churna',
    name: 'Triphala Churna',
    sanskrit: 'Triphala',
    type: 'Churna (powder)',
    summary:
      'The classic three-fruit blend of Amalaki, Bibhitaki, and Haritaki — a tridoshic tonic for gentle elimination and daily rejuvenation.',
    herbIds: ['triphala', 'amla'],
    indications: ['constipation', 'indigestion', 'skin_breakouts', 'low_appetite'],
    doshaEffect: { vata: 'neutral', pitta: 'decrease', kapha: 'decrease' },
    evidenceLevel: 'preliminary',
    evidenceNote: 'Small human studies for regularity and oral health; extensive traditional use.',
    contraindications: ['loose_stools'],
    drugInteractions: [
      { drugClass: 'Narrow-therapeutic-index drugs', drugClassKey: 'narrow_therapeutic', severity: 'info', mechanism: 'Laxative effect may alter absorption; separate dosing by 2+ hours.' },
    ],
    pregnancy: 'caution',
    safetyNotes: 'Begin with a small dose to gauge bowel response.',
  },
  {
    id: 'chyawanprash',
    name: 'Chyawanprash',
    sanskrit: 'Chyawanprash',
    type: 'Rasayana (herbal jam)',
    summary:
      'An Amalaki-based rejuvenative jam traditionally taken in cooler months to support immunity, energy, and the respiratory tract.',
    herbIds: ['amla', 'cardamom', 'ginger'],
    indications: ['low_immunity', 'fatigue', 'cough', 'congestion'],
    doshaEffect: { vata: 'decrease', pitta: 'neutral', kapha: 'increase' },
    evidenceLevel: 'preliminary',
    evidenceNote: 'Traditional tonic with limited small human studies on immune and quality-of-life measures.',
    contraindications: ['diabetes'],
    drugInteractions: [
      { drugClass: 'Antidiabetic medication', drugClassKey: 'antidiabetic', severity: 'caution', mechanism: 'Contains sugar/honey base — monitor blood glucose.' },
    ],
    pregnancy: 'caution',
    safetyNotes: 'High sugar content — use caution with diabetes. Typically 1 teaspoon in the morning.',
  },
  {
    id: 'ccf_tea',
    name: 'CCF Tea',
    sanskrit: 'Jiraka–Dhanyaka–Shatapushpa',
    type: 'Herbal tea',
    summary:
      'A simple, tridoshic digestive tea of Cumin, Coriander, and Fennel seeds — gentle enough for daily use to ease bloating.',
    herbIds: ['cumin', 'coriander', 'fennel'],
    indications: ['indigestion', 'water_retention', 'acidity', 'low_appetite'],
    doshaEffect: { vata: 'decrease', pitta: 'decrease', kapha: 'decrease' },
    evidenceLevel: 'traditional',
    evidenceNote: 'Traditional daily digestive; individual seeds have limited supportive studies.',
    contraindications: [],
    drugInteractions: [],
    pregnancy: 'generally-regarded-safe',
    safetyNotes: 'A gentle, everyday option well tolerated by most people.',
  },
  {
    id: 'golden_milk',
    name: 'Golden Milk',
    sanskrit: 'Haridra Kshira',
    type: 'Warm beverage',
    summary:
      'Warm milk (or plant milk) with Turmeric, Ginger, and Cardamom — a soothing evening drink traditionally used for comfort and rest.',
    herbIds: ['turmeric', 'ginger', 'cardamom'],
    indications: ['joint_stiffness', 'muscle_ache', 'insomnia', 'cough'],
    doshaEffect: { vata: 'decrease', pitta: 'neutral', kapha: 'neutral' },
    evidenceLevel: 'preliminary',
    evidenceNote: 'Combines curcumin and ginger, each with some supportive human data; the beverage itself is traditional.',
    contraindications: ['gallstones', 'bleeding_disorder'],
    drugInteractions: [
      { drugClass: 'Anticoagulants / antiplatelets', drugClassKey: 'anticoagulant', severity: 'caution', mechanism: 'Turmeric + ginger may add to blood-thinning at high doses.' },
    ],
    pregnancy: 'caution',
    safetyNotes: 'Use culinary amounts of spices. A pinch of black pepper improves curcumin absorption.',
  },
]

export const FORMULATION_BY_ID: Record<string, Formulation> = Object.fromEntries(
  FORMULATIONS.map((f) => [f.id, f]),
)
