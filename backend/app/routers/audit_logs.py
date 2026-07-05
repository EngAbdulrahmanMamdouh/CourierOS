from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.dependencies.auth import get_current_user
from app.dependencies.roles import require_admin
from app.models.user import User
from app.services.audit_service import get_audit_logs

router = APIRouter(
    prefix="/audit-logs",
    tags=["Audit Logs"],
)


@router.get("/", response_model=list[dict])
def list_audit_logs(
    user_id: int | None = None,
    action: str | None = None,
    entity_type: str | None = None,
    entity_id: int | None = None,
    date_from: datetime | None = None,
    date_to: datetime | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    logs = get_audit_logs(
        db=db,
        user_id=user_id,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        date_from=date_from,
        date_to=date_to,
    )
    return [
        {
            "id": log.id,
            "actor_id": log.actor_id,
            "action": log.action,
            "entity": log.entity,
            "entity_id": log.entity_id,
            "description": log.description,
            "created_at": log.created_at,
        }
        for log in logs
    ]
