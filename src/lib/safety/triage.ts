import type { RedFlagRule, TriageLevel, TriageResult } from '@/types'
import { RED_FLAG_RULES, PEDIATRIC_KEYWORDS } from '@/data/emergencyRules'
import { normalize } from '@/lib/text'

// ─────────────────────────────────────────────────────────────────────────────
// Emergency triage — the FIRST and most important safety gate.
//
// This is 100% deterministic. It never calls a model. If any emergency rule
// matches (from structured red-flag selections OR keywords in free text), the
// engine returns blockRecommendations=true and the app withholds all Ayurvedic
// suggestions, showing escalation guidance instead.
// ─────────────────────────────────────────────────────────────────────────────

const LEVEL_RANK: Record<TriageLevel, number> = { routine: 0, urgent: 1, emergency: 2 }

export interface TriageContext {
  /** Keys of red-flag checkboxes the user explicitly selected. */
  redFlagSelections?: string[]
  /** Any free text to scan for emergency keywords. */
  freeText?: string
}

function ruleMatches(rule: RedFlagRule, selections: Set<string>, normText: string): boolean {
  // Structured selection by rule id or by any trigger phrase used as a key.
  if (selections.has(rule.id)) return true
  for (const trig of rule.triggers) {
    if (selections.has(trig)) return true
    if (normText && normText.includes(normalize(trig))) return true
  }
  return false
}

export function runTriage(ctx: TriageContext): TriageResult {
  const selections = new Set(ctx.redFlagSelections ?? [])
  const normText = ctx.freeText ? normalize(ctx.freeText) : ''

  const matched = RED_FLAG_RULES.filter((r) => ruleMatches(r, selections, normText))

  // Pediatric mentions are routed to a clinician (not an emergency block, but we
  // never provide herbal dosing suggestions for infants/children).
  const pediatric = PEDIATRIC_KEYWORDS.some((k) => normText.includes(normalize(k)))

  let level: TriageLevel = 'routine'
  for (const m of matched) {
    if (LEVEL_RANK[m.level] > LEVEL_RANK[level]) level = m.level
  }

  const blockRecommendations = level === 'emergency' || pediatric

  let message: string
  if (level === 'emergency') {
    message =
      'Your responses include a potential emergency warning sign. AyurSage will not provide herbal suggestions here. Please seek emergency care now.'
  } else if (level === 'urgent') {
    message =
      'Some responses suggest you should be seen by a clinician soon (same day). You can still review general wellness information below, but please prioritise medical care.'
  } else if (pediatric) {
    message =
      'For infants and children, please consult a pediatric clinician before using any herbal product. AyurSage does not provide pediatric dosing.'
  } else {
    message = 'No emergency warning signs were detected in your responses.'
  }

  return {
    level: pediatric && level === 'routine' ? 'urgent' : level,
    matched,
    blockRecommendations,
    message,
  }
}
