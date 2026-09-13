// ---------------------------------------------------------------------------
// AyurSage — core domain types
// ---------------------------------------------------------------------------

export type Dosha = 'vata' | 'pitta' | 'kapha';

export type DoshaScores = Record<Dosha, number>;

/**
 * Evidence tiers are transparent and conservative. We NEVER fabricate
 * clinical claims — "traditional" means classical Ayurvedic textual use with
 * no modern clinical validation, and higher tiers require real human data.
 */
export type EvidenceLevel =
  | 'traditional' // Classical texts / ethnobotanical use only
  | 'preclinical' // In-vitro / animal studies only
  | 'preliminary-clinical' // Small / low-quality human trials
  | 'moderate-clinical'; // Multiple RCTs or systematic reviews

export const EVIDENCE_META: Record<
  EvidenceLevel,
  { label: string; rank: number; blurb: string; tone: string }
> = {
  traditional: {
    label: 'Traditional use',
    rank: 1,
    blurb: 'Documented in classical Ayurvedic texts; no modern clinical trials.',
    tone: 'clay',
  },
  preclinical: {
    label: 'Pre-clinical',
    rank: 2,
    blurb: 'Laboratory or animal studies only; not yet tested in humans.',
    tone: 'turmeric',
  },
  'preliminary-clinical': {
    label: 'Preliminary clinical',
    rank: 3,
    blurb: 'Small or early-stage human studies with limited certainty.',
    tone: 'sage',
  },
  'moderate-clinical': {
    label: 'Moderate clinical',
    rank: 4,
    blurb: 'Supported by multiple human trials or systematic reviews.',
    tone: 'sage',
  },
};

export interface Citation {
  /** Human-readable source label. These reference real, well-known literature. */
  label: string;
  kind: 'classical-text' | 'review' | 'rct' | 'monograph';
  note?: string;
}

export interface Herb {
  id: string;
  commonName: string;
  sanskritName: string;
  latinName: string;
  category: 'herb' | 'formulation';
  summary: string;
  /** Effect on each dosha: -1 pacifies, 0 neutral, +1 aggravates. */
  doshaEffect: DoshaScores;
  /** Symptom / concern tags this herb is traditionally associated with. */
  targets: string[];
  evidence: EvidenceLevel;
  evidenceNote: string;
  citations: Citation[];
  /** Traditional preparations / dosage context (educational, not prescriptive). */
  commonForms: string[];
  /** Conditions/states where the herb should be avoided (deterministic gate). */
  contraindications: Contraindication[];
  /** Known / theoretical interactions with drug classes. */
  interactions: DrugInteraction[];
  /** Qualities used for retrieval + explanation. */
  qualities: string[];
  safetyNotes: string[];
}

export type ContraindicationFlag =
  | 'pregnancy'
  | 'breastfeeding'
  | 'bleeding-disorder'
  | 'surgery-scheduled'
  | 'liver-disease'
  | 'kidney-disease'
  | 'hyperthyroid'
  | 'hypothyroid'
  | 'autoimmune'
  | 'diabetes'
  | 'hypertension'
  | 'peptic-ulcer'
  | 'child';

export interface Contraindication {
  flag: ContraindicationFlag;
  severity: 'avoid' | 'caution';
  reason: string;
}

export type DrugClass =
  | 'anticoagulant'
  | 'antiplatelet'
  | 'antidiabetic'
  | 'antihypertensive'
  | 'sedative'
  | 'thyroid-hormone'
  | 'immunosuppressant'
  | 'lithium'
  | 'chemotherapy'
  | 'diuretic'
  | 'nsaid';

export interface DrugInteraction {
  drugClass: DrugClass;
  severity: 'severe' | 'moderate' | 'theoretical';
  effect: string;
}

// ---------------------------------------------------------------------------
// Assessment
// ---------------------------------------------------------------------------

