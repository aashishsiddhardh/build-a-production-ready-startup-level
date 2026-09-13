// ─────────────────────────────────────────────────────────────────────────────
// Core domain types for AyurSage.
//
// Design note: the safety-critical layer (triage, contraindications, drug
// interactions) is expressed with plain, auditable data structures so it can be
// reasoned about deterministically. The AI/NLP layer only ever *reads* these
// structures — it can never override a safety decision.
// ─────────────────────────────────────────────────────────────────────────────

export type Dosha = 'vata' | 'pitta' | 'kapha'

export type DoshaEffect = 'increase' | 'decrease' | 'neutral'

/** Six tastes (rasa) recognised in classical Ayurveda. */
export type Rasa = 'sweet' | 'sour' | 'salty' | 'pungent' | 'bitter' | 'astringent'

/** Thermal potency (virya). */
export type Virya = 'heating' | 'cooling' | 'neutral'

/**
 * Transparent evidence tiers. These describe the *type and strength* of
 * available support — never a fabricated citation. Higher tiers require
 * controlled human research; lower tiers reflect traditional use only.
 */
export type EvidenceLevel =
  | 'traditional' // Documented classical/traditional use; no modern trials.
  | 'preclinical' // In-vitro / animal signals only.
  | 'preliminary' // Small or low-quality human studies; mixed results.
  | 'moderate' // Several human trials or a small meta-analysis; some limits.
  | 'strong' // Consistent, higher-quality human evidence.

export type InteractionSeverity = 'info' | 'caution' | 'avoid'

export type PregnancyCategory = 'avoid' | 'caution' | 'insufficient-data' | 'generally-regarded-safe'

export interface DrugInteraction {
  /** Human-readable drug class or mechanism, e.g. "Anticoagulants / antiplatelets". */
  drugClass: string
  /** Machine key used by the deterministic checker. */
  drugClassKey: string
  severity: InteractionSeverity
  mechanism: string
}

export interface Herb {
  id: string
  name: string
  sanskrit: string
  latin: string
  category: string
  summary: string
  /** Effect on each dosha — used for constitutional alignment scoring. */
  doshaEffect: Record<Dosha, DoshaEffect>
  rasa: Rasa[]
  virya: Virya
  /** Symptom / concern tags this herb is traditionally associated with. */
  indications: string[]
  /** Free-text traditional actions used for retrieval + explanation. */
  actions: string[]
  evidenceLevel: EvidenceLevel
  evidenceNote: string
  /** Condition keys (see HEALTH_CONDITIONS) that contraindicate use. */
  contraindications: string[]
  drugInteractions: DrugInteraction[]
  pregnancy: PregnancyCategory
  typicalForm: string
  safetyNotes: string
}

export interface Formulation {
  id: string
  name: string
  sanskrit: string
  type: string
  summary: string
  herbIds: string[]
  indications: string[]
  doshaEffect: Record<Dosha, DoshaEffect>
  evidenceLevel: EvidenceLevel
  evidenceNote: string
  contraindications: string[]
  drugInteractions: DrugInteraction[]
  pregnancy: PregnancyCategory
  safetyNotes: string
}

export interface SymptomOption {
  key: string
  label: string
  /** Body system, used purely for grouping in the UI. */
  system: string
}

export interface HealthConditionOption {
  key: string
  label: string
  /** Extra description shown to the user. */
  note?: string
}

export interface MedicationOption {
  key: string
  label: string
  /** Interaction class keys this medication belongs to. */
  drugClassKeys: string[]
}

// ── Emergency triage ─────────────────────────────────────────────────────────

export type TriageLevel = 'emergency' | 'urgent' | 'routine'

export interface RedFlagRule {
  id: string
  /** Symptom keys / free-text keywords that trigger this rule. */
  triggers: string[]
  level: TriageLevel
  title: string
  guidance: string
}

export interface TriageResult {
  level: TriageLevel
  matched: RedFlagRule[]
  /** True when Ayurvedic recommendations must be withheld entirely. */
  blockRecommendations: boolean
  message: string
}

// ── Assessment + recommendations ─────────────────────────────────────────────

export interface AssessmentInput {
  symptoms: string[]
  /** Free-text description of the concern. */
  freeText: string
  durationDays: number
  severity: 1 | 2 | 3 | 4 | 5
  conditions: string[]
  medications: string[]
  pregnant: boolean
  age: number
  goals: string[]
  doshaScores?: Record<Dosha, number>
}

export interface ScoreComponent {
  label: string
  /** 0..1 contribution. */
  value: number
  weight: number
  detail: string
}

export type SafetyFlagKind = 'contraindication' | 'interaction' | 'pregnancy' | 'evidence'

export interface SafetyFlag {
  kind: SafetyFlagKind
  severity: InteractionSeverity
  message: string
}

export interface Recommendation {
  herb: Herb
  score: number
  components: ScoreComponent[]
  matchedSymptoms: string[]
  /** Non-blocking cautions surfaced transparently to the user. */
  cautions: SafetyFlag[]
  rationale: string
}

export interface LifestyleGuidance {
  diet: string[]
  routine: string[]
  yoga: string[]
  mindfulness: string[]
}

export interface RecommendationResult {
  triage: TriageResult
  dominantDosha: Dosha | null
  recommendations: Recommendation[]
  /** Herbs excluded by the deterministic safety layer, with reasons. */
  excluded: { herb: Herb; reasons: SafetyFlag[] }[]
  lifestyle: LifestyleGuidance
  disclaimers: string[]
  generatedAt: string
}

// ── Auth, users, history, audit ──────────────────────────────────────────────

export type Role = 'user' | 'admin'

export interface User {
  id: string
  email: string
  name: string
  role: Role
  createdAt: string
  /** Explicit consent to store health-related inputs locally. */
  consentDataStorage: boolean
  consentAt: string | null
}

export interface StoredUser extends User {
  /** PBKDF2 hash — never the raw password. */
  passwordHash: string
  salt: string
}

export interface Session {
  userId: string
  issuedAt: string
  expiresAt: string
}

export interface HistoryEntry {
  id: string
  userId: string
  createdAt: string
  input: AssessmentInput
  result: RecommendationResult
}

export type AuditAction =
  | 'auth.register'
  | 'auth.login'
  | 'auth.logout'
  | 'auth.login_failed'
  | 'assessment.run'
  | 'assessment.blocked_emergency'
  | 'assistant.query'
  | 'privacy.export'
  | 'privacy.delete_history'
  | 'privacy.delete_account'
  | 'consent.update'
  | 'admin.view'

export interface AuditEvent {
  id: string
  at: string
  userId: string | null
  actorEmail: string | null
  action: AuditAction
  /** Never contains raw health payloads — metadata only. */
  meta: Record<string, string | number | boolean>
}

// ── Assistant ────────────────────────────────────────────────────────────────

export type ChatRole = 'user' | 'assistant' | 'system'

export interface ChatMessage {
  id: string
  role: ChatRole
  content: string
  createdAt: string
  /** Grounding sources (herb/formulation ids) used to compose the reply. */
  sources?: { id: string; name: string }[]
  triage?: TriageResult
}
