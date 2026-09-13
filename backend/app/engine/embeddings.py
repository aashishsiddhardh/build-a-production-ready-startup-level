"""Deterministic feature-hashing embeddings.

To keep the reference stack runnable without an external embedding provider,
we build L2-normalized feature-hashed bag-of-words vectors sized to
`embedding_dim`. They are stored in pgvector columns and compared with cosine
distance — the same retrieval contract the client's TF-IDF store uses. Swap
this module for a real embedding model in production without touching callers.
"""
from __future__ import annotations

import hashlib
import math
import re

from app.config import get_settings

DIM = get_settings().embedding_dim

_STOPWORDS = set(
    "a an and are as at be but by for from has have in into is it its of on or that "
    "the this to was were will with your you".split()
)


def tokenize(text: str) -> list[str]:
    tokens = re.sub(r"[^a-z0-9\s]", " ", text.lower()).split()
    out = []
    for t in tokens:
        if len(t) <= 2 or t in _STOPWORDS:
            continue
        t = re.sub(r"(ations|ition|ments|ing|edly|ed|es|ly|s)$", "", t)
        out.append(t)
    return out


def _bucket(token: str) -> int:
    h = hashlib.md5(token.encode()).hexdigest()
    return int(h, 16) % DIM


def embed(text: str) -> list[float]:
    vec = [0.0] * DIM
    tokens = tokenize(text)
    if not tokens:
        return vec
    for t in tokens:
        vec[_bucket(t)] += 1.0
    # tf normalization + L2 normalization
    inv = 1.0 / len(tokens)
    norm = math.sqrt(sum((v * inv) ** 2 for v in vec)) or 1.0
    return [(v * inv) / norm for v in vec]
