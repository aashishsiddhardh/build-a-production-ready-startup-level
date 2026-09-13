import type { Dosha } from '@/lib/types';

/**
 * Concern taxonomy. These are wellness concerns (not diagnoses). Each maps to
 * the dosha most classically associated with it, which the deterministic
 * recommender uses as one scoring signal.
 */
export interface Concern {
  id: string;
  label: string;
  group: 'mind' | 'sleep' | 'energy' | 'digestion' | 'joints' | 'immunity' | 'skin' | 'metabolic' | 'respiratory' | 'womens';
  associatedDosha: Dosha | null;
  description: string;
  /** Keywords help the free-text parser map a narrative onto concerns. */
  keywords: string[];
}

export const CONCERNS: Concern[] = [
  {
    id: 'stress-anxiety',
    label: 'Stress & anxiety',
    group: 'mind',
    associatedDosha: 'vata',
    description: 'Feeling wired, worried, restless or overwhelmed.',
    keywords: ['stress', 'anxiety', 'anxious', 'worried', 'overwhelmed', 'nervous', 'panic', 'tense', 'restless'],
  },
  {
    id: 'poor-sleep',
    label: 'Poor sleep',
    group: 'sleep',
    associatedDosha: 'vata',
    description: 'Difficulty falling or staying asleep, light or unrefreshing sleep.',
    keywords: ['sleep', 'insomnia', 'awake', 'cant sleep', 'wakeful', 'restless nights', 'tossing'],
  },
  {
    id: 'low-energy',
    label: 'Low energy & fatigue',
    group: 'energy',
    associatedDosha: 'kapha',
    description: 'Persistent tiredness, sluggishness or low stamina.',
    keywords: ['tired', 'fatigue', 'exhausted', 'lethargy', 'sluggish', 'no energy', 'burnout', 'weak'],
  },
  {
    id: 'brain-fog',
    label: 'Memory & focus',
    group: 'mind',
    associatedDosha: 'vata',
    description: 'Difficulty concentrating, forgetfulness or mental cloudiness.',
    keywords: ['focus', 'memory', 'concentration', 'brain fog', 'forgetful', 'foggy', 'distracted'],
  },
  {
    id: 'low-mood',
    label: 'Low mood',
    group: 'mind',
    associatedDosha: 'kapha',
    description: 'Feeling flat, unmotivated or heavy in mood (non-clinical).',
    keywords: ['mood', 'sad', 'down', 'unmotivated', 'flat', 'heavy'],
  },
  {
    id: 'indigestion',
    label: 'Indigestion & bloating',
    group: 'digestion',
    associatedDosha: 'vata',
    description: 'Bloating, gas, irregular digestion or discomfort after meals.',
    keywords: ['bloating', 'bloated', 'gas', 'indigestion', 'digestion', 'stomach', 'cramp', 'flatulence'],
  },
  {
    id: 'constipation',
    label: 'Constipation',
    group: 'digestion',
    associatedDosha: 'vata',
    description: 'Infrequent, hard or difficult bowel movements.',
    keywords: ['constipation', 'constipated', 'irregular', 'hard stool', 'bowel'],
  },
  {
    id: 'acid-reflux',
    label: 'Acidity & reflux',
    group: 'digestion',
    associatedDosha: 'pitta',
    description: 'Heartburn, sour stomach or burning sensation.',
    keywords: ['acidity', 'acid', 'reflux', 'heartburn', 'sour', 'burning stomach', 'gerd'],
  },
  {
    id: 'joint-pain',
    label: 'Joint stiffness',
    group: 'joints',
    associatedDosha: 'vata',
    description: 'Aching, stiff or creaky joints (non-emergency, chronic pattern).',
    keywords: ['joint', 'stiff', 'stiffness', 'arthritis', 'ache', 'knee', 'creaky'],
  },
  {
    id: 'low-immunity',
    label: 'Low immunity',
    group: 'immunity',
    associatedDosha: 'kapha',
    description: 'Frequent colds, slow recovery or seasonal susceptibility.',
    keywords: ['immunity', 'immune', 'cold', 'colds', 'infection', 'recovery', 'seasonal'],
  },
  {
    id: 'cough-congestion',
    label: 'Cough & congestion',
    group: 'respiratory',
    associatedDosha: 'kapha',
    description: 'Mild cough, chest heaviness or nasal congestion (non-acute).',
    keywords: ['cough', 'congestion', 'phlegm', 'mucus', 'chest', 'sinus', 'blocked nose'],
  },
  {
    id: 'skin-issues',
    label: 'Skin balance',
    group: 'skin',
    associatedDosha: 'pitta',
    description: 'Dull, blemish-prone or irritated skin (cosmetic, non-acute).',
    keywords: ['skin', 'acne', 'pimple', 'rash', 'blemish', 'dull', 'complexion', 'eczema'],
  },
  {
    id: 'blood-sugar',
    label: 'Blood sugar support',
    group: 'metabolic',
    associatedDosha: 'kapha',
    description: 'Interest in metabolic and glucose-balance support (not a diabetes treatment).',
    keywords: ['sugar', 'glucose', 'metabolic', 'glycemic', 'prediabetes'],
  },
  {
    id: 'cholesterol',
    label: 'Cholesterol & lipids',
    group: 'metabolic',
    associatedDosha: 'kapha',
    description: 'Interest in healthy lipid balance (not a substitute for medication).',
    keywords: ['cholesterol', 'lipids', 'triglycerides', 'heart health'],
  },
  {
    id: 'fluid-retention',
    label: 'Fluid balance',
    group: 'metabolic',
    associatedDosha: 'kapha',
    description: 'Mild puffiness or water retention (non-acute).',
    keywords: ['water retention', 'puffy', 'swelling', 'bloat', 'fluid'],
  },
  {
    id: 'womens-wellness',
    label: "Women's wellness",
    group: 'womens',
    associatedDosha: 'vata',
    description: 'General reproductive and cycle wellness support.',
    keywords: ['period', 'menstrual', 'cycle', 'pms', 'womens', 'menopause', 'hormonal'],
  },
  {
    id: 'headache',
    label: 'Tension headaches',
    group: 'mind',
    associatedDosha: 'pitta',
    description: 'Occasional tension-type headaches (non-acute, non-severe).',
    keywords: ['headache', 'migraine', 'head pain', 'tension head'],
  },
];

export const CONCERN_MAP: Record<string, Concern> = Object.fromEntries(
  CONCERNS.map((c) => [c.id, c]),
);
