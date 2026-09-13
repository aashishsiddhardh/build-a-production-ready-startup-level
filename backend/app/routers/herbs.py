from fastapi import APIRouter, HTTPException, Query, status

from app.data_loader import concern_map, herb_map, herbs, knowledge

router = APIRouter(prefix="/api/herbs", tags=["knowledge"])


@router.get("")
def list_herbs(
    concern: str | None = Query(default=None),
    evidence: str | None = Query(default=None),
    category: str | None = Query(default=None),
) -> list[dict]:
    result = herbs()
    if category and category != "all":
        result = [h for h in result if h["category"] == category]
    if concern:
        result = [h for h in result if concern in h["targets"]]
    if evidence:
        result = [h for h in result if h["evidence"] == evidence]
    return result


@router.get("/concerns")
def list_concerns() -> list[dict]:
    return knowledge()["concerns"]


@router.get("/{herb_id}")
def get_herb(herb_id: str) -> dict:
    herb = herb_map().get(herb_id)
    if not herb:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Herb not found")
    related = [
        {"id": h["id"], "commonName": h["commonName"], "summary": h["summary"]}
        for h in herbs()
        if h["id"] != herb_id and set(h["targets"]) & set(herb["targets"])
    ][:3]
    cmap = concern_map()
    return {**herb, "concernLabels": [cmap.get(t, {}).get("label", t) for t in herb["targets"]], "related": related}
