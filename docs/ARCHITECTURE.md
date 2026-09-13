# Architecture

AyurSage is built around a single non-negotiable principle:

> **Deterministic rules own medical safety. AI only handles natural-language
> understanding and explanation — it can never override a safety decision.**

## The two layers

```
                 ┌─────────────────────────────────────────────┐
   user input →  │  LAYER A — DETERMINISTIC (auditable, tested) │
                 │   1. Emergency triage        (safety gate #1) │
                 │   2. Contraindication check  (safety gate #2) │
                 │   3. Drug-interaction check  (safety gate #2) │
                 │   4. Explainable scoring                       │
                 └───────────────┬─────────────────────────────┘
                                 │ (only survivors of the gates)
                 ┌───────────────┴─────────────────────────────┐
                 │  LAYER B — PROBABILISTIC (grounded, bounded)  │
                 │   • NLU: map free text → canonical concepts   │
                 │   • Retrieval: vector similarity over the KB  │
                 │   • NLG: phrase explanations from KB facts    │
                 └─────────────────────────────────────────────┘
```

Layer B **reads** Layer A's output to explain it, and proposes *candidates* via
retrieval — but every candidate must pass Layer A's gates before a user ever sees
it. The language model never sees a blocked item and never produces the final
safety verdict.

## Frontend (this repository root)

- **Vite + React + TypeScript + Tailwind** single-page app.
- Safety-critical logic lives in `src/lib/safety/*` and is unit-tested.
- Retrieval (`src/lib/recommend/retrieval.ts`) is an in-browser TF-IDF vector
  store — a client-side analogue of pgvector cosine search. It is deterministic,
  explainable, and works offline (the standalone `dist-singlefile` build makes
  zero backend calls).
- Persistence is local-first (`src/lib/storage/*`): users, history, audit, and
  chats live in `localStorage` under one namespace so they can be exported or
  erased as a unit.
- The conversational assistant (`src/lib/assistant/engine.ts`) is grounded in the
  KB. If `VITE_OPENAI_API_KEY` is set it uses the LLM **only to rephrase
  retrieved facts** under a strict system prompt; any failure degrades to the
  on-device responder.

## Reference backend (`/backend`)

A FastAPI service that mirrors the same domain and safety layer in Python, backed
by **PostgreSQL + pgvector** (`backend/db/schema.sql`) with **Row-Level
Security**. It is optional: the SPA is fully functional without it. Point the
client at it by setting `VITE_API_BASE_URL`.

- `app/safety.py` — Python port of triage + contraindication/interaction checks.
- `app/recommend.py` — safety-first orchestration + explainable scoring.
- `app/security.py` — bcrypt password hashing + JWT sessions.
- `db/schema.sql` — tables, pgvector index, and RLS policies keyed on the
  authenticated user.

## Data flow for an assessment

1. User completes the structured wizard (symptoms, safety screen, conditions,
   medications, constitution, goals).
2. **Triage** runs first. If an emergency/red-flag or pediatric case is detected,
   the app withholds all herbal suggestions and shows escalation guidance.
3. Otherwise, **retrieval** ranks KB documents by cosine similarity to the
   canonicalised query.
4. Each candidate is passed through **contraindication + interaction** checks.
   `avoid`-level results are removed (and shown transparently in "filtered out");
   `caution`/`info` results are surfaced but do not block.
5. Survivors are **scored** with four transparent components (relevance,
   constitutional fit, evidence strength, safety margin) and sorted.
6. **Lifestyle guidance** (diet/routine/yoga/mind) and **disclaimers** are always
   attached. The full result is saved to history and a metadata-only audit event
   is recorded.
