# Safety model

AyurSage is an **educational wellness** tool. It is **not** a medical device and
does **not** provide medical advice, diagnosis, or treatment.

## Hard guarantees (enforced in code)

The system is designed so the following can never happen, regardless of what the
AI layer produces:

| Guarantee | How it is enforced |
|---|---|
| **Never diagnose or prescribe** | The app only surfaces *traditional associations* and general lifestyle information. No dosing instructions are generated; wording is templated and reviewed. |
| **Never guarantee cures** | Copy and the assistant system prompt forbid outcome claims; evidence is always tiered. |
| **Never invent evidence/citations** | Evidence tiers describe the *type/strength* of support (traditional → strong) in general terms. No fabricated studies, DOIs, or citations are ever produced. The LLM is constrained to the provided KB context. |
| **Never recommend stopping medication** | Explicit disclaimers on every result; the assistant refuses and defers to a clinician/pharmacist. |
| **No herbs in emergencies / high-risk** | `runTriage()` is a deterministic gate that runs *before* any recommendation. Emergency, pediatric, pregnancy-danger, and self-harm signals block herbal output and show escalation guidance. |

## The two deterministic safety gates

### Gate #1 — Emergency triage (`src/lib/safety/triage.ts`)
Exact/keyword matching against a conservative red-flag rule set
(`src/data/emergencyRules.ts`): cardiac, stroke (FAST), breathing, anaphylaxis,
bleeding, neurological, severe abdominal pain, self-harm, and pregnancy danger
signs. Any emergency match → `blockRecommendations = true`. Pediatric mentions are
routed to a clinician. This layer never calls a model.

### Gate #2 — Contraindications + interactions (`src/lib/safety/contraindications.ts`)
Each herb/formulation carries structured `contraindications`, `drugInteractions`,
and a `pregnancy` category. Against the user's declared conditions, medications,
and pregnancy status:
- `avoid`-level findings **block** the item (removed before scoring, shown in
  "filtered out for your safety").
- `caution` / `info` findings are **surfaced** on the card and reduce the safety
  component of the score, but do not block.

## Human-in-the-loop expectations
Every result repeats that the user should consult a qualified professional —
especially before combining herbs with medications, during pregnancy or
breastfeeding, or with any chronic condition.

## Testing
The safety layer is covered by unit tests (`src/test/*.test.ts`): triage
classification, contraindication/interaction blocking, scoring transparency, and
end-to-end engine behaviour (including that contraindicated herbs are never
recommended). Run `npm run test`.
