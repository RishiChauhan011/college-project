from fastapi import APIRouter
from api.schemas.role_fit import RoleFitRequest, RoleFitResponse
from services.role_fit_service import get_role_fit

router = APIRouter()


@router.post(
    "/role-fit",
    response_model=RoleFitResponse,
    tags=["Recommendation"],
    summary="Predict best-fit role from a skill list",
    description=(
        "Predicts which specific role (within the AI & Data Science domain) "
        "a given skill list best fits, using a trained Logistic Regression "
        "classifier. Scoped to one domain - see project documentation for why."
    ),
)
async def role_fit(request: RoleFitRequest):
    return get_role_fit(request.resume_skills)