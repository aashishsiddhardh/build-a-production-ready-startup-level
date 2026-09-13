# AyurSage — reference backend (FastAPI)

A Python port of the same safety-first domain implemented in the SPA, backed by
**PostgreSQL + pgvector** with **Row-Level Security**. It is **optional** — the
web app is fully functional in-browser. Use this when you want a real server with
shared persistence and server-side embeddings.

## Run locally

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload   # http://localhost:8000/docs
```

The default configuration keeps an in-memory user/audit store so the API runs
standalone. Provide `DATABASE_URL` (and wire the queries) to use the schema in
`db/schema.sql` for production persistence.

## Layout

```
app/
  main.py       # FastAPI app + routes (auth, triage, recommend, herbs, audit)
  safety.py     # deterministic triage + contraindication/interaction checks
  recommend.py  # safety-first orchestration + explainable scoring
  data.py       # compact herb knowledge base (Postgres in production)
  models.py     # Pydantic request/response models
  security.py   # bcrypt password hashing + JWT sessions
db/
  schema.sql    # tables, pgvector index, RLS policies
```

## Safety boundary

`app/safety.py` owns every medical-safety decision. Any embedding/LLM provider is
used **server-side only** and only to rank or phrase around the deterministic
rules — it can never override them, invent evidence, diagnose, or prescribe. See
[`../docs/SAFETY.md`](../docs/SAFETY.md).
