from db.models import AuditLog
from sqlalchemy.orm import Session
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

def log_audit(db: Session, actor: str, action: str, entity: str = None, description: str = None):
    try:
        new_log = AuditLog(
            actor=actor,
            action=action,
            entity=entity,
            description=description,
            timestamp=datetime.now(timezone.utc)
        )
        db.add(new_log)
        db.commit()
        db.refresh(new_log)
    except Exception as e:
        logger.error(f"Failed to log audit event: {e}")
        db.rollback()

def get_audit_logs(db: Session, limit: int = 20, offset: int = 0):
    total = db.query(AuditLog).count()
    items = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).offset(offset).limit(limit).all()
    
    return {
        "items": items,
        "total": total,
        "has_more": offset + limit < total
    }
