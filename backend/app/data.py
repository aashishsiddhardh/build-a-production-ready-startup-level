"""Compact herb knowledge base for the reference API.

In production this is loaded from PostgreSQL (see db/schema.sql) with pgvector
embeddings. Here we keep a representative in-memory subset so the API runs
standalone. Evidence notes describe the *type* of support — never fabricated
citations.
"""
from __future__ import annotations

HERBS: list[dict] = [
    {
        "id": "ashwagandha", "name": "Ashwagandha", "latin": "Withania somnifera",
        "category": "Adaptogen / Rasayana",
        "summary": "A rejuvenative traditionally used to steady the nervous system and support restful sleep.",
        "dosha_effect": {"vata": "decrease", "pitta": "neutral", "kapha": "increase"},
        "indications": ["stress", "anxiety", "insomnia", "fatigue", "low_immunity"],
        "evidence_level": "moderate",
        "evidence_note": "Several small-to-moderate human trials suggest benefit for perceived stress and sleep quality.",
        "contraindications": ["thyroid", "autoimmune", "surgery_2w"],
        "drug_interactions": [
            {"drug_class": "Thyroid medication", "drug_class_key": "thyroid", "severity": "caution",
             "mechanism": "May raise thyroid hormone levels."},
            {"drug_class": "Sedatives", "drug_class_key": "sedative", "severity": "caution",
             "mechanism": "May increase drowsiness."},
        ],
        "pregnancy": "avoid",
    },
    {
        "id": "triphala", "name": "Triphala", "latin": "Three-fruit blend",
        "category": "Digestive / Rasayana",
        "summary": "A gentle three-fruit formula traditionally used to support regular elimination and digestion.",
        "dosha_effect": {"vata": "neutral", "pitta": "decrease", "kapha": "decrease"},
        "indications": ["constipation", "indigestion", "low_appetite", "skin_breakouts"],
        "evidence_level": "preliminary",
        "evidence_note": "Small human studies and extensive traditional use suggest support for regularity.",
        "contraindications": ["loose_stools"],
        "drug_interactions": [],
        "pregnancy": "caution",
    },
    {
        "id": "turmeric", "name": "Turmeric", "latin": "Curcuma longa",
        "category": "Anti-inflammatory",
        "summary": "A warming spice traditionally used to support a healthy inflammation response and joints.",
        "dosha_effect": {"vata": "neutral", "pitta": "neutral", "kapha": "decrease"},
        "indications": ["joint_stiffness", "muscle_ache", "skin_breakouts", "indigestion"],
        "evidence_level": "moderate",
        "evidence_note": "Curcumin has been studied in several human trials for joint comfort with heterogeneous results.",
        "contraindications": ["gallstones", "bleeding_disorder", "surgery_2w"],
        "drug_interactions": [
            {"drug_class": "Anticoagulants", "drug_class_key": "anticoagulant", "severity": "caution",
             "mechanism": "High doses may add to blood-thinning effects."},
        ],
        "pregnancy": "caution",
    },
    {
        "id": "ginger", "name": "Ginger", "latin": "Zingiber officinale",
        "category": "Digestive / Carminative",
        "summary": "A warming root traditionally used to kindle digestion and ease mild nausea.",
        "dosha_effect": {"vata": "decrease", "pitta": "increase", "kapha": "decrease"},
        "indications": ["nausea", "indigestion", "low_appetite", "congestion", "cough"],
        "evidence_level": "moderate",
        "evidence_note": "Human trials support ginger for certain types of nausea.",
        "contraindications": ["gerd", "gallstones", "bleeding_disorder"],
        "drug_interactions": [
            {"drug_class": "Anticoagulants", "drug_class_key": "anticoagulant", "severity": "caution",
             "mechanism": "High doses may modestly increase bleeding risk."},
        ],
        "pregnancy": "generally-regarded-safe",
    },
    {
        "id": "brahmi", "name": "Brahmi", "latin": "Bacopa monnieri",
        "category": "Nervine / Medhya",
        "summary": "A traditional brain tonic valued for memory, focus, and a calm mind.",
        "dosha_effect": {"vata": "decrease", "pitta": "decrease", "kapha": "neutral"},
        "indications": ["brain_fog", "stress", "anxiety", "insomnia"],
        "evidence_level": "moderate",
        "evidence_note": "Multiple small human trials indicate possible benefit for aspects of memory over weeks.",
        "contraindications": ["gerd"],
        "drug_interactions": [
            {"drug_class": "Sedatives", "drug_class_key": "sedative", "severity": "caution",
             "mechanism": "May increase drowsiness."},
        ],
        "pregnancy": "insufficient-data",
    },
    {
        "id": "licorice", "name": "Licorice", "latin": "Glycyrrhiza glabra",
        "category": "Demulcent / Respiratory",
        "summary": "A soothing root traditionally used for the throat and digestive lining.",
        "dosha_effect": {"vata": "decrease", "pitta": "decrease", "kapha": "increase"},
        "indications": ["sore_throat", "cough", "acidity"],
        "evidence_level": "preliminary",
        "evidence_note": "Small studies and long traditional use for throat/GI soothing; real risks at high dose.",
        "contraindications": ["hypertension", "kidney_disease", "heart_disease"],
        "drug_interactions": [
            {"drug_class": "Blood pressure medication", "drug_class_key": "antihypertensive", "severity": "avoid",
             "mechanism": "Can raise blood pressure and cause potassium loss."},
        ],
        "pregnancy": "avoid",
    },
]

EVIDENCE_WEIGHT = {
    "traditional": 0.35, "preclinical": 0.45, "preliminary": 0.6, "moderate": 0.85, "strong": 1.0,
}
