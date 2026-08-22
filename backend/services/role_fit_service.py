import logging
from fastapi import HTTPException
from utils.data_loader import get_role_classifier
from ml.role_classifier import predict_role_cached

logger = logging.getLogger(__name__)

# This classifier is deliberately scoped to one domain only - see
# role_classifier.py for the reasoning (skill density per domain).
SUPPORTED_DOMAIN = "AI & Data Science"


def get_role_fit(skills: list[str], target_domain: str | None = None) -> dict:
    """Predict the best-fit role for a given skill list, using the
    pre-trained, startup-cached role classifier model (no per-request
    disk I/O - see utils/data_loader.py)."""
    if not skills:
        raise HTTPException(status_code=422, detail="Skills list cannot be empty.")

    try:
        from ml.role_classifier import predict_role_cached
        model, feature_columns, role_to_domain = get_role_classifier()
        result = predict_role_cached(skills, model, feature_columns, role_to_domain, target_domain)

        return {
            "predicted_role": result["predicted_role"],
            "confidence": result["confidence"],
            "all_probabilities": result["all_probabilities"],
            "domain": target_domain or "All Domains",
        }
    except Exception as e:
        logger.error(f"Error executing role classifier: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="An error occurred while predicting role fit."
        )