export interface HealthProfile {
  age: number | null;
  sexAtBirth: 'female' | 'male' | 'intersex' | 'prefer-not' | null;
  pregnant: boolean;
  breastfeeding: boolean;
  conditions: ContraindicationFlag[];
  medications: DrugClass[];
  allergies: string;
}

export interface AssessmentInput {
  profile: HealthProfile;
  /** Prakriti (constitution) quiz answers keyed by question id -> dosha. */
  prakritiAnswers: Record<string, Dosha>;
  /** Current concerns / symptoms selected by the user. */
  concerns: string[];
  /** Free-text description of how the user feels. */
  narrative: string;
  /** Explicit emergency screen answers. */
  redFlagAnswers: Record<string, boolean>;
  consentAccepted: boolean;
}

// ---------------------------------------------------------------------------
// Triage
// ---------------------------------------------------------------------------

export type TriageLevel = 'emergency' | 'urgent' | 'routine' | 'self-care';

export interface TriageResult {
  level: TriageLevel;
  /** True when Ayurvedic recommendations must be withheld for safety. */
  blockRecommendations: boolean;
  matchedFlags: { id: string; label: string; advice: string }[];
  headline: string;
  guidance: string;
}

// ---------------------------------------------------------------------------
// Recommendations + explainability
// ---------------------------------------------------------------------------

export interface ScoreFactor {
  label: string;
  detail: string;
  weight: number; // contribution to final score (can be negative)
}

export interface SafetyCheck {
  status: 'ok' | 'caution' | 'blocked';
  contraindications: { flag: ContraindicationFlag; reason: string; severity: 'avoid' | 'caution' }[];
  interactions: { drugClass: DrugClass; effect: string; severity: 'severe' | 'moderate' | 'theoretical' }[];
}

export interface Recommendation {
  herb: Herb;
  score: number; // 0-100 confidence-of-fit, NOT a medical certainty
  factors: ScoreFactor[];
  matchedConcerns: string[];
  safety: SafetyCheck;
  rationale: string;
}

export interface LifestyleGuidance {
  category: 'diet' | 'routine' | 'yoga' | 'mind';
  title: string;
  items: string[];
  dosha: Dosha | 'all';
}

export interface AssessmentResult {
  id: string;
  createdAt: string;
  triage: TriageResult;
  prakriti: DoshaScores;
  dominantDosha: Dosha;
  imbalance: Dosha | null;
  recommendations: Recommendation[];
  withheldForSafety: { herb: string; reason: string }[];
  lifestyle: LifestyleGuidance[];
  concerns: string[];
  profileSnapshot: HealthProfile;
  disclaimerVersion: string;
}

// ---------------------------------------------------------------------------
// Auth + persistence
// ---------------------------------------------------------------------------

export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
  /** PBKDF2 hash material — never the raw password. */
  passwordHash: string;
  salt: string;
  consent: {
    disclaimerAcceptedAt: string | null;
    dataProcessingAt: string | null;
    version: string;
  };
}

export interface StoredAssessment extends AssessmentResult {
  userId: string;
}

export type AuditAction =
  | 'auth.register'
  | 'auth.login'
  | 'auth.logout'
  | 'assessment.create'
  | 'assessment.view'
  | 'triage.emergency'
  | 'recommendation.generated'
  | 'assistant.query'
  | 'privacy.export'
  | 'privacy.delete'
  | 'consent.accept'
  | 'admin.view';

export interface AuditEntry {
  id: string;
  ts: string;
  userId: string | null;
  actorEmail: string | null;
  action: AuditAction;
  meta: Record<string, string | number | boolean | null>;
}

// ---------------------------------------------------------------------------
// Conversational assistant
// ---------------------------------------------------------------------------

export interface RetrievedChunk {
  id: string;
  herbId: string;
  text: string;
  score: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  ts: string;
  citations?: { label: string; herbId?: string }[];
  safetyBanner?: 'emergency' | 'medication' | 'general' | null;
}
