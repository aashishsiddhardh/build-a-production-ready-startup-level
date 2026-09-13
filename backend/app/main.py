"""AyurSage reference API (FastAPI).

SAFETY-FIRST ARCHITECTURE
    Deterministic rules (app/safety.py) own every medical-safety decision:
    emergency triage, contraindications, and drug interactions. The optional
    LLM/embedding layer only ever phrases or ranks around those decisions — it
    can never override them, invent evidence, diagnose, or prescribe.

This module keeps an in-memory store so it runs standalone for demos. In
production, swap the `_USERS`/`_AUDIT` dicts for the PostgreSQL tables defined in
db/schema.sql (with pgvector for retrieval and Row-Level Security on user data).
"""
from __future__ import annotations

import os
import uuid
from datetime import datetime, timezone

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from .data import HERBS
from .models import AssessmentInput, LoginRequest, RegisterRequest, TokenResponse, TriageRequest
from .recommend import recommend
from .safety import run_triage
from .security import create_access_token, decode_token, hash_password, verify_password

app = FastAPI(
    title="AyurSage API",
    version="1.0.0",
    description="Safety-first Ayurvedic wellness recommendation API. Educational only; not medical advice.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:5173").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── In-memory stores (replace with PostgreSQL in production) ──────────────────
_USERS: dict[str, dict] = {}
_AUDIT: list[dict] = []
_bearer = HTTPBearer(auto_error=False)


def _audit(action: str, user_id: str | None, email: str | None, meta: dict | None = None) -> None:
    _AUDIT.append({
        "id": str(uuid.uuid4()),
        "at": datetime.now(timezone.utc).isoformat(),
        "user_id": user_id,
        "actor_email": email,
        "action": action,
        "meta": meta or {},
    })


def current_user(creds: HTTPAuthorizationCredentials | None = Depends(_bearer)) -> dict:
    if creds is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Missing bearer token")
    try:
        payload = decode_token(creds.credentials)
    except Exception:  # noqa: BLE001
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid or expired token")
    user = _USERS.get(payload.get("sub"))
    if not user:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Unknown user")
    return user


# ── Health ────────────────────────────────────────────────────────────────────
@app.get("/health")
def health() -> dict:
    return {"status": "ok", "service": "ayursage-api", "time": datetime.now(timezone.utc).isoformat()}


# ── Auth ───────────────────────────────────────────────────────────────────────
@app.post("/api/auth/register", response_model=TokenResponse)
def register(req: RegisterRequest) -> TokenResponse:
    if not req.consent:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Consent is required")
    if any(u["email"] == req.email for u in _USERS.values()):
        raise HTTPException(status.HTTP_409_CONFLICT, "Email already registered")
    uid = str(uuid.uuid4())
    _USERS[uid] = {
        "id": uid, "email": req.email, "name": req.name, "role": "user",
        "password_hash": hash_password(req.password),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    _audit("auth.register", uid, req.email)
    return TokenResponse(access_token=create_access_token(uid, "user"))


@app.post("/api/auth/login", response_model=TokenResponse)
def login(req: LoginRequest) -> TokenResponse:
    user = next((u for u in _USERS.values() if u["email"] == req.email), None)
    if not user or not verify_password(req.password, user["password_hash"]):
        _audit("auth.login_failed", None, req.email)
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid email or password")
    _audit("auth.login", user["id"], user["email"])
    return TokenResponse(access_token=create_access_token(user["id"], user["role"]))


# ── Knowledge base ──────────────────────────────────────────────────────────────
@app.get("/api/herbs")
def herbs() -> dict:
    return {"herbs": HERBS, "count": len(HERBS)}


# ── Safety + recommendations ────────────────────────────────────────────────────
@app.post("/api/triage")
def triage(req: TriageRequest) -> dict:
    return run_triage(req.red_flag_selections, req.free_text)


@app.post("/api/recommend")
def recommend_endpoint(inp: AssessmentInput, user: dict = Depends(current_user)) -> dict:
    result = recommend(inp.model_dump())
    _audit(
        "assessment.blocked_emergency" if result["triage"]["blocked"] else "assessment.run",
        user["id"], user["email"],
        {"triage": result["triage"]["level"], "results": len(result["recommendations"])},
    )
    return result


@app.get("/api/audit")
def audit_log(user: dict = Depends(current_user)) -> dict:
    if user["role"] != "admin":
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Admin only")
    return {"events": list(reversed(_AUDIT))}
