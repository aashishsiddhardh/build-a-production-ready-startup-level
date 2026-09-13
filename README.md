<div align="center">

# 🌿 AyurSage

### An AI-powered Ayurvedic wellness companion with a safety-first architecture

**Deterministic rules protect. AI explains.** Educational wellness guidance —
never a diagnosis, prescription, or promise of a cure.

</div>

---

## What it is

AyurSage turns an Ayurvedic knowledge base into a responsible, transparent
wellness companion. It screens for emergencies first, filters every suggestion
against your conditions and medications, and shows exactly *why* each herb was
recommended — with honest evidence levels and no fabricated citations.

> ⚠️ **Not medical advice.** AyurSage does not diagnose, treat, prescribe, or
> cure. It withholds herbal suggestions in emergencies and for children, and it
> never tells you to stop a medication. Always consult a qualified professional.

## Features

- 🔐 **User authentication** — local, on-device accounts (salted PBKDF2 hashes) with roles.
- 🩺 **Structured assessment** — symptoms, duration/severity, health context, constitution, goals.
- 🚨 **Emergency triage** — a deterministic red-flag gate that runs *before* anything else.
- 📚 **Knowledge base** — herbs & classical formulations with dosha effects, taste/potency, and safety notes.
- 🧭 **RAG recommendations** — in-browser vector retrieval (a client-side pgvector analogue).
- 📊 **Transparent evidence levels** — traditional → strong, described honestly.
- ⚖️ **Contraindication & interaction checks** — auditable rules filter unsafe items and flag cautions.
- 🌱 **Personalised lifestyle guidance** — diet, daily routine, yoga/breathwork, and mind.
- 🔍 **Explainable scoring** — every score breaks down into four weighted components.
- 💬 **Grounded conversational assistant** — on-device by default; optional LLM phrasing layer.
- 🕘 **User history** — revisit and delete past assessments.
- 📈 **Admin dashboard** — KB, triage, and usage metrics + a metadata-only audit log.
- 🛡️ **Privacy controls** — consent, full data export, and one-click erasure.
- 🧪 **Tests** — the safety layer is unit-tested (Vitest) plus an app render smoke test.
- 🐳 **Docker** — frontend (nginx), reference FastAPI backend, and Postgres/pgvector via Compose.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Vite · React 18 · TypeScript · Tailwind CSS · React Router · Recharts |
| Safety/logic | Pure TypeScript (tested), Web Crypto (PBKDF2) |
| Reference backend | FastAPI · Pydantic · PostgreSQL + **pgvector** · JWT · bcrypt |
| Tooling | Vitest · Testing Library · vite-plugin-singlefile · Docker |

## Quick start (frontend)

```bash
npm install
npm run dev        # http://localhost:5173
npm run test       # run the safety + smoke tests
npm run build      # type-check + production build
```

Explore the admin dashboard with the seeded demo admin shown on the sign-in page
(`admin@ayursage.local`). **Change this before any real deployment.**

### Environment (all optional)
Copy `.env.example` → `.env`. With no configuration the app runs fully offline.
Setting `VITE_OPENAI_API_KEY` enables the LLM phrasing layer for the assistant
(it stays grounded in the KB and degrades gracefully if the call fails).

## Standalone preview

```bash
npm run build:preview   # emits dist-singlefile/index.html (everything inlined)
```

This one self-contained HTML file renders the whole app with **zero backend
calls** — ideal for sharing a live preview.

## Full stack with Docker

```bash
docker compose up --build
# web → http://localhost:8080   api → http://localhost:8000/docs   db → pgvector:5432
```

The Compose stack initialises PostgreSQL with `backend/db/schema.sql` (pgvector +
Row-Level Security) and runs the FastAPI reference API. The web app works with or
without the API.

## Project layout

```
├─ src/
│  ├─ data/            # knowledge base, symptom/condition/med reference, triage rules
│  ├─ lib/
│  │  ├─ safety/       # triage + contraindication/interaction engines (tested)
│  │  ├─ recommend/    # retrieval (vector store) · scoring · lifestyle · orchestrator
│  │  ├─ assistant/    # grounded conversational engine (+ optional LLM)
│  │  ├─ dosha/        # constitution analysis
│  │  ├─ auth/ storage/ audit/ crypto.ts
│  ├─ components/  context/  pages/  test/
├─ backend/            # FastAPI + Postgres/pgvector reference implementation
├─ docs/               # ARCHITECTURE.md · SAFETY.md · API.md
├─ Dockerfile · nginx.conf · docker-compose.yml
```

## Documentation

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — the two-layer, safety-first design.
- [`docs/SAFETY.md`](docs/SAFETY.md) — the guarantees and how they are enforced.
- [`docs/API.md`](docs/API.md) — reference backend endpoints.

## License

Provided for educational and demonstration purposes. Review the safety model
before any real-world use.
