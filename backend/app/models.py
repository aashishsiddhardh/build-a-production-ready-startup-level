"""Pydantic request/response models for the reference API."""
from __future__ import annotations

from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    name: str = Field(min_length=1)
    email: EmailStr
    password: str = Field(min_length=8)
    consent: bool


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class AssessmentInput(BaseModel):
    symptoms: list[str] = []
    free_text: str = ""
    duration_days: int = 3
    severity: int = 2
    conditions: list[str] = []
    medications: list[str] = []
    pregnant: bool = False
    age: int = 35
    goals: list[str] = []
    dosha_scores: dict[str, int] | None = None


class TriageRequest(BaseModel):
    red_flag_selections: list[str] = []
    free_text: str = ""
