"""Deterministic contraindication + drug-interaction safety gate (Python mirror)."""
from __future__ import annotations

from dataclasses import dataclass, field

CHILD_AGE_THRESHOLD = 12


@dataclass
class SafetyCheck:
    status: str  # ok | caution | blocked
    contraindications: list[dict] = field(default_factory=list)
    interactions: list[dict] = field(default_factory=list)


def derive_profile_flags(profile: dict) -> set[str]:
    flags = set(profile.get("conditions", []) or [])
    if profile.get("pregnant"):
        flags.add("pregnancy")
    if profile.get("breastfeeding"):
        flags.add("breastfeeding")
    age = profile.get("age")
    if age is not None and age < CHILD_AGE_THRESHOLD:
        flags.add("child")
    return flags


def check_herb_safety(herb: dict, profile: dict) -> SafetyCheck:
    flags = derive_profile_flags(profile)
    meds = set(profile.get("medications", []) or [])

    contraindications = [
        {"flag": c["flag"], "reason": c["reason"], "severity": c["severity"]}
        for c in herb.get("contraindications", [])
        if c["flag"] in flags
    ]
    interactions = [
        {"drugClass": i["drugClass"], "effect": i["effect"], "severity": i["severity"]}
        for i in herb.get("interactions", [])
        if i["drugClass"] in meds
    ]

    blocked = any(c["severity"] == "avoid" for c in contraindications) or any(
        i["severity"] == "severe" for i in interactions
    )
    caution = bool(contraindications or interactions)
    status = "blocked" if blocked else "caution" if caution else "ok"
    return SafetyCheck(status=status, contraindications=contraindications, interactions=interactions)
