from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.orm import Session
from db.models import User, UserProfile
from db.database import get_db
from .routes_auth import get_current_user
from pydantic import BaseModel
from typing import Optional, List
import magic
from resume_parser.parse_resume import parse_resume

router = APIRouter()

class ProfileUpdateRequest(BaseModel):
    name: Optional[str] = None
    education: Optional[str] = None
    experience_years: Optional[int] = None
    preferred_location: Optional[str] = None
    preferred_field: Optional[str] = None
    skills: Optional[List[str]] = None


@router.get("/profile")
def get_profile(current_user = Depends(get_current_user)):
    profile_data = {}
    if getattr(current_user, "profile", None):
        profile_data = {
            "skills": current_user.profile.skills,
            "education": current_user.profile.education,
            "experience_years": current_user.profile.experience_years,
            "preferred_location": current_user.profile.preferred_location,
            "preferred_field": current_user.profile.preferred_field,
            "source": current_user.profile.source
        }
    
    return {
        "id": current_user.id if hasattr(current_user, "id") else None,
        "name": getattr(current_user, "name", "Admin"),
        "email": current_user.email,
        "role": "admin" if getattr(current_user, "name", "") == "Admin" else "user",
        "profile": profile_data if profile_data else None
    }


@router.put("/profile")
def update_profile(
    updates: ProfileUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update the authenticated user's name and/or profile fields."""
    # Only regular users can update via this endpoint
    if not hasattr(current_user, "password_hash"):
        raise HTTPException(
            status_code=403,
            detail="Admin accounts cannot be updated via this endpoint"
        )

    # Update name on the User row if provided
    if updates.name is not None:
        current_user.name = updates.name
        db.add(current_user)

    # Fetch or create the UserProfile row
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    if profile is None:
        profile = UserProfile(user_id=current_user.id, source="manual")
        db.add(profile)

    if updates.education is not None:
        profile.education = updates.education
    if updates.experience_years is not None:
        profile.experience_years = updates.experience_years
    if updates.preferred_location is not None:
        profile.preferred_location = updates.preferred_location
    if updates.preferred_field is not None:
        profile.preferred_field = updates.preferred_field
    if updates.skills is not None:
        profile.skills = updates.skills

    db.commit()
    db.refresh(current_user)
    db.refresh(profile)

    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "role": "user",
        "profile": {
            "skills": profile.skills,
            "education": profile.education,
            "experience_years": profile.experience_years,
            "preferred_location": profile.preferred_location,
            "preferred_field": profile.preferred_field,
            "source": profile.source,
        }
    }


@router.post("/resume-upload")
async def upload_resume(file: UploadFile = File(...), current_user: User = Depends(get_current_user)):
    if not file.filename:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No file attached")
        
    ext = file.filename.split('.')[-1].lower()
    if ext not in ["pdf", "docx"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only PDF or DOCX files are allowed")
        
    file_bytes = await file.read()
    
    if len(file_bytes) > 5 * 1024 * 1024:
        raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="File too large. Maximum size is 5MB")
        
    mime_type = magic.from_buffer(file_bytes, mime=True)
    if ext == "pdf" and mime_type != "application/pdf":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid PDF file content")
    elif ext == "docx" and mime_type not in [
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/zip",
        "application/x-zip-compressed",
        "application/octet-stream"
    ]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid DOCX file content")
        
    result = parse_resume(file_bytes, ext)

    # Persist extracted skills to DB if parsing was successful and user is authenticated
    if result.get("readable") and isinstance(current_user, User) and hasattr(current_user, "id"):
        db = next(get_db())
        try:
            profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
            if profile is None:
                profile = UserProfile(user_id=current_user.id, source="resume")
                db.add(profile)
            else:
                profile.source = "resume"

            if result.get("skills"):
                profile.skills = result["skills"]

            db.commit()
            db.refresh(profile)
        except Exception as err:
            logger.error(f"Failed to auto-persist resume skills to user profile: {err}")
        finally:
            db.close()

    return result
