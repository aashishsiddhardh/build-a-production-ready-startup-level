from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import audit, get_current_user
from app.models import Assessment, AuditLog, ChatMessage, User

router = APIRouter(prefix="/api/privacy", tags=["privacy"])


@router.get("/export")
def export_data(db: Session = Depends(get_db), user: User = Depends(get_current_user)) -> JSONResponse:
    assessments = db.scalars(select(Assessment).where(Assessment.user_id == user.id)).all()
    chats = db.scalars(select(ChatMessage).where(ChatMessage.user_id == user.id)).all()
    audits = db.scalars(select(AuditLog).where(AuditLog.user_id == user.id)).all()
    audit(db, "privacy.export", user, assessments=len(assessments))
    return JSONResponse(
        {
            "account": {"id": user.id, "name": user.name, "email": user.email, "role": user.role},
            "assessments": [a.payload for a in assessments],
            "chatHistory": [{"role": c.role, "content": c.content, "ts": c.created_at.isoformat()} for c in chats],
            "auditTrail": [{"action": a.action, "ts": a.ts.isoformat(), "meta": a.meta} for a in audits],
        }
    )


@router.delete("/data", status_code=204)
def delete_data(db: Session = Depends(get_db), user: User = Depends(get_current_user)) -> None:
    db.query(Assessment).filter(Assessment.user_id == user.id).delete()
    db.query(ChatMessage).filter(ChatMessage.user_id == user.id).delete()
    db.commit()
    audit(db, "privacy.delete", user, scope="health-data")


@router.delete("/account", status_code=204)
def delete_account(db: Session = Depends(get_db), user: User = Depends(get_current_user)) -> None:
    audit(db, "privacy.delete", user, scope="account")
    db.delete(user)  # cascades to assessments/chats
    db.commit()
