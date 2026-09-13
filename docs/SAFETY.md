# AyurSage — Safety Architecture

AyurSage is built on a single principle: **medical safety is deterministic; AI only handles language.** This document describes how that boundary is enforced.

## The two systems

| Concern | System | Can AI change it? |
|---|---|---|
| Emergency triage | Deterministic rules | **No** |
| Contraindication gate | Deterministic rules | **No** |
| Drug-interaction gate | Deterministic rules | **No** |
| Recommendation scoring | Deterministic, transparent weights | **No** |
| Understanding free-text | AI / NLP | n/a |
| Explaining results | AI (RAG, grounded) | n/a |

The AI layer is **downstream** of every safety decision and is never given the authority to un-block a herb, re-rank past a safety gate, or overrule triage.

## Pipeline

1. **Emergency triage** (`engine/triage.ts`, `backend/app/engine/triage.py`)
   - Structured red-flag questions (yes/no) + a broad keyword scan of the narrative.
   - Fail-safe: false positives (routing to care) are acceptable; false negatives are not.
   - Any emergency match → `blockRecommendations = true` and **zero** herbal suggestions.

2. **Dosha analysis** (`engine/doshaAssessment.ts`)
   - Deterministic scoring of the Prakriti quiz → vata/pitta/kapha percentages.
   - Current imbalance (vikriti) inferred from selected concerns.

3. **Safety gate** (`engine/safety.ts`)
   - Derives effective flags from the profile (pregnancy, breastfeeding, age→child, conditions).
   - A herb is **blocked** on any `avoid` contraindication or `severe` interaction; **caution** on softer matches.
   - Blocked herbs are removed from ranking and shown in a separate "withheld for your safety" list.

4. **Explainable scoring** (`engine/recommender.ts`)
   - Transparent additive weights: concern match, dosha alignment, evidence bonus, caution penalty.
   - Every recommendation exposes its full factor breakdown and a plain-language rationale.
   - The score is a **fit-to-profile** signal, explicitly *not* a medical-effectiveness or certainty claim.

5. **Assistant guardrails** (`engine/assistant.ts`)
   - Runs triage on every message first (emergency → stop, route to care).
   - Detects medication-stopping intent (verb + medication noun) → refuses and redirects to the prescriber.
   - Reframes diagnosis/cure requests.
   - Only then retrieves KB chunks and composes a grounded, cited answer.

## Evidence integrity

- Four conservative tiers: `traditional`, `preclinical`, `preliminary-clinical`, `moderate-clinical`.
- Citations reference **real classical texts by name** and **categories** of modern literature by study type. AyurSage does not fabricate specific trials, DOIs or results, and the UI states that references are educational pointers to be verified against primary sources.

## What is never done

- No diagnosis, no prescription, no dosing directives, no cure guarantees.
- Never recommends stopping/altering prescribed medication.
- No herbal recommendations during emergencies or high-risk situations.
