from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import audit, get_current_user
from app.engine.assistant import answer
from app.models import ChatMessage, User
from app.schemas import ChatRequest, ChatResponse

router = APIRouter(prefix="/api/assistant", tags=["assistant"])


@router.post("/chat", response_model=ChatResponse)
def chat(
    body: ChatRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> ChatResponse:
    audit(db, "assistant.query", user, length=len(body.message))

    db.add(ChatMessage(user_id=user.id, role="user", content=body.message))
    reply = answer(db, body.message)
    db.add(
        ChatMessage(
            user_id=user.id,
            role="assistant",
            content=reply["content"],
            safety_banner=reply["safety_banner"],
        )
    )
    db.commit()
    return ChatResponse(**reply)
