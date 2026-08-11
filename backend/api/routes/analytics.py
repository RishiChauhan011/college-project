from fastapi import APIRouter
from typing import List
from api.schemas.analytics import AnalyticsSummaryResponse, DomainAnalyticsResponse
from services.analytics_service import get_domains, get_analytics_summary, get_domain_analytics

router = APIRouter(tags=["Analytics"])

@router.get(
    "/domains",
    response_model=List[str],
    summary="Get all career domains",
    description="Returns a list of all available career domains dynamically retrieved from analytics data."
)
async def list_domains():
    return get_domains()

@router.get(
    "/analytics",
    response_model=AnalyticsSummaryResponse,
    summary="Get overall analytics summary",
    description="Loads precomputed overall statistics including total jobs, total skills, salary disclosure rate, and domain count."
)
async def overall_analytics():
    return get_analytics_summary()

@router.get(
    "/analytics/domain/{domain_name}",
    response_model=DomainAnalyticsResponse,
    summary="Get analytics for a specific domain",
    description="Returns job count, average skills, top skills, top companies, and precalculated salary stats for the specified domain. Performs case-insensitive domain matching."
)
async def domain_analytics(domain_name: str):
    return get_domain_analytics(domain_name)
