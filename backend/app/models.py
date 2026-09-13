"""SQLAlchemy models. Mirrors the client domain, with pgvector embeddings."""
from __future__ import annotations

import uuid
from datetime import datetime

from pgvector.sqlalchemy import Vector
from sqlalchemy import (
    JSON,
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import ARRAY, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.config import get_settings
from app.database import Base

DIM = get_settings().embedding_dim


def _uuid() -> str:
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    email: Mapped[str] = mapped_column(String(320), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    role: Mapped[str] = mapped_column(String(20), default="user", nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    consent_accepted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    consent_version: Mapped[str] = mapped_column(String(40), default="2024-11-01")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    assessments: Mapped[list[Assessment]] = relationship(back_populates="user", cascade="all, delete-orphan")


class Herb(Base):
    __tablename__ = "herbs"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    common_name: Mapped[str] = mapped_column(String(200), nullable=False)
    sanskrit_name: Mapped[str] = mapped_column(String(200))
    latin_name: Mapped[str] = mapped_column(String(200))
    category: Mapped[str] = mapped_column(String(40))
    summary: Mapped[str] = mapped_column(Text)
    evidence: Mapped[str] = mapped_column(String(40))
    evidence_note: Mapped[str] = mapped_column(Text)
    dosha_effect: Mapped[dict] = mapped_column(JSON)
    targets: Mapped[list[str]] = mapped_column(ARRAY(String))
    contraindications: Mapped[list] = mapped_column(JSON)
    interactions: Mapped[list] = mapped_column(JSON)
    citations: Mapped[list] = mapped_column(JSON)
    common_forms: Mapped[list[str]] = mapped_column(ARRAY(String))
    qualities: Mapped[list[str]] = mapped_column(ARRAY(String))
    safety_notes: Mapped[list[str]] = mapped_column(ARRAY(String))


class KnowledgeChunk(Base):
    """RAG chunks with pgvector embeddings for similarity search."""

    __tablename__ = "knowledge_chunks"

    id: Mapped[str] = mapped_column(String(96), primary_key=True)
    herb_id: Mapped[str] = mapped_column(ForeignKey("herbs.id", ondelete="CASCADE"), index=True)
    text: Mapped[str] = mapped_column(Text, nullable=False)
    embedding: Mapped[list[float]] = mapped_column(Vector(DIM))


class Assessment(Base):
    __tablename__ = "assessments"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    triage_level: Mapped[str] = mapped_column(String(20))
    blocked: Mapped[bool] = mapped_column(Boolean, default=False)
    dominant_dosha: Mapped[str] = mapped_column(String(20))
    imbalance: Mapped[str | None] = mapped_column(String(20))
    concerns: Mapped[list[str]] = mapped_column(ARRAY(String))
    # Full result payload (recommendations, factors, lifestyle) for auditability.
    payload: Mapped[dict] = mapped_column(JSON)

    user: Mapped[User] = relationship(back_populates="assessments")


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    role: Mapped[str] = mapped_column(String(20))
    content: Mapped[str] = mapped_column(Text)
    safety_banner: Mapped[str | None] = mapped_column(String(20))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class AuditLog(Base):
    """Append-only audit trail."""

    __tablename__ = "audit_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    ts: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    user_id: Mapped[str | None] = mapped_column(UUID(as_uuid=False), index=True)
    actor_email: Mapped[str | None] = mapped_column(String(320))
    action: Mapped[str] = mapped_column(String(80), index=True)
    meta: Mapped[dict] = mapped_column(JSON, default=dict)
    ip_hash: Mapped[str | None] = mapped_column(String(64))
