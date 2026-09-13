# Reference API

The FastAPI reference backend (`/backend`) exposes the same safety-first domain
as the SPA. All endpoints return JSON. The SPA does **not** require this service —
it runs fully in-browser — but you can point it here with `VITE_API_BASE_URL`.

Base URL (compose): `http://localhost:8000`

## Auth

### `POST /api/auth/register`
```json
{ "name": "Asha", "email": "asha@example.com", "password": "at-least-8", "consent": true }
```
→ `{ "access_token": "<jwt>", "token_type": "bearer" }`

### `POST /api/auth/login`
```json
{ "email": "asha@example.com", "password": "at-least-8" }
```
→ `{ "access_token": "<jwt>", "token_type": "bearer" }`

Send the token as `Authorization: Bearer <jwt>` on protected routes.

## Safety & recommendations

### `POST /api/triage`  *(public)*
```json
{ "red_flag_selections": ["cardiac"], "free_text": "crushing chest pain" }
```
→
```json
{ "level": "emergency", "blocked": true, "matched": [{ "id": "cardiac", "title": "Possible cardiac emergency", "guidance": "…", "level": "emergency" }] }
```

### `POST /api/recommend`  *(auth required)*
```json
{
  "symptoms": ["insomnia", "stress"],
  "conditions": [],
  "medications": [],
  "pregnant": false,
  "goals": ["better_sleep"],
  "dosha_scores": { "vata": 5, "pitta": 2, "kapha": 1 }
}
```
→ `{ triage, dominant_dosha, recommendations[], excluded[], disclaimers[] }`
where each recommendation includes `score` and the four transparent `components`.

Emergency inputs return `recommendations: []` with escalation guidance in
`triage` — herbal suggestions are withheld.

## Knowledge base

### `GET /api/herbs`  *(public)*
→ `{ "herbs": [ … ], "count": n }`

## Admin

### `GET /api/audit`  *(admin only)*
→ `{ "events": [ … ] }` — metadata only; never raw health payloads.

## Health

### `GET /health`
→ `{ "status": "ok", … }`

---

Interactive docs are available at `/docs` (Swagger UI) when the service is
running.
