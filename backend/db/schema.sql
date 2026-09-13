-- ─────────────────────────────────────────────────────────────────────────────
-- AyurSage — PostgreSQL schema (with pgvector) for the reference backend.
--
-- Mirrors the domain implemented client-side in the SPA:
--   • users + auth              • herbs / formulations knowledge base (+ embeddings)
--   • assessments + results     • audit log (metadata only)
-- Row-Level Security is enabled so a user can only ever read their own data.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS vector;      -- pgvector for semantic retrieval
CREATE EXTENSION IF NOT EXISTS pgcrypto;    -- gen_random_uuid()

-- ── Users ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email              CITEXT UNIQUE NOT NULL,
  name               TEXT NOT NULL,
  role               TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user','admin')),
  password_hash      TEXT NOT NULL,               -- bcrypt/argon2 hash, never plaintext
  consent_data       BOOLEAN NOT NULL DEFAULT FALSE,
  consent_at         TIMESTAMPTZ,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Knowledge base ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS herbs (
  id                 TEXT PRIMARY KEY,
  name               TEXT NOT NULL,
  sanskrit           TEXT,
  latin              TEXT,
  category           TEXT,
  summary            TEXT,
  dosha_effect       JSONB NOT NULL,              -- {"vata":"decrease",...}
  rasa               TEXT[] NOT NULL DEFAULT '{}',
  virya              TEXT,
  indications        TEXT[] NOT NULL DEFAULT '{}',
  actions            TEXT[] NOT NULL DEFAULT '{}',
  evidence_level     TEXT NOT NULL,
  evidence_note      TEXT,
  contraindications  TEXT[] NOT NULL DEFAULT '{}',
  drug_interactions  JSONB NOT NULL DEFAULT '[]',
  pregnancy          TEXT NOT NULL DEFAULT 'insufficient-data',
  typical_form       TEXT,
  safety_notes       TEXT,
  -- Sentence-embedding of the herb's indications/summary for retrieval.
  embedding          VECTOR(384)
);

-- Approximate-nearest-neighbour index for cosine similarity.
CREATE INDEX IF NOT EXISTS herbs_embedding_idx
  ON herbs USING ivfflat (embedding vector_cosine_ops) WITH (lists = 50);

CREATE TABLE IF NOT EXISTS formulations (
  id                 TEXT PRIMARY KEY,
  name               TEXT NOT NULL,
  type               TEXT,
  summary            TEXT,
  herb_ids           TEXT[] NOT NULL DEFAULT '{}',
  indications        TEXT[] NOT NULL DEFAULT '{}',
  dosha_effect       JSONB NOT NULL DEFAULT '{}',
  evidence_level     TEXT NOT NULL,
  evidence_note      TEXT,
  contraindications  TEXT[] NOT NULL DEFAULT '{}',
  drug_interactions  JSONB NOT NULL DEFAULT '[]',
  pregnancy          TEXT NOT NULL DEFAULT 'insufficient-data',
  safety_notes       TEXT,
  embedding          VECTOR(384)
);

-- ── Assessments + results (health data — RLS protected) ──────────────────────
CREATE TABLE IF NOT EXISTS assessments (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  input              JSONB NOT NULL,              -- symptoms, conditions, meds, etc.
  triage_level       TEXT NOT NULL,
  blocked            BOOLEAN NOT NULL DEFAULT FALSE,
  result             JSONB NOT NULL,              -- recommendations + scoring + lifestyle
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS assessments_user_idx ON assessments(user_id, created_at DESC);

-- ── Audit log (metadata only — never raw health payloads) ────────────────────
CREATE TABLE IF NOT EXISTS audit_log (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID REFERENCES users(id) ON DELETE SET NULL,
  actor_email        TEXT,
  action             TEXT NOT NULL,
  meta               JSONB NOT NULL DEFAULT '{}',
  at                 TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS audit_action_idx ON audit_log(action, at DESC);

-- ── Row-Level Security ───────────────────────────────────────────────────────
-- The API sets `SET LOCAL app.user_id = '<uuid>'` per request after verifying the
-- JWT; policies key off that. Admins bypass via a dedicated role/claim.
ALTER TABLE users        ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments  ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log    ENABLE ROW LEVEL SECURITY;

CREATE POLICY users_self_select ON users
  FOR SELECT USING (id = current_setting('app.user_id', true)::uuid);
CREATE POLICY users_self_update ON users
  FOR UPDATE USING (id = current_setting('app.user_id', true)::uuid);

CREATE POLICY assessments_owner_all ON assessments
  USING (user_id = current_setting('app.user_id', true)::uuid)
  WITH CHECK (user_id = current_setting('app.user_id', true)::uuid);

CREATE POLICY audit_owner_select ON audit_log
  FOR SELECT USING (user_id = current_setting('app.user_id', true)::uuid);

-- Knowledge base is world-readable (public educational content).
ALTER TABLE herbs        ENABLE ROW LEVEL SECURITY;
ALTER TABLE formulations ENABLE ROW LEVEL SECURITY;
CREATE POLICY herbs_public_read        ON herbs        FOR SELECT USING (true);
CREATE POLICY formulations_public_read ON formulations FOR SELECT USING (true);
