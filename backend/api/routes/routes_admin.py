from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from db.database import get_db
from db.models import User, UserProfile, Admin
from .routes_auth import get_current_user
from utils.data_loader import get_jobs_data, get_skills_data, get_domain_names
from pydantic import BaseModel
from services.analytics_service import get_analytics_summary
from services.job_service import get_companies, get_admin_jobs, get_admin_companies
from services.audit_service import get_audit_logs

router = APIRouter(prefix="/admin", tags=["Admin Control Center"])

def get_current_admin(current_user = Depends(get_current_user)):
    """Enforce admin privileges."""
    is_admin = getattr(current_user, "admin_id", None) is not None or getattr(current_user, "name", "") == "Admin"
    if not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: Administrator credentials required"
        )
    return current_user

class AdminProfileUpdateRequest(BaseModel):
    admin_id: Optional[str] = None
    role: Optional[str] = None

@router.put("/profile")
def update_admin_profile(
    updates: AdminProfileUpdateRequest,
    db: Session = Depends(get_db),
    admin = Depends(get_current_admin)
):
    """Update the authenticated admin's credentials and role."""
    # Ensure it's an admin model instance
    admin_model = db.query(Admin).filter(Admin.admin_id == admin.admin_id).first()
    if not admin_model:
        raise HTTPException(status_code=404, detail="Admin not found")

    if updates.admin_id:
        existing = db.query(Admin).filter(Admin.admin_id == updates.admin_id).first()
        if existing and existing.id != admin_model.id:
            raise HTTPException(status_code=400, detail="Admin ID already exists")
        admin_model.admin_id = updates.admin_id

    if updates.role:
        admin_model.role = updates.role

    db.commit()
    db.refresh(admin_model)

    return {
        "id": admin_model.id,
        "name": "Admin",
        "email": admin_model.admin_id,
        "role": "admin",
        "admin_role": admin_model.role,
        "last_login": admin_model.last_login.isoformat() if admin_model.last_login else None
    }

@router.get("/stats")
def get_admin_stats(
    db: Session = Depends(get_db),
    admin = Depends(get_current_admin)
):
    """Aggregate statistics for admin dashboard."""
    user_count = db.query(User).count()
    profile_count = db.query(UserProfile).count()

    jobs = get_jobs_data()
    skills = get_skills_data()
    domains = get_domain_names()
    companies = get_companies()
    summary = get_analytics_summary()

    return {
        "total_users": user_count,
        "active_profiles": profile_count,
        "total_jobs": len(jobs),
        "total_skills": len(skills),
        "total_companies": len(companies),
        "total_domains": len(domains),
        "salary_statistics": summary.get("salary_statistics", {}),
        "top_skills": summary.get("top_skills", [])[:10],
        "top_companies": summary.get("top_companies", [])[:10]
    }

@router.get("/users")
def list_admin_users(
    search: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db),
    admin = Depends(get_current_admin)
):
    """List registered users with profile information."""
    query = db.query(User)
    if search:
        search_pattern = f"%{search}%"
        query = query.filter((User.name.ilike(search_pattern)) | (User.email.ilike(search_pattern)))

    total = query.count()
    users = query.offset(offset).limit(limit).all()

    user_list = []
    for u in users:
        p = u.profile
        skills = p.skills if (p and p.skills) else []
        user_list.append({
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "created_at": u.created_at.isoformat() if u.created_at else None,
            "preferred_field": p.preferred_field if p else None,
            "experience_years": p.experience_years if p else 0,
            "education": p.education if p else None,
            "skills_count": len(skills) if isinstance(skills, list) else 0,
            "skills": skills if isinstance(skills, list) else [],
            "source": p.source if p else "manual"
        })

    return {
        "total": total,
        "limit": limit,
        "offset": offset,
        "users": user_list
    }

