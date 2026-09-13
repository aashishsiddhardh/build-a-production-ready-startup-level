"""Loads the shared knowledge base (generated from the frontend TS)."""
from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path

_DATA_PATH = Path(__file__).parent / "data" / "knowledge.json"


@lru_cache
def knowledge() -> dict:
    with _DATA_PATH.open() as fh:
        return json.load(fh)


@lru_cache
def herbs() -> list[dict]:
    return knowledge()["herbs"]


@lru_cache
def herb_map() -> dict[str, dict]:
    return {h["id"]: h for h in herbs()}


@lru_cache
def concern_map() -> dict[str, dict]:
    return {c["id"]: c for c in knowledge()["concerns"]}


@lru_cache
def dosha_meta() -> dict[str, dict]:
    return knowledge()["doshaMeta"]


@lru_cache
def lifestyle_library() -> dict[str, list]:
    return knowledge()["lifestyle"]


def universal_guidance() -> dict:
    return knowledge()["universalGuidance"]
