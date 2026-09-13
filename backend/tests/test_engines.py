"""Tests for the deterministic safety engines (no DB required)."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.engine.recommender import analyze_dosha, generate_recommendations  # noqa: E402
from app.engine.safety import check_herb_safety, derive_profile_flags  # noqa: E402
from app.engine.triage import run_triage  # noqa: E402
from app.data_loader import herb_map  # noqa: E402


# --- Triage ---------------------------------------------------------------

def test_triage_self_care_default():
    res = run_triage({}, "I feel a bit tired and bloated")
    assert res.level == "self-care"
    assert res.block_recommendations is False


def test_triage_chest_pain_answer_is_emergency():
    res = run_triage({"chest-pain": True}, "")
    assert res.level == "emergency"
    assert res.block_recommendations is True


def test_triage_keyword_self_harm():
    res = run_triage({}, "I want to end my life")
    assert res.level == "emergency"


def test_triage_urgent_persistent():
    res = run_triage({"persistent": True}, "")
    assert res.level == "urgent"
    assert res.block_recommendations is True


# --- Safety gate ----------------------------------------------------------

def test_flags_from_profile():
    flags = derive_profile_flags({"pregnant": True, "age": 8, "conditions": []})
    assert "pregnancy" in flags and "child" in flags


def test_licorice_blocked_with_diuretic():
    res = check_herb_safety(herb_map()["licorice"], {"medications": ["diuretic"]})
    assert res.status == "blocked"


def test_turmeric_caution_with_anticoagulant():
    res = check_herb_safety(herb_map()["turmeric"], {"medications": ["anticoagulant"]})
    assert res.status == "caution"


def test_fennel_ok():
    res = check_herb_safety(herb_map()["fennel"], {})
    assert res.status == "ok"


# --- Dosha + recommender --------------------------------------------------

def test_dosha_imbalance_from_concerns():
    res = analyze_dosha({}, ["acid-reflux", "skin-issues"])
    assert res["imbalance"] == "pitta"


def test_recommender_blocks_in_emergency():
    result = generate_recommendations(
        {"concerns": ["stress-anxiety"], "redFlagAnswers": {"chest-pain": True}}
    )
    assert result["recommendations"] == []
    assert result["lifestyle"] == []


def test_recommender_withholds_ashwagandha_in_pregnancy():
    result = generate_recommendations(
        {"concerns": ["stress-anxiety", "low-energy"], "profile": {"pregnant": True}}
    )
    ids = [r["herbId"] for r in result["recommendations"]]
    assert "ashwagandha" not in ids
    assert any("Ashwagandha" in w["herb"] for w in result["withheldForSafety"])


def test_recommender_scores_sorted_desc():
    result = generate_recommendations({"concerns": ["joint-pain", "indigestion"]})
    scores = [r["score"] for r in result["recommendations"]]
    assert scores == sorted(scores, reverse=True)
