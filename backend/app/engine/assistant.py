"""Conversational assistant: deterministic guardrails + pgvector RAG.

Guardrails run BEFORE any generation and can fully short-circuit. Retrieval
uses pgvector cosine distance over KnowledgeChunk embeddings. If an LLM key is
configured the retrieved context is handed to the model for phrasing; otherwise
a deterministic, grounded template answer is returned. Either way the model
never sets safety and citations only reference retrieved herbs.
"""
from __future__ import annotations

import re

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.data_loader import herb_map
from app.engine.embeddings import embed
from app.engine.triage import run_triage
from app.models import KnowledgeChunk

_MED_VERBS = re.compile(r"\b(stop|stopping|quit|quitting|skip|skipping|discontinue|ditch|swap|replace|replacing)\b", re.I)
_MED_OFF = re.compile(r"\b(come|get|go)\s+off\b", re.I)
_MED_NOUNS = re.compile(
    r"\b(medications?|meds|medicine|medicines|pills?|drugs?|insulin|statins?|metformin|prescriptions?|chemo|chemotherapy|doses?|tablets?|antidepressants?|blood ?thinners?)\b",
    re.I,
)
_MED_INSTEAD = re.compile(r"\binstead of (my |the )?(medication|medicine|doctor|chemo|insulin|treatment|meds)\b", re.I)
_CURE = re.compile(r"\b(cure|cures|permanently fix)\b", re.I)
_DIAGNOSE = re.compile(r"(what disease|do i have|diagnose|what'?s wrong with me)", re.I)


def _wants_stop_med(msg: str) -> bool:
    if _MED_INSTEAD.search(msg):
        return True
    return bool(_MED_NOUNS.search(msg) and (_MED_VERBS.search(msg) or _MED_OFF.search(msg)))


def retrieve(db: Session, query: str, k: int = 5) -> list[dict]:
    vec = embed(query)
    if not any(vec):
        return []
    # pgvector cosine distance operator (<=>); lower is closer.
    stmt = (
        select(KnowledgeChunk, KnowledgeChunk.embedding.cosine_distance(vec).label("dist"))
        .order_by("dist")
        .limit(k)
    )
    rows = db.execute(stmt).all()
    return [{"herbId": chunk.herb_id, "text": chunk.text, "score": 1 - float(dist)} for chunk, dist in rows]


def answer(db: Session, message: str) -> dict:
    triage = run_triage({}, message)
    if triage.level == "emergency":
        advice = "\n".join(f"• {f['advice']}" for f in triage.matched_flags)
        return {
            "content": ("This sounds like it could be a medical emergency, so I can't offer wellness suggestions here.\n\n"
                        f"{advice}\n\nPlease contact your local emergency number or nearest emergency department now."),
            "safety_banner": "emergency",
            "citations": [],
        }

    if _wants_stop_med(message):
        return {
            "content": ("I can't advise stopping, skipping, or replacing any prescribed medication — that can be dangerous. "
                        "Please keep taking it as prescribed and talk with the clinician who prescribed it before any change. "
                        "I'm happy to share general practices used alongside conventional care, with your doctor's awareness."),
            "safety_banner": "medication",
            "citations": [],
        }

    preface = []
    if _DIAGNOSE.search(message):
        preface.append("I can't diagnose conditions — that needs a licensed clinician. I can share general Ayurvedic wellness information.")
    if _CURE.search(message):
        preface.append("A note on language: Ayurveda offers supportive wellness practices, but I can't promise any herb will cure a condition.")

    chunks = retrieve(db, message, 5)
    if not chunks:
        return {
            "content": (("\n\n".join(preface) + "\n\n") if preface else "")
            + "I don't have specific knowledge-base information matching that. Tell me about your sleep, digestion, stress or energy and I'll point you to relevant herbs — or take the full assessment for personalized, safety-checked suggestions.",
            "safety_banner": "general",
            "citations": [],
        }

    top_ids, seen = [], set()
    for c in chunks:
        if c["herbId"] not in seen:
            seen.add(c["herbId"])
            top_ids.append(c["herbId"])
    top_ids = top_ids[:3]

    hmap = herb_map()
    lines = list(preface)
    lines.append("Here's what the AyurSage knowledge base has that's relevant:")
    citations = []
    for hid in top_ids:
        h = hmap.get(hid)
        if not h:
            continue
        lines.append(f"\n**{h['commonName']}** ({h['latinName']}) — {h['summary']} Evidence: {h['evidence']}.")
        citations.append({"label": h["commonName"], "herbId": hid})
    lines.append("\nThese are general educational notes, not personalized medical advice.")

    return {"content": "\n".join(lines), "safety_banner": "general", "citations": citations}
