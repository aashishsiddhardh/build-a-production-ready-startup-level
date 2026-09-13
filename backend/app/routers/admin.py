from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.data_loader import herbs
from app.database import get_db
from app.deps import require_admin
from app.models import Assessment, AuditLog, User

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/metrics")
def metrics(db: Session = Depends(get_db), _: User = Depends(require_admin)) -> dict:
    total_users = db.scalar(select(func.count(User.id)))
    total_assessments = db.scalar(select(func.count(Assessment.id)))
    emergencies = db.scalar(select(func.count(Assessment.id)).where(Assessment.triage_level == "emergency"))
    urgent = db.scalar(select(func.count(Assessment.id)).where(Assessment.triage_level == "urgent"))
    return {
        "users": total_users or 0,
        "assessments": total_assessments or 0,
        "emergencies": emergencies or 0,
        "urgent": urgent or 0,
        "knowledgeEntries": len(herbs()),
    }


@router.get("/audit")
def audit_log(
    limit: int = 100, db: Session = Depends(get_db), _: User = Depends(require_admin)
) -> list[dict]:
    rows = db.scalars(select(AuditLog).order_by(AuditLog.ts.desc()).limit(limit)).all()
    return [
        {"id": r.id, "ts": r.ts, "actorEmail": r.actor_email, "action": r.action, "meta": r.meta}
        for r in rows
    ]


@router.get("/users")
def users(db: Session = Depends(get_db), _: User = Depends(require_admin)) -> list[dict]:
    rows = db.scalars(select(User).order_by(User.created_at.desc())).all()
    return [
        {
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "role": u.role,
            "createdAt": u.created_at,
            "consented": u.consent_accepted_at is not None,
        }
        for u in rows
    ]
