import type {
  AssessmentInput,
  DrugInteraction,
  Herb,
  Formulation,
  SafetyFlag,
} from '@/types'
import { MEDICATIONS } from '@/data/reference'
import { normalize } from '@/lib/text'

// ─────────────────────────────────────────────────────────────────────────────
// Deterministic contraindication + drug-interaction checking (safety gate #2).
//
// Given an item (herb/formulation) and the user's structured inputs, this
// returns transparent SafetyFlags. Anything at severity "avoid" (or an
// "avoid"-category contraindication / pregnancy) BLOCKS the item entirely.
// "caution"/"info" flags are surfaced to the user but do not block.
// ─────────────────────────────────────────────────────────────────────────────

// Human-readable labels for contraindication keys (for clear messaging).
const CONTRA_LABELS: Record<string, string> = {
  hypertension: 'high blood pressure',
  hypotension: 'low blood pressure',
  diabetes: 'diabetes',
  thyroid: 'a thyroid disorder',
  hyperthyroidism: 'an overactive thyroid',
  liver_disease: 'liver disease',
  kidney_disease: 'kidney disease',
  bleeding_disorder: 'a bleeding disorder',
  gallstones: 'gallstones',
  gerd: 'GERD / peptic ulcer',
  autoimmune: 'an autoimmune condition',
  heart_disease: 'heart disease',
  seizure: 'a seizure disorder',
  surgery_2w: 'upcoming surgery',
  iron_deficiency: 'iron-deficiency anemia',
  hypokalemia: 'low potassium',
  loose_stools: 'active loose stools',
  breastfeeding: 'breastfeeding',
}

function contraLabel(key: string): string {
  return CONTRA_LABELS[key] ?? key.replace(/_/g, ' ')
}

interface SafetyItem {
  contraindications: string[]
  drugInteractions: DrugInteraction[]
  pregnancy: Herb['pregnancy']
  name: string
}

export interface SafetyResult {
  flags: SafetyFlag[]
  blocked: boolean
  /** Only the flags that caused a block (empty if not blocked). */
  blockingFlags: SafetyFlag[]
}

/** Resolve which drug-interaction class keys apply to the user's medications. */
export function userDrugClasses(input: AssessmentInput): Set<string> {
  const set = new Set<string>()
  for (const medKey of input.medications) {
    const med = MEDICATIONS.find((m) => m.key === medKey)
    if (med) med.drugClassKeys.forEach((k) => set.add(k))
  }
  return set
}

function matchesUser(key: string, input: AssessmentInput, normText: string): boolean {
  if (input.conditions.includes(key)) return true
  if (input.symptoms.includes(key)) return true
  const label = normalize(contraLabel(key))
  if (label && normText.includes(label)) return true
  return false
}

export function checkSafety(item: SafetyItem, input: AssessmentInput): SafetyResult {
  const flags: SafetyFlag[] = []
  const normText = normalize(input.freeText || '')
  const drugClasses = userDrugClasses(input)

  // ── Contraindications ──
  for (const key of item.contraindications) {
    if (matchesUser(key, input, normText)) {
      flags.push({
        kind: 'contraindication',
        severity: 'avoid',
        message: `Not recommended because you indicated ${contraLabel(key)}.`,
      })
    }
  }

  // ── Pregnancy / breastfeeding ──
  const breastfeeding = input.conditions.includes('breastfeeding')
  if (input.pregnant || breastfeeding) {
    const who = input.pregnant ? 'pregnancy' : 'breastfeeding'
    if (item.pregnancy === 'avoid') {
      flags.push({
        kind: 'pregnancy',
        severity: 'avoid',
        message: `Not recommended during ${who}.`,
      })
    } else if (item.pregnancy === 'caution') {
      flags.push({
        kind: 'pregnancy',
        severity: 'caution',
        message: `Use only under professional guidance during ${who}.`,
      })
    } else if (item.pregnancy === 'insufficient-data') {
      flags.push({
        kind: 'pregnancy',
        severity: 'caution',
        message: `Safety during ${who} is not well established — avoid unless advised by your clinician.`,
      })
    }
  }

  // ── Drug interactions ──
  for (const di of item.drugInteractions) {
    if (drugClasses.has(di.drugClassKey)) {
      flags.push({
        kind: 'interaction',
        severity: di.severity,
        message: `Possible interaction with ${di.drugClass.toLowerCase()}: ${di.mechanism}`,
      })
    }
  }

  const blockingFlags = flags.filter((f) => f.severity === 'avoid')
  return { flags, blocked: blockingFlags.length > 0, blockingFlags }
}

export function checkHerbSafety(herb: Herb, input: AssessmentInput): SafetyResult {
  return checkSafety(herb, input)
}

export function checkFormulationSafety(f: Formulation, input: AssessmentInput): SafetyResult {
  return checkSafety(f, input)
}
