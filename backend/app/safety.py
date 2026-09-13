"""Deterministic safety layer — the exact-match rules that protect users.

This mirrors the TypeScript implementation in the SPA (src/lib/safety/*). It is
pure and testable, and no model output can override its decisions.
"""
from __future__ import annotations

import re
from dataclasses import dataclass, field


@dataclass
class RedFlagRule:
    id: str
    level: str  # 'emergency' | 'urgent'
    title: str
    guidance: str
    triggers: list[str] = field(default_factory=list)


RED_FLAG_RULES: list[RedFlagRule] = [
    RedFlagRule("cardiac", "emergency", "Possible cardiac emergency",
                "Chest pain or pressure can signal a heart attack. Call emergency services now.",
                ["chest pain", "chest pressure", "chest tightness", "pain radiating to arm"]),
    RedFlagRule("stroke", "emergency", "Possible stroke (FAST)",
                "Sudden face drooping, arm weakness, or speech difficulty may indicate a stroke. Call emergency services immediately.",
                ["face drooping", "slurred speech", "sudden weakness", "one-sided weakness", "sudden numbness"]),
    RedFlagRule("breathing", "emergency", "Severe breathing difficulty",
                "Severe difficulty breathing is a medical emergency. Call emergency services now.",
                ["difficulty breathing", "cannot breathe", "gasping", "blue lips", "choking"]),
    RedFlagRule("anaphylaxis", "emergency", "Possible severe allergic reaction",
                "Throat/tongue swelling with breathing trouble suggests anaphylaxis. Use epinephrine if available and call emergency services.",
                ["swelling of throat", "swelling of tongue", "throat closing", "anaphylaxis"]),
    RedFlagRule("bleeding", "emergency", "Severe or uncontrolled bleeding",
                "Heavy/uncontrolled bleeding or vomiting/coughing blood needs emergency care.",
                ["severe bleeding", "uncontrolled bleeding", "vomiting blood", "coughing blood"]),
    RedFlagRule("neuro", "emergency", "Serious neurological signs",
                "A sudden worst-ever headache, seizure, or fainting needs urgent evaluation. Call emergency services.",
                ["worst headache of my life", "sudden severe headache", "seizure", "loss of consciousness", "fainting"]),
    RedFlagRule("abdomen", "emergency", "Severe abdominal pain",
                "Sudden severe abdominal pain can be a surgical emergency. Seek urgent medical care.",
                ["severe abdominal pain", "rigid abdomen"]),
    RedFlagRule("mental_health", "emergency", "Thoughts of self-harm",
                "Please contact a crisis line now (in the US/Canada dial 988) or your local emergency number. You are not alone.",
                ["suicidal", "want to die", "kill myself", "end my life", "self harm", "hurt myself"]),
    RedFlagRule("infection_urgent", "urgent", "Signs of serious infection",
                "A high or persistent fever, especially with confusion, should be evaluated promptly.",
                ["high fever", "persistent high fever", "shaking chills"]),
]

PEDIATRIC_KEYWORDS = ["my baby", "my infant", "newborn", "toddler", "my child"]

_LEVEL_RANK = {"routine": 0, "urgent": 1, "emergency": 2}


def _normalize(text: str) -> str:
    return re.sub(r"\s+", " ", re.sub(r"[^a-z0-9\s]", " ", (text or "").lower())).strip()


def run_triage(red_flag_selections: list[str] | None = None, free_text: str = "") -> dict:
    selections = set(red_flag_selections or [])
    norm = _normalize(free_text)

    matched = []
    for rule in RED_FLAG_RULES:
        if rule.id in selections or any(t in selections or _normalize(t) in norm for t in rule.triggers):
            matched.append(rule)

    pediatric = any(_normalize(k) in norm for k in PEDIATRIC_KEYWORDS)

    level = "routine"
    for m in matched:
        if _LEVEL_RANK[m.level] > _LEVEL_RANK[level]:
            level = m.level

    block = level == "emergency" or pediatric
    if pediatric and level == "routine":
        level = "urgent"

    return {
        "level": level,
        "blocked": block,
        "matched": [{"id": m.id, "title": m.title, "guidance": m.guidance, "level": m.level} for m in matched],
    }


# ── Contraindication + drug-interaction checking ─────────────────────────────

_CONTRA_LABELS = {
    "hypertension": "high blood pressure", "diabetes": "diabetes", "thyroid": "a thyroid disorder",
    "liver_disease": "liver disease", "kidney_disease": "kidney disease",
    "bleeding_disorder": "a bleeding disorder", "gallstones": "gallstones",
    "gerd": "GERD / peptic ulcer", "autoimmune": "an autoimmune condition",
    "heart_disease": "heart disease", "surgery_2w": "upcoming surgery",
}

MEDICATION_CLASSES = {
    "warfarin": ["anticoagulant"], "aspirin": ["anticoagulant"],
    "insulin": ["antidiabetic"], "metformin": ["antidiabetic"],
    "antihypertensive": ["antihypertensive"], "thyroid_med": ["thyroid"],
    "sedative": ["sedative", "cns_depressant"], "immunosuppressant": ["immunosuppressant"],
}


def check_safety(item: dict, inp: dict) -> dict:
    """item: herb/formulation dict; inp: assessment dict. Returns flags + blocked."""
    flags: list[dict] = []
    norm = _normalize(inp.get("free_text", ""))
    drug_classes: set[str] = set()
    for med in inp.get("medications", []):
        drug_classes.update(MEDICATION_CLASSES.get(med, []))

    conditions = set(inp.get("conditions", []))
    symptoms = set(inp.get("symptoms", []))

    for key in item.get("contraindications", []):
        label = _CONTRA_LABELS.get(key, key.replace("_", " "))
        if key in conditions or key in symptoms or _normalize(label) in norm:
            flags.append({"kind": "contraindication", "severity": "avoid",
                          "message": f"Not recommended because you indicated {label}."})

    if inp.get("pregnant"):
        preg = item.get("pregnancy", "insufficient-data")
        if preg == "avoid":
            flags.append({"kind": "pregnancy", "severity": "avoid", "message": "Not recommended during pregnancy."})
        elif preg in ("caution", "insufficient-data"):
            flags.append({"kind": "pregnancy", "severity": "caution",
                          "message": "Use only under professional guidance during pregnancy."})

    for di in item.get("drug_interactions", []):
        if di.get("drug_class_key") in drug_classes:
            flags.append({"kind": "interaction", "severity": di.get("severity", "caution"),
                          "message": f"Possible interaction with {di.get('drug_class','').lower()}: {di.get('mechanism','')}"})

    blocking = [f for f in flags if f["severity"] == "avoid"]
    return {"flags": flags, "blocked": len(blocking) > 0, "blocking": blocking}
