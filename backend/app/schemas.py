"""Pydantic request/response schemas."""
from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    name: str = Field(min_length=2, max_length=200)
    email: EmailStr
    password: str = Field(min_length=8, max_length=200)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserOut"


class UserOut(BaseModel):
    id: str
    email: str
    name: str
    role: str
    consent_accepted_at: datetime | None = None

    class Config:
        from_attributes = True


class HealthProfile(BaseModel):
    age: int | None = None
    sexAtBirth: str | None = None
    pregnant: bool = False
    breastfeeding: bool = False
    conditions: list[str] = []
    medications: list[str] = []
    allergies: str = ""


class AssessmentRequest(BaseModel):
    profile: HealthProfile = HealthProfile()
    prakritiAnswers: dict[str, str] = {}
    concerns: list[str] = []
    narrative: str = ""
    redFlagAnswers: dict[str, bool] = {}
    consentAccepted: bool = False


class AssessmentOut(BaseModel):
    id: str
    createdAt: datetime
    result: dict[str, Any]


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=2000)


class ChatResponse(BaseModel):
    content: str
    safety_banner: str | None = None
    citations: list[dict[str, Any]] = []
