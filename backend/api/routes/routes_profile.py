from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from db.models import User
from .routes_auth import get_current_user
import magic
from resume_parser.parse_resume import parse_resume

router = APIRouter()

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

@router.post("/resume-upload")
async def upload_resume(file: UploadFile = File(...), current_user: User = Depends(get_current_user)):
    if not file.filename:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No file attached")
        
    ext = file.filename.split('.')[-1].lower()
    if ext not in ["pdf", "docx"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only PDF or DOCX files are allowed")
        
    # Read bytes for validation and parsing
    file_bytes = await file.read()
    
    # Check size (5MB limit)
    if len(file_bytes) > 5 * 1024 * 1024:
        raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="File too large. Maximum size is 5MB")
        
    # Sniff MIME type
    mime_type = magic.from_buffer(file_bytes, mime=True)
    if ext == "pdf" and mime_type != "application/pdf":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid PDF file content")
    elif ext == "docx" and mime_type not in [
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/zip" # Sometimes python-magic identifies docx as generic zip
    ]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid DOCX file content")
        
    # Process
    result = parse_resume(file_bytes, ext)
    return result
