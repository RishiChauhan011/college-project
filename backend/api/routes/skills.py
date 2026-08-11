from fastapi import APIRouter, Query
from typing import List, Optional
from api.schemas.skills import SkillResponse
from services.skill_service import get_skills

router = APIRouter(tags=["Skills"])

@router.get(
    "/skills",
    response_model=List[SkillResponse],
    summary="Get master skills list",
    description="Returns list of all skills defined in master_skills.csv, with optional filtering by category, skill type, and enabled status."
)
async def list_skills(
    category: Optional[str] = Query(None, description="Filter skills by high-level category (Technical, Domain, Soft Skill)"),
    skill_type: Optional[str] = Query(None, description="Filter skills by subtype (Language, Framework, Tool, Knowledge Area, Broad Domain, Soft Skill)"),
    enabled: Optional[bool] = Query(None, description="Filter skills by active/inactive enabled state")
):
    return get_skills(category=category, skill_type=skill_type, enabled=enabled)
