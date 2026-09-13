import type { Herb, HealthProfile, SafetyCheck, ContraindicationFlag } from '@/lib/types';

const CHILD_AGE_THRESHOLD = 12;

/**
 * Build the effective set of contraindication flags implied by a health
 * profile (pregnancy, breastfeeding, age, declared conditions).
 */
export function deriveProfileFlags(profile: HealthProfile): Set<ContraindicationFlag> {
  const flags = new Set<ContraindicationFlag>(profile.conditions);
  if (profile.pregnant) flags.add('pregnancy');
  if (profile.breastfeeding) flags.add('breastfeeding');
  if (profile.age !== null && profile.age < CHILD_AGE_THRESHOLD) flags.add('child');
  return flags;
}

/**
 * Deterministic safety check for a single herb against a health profile.
 *
 * status:
 *  - 'blocked' : an "avoid" contraindication or "severe" interaction applies.
 *  - 'caution' : a "caution" contraindication or moderate/theoretical interaction applies.
 *  - 'ok'      : nothing matched.
 */
export function checkHerbSafety(herb: Herb, profile: HealthProfile): SafetyCheck {
  const profileFlags = deriveProfileFlags(profile);

  const contraindications = herb.contraindications
    .filter((c) => profileFlags.has(c.flag))
    .map((c) => ({ flag: c.flag, reason: c.reason, severity: c.severity }));

  const meds = new Set(profile.medications);
  const interactions = herb.interactions
    .filter((i) => meds.has(i.drugClass))
    .map((i) => ({ drugClass: i.drugClass, effect: i.effect, severity: i.severity }));

  const blocked =
    contraindications.some((c) => c.severity === 'avoid') ||
    interactions.some((i) => i.severity === 'severe');
  const caution = contraindications.length > 0 || interactions.length > 0;

  const status: SafetyCheck['status'] = blocked ? 'blocked' : caution ? 'caution' : 'ok';

  return { status, contraindications, interactions };
}
