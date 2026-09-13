from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import audit, get_current_user
from app.engine.recommender import generate_recommendations
from app.models import Assessment, User
from app.schemas import AssessmentOut, AssessmentRequest

router = APIRouter(prefix="/api/assessments", tags=["assessments"])


@router.post("", response_model=AssessmentOut, status_code=status.HTTP_201_CREATED)
def create_assessment(
    body: AssessmentRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> AssessmentOut:
    result = generate_recommendations(body.model_dump())
    row = Assessment(
        user_id=user.id,
        triage_level=result["triage"]["level"],
        blocked=result["triage"]["block_recommendations"],
        dominant_dosha=result["dominantDosha"],
        imbalance=result["imbalance"],
        concerns=result["concerns"],
        payload=result,
    )
    db.add(row)
    db.commit()
    db.refresh(row)

    audit(db, "assessment.create", user, id=row.id, triage=row.triage_level)
    if row.triage_level == "emergency":
        audit(db, "triage.emergency", user, id=row.id)
    else:
        audit(db, "recommendation.generated", user, id=row.id, count=len(result["recommendations"]))

    return AssessmentOut(id=row.id, createdAt=row.created_at, result=result)


@router.get("", response_model=list[AssessmentOut])
def list_assessments(
    db: Session = Depends(get_db), user: User = Depends(get_current_user)
) -> list[AssessmentOut]:
    rows = db.scalars(
        select(Assessment).where(Assessment.user_id == user.id).order_by(Assessment.created_at.desc())
    ).all()
    return [AssessmentOut(id=r.id, createdAt=r.created_at, result=r.payload) for r in rows]


@router.get("/{assessment_id}", response_model=AssessmentOut)
def get_assessment(
    assessment_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)
) -> AssessmentOut:
    row = db.get(Assessment, assessment_id)
    if not row or row.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    audit(db, "assessment.view", user, id=row.id)
    return AssessmentOut(id=row.id, createdAt=row.created_at, result=row.payload)


@router.delete("/{assessment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_assessment(
    assessment_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)
) -> None:
    row = db.get(Assessment, assessment_id)
    if not row or row.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    db.delete(row)
    db.commit()
    audit(db, "privacy.delete", user, scope="assessment", id=assessment_id)