@router.get("/users/{user_id}")
def get_admin_user_detail(
    user_id: int,
    db: Session = Depends(get_db),
    admin = Depends(get_current_admin)
):
    """Retrieve detailed user information for admin inspection."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID {user_id} not found"
        )
    p = user.profile
    skills = p.skills if (p and p.skills) else []
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "created_at": user.created_at.isoformat() if user.created_at else None,
        "preferred_field": p.preferred_field if p else None,
        "experience_years": p.experience_years if p else 0,
        "education": p.education if p else None,
        "preferred_location": p.preferred_location if p else None,
        "skills": skills if isinstance(skills, list) else [],
        "source": p.source if p else "manual"
    }

@router.get("/jobs")
def list_admin_jobs(
    search: Optional[str] = Query(None, description="Search query"),
    domain: Optional[str] = Query(None, description="Domain filter"),
    limit: int = 20,
    offset: int = 0,
    admin = Depends(get_current_admin)
):
    """List jobs with pagination and search for admin."""
    return get_admin_jobs(search, domain, limit, offset)

@router.get("/companies")
def list_admin_companies(
    search: Optional[str] = Query(None, description="Search query"),
    limit: int = 20,
    offset: int = 0,
    admin = Depends(get_current_admin)
):
    """List companies with pagination and search for admin."""
    return get_admin_companies(search, limit, offset)

@router.get("/audit-logs")
def list_audit_logs(
    limit: int = 20,
    offset: int = 0,
    db: Session = Depends(get_db),
    admin = Depends(get_current_admin)
):
    """List system audit logs."""
    return get_audit_logs(db, limit, offset)


@router.get("/analytics/growth")
def get_growth_analytics(
    granularity: str = Query("day", description="Granularity: day, week, month"),
    range_val: int = Query(15, description="Number of units back"),
    db: Session = Depends(get_db),
    admin = Depends(get_current_admin)
):
    """Get user registrations over a dynamic time range."""
    from datetime import datetime, timedelta, timezone
    import calendar

    now = datetime.now(timezone.utc)

    # Calculate cutoff date based on granularity and range_val
    if granularity == "month":
        # Approximate months as 30 days for the cutoff calculation,
        # or calculate exactly by subtracting months.
        # A simpler way is to just generate the last N months.
        pass # Will handle exactly in loop

    stats_map = {}

    if granularity == "day":
        cutoff = now - timedelta(days=range_val)
        users = db.query(User).filter(User.created_at >= cutoff).all()
        for i in range(range_val, -1, -1):
            day_str = (now - timedelta(days=i)).strftime('%Y-%m-%d')
            stats_map[day_str] = {"date": day_str, "registrations": 0}

        for u in users:
            if not u.created_at: continue
            day_str = u.created_at.strftime('%Y-%m-%d')
            if day_str in stats_map:
                stats_map[day_str]["registrations"] += 1

    elif granularity == "week":
        # range_val weeks back
        cutoff = now - timedelta(weeks=range_val)
        users = db.query(User).filter(User.created_at >= cutoff).all()
        # Generate week start dates
        for i in range(range_val, -1, -1):
            target_date = now - timedelta(weeks=i)
            # Find the Monday of that week
            monday = target_date - timedelta(days=target_date.weekday())
            week_str = monday.strftime('%Y-%m-%d')
            stats_map[week_str] = {"date": week_str, "registrations": 0}

        for u in users:
            if not u.created_at: continue
            # Find Monday of the user's creation week
            u_monday = u.created_at - timedelta(days=u.created_at.weekday())
            week_str = u_monday.strftime('%Y-%m-%d')
            if week_str in stats_map:
                stats_map[week_str]["registrations"] += 1

    elif granularity == "month":
        # range_val months back. Calculate exact months.
        for i in range(range_val, -1, -1):
            target_month = now.month - i
            target_year = now.year
            while target_month <= 0:
                target_month += 12
                target_year -= 1
            month_str = f"{target_year}-{target_month:02d}"
            stats_map[month_str] = {"date": month_str, "registrations": 0}

        # Cutoff is the first day of the oldest month
        oldest_month_str = list(stats_map.keys())[0]
        cutoff = datetime.strptime(oldest_month_str + "-01", "%Y-%m-%d").replace(tzinfo=timezone.utc)
        users = db.query(User).filter(User.created_at >= cutoff).all()

        for u in users:
            if not u.created_at: continue
            month_str = u.created_at.strftime('%Y-%m')
            if month_str in stats_map:
                stats_map[month_str]["registrations"] += 1

    else:
        raise HTTPException(status_code=400, detail="Invalid granularity")

    return sorted(stats_map.values(), key=lambda x: x["date"])

