from fastapi import APIRouter
from api.schemas.recommendation import RecommendationRequest, RecommendationResponse
from services.recommendation_service import get_recommendation

router = APIRouter(tags=["Recommendations"])

@router.post(
    "/recommendation",
    response_model=RecommendationResponse,
    summary="Compute resume skill recommendations",
    description="Analyzes input resume skills against a target domain. Performs case-insensitive domain validation in the service layer, runs the gap analysis engine, and returns matched score, normalized skills, missing skills ordered by ROI, and qualifying companies."
)
async def post_recommendation(request: RecommendationRequest):
    return get_recommendation(
        resume_skills=request.resume_skills,
        target_domain=request.target_domain
    )
