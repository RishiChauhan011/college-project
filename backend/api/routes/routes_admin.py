from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from db.database import get_db
from db.models import User, UserProfile, Admin
from .routes_auth import get_current_user
from utils.data_loader import get_jobs_data, get_skills_data, get_domain_names
from services.analytics_service import get_analytics_summary
from services.job_service import get_companies

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
