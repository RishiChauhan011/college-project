from fastapi import APIRouter, Query
from typing import List, Optional
from api.schemas.jobs import JobResponse
from services.job_service import get_companies, get_jobs

router = APIRouter(tags=["Jobs & Companies"])

@router.get(
    "/companies",
    response_model=List[str],
    summary="Get unique companies",
    description="Returns a unique, sorted list of companies hiring in the dashboard. Can be filtered by a specific career domain."
)
async def list_companies(
    domain: Optional[str] = Query(None, description="Optional career domain to filter companies (case-insensitive)")
):
    return get_companies(domain)

@router.get(
    "/jobs",
    response_model=List[JobResponse],
    summary="Get jobs list with filtering",
    description="Returns matching jobs in the dataset with optional filters for domain, company name, required skills, limit, and offset pagination."
)
async def list_jobs(
    domain: Optional[str] = Query(None, description="Filter jobs by career domain (case-insensitive)"),
    company: Optional[str] = Query(None, description="Filter jobs by company name (case-insensitive)"),
    skills: Optional[List[str]] = Query(None, description="List of skills to match (case-insensitive, matches all skills in list, supports comma-separated string)"),
    limit: int = Query(20, ge=1, le=100, description="Maximum number of jobs to return (default 20, max 100)"),
    offset: int = Query(0, ge=0, description="Offset index for pagination")
):
    return get_jobs(domain=domain, company=company, skills=skills, limit=limit, offset=offset)
