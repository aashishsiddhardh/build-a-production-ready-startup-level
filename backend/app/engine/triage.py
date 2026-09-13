"""Deterministic emergency triage — the Python mirror of the client engine.

AI output NEVER feeds into this function. Any emergency signal blocks all
herbal recommendations. Fail safe: broad matching is intentional.
"""
from __future__ import annotations

import re
from dataclasses import dataclass, field

RED_FLAG_QUESTIONS = [
    ("chest-pain", "Chest pain / pressure", "emergency",
     "These can be signs of a heart attack. Call your local emergency number now."),
    ("breathing", "Difficulty breathing", "emergency",
     "Difficulty breathing is a medical emergency. Seek emergency care immediately."),
    ("stroke", "Stroke signs", "emergency",
     "These are warning signs of a stroke. Call emergency services immediately."),
    ("severe-bleeding", "Severe bleeding", "emergency",
     "Uncontrolled bleeding requires emergency care now."),
    ("anaphylaxis", "Severe allergic reaction", "emergency",
     "This may be anaphylaxis. Use prescribed epinephrine and call emergency services."),
    ("self-harm", "Thoughts of self-harm", "emergency",
     "Please contact a crisis helpline or emergency services right now. You are not alone."),
    ("fainting", "Fainting / confusion", "emergency",
     "These symptoms need urgent, in-person evaluation. Seek emergency care."),
    ("severe-pain", "Sudden severe pain", "emergency",
     "Sudden severe pain needs urgent medical assessment. Seek emergency care."),
    ("pregnancy-warning", "Pregnancy warning signs", "emergency",
     "These are pregnancy warning signs. Contact your obstetric provider or emergency services immediately."),
    ("persistent", "Persistent / worsening symptoms", "urgent",
     "Please see a licensed clinician soon for a proper evaluation before using wellness herbs."),
]

KEYWORD_RULES = [
    ("kw-chest", "Chest pain", "emergency",
     [r"chest pain", r"chest tightness", r"chest pressure", r"crushing", r"pain in.*(arm|jaw)", r"heart attack"],
     "Chest pain can signal a heart emergency. Call your local emergency number now."),
    ("kw-breathing", "Breathing difficulty", "emergency",
     [r"can'?t breathe", r"cannot breathe", r"short(ness)? of breath", r"gasping", r"suffocat"],
     "Difficulty breathing is an emergency. Seek emergency care immediately."),
    ("kw-stroke", "Stroke symptoms", "emergency",
     [r"face droop", r"slurred speech", r"numb.*(side|arm|face)", r"sudden.*(weakness|vision loss)", r"stroke"],
     "These may be stroke warning signs. Call emergency services immediately."),
    ("kw-selfharm", "Self-harm", "emergency",
     [r"suicid", r"kill myself", r"end my life", r"harm myself", r"self.?harm", r"want to die"],
     "Please reach out for immediate help — contact a crisis line or emergency services now."),
    ("kw-bleeding", "Severe bleeding", "emergency",
     [r"coughing up blood", r"vomiting blood", r"blood in.*(vomit|stool)", r"bleeding heavily"],
     "Bleeding of this kind requires emergency care right now."),
    ("kw-anaphylaxis", "Allergic reaction", "emergency",
     [r"throat.*(swell|closing)", r"anaphylax", r"face.*swelling", r"tongue.*swelling"],
     "This may be a severe allergic reaction. Use prescribed epinephrine and call emergency services."),
    ("kw-persistent", "Persistent symptoms", "urgent",
     [r"weeks", r"getting worse", r"losing weight", r"unexplained weight", r"months"],
     "Persistent or worsening symptoms should be evaluated by a clinician first."),
]


@dataclass
class TriageResult:
    level: str  # emergency | urgent | self-care
    block_recommendations: bool
    matched_flags: list[dict] = field(default_factory=list)
    headline: str = ""
    guidance: str = ""


def run_triage(red_flag_answers: dict[str, bool], narrative: str) -> TriageResult:
    matched: list[tuple[str, str, str, str]] = []

    for qid, label, level, advice in RED_FLAG_QUESTIONS:
        if red_flag_answers.get(qid) is True:
            matched.append((qid, label, advice, level))

    text = (narrative or "").lower()
    if text.strip():
        for rid, label, level, patterns, advice in KEYWORD_RULES:
            if any(re.search(p, text) for p in patterns):
                if not any(m[1] == label for m in matched):
                    matched.append((rid, label, advice, level))

    has_emergency = any(m[3] == "emergency" for m in matched)
    has_urgent = any(m[3] == "urgent" for m in matched)
    level = "emergency" if has_emergency else "urgent" if has_urgent else "self-care"
    block = has_emergency or has_urgent

    if level == "emergency":
        headline = "This may be a medical emergency"
        guidance = ("One or more answers matches an emergency warning sign. We do not provide herbal "
                    "recommendations here. Contact your local emergency number or nearest emergency department now.")
    elif level == "urgent":
        headline = "Please see a clinician before using wellness herbs"
        guidance = ("Your answers suggest a situation that should be evaluated by a licensed professional first. "
                    "We are withholding herbal recommendations until you have been assessed.")
    else:
        headline = "No emergency warning signs detected"
        guidance = ("We did not detect emergency warning signs. The suggestions are educational and general — "
                    "not a diagnosis or treatment.")

    return TriageResult(
        level=level,
        block_recommendations=block,
        matched_flags=[{"id": m[0], "label": m[1], "advice": m[2]} for m in matched],
        headline=headline,
        guidance=guidance,
    )
