import type {
  SymptomOption,
  HealthConditionOption,
  MedicationOption,
  Dosha,
} from '@/types'

// ── Structured symptom checklist (grouped by body system) ────────────────────
export const SYMPTOMS: SymptomOption[] = [
  // Digestive
  { key: 'indigestion', label: 'Indigestion / bloating', system: 'Digestive' },
  { key: 'constipation', label: 'Constipation', system: 'Digestive' },
  { key: 'loose_stools', label: 'Loose stools', system: 'Digestive' },
  { key: 'acidity', label: 'Acidity / heartburn', system: 'Digestive' },
  { key: 'low_appetite', label: 'Low appetite', system: 'Digestive' },
  { key: 'nausea', label: 'Mild nausea', system: 'Digestive' },
  // Sleep & mind
  { key: 'insomnia', label: 'Difficulty sleeping', system: 'Sleep & Mind' },
  { key: 'stress', label: 'Stress / feeling overwhelmed', system: 'Sleep & Mind' },
  { key: 'anxiety', label: 'Mild anxiety / restlessness', system: 'Sleep & Mind' },
  { key: 'low_mood', label: 'Low mood', system: 'Sleep & Mind' },
  { key: 'brain_fog', label: 'Poor focus / brain fog', system: 'Sleep & Mind' },
  { key: 'fatigue', label: 'Low energy / fatigue', system: 'Sleep & Mind' },
  // Respiratory
  { key: 'cough', label: 'Mild cough', system: 'Respiratory' },
  { key: 'congestion', label: 'Nasal congestion', system: 'Respiratory' },
  { key: 'sore_throat', label: 'Sore throat', system: 'Respiratory' },
  { key: 'seasonal_allergy', label: 'Seasonal allergies', system: 'Respiratory' },
  // Musculoskeletal
  { key: 'joint_stiffness', label: 'Joint stiffness', system: 'Musculoskeletal' },
  { key: 'muscle_ache', label: 'Muscle aches', system: 'Musculoskeletal' },
  { key: 'back_discomfort', label: 'Mild back discomfort', system: 'Musculoskeletal' },
  // Skin
  { key: 'dry_skin', label: 'Dry skin', system: 'Skin' },
  { key: 'skin_breakouts', label: 'Skin breakouts', system: 'Skin' },
  // Metabolic / general
  { key: 'sugar_cravings', label: 'Sugar cravings', system: 'Metabolic' },
  { key: 'water_retention', label: 'Water retention / heaviness', system: 'Metabolic' },
  { key: 'low_immunity', label: 'Frequent minor colds', system: 'Immune' },
  { key: 'headache_tension', label: 'Tension headache', system: 'Neurological' },
  // Reproductive / hormonal (non-emergency)
  { key: 'menstrual_cramps', label: 'Menstrual cramps', system: 'Hormonal' },
  { key: 'hot_flashes', label: 'Hot flashes', system: 'Hormonal' },
]

// ── Health conditions (drive deterministic contraindication checks) ──────────
export const HEALTH_CONDITIONS: HealthConditionOption[] = [
  { key: 'hypertension', label: 'High blood pressure' },
  { key: 'hypotension', label: 'Low blood pressure' },
  { key: 'diabetes', label: 'Diabetes', note: 'Some herbs can lower blood sugar.' },
  { key: 'thyroid', label: 'Thyroid disorder' },
  { key: 'liver_disease', label: 'Liver disease' },
  { key: 'kidney_disease', label: 'Kidney disease' },
  { key: 'bleeding_disorder', label: 'Bleeding disorder' },
  { key: 'gallstones', label: 'Gallstones / bile duct issues' },
  { key: 'gerd', label: 'GERD / peptic ulcer' },
  { key: 'autoimmune', label: 'Autoimmune condition' },
  { key: 'heart_disease', label: 'Heart disease' },
  { key: 'seizure', label: 'Seizure disorder' },
  { key: 'surgery_2w', label: 'Surgery scheduled within 2 weeks' },
  { key: 'iron_deficiency', label: 'Iron-deficiency anemia' },
  { key: 'breastfeeding', label: 'Breastfeeding' },
]

// ── Medications (mapped to interaction classes) ──────────────────────────────
export const MEDICATIONS: MedicationOption[] = [
  { key: 'warfarin', label: 'Warfarin / blood thinner', drugClassKeys: ['anticoagulant'] },
  { key: 'aspirin', label: 'Aspirin / antiplatelet', drugClassKeys: ['anticoagulant'] },
  { key: 'insulin', label: 'Insulin', drugClassKeys: ['antidiabetic'] },
  { key: 'metformin', label: 'Metformin / oral diabetes med', drugClassKeys: ['antidiabetic'] },
  { key: 'antihypertensive', label: 'Blood pressure medication', drugClassKeys: ['antihypertensive'] },
  { key: 'thyroid_med', label: 'Thyroid medication', drugClassKeys: ['thyroid'] },
  { key: 'sedative', label: 'Sedative / sleep medication', drugClassKeys: ['sedative', 'cns_depressant'] },
  { key: 'antidepressant', label: 'Antidepressant (SSRI/SNRI)', drugClassKeys: ['serotonergic'] },
  { key: 'immunosuppressant', label: 'Immunosuppressant', drugClassKeys: ['immunosuppressant'] },
  { key: 'chemotherapy', label: 'Chemotherapy', drugClassKeys: ['immunosuppressant', 'narrow_therapeutic'] },
  { key: 'antiepileptic', label: 'Anti-seizure medication', drugClassKeys: ['cns_depressant', 'narrow_therapeutic'] },
  { key: 'lithium', label: 'Lithium', drugClassKeys: ['narrow_therapeutic', 'diuretic_sensitive'] },
  { key: 'digoxin', label: 'Digoxin', drugClassKeys: ['narrow_therapeutic'] },
  { key: 'oral_contraceptive', label: 'Oral contraceptive', drugClassKeys: ['hormonal'] },
]

// ── Wellness goals ───────────────────────────────────────────────────────────
export const WELLNESS_GOALS: { key: string; label: string }[] = [
  { key: 'better_sleep', label: 'Sleep better' },
  { key: 'digestion', label: 'Improve digestion' },
  { key: 'stress_resilience', label: 'Manage everyday stress' },
  { key: 'energy', label: 'More steady energy' },
  { key: 'immunity', label: 'Support immunity' },
  { key: 'focus', label: 'Sharper focus' },
  { key: 'skin', label: 'Healthier skin' },
  { key: 'joint_comfort', label: 'Joint comfort' },
]

export const DOSHA_LABELS: Record<Dosha, { name: string; element: string; blurb: string }> = {
  vata: {
    name: 'Vata',
    element: 'Air + Ether',
    blurb: 'Movement, creativity, and change. Tends toward dryness, cold, and irregularity when aggravated.',
  },
  pitta: {
    name: 'Pitta',
    element: 'Fire + Water',
    blurb: 'Transformation, drive, and metabolism. Tends toward heat, intensity, and inflammation when aggravated.',
  },
  kapha: {
    name: 'Kapha',
    element: 'Earth + Water',
    blurb: 'Structure, stability, and lubrication. Tends toward heaviness, congestion, and sluggishness when aggravated.',
  },
}
