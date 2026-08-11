import logging
from fastapi import HTTPException
from utils.data_loader import get_domain_names
from recommendation.recommendation import generate_recommendation
from llm.gemini_client import generate_roadmap_narrative

logger = logging.getLogger(__name__)

def get_recommendation(resume_skills: list[str], target_domain: str) -> dict:
    """Validate target domain and query the completed recommendation engine."""
    available_domains = get_domain_names()
    
    # 1. Normalize domain name (case-insensitive check)
    canonical_domain = None
    domain_lower = target_domain.strip().lower()
    for d in available_domains:
        if d.lower() == domain_lower:
            canonical_domain = d
            break
            
    if canonical_domain is None:
        logger.warning(f"Domain validation failed: target_domain '{target_domain}' does not exist.")
        raise HTTPException(
            status_code=404,
            detail=f"Domain '{target_domain}' not found. Valid options: {available_domains}"
        )
        
    try:
        # 2. Call the pre-existing recommendation algorithm
        rec_result = generate_recommendation(resume_skills, canonical_domain)

        # 3. Generate the natural-language roadmap narrative from the
        # structured result. This NEVER raises - if Gemini fails or the
        # API key isn't configured, the response still returns fully
        # valid structured data, just with narrative=None. The
        # structured data has real standalone value and shouldn't be
        # lost just because the explanation layer had a problem.
        roadmap_result = generate_roadmap_narrative(rec_result)

        # 4. Map values to match target API response schema
        return {
            "match_score": rec_result.get("match_percent", 0.0),
            "recognized_skills": rec_result.get("resume_skills_recognized", []),
            "missing_skills": rec_result.get("missing_skills", []),
            "learning_priority": rec_result.get("recommended_learning_priority", []),
            "estimated_learning_weeks": rec_result.get("estimated_learning_weeks", 0),
            "qualified_companies": rec_result.get("companies_you_would_qualify_for", []),
            "roadmap_narrative": roadmap_result["narrative"],
        }
    except Exception as e:
        logger.error(f"Error executing recommendation algorithm: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="An error occurred while computing recommendations."
        )