"""Recommendation engine (reference) — safety-first orchestration.

Order of operations mirrors the SPA:
  1. deterministic emergency triage (may hard-block)
  2. keyword/embedding retrieval over the knowledge base
  3. deterministic contraindication + interaction filtering
  4. explainable scoring of the survivors
"""
from __future__ import annotations

from .data import HERBS, EVIDENCE_WEIGHT
from .safety import run_triage, check_safety

DISCLAIMERS = [
    "AyurSage provides general educational wellness information based on Ayurvedic tradition and does not diagnose, treat, prescribe, or cure any condition.",
    "These suggestions are not a substitute for professional medical advice. Talk to a qualified healthcare provider before combining herbs with medications or during pregnancy.",
    "Never stop or change a prescribed medication based on this information.",
]


def _relevance(herb: dict, query_terms: set[str]) -> tuple[float, list[str]]:
    inds = set(herb.get("indications", []))
    overlap = inds & query_terms
    denom = len(query_terms) or 1
    return (len(overlap) / denom, sorted(overlap))


def _dominant_dosha(inp: dict) -> str | None:
    scores = inp.get("dosha_scores")
    if not scores:
        return None
    return max(scores, key=scores.get) if any(scores.values()) else None


def _score(herb: dict, relevance: float, dominant: str | None, cautions: list[dict]) -> dict:
    rel = max(0.0, min(1.0, relevance))
    if dominant:
        eff = herb["dosha_effect"].get(dominant, "neutral")
        constitution = 1.0 if eff == "decrease" else 0.6 if eff == "neutral" else 0.2
    else:
        constitution = 0.6
    evidence = EVIDENCE_WEIGHT.get(herb["evidence_level"], 0.5)
    safety = 1.0
    for c in cautions:
        safety -= 0.3 if c["severity"] == "caution" else 0.1
    safety = max(0.0, safety)

    components = [
        {"label": "Symptom relevance", "value": rel, "weight": 0.45},
        {"label": "Constitutional fit", "value": constitution, "weight": 0.20},
        {"label": "Evidence strength", "value": evidence, "weight": 0.25},
        {"label": "Safety margin", "value": safety, "weight": 0.10},
    ]
    score = round(sum(c["value"] * c["weight"] for c in components) * 100)
    return {"score": score, "components": components}


def recommend(inp: dict) -> dict:
    # Emergency screen keys share the symptom channel used by triage.
    triage = run_triage(inp.get("symptoms", []), inp.get("free_text", ""))
    dominant = _dominant_dosha(inp)

    if triage["blocked"]:
        return {"triage": triage, "dominant_dosha": dominant, "recommendations": [],
                "excluded": [], "disclaimers": DISCLAIMERS}

    query_terms = set(inp.get("symptoms", [])) | set(inp.get("goals", []))
    recs, excluded = [], []
    for herb in HERBS:
        relevance, matched = _relevance(herb, query_terms)
        if relevance <= 0:
            continue
        safety = check_safety(herb, inp)
        if safety["blocked"]:
            excluded.append({"id": herb["id"], "name": herb["name"],
                             "reasons": [f["message"] for f in safety["blocking"]]})
            continue
        scored = _score(herb, relevance, dominant, safety["flags"])
        recs.append({
            "id": herb["id"], "name": herb["name"], "latin": herb["latin"],
            "summary": herb["summary"], "evidence_level": herb["evidence_level"],
            "matched": matched, "cautions": safety["flags"], **scored,
        })

    recs.sort(key=lambda r: r["score"], reverse=True)
    return {"triage": triage, "dominant_dosha": dominant, "recommendations": recs[:6],
            "excluded": excluded, "disclaimers": DISCLAIMERS}
