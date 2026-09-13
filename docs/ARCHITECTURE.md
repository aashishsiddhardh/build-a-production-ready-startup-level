# AyurSage — Architecture

## Overview

AyurSage is a safety-first Ayurvedic wellness recommender delivered as a Vite + React + TypeScript SPA, with a mirrored FastAPI + PostgreSQL/pgvector backend for production scale. Both share one knowledge-base source of truth.

```
┌──────────────────────────────────────────────────────────────┐
│                        React SPA (Vite)                        │
│  pages ─ components ─ context(Auth)                             │
│  engine/  triage · doshaAssessment · safety · recommender      │
│           retrieval(in-browser vector store) · assistant       │
│  lib/     auth · storage(localStorage) · crypto(PBKDF2) · audit│
│  data/    herbs · conditions · doshas · lifestyle · rules ◄─── single source of truth
└───────────────┬──────────────────────────────────────────────┘
                │  VITE_API_URL (optional)
                ▼
┌──────────────────────────────────────────────────────────────┐
│                   FastAPI backend (/backend)                   │
│  routers/ auth · assessments · herbs · assistant · privacy ·   │
│           admin                                                │
│  engine/  triage · safety · recommender · embeddings ·         │
│           assistant   (Python mirror of the client engines)    │
│  security JWT + bcrypt · deps(current user, audit)             │
└───────────────┬──────────────────────────────────────────────┘
                ▼
┌──────────────────────────────────────────────────────────────┐
│              PostgreSQL 16 + pgvector                          │
│  users · herbs · knowledge_chunks(vector) · assessments ·      │
│  chat_messages · audit_logs                                    │
└──────────────────────────────────────────────────────────────┘
```

## Knowledge base sync

`src/data/*.ts` is the canonical KB. `npm run export:knowledge` bundles it with esbuild and writes `backend/app/data/knowledge.json`, which the FastAPI service loads at seed time (also generating pgvector embeddings for each chunk). This guarantees the two stacks never drift.

## Data model (backend)

- **users** — email, name, role, bcrypt hash, consent timestamps.
- **herbs** — full monograph incl. `dosha_effect`, `targets`, `contraindications`, `interactions`, `citations`.
- **knowledge_chunks** — `herb_id`, `text`, `embedding vector(N)`; queried by cosine distance.
- **assessments** — triage level, dominant dosha, imbalance, concerns, full JSON payload for audit.
- **chat_messages** — per-user conversation history with safety-banner metadata.
- **audit_logs** — append-only; every auth/assessment/privacy/safety event.

## Request flow (create assessment)

1. Client collects profile, prakriti answers, concerns, narrative, red-flag answers.
2. `POST /api/assessments` (or the local engine) runs: triage → dosha → safety gate → scoring.
3. Result persisted; audit events written (`assessment.create`, plus `triage.emergency` or `recommendation.generated`).
4. Response includes the triage verdict, dosha snapshot, ranked+explained recommendations, withheld herbs, and lifestyle guidance.

## RAG assistant flow

1. Deterministic guardrails (emergency triage, medication-stop intent, diagnosis/cure reframing).
2. Embed the query → pgvector cosine search (backend) or TF-IDF cosine (client) over `knowledge_chunks`.
3. Compose a grounded answer citing only retrieved herbs. An optional LLM (`LLM_API_KEY`) can phrase the retrieved context; without it, a deterministic template is used. The model never sets safety.

## Testing

- **Client:** Vitest unit tests for triage, safety gate, recommender, dosha analysis, retrieval, assistant guardrails.
- **Backend:** Pytest tests for the Python mirrors (no DB needed).

## Deployment

`docker compose up --build` starts pgvector, the FastAPI backend (auto-creates the extension, tables and seed data on startup), and the nginx-served SPA that proxies `/api` to the backend.
