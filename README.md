# 🌿 AyurSage — AI-powered Ayurvedic Wellness Recommendation System

> A production-grade, **safety-first** Ayurvedic wellness companion. Deterministic rules protect the user (emergency triage, contraindication & drug-interaction gates, explainable scoring); AI is used **only** for natural-language understanding and transparent explanations.

AyurSage never diagnoses, prescribes, guarantees cures, invents evidence, recommends stopping medication, or offers herbal advice in an emergency. It is **educational wellness guidance only** — not medical advice.

---

## ✨ Highlights

- **Safety-first architecture** — a hard boundary between deterministic medical safety and AI language. AI output can never override a safety rule.
- **Emergency triage** — structured red-flag screening + a broad keyword scan. Any emergency signal withholds all herbal suggestions and routes to care.
- **Structured assessment** — health profile, Prakriti (constitution) quiz, concern selection, free-text narrative, and an explicit safety screen.
- **Evidence-graded knowledge base** — 18 herbs & classical formulations, each with a transparent evidence tier (traditional → moderate-clinical), contraindications, and drug interactions.
- **Contraindication & interaction checking** — deterministic per-herb gate against pregnancy, age, conditions and medications. Unsafe herbs are removed and listed separately.
- **Explainable recommendations** — every suggestion shows a fit-score with a full, reproducible factor breakdown.
- **RAG conversational assistant** — grounded in the knowledge base via a vector store, with always-on safety guardrails.
- **Personalized lifestyle guidance** — dosha-specific diet, daily routine (dinacharya) and yoga suggestions.
- **User accounts & history** — PBKDF2-hashed passwords, saved assessments, chat history.
- **Admin dashboard** — usage metrics, concern/triage/evidence analytics, KB browser, audit log, users.
- **Privacy & security controls** — data export, one-click deletion, consent tracking, append-only audit trail.
- **Comprehensive tests** — the safety-critical logic (triage, safety gate, recommender, retrieval, assistant guardrails) is unit-tested on both the client and the backend.

---

## 🏗️ Architecture

AyurSage ships in two coherent forms that share **one source of truth** for the knowledge base:

### 1. The running app — a Vite + React + TypeScript SPA (this repo's live preview)
A fully client-side application. The entire safety-first engine runs in the browser:

```
Assessment ──▶ [1] Emergency triage (deterministic)  ──▶ can withhold everything
            ──▶ [2] Dosha analysis   (deterministic)
            ──▶ [3] Safety gate      (deterministic)  ──▶ removes unsafe herbs
            ──▶ [4] Explainable score(deterministic)
Assistant  ──▶ Guardrails (deterministic) ──▶ RAG retrieval ──▶ grounded explanation (AI layer)
```

- Retrieval uses an **in-browser vector store** (TF-IDF + cosine similarity) over the KB.
- Auth, assessments, history, audit logs persist to `localStorage` behind a storage-agnostic interface.

### 2. The production backend — FastAPI + PostgreSQL + pgvector (`/backend`)
A drop-in server that mirrors the exact same deterministic engines in Python:

- **PostgreSQL + pgvector** stores herbs, `knowledge_chunks` (with vector embeddings), users, assessments, chats and an append-only `audit_logs` table.
- **FastAPI** exposes `/api/auth`, `/api/assessments`, `/api/herbs`, `/api/assistant`, `/api/privacy`, `/api/admin`.
- **JWT auth**, bcrypt password hashing, RLS-friendly per-user scoping.
- The RAG retrieval uses **pgvector cosine distance** over embeddings.
- The SPA can be pointed at the backend by setting `VITE_API_URL`; otherwise it runs standalone.

> The backend KB is generated from the frontend TypeScript data via `npm run export:knowledge`, keeping both stacks perfectly in sync.

---

## 🚀 Getting started

### Frontend (the live app)

```bash
npm install
npm run dev            # http://localhost:5173
npm run test           # run the safety-critical unit tests (Vitest)
npm run build          # production build
npm run build:preview  # single self-contained index.html (dist-preview/)
```

**Demo accounts** (seeded automatically):

| Role  | Email                 | Password      |
|-------|-----------------------|---------------|
| User  | `demo@ayursage.demo`  | `wellness123` |
| Admin | `admin@ayursage.demo` | `admin1234`   |

### Full stack (Docker Compose)

```bash
cp .env.example .env
docker compose up --build
# Frontend → http://localhost:3000
# API docs → http://localhost:8000/docs
# Postgres → localhost:5432
```

### Backend tests

```bash
cd backend
pip install -r requirements.txt
pytest        # deterministic-engine tests (no DB required)
```

---

## 🔐 Safety & privacy guarantees

AyurSage will **never**:
- diagnose a condition, or tell you what's wrong;
- prescribe treatment or exact dosages;
- guarantee a cure or specific outcome;
- invent studies, citations or evidence;
- recommend stopping or changing prescribed medication;
- give herbal advice in an emergency / high-risk situation.

Evidence tiers are conservative and honest: `traditional → preclinical → preliminary-clinical → moderate-clinical`. Citations reference **categories** of real literature (named classical texts + study types) for education — they are not fabricated trial results, and the UI says so.

Security: passwords are salted + PBKDF2/bcrypt hashed, health data is scoped to the user, every safety/privacy action is written to an append-only audit trail, and users can export or delete their data at any time.

---

## 📁 Project structure

```
├── src/                      # React SPA
│   ├── data/                 # Knowledge base, concerns, doshas, rules (source of truth)
│   ├── engine/               # Deterministic engines + RAG + assistant (with tests)
│   ├── components/           # UI components
│   ├── pages/                # Routed pages
│   ├── lib/                  # Auth, storage, crypto, audit, types
│   └── context/              # Auth context
├── backend/                  # FastAPI + Postgres + pgvector (production architecture)
│   ├── app/engine/           # Python mirrors of the safety engines (+ tests)
│   ├── app/routers/          # API endpoints
│   └── app/data/knowledge.json  # generated from src/data via export:knowledge
├── scripts/export-knowledge.mjs # keeps backend KB in sync with the frontend
├── docs/                     # Architecture & safety docs
├── Dockerfile / nginx.conf   # Frontend container
├── docker-compose.yml        # db + backend + frontend
└── vite.singlefile.config.ts # single-file preview build
```

---

## ⚕️ Disclaimer

AyurSage provides general Ayurvedic wellness education only. It is **not** a substitute for professional medical advice, diagnosis, or treatment. Never disregard professional medical advice or delay seeking it because of something in this app. Never stop or change prescribed medication based on this tool. In an emergency, contact your local emergency services immediately.
