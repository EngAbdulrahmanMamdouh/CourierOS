from datetime import datetime

from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog


def log_event(db: Session, actor_id: int, action: str, entity: str, entity_id: int, description: str, company_id: int | None = None):
    log_entry = AuditLog(
        actor_id=actor_id,
        company_id=company_id,
        action=action,
        entity=entity,
        entity_id=entity_id,
        description=description,
    )
    db.add(log_entry)
    db.commit()
    db.refresh(log_entry)
    return log_entry


def create_audit_log(db: Session, actor_id: int, action: str, entity: str, entity_id: int, description: str, company_id: int | None = None):
    return log_event(
        db=db,
        actor_id=actor_id,
        action=action,
        entity=entity,
        entity_id=entity_id,
        description=description,
        company_id=company_id,
    )


def get_audit_logs(
    db: Session,
    user_id: int | None = None,
    action: str | None = None,
    entity_type: str | None = None,
    entity_id: int | None = None,
    date_from: datetime | None = None,
    date_to: datetime | None = None,
):
    query = db.query(AuditLog)

    if user_id is not None:
        query = query.filter(AuditLog.actor_id == user_id)

    if action:
        query = query.filter(AuditLog.action == action)

    if entity_type:
        query = query.filter(AuditLog.entity == entity_type)

    if entity_id is not None:
        query = query.filter(AuditLog.entity_id == entity_id)

    if date_from is not None:
        query = query.filter(AuditLog.created_at >= date_from)

    if date_to is not None:
        query = query.filter(AuditLog.created_at <= date_to)

    return query.order_by(AuditLog.created_at.desc()).all()
