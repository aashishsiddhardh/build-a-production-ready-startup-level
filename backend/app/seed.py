"""Database bootstrap: create pgvector extension, tables, and seed data."""
from __future__ import annotations

from sqlalchemy import text
from sqlalchemy.orm import Session

from app.data_loader import concern_map, herbs
from app.database import Base, engine
from app.engine.embeddings import embed
from app.models import Herb, KnowledgeChunk, User
from app.security import hash_password

EVIDENCE_LABEL = {
    "traditional": "Traditional use",
    "preclinical": "Pre-clinical",
    "preliminary-clinical": "Preliminary clinical",
    "moderate-clinical": "Moderate clinical",
}


def init_extensions() -> None:
    with engine.begin() as conn:
        conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))


def create_tables() -> None:
    Base.metadata.create_all(bind=engine)


def _chunks_for(h: dict) -> list[tuple[str, str]]:
    cmap = concern_map()
    concern_labels = ", ".join(cmap.get(t, {}).get("label", t) for t in h["targets"])
    contra = " ".join(f"{c['flag']} ({c['severity']}): {c['reason']}" for c in h["contraindications"])
    inter = " ".join(f"{i['drugClass']}: {i['effect']}" for i in h["interactions"])
    return [
        (f"{h['id']}-overview",
         f"{h['commonName']} ({h['sanskritName']}, {h['latinName']}). {h['summary']} "
         f"Qualities: {', '.join(h['qualities'])}. Commonly used for {concern_labels}."),
        (f"{h['id']}-evidence",
         f"{h['commonName']} evidence level is {EVIDENCE_LABEL[h['evidence']]}. {h['evidenceNote']}"),
        (f"{h['id']}-safety",
         f"{h['commonName']} safety. Contraindications: {contra or 'none'}. Interactions: {inter or 'none'}. "
         f"Notes: {' '.join(h['safetyNotes'])}"),
    ]


def seed(db: Session) -> None:
    if db.query(Herb).count() == 0:
        for h in herbs():
            db.add(Herb(
                id=h["id"], common_name=h["commonName"], sanskrit_name=h["sanskritName"],
                latin_name=h["latinName"], category=h["category"], summary=h["summary"],
                evidence=h["evidence"], evidence_note=h["evidenceNote"], dosha_effect=h["doshaEffect"],
                targets=h["targets"], contraindications=h["contraindications"], interactions=h["interactions"],
                citations=h["citations"], common_forms=h["commonForms"], qualities=h["qualities"],
                safety_notes=h["safetyNotes"],
            ))
            for cid, ctext in _chunks_for(h):
                db.add(KnowledgeChunk(id=cid, herb_id=h["id"], text=ctext, embedding=embed(ctext)))
        db.commit()

    if db.query(User).count() == 0:
        db.add(User(email="admin@ayursage.demo", name="Dr. Meera Rao", role="admin",
                    password_hash=hash_password("admin1234")))
        db.add(User(email="demo@ayursage.demo", name="Asha Patel", role="user",
                    password_hash=hash_password("wellness123")))
        db.commit()


def bootstrap() -> None:
    init_extensions()
    create_tables()
    from app.database import SessionLocal

    db = SessionLocal()
    try:
        seed(db)
    finally:
        db.close()
