"""Dosha analysis + explainable recommender (Python mirror of the client engine).

The pipeline is safety-first and deterministic:
  1. triage (can withhold everything)
  2. dosha analysis
  3. per-herb safety gate (removes unsafe herbs)
  4. transparent scoring + factor breakdown
"""
from __future__ import annotations

from app.data_loader import (
    concern_map,
    dosha_meta,
    herbs,
    lifestyle_library,
    universal_guidance,
)
from app.engine.safety import check_herb_safety
from app.engine.triage import run_triage

EVIDENCE_META = {
    "traditional": {"label": "Traditional use", "blurb": "Documented in classical texts; no modern trials."},
    "preclinical": {"label": "Pre-clinical", "blurb": "Lab or animal studies only."},
    "preliminary-clinical": {"label": "Preliminary clinical", "blurb": "Small or early human studies."},
    "moderate-clinical": {"label": "Moderate clinical", "blurb": "Multiple human trials or reviews."},
}

SCORING = {
    "per_concern_match": 22,
    "max_concern_points": 66,
    "pacify_imbalance": 14,
    "aggravate_imbalance": -18,
    "pacify_dominant": 6,
    "evidence_bonus": {
        "moderate-clinical": 10,
        "preliminary-clinical": 6,
        "preclinical": 2,
        "traditional": 0,
    },
    "caution_penalty": -12,
    "min_score": 20,
    "max_recommendations": 6,
}

PRAKRITI_QUESTION_COUNT = 9


def analyze_dosha(prakriti_answers: dict[str, str], concerns: list[str]) -> dict:
    counts = {"vata": 0, "pitta": 0, "kapha": 0}
    answered = 0
    for ans in prakriti_answers.values():
        if ans in counts:
            counts[ans] += 1
            answered += 1

    if answered == 0:
        prakriti = {"vata": 34, "pitta": 33, "kapha": 33}
    else:
        prakriti = {k: round(v / answered * 100) for k, v in counts.items()}

    dominant = max(prakriti, key=prakriti.get)

    imbalance_counts = {"vata": 0, "pitta": 0, "kapha": 0}
    cmap = concern_map()
    for cid in concerns:
        d = cmap.get(cid, {}).get("associatedDosha")
        if d:
            imbalance_counts[d] += 1
    imbalance = max(imbalance_counts, key=imbalance_counts.get) if sum(imbalance_counts.values()) else None

    return {"prakriti": prakriti, "dominant": dominant, "imbalance": imbalance}


def _clamp(n: float) -> int:
    return max(0, min(100, round(n)))


def _score_herb(herb, concerns, imbalance, dominant, caution) -> dict:
    factors = []
    cmap = concern_map()
    dmeta = dosha_meta()

    matched = [c for c in concerns if c in herb["targets"]]
    concern_points = min(len(matched) * SCORING["per_concern_match"], SCORING["max_concern_points"])
    if matched:
        labels = ", ".join(cmap.get(c, {}).get("label", c) for c in matched)
        factors.append({"label": "Matches your concerns", "detail": f"Traditionally used for: {labels}.", "weight": concern_points})

    if imbalance:
        effect = herb["doshaEffect"][imbalance]
        if effect < 0:
            factors.append({"label": f"Pacifies {dmeta[imbalance]['name']}", "detail": "Balances the pattern behind your concerns.", "weight": SCORING["pacify_imbalance"]})
        elif effect > 0:
            factors.append({"label": f"May aggravate {dmeta[imbalance]['name']}", "detail": "Can increase an already-elevated dosha.", "weight": SCORING["aggravate_imbalance"]})

    if herb["doshaEffect"][dominant] < 0:
        factors.append({"label": f"Suits your {dmeta[dominant]['name']} constitution", "detail": "Balancing for your dominant nature.", "weight": SCORING["pacify_dominant"]})

    ev_bonus = SCORING["evidence_bonus"][herb["evidence"]]
    if ev_bonus > 0:
        factors.append({"label": f"Evidence: {EVIDENCE_META[herb['evidence']]['label']}", "detail": EVIDENCE_META[herb["evidence"]]["blurb"], "weight": ev_bonus})

    if caution:
        factors.append({"label": "Personal caution applies", "detail": "A contraindication or interaction needs professional guidance.", "weight": SCORING["caution_penalty"]})

    raw = sum(f["weight"] for f in factors)
    return {"score": _clamp(raw), "factors": factors, "matched": matched}


def generate_recommendations(payload: dict) -> dict:
    profile = payload.get("profile", {})
    concerns = payload.get("concerns", [])
    triage = run_triage(payload.get("redFlagAnswers", {}), payload.get("narrative", ""))
    dosha = analyze_dosha(payload.get("prakritiAnswers", {}), concerns)

    base = {
        "triage": triage.__dict__,
        "prakriti": dosha["prakriti"],
        "dominantDosha": dosha["dominant"],
        "imbalance": dosha["imbalance"],
        "concerns": concerns,
    }

    if triage.block_recommendations:
        return {**base, "recommendations": [], "withheldForSafety": [], "lifestyle": []}

    withheld = []
    recs = []
    for herb in herbs():
        safety = check_herb_safety(herb, profile)
        if safety.status == "blocked":
            reason = next((c["reason"] for c in safety.contraindications if c["severity"] == "avoid"), None) \
                or next((i["effect"] for i in safety.interactions if i["severity"] == "severe"), "Serious contraindication.")
            withheld.append({"herb": herb["commonName"], "reason": reason})
            continue

        scored = _score_herb(herb, concerns, dosha["imbalance"], dosha["dominant"], safety.status == "caution")
        if not scored["matched"] or scored["score"] < SCORING["min_score"]:
            continue
        recs.append({
            "herbId": herb["id"],
            "herbName": herb["commonName"],
            "score": scored["score"],
            "factors": scored["factors"],
            "matchedConcerns": scored["matched"],
            "evidence": herb["evidence"],
            "safety": safety.__dict__,
        })

    recs.sort(key=lambda r: r["score"], reverse=True)
    recs = recs[: SCORING["max_recommendations"]]

    focus = dosha["imbalance"] or dosha["dominant"]
    lifestyle = list(lifestyle_library()[focus]) + [universal_guidance()]

    return {**base, "recommendations": recs, "withheldForSafety": withheld, "lifestyle": lifestyle}
