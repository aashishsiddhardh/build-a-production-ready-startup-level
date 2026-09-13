import type { ContraindicationFlag, DrugClass } from '@/lib/types';

export const CONDITION_OPTIONS: { flag: ContraindicationFlag; label: string; hint?: string }[] = [
  { flag: 'hypertension', label: 'High blood pressure' },
  { flag: 'diabetes', label: 'Diabetes' },
  { flag: 'liver-disease', label: 'Liver disease' },
  { flag: 'kidney-disease', label: 'Kidney disease' },
  { flag: 'hyperthyroid', label: 'Overactive thyroid', hint: 'Hyperthyroidism' },
  { flag: 'hypothyroid', label: 'Underactive thyroid', hint: 'Hypothyroidism' },
  { flag: 'autoimmune', label: 'Autoimmune condition' },
  { flag: 'bleeding-disorder', label: 'Bleeding disorder' },
  { flag: 'peptic-ulcer', label: 'Stomach / peptic ulcer' },
  { flag: 'surgery-scheduled', label: 'Surgery scheduled soon' },
];

export const MEDICATION_OPTIONS: { drugClass: DrugClass; label: string; hint?: string }[] = [
  { drugClass: 'anticoagulant', label: 'Blood thinners', hint: 'e.g. warfarin, apixaban' },
  { drugClass: 'antiplatelet', label: 'Antiplatelets', hint: 'e.g. aspirin, clopidogrel' },
  { drugClass: 'antidiabetic', label: 'Diabetes medication', hint: 'e.g. metformin, insulin' },
  { drugClass: 'antihypertensive', label: 'Blood pressure medication' },
  { drugClass: 'thyroid-hormone', label: 'Thyroid medication', hint: 'e.g. levothyroxine' },
  { drugClass: 'sedative', label: 'Sedatives / sleep aids' },
  { drugClass: 'immunosuppressant', label: 'Immunosuppressants' },
  { drugClass: 'diuretic', label: 'Diuretics (water pills)' },
  { drugClass: 'lithium', label: 'Lithium' },
  { drugClass: 'chemotherapy', label: 'Chemotherapy' },
  { drugClass: 'nsaid', label: 'Regular NSAIDs', hint: 'e.g. ibuprofen, naproxen' },
];
