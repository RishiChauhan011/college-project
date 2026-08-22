import json
import csv
import logging
import joblib
from config import (
    ANALYTICS_FILE, JOBS_WITH_SKILLS_FILE, MASTER_SKILLS_FILE,
    ROLE_CLASSIFIER_MODEL_FILE, ROLE_CLASSIFIER_FEATURES_FILE,
)

logger = logging.getLogger(__name__)

# Private global caches
_analytics = None
_jobs = None
_skills = None
_role_classifier_model = None
_role_classifier_features = None

def preload_data():
    """Load all JSON and CSV datasets into memory.

    Domain salary stats are NOT calculated here - they are read directly
    from analytics.json (produced by analytics.py), which is the single
    source of truth for all derived/computed statistics. This avoids
    maintaining two separate implementations of the same salary math
    that could silently drift out of sync over time."""
    global _analytics, _jobs, _skills, _role_classifier_model, _role_classifier_features

    logger.info("Preloading dashboard datasets...")

    # 1. Load analytics.json (includes per-domain salary stats already)
    try:
        with open(ANALYTICS_FILE, "r", encoding="utf-8") as f:
            _analytics = json.load(f)
        logger.info("Successfully loaded analytics.json")
    except Exception as e:
        logger.error(f"Failed to load analytics.json: {e}")
        raise e

    # 2. Load jobs_with_skills.json
    try:
        with open(JOBS_WITH_SKILLS_FILE, "r", encoding="utf-8") as f:
            _jobs = json.load(f)
        logger.info(f"Successfully loaded {len(_jobs)} jobs from jobs_with_skills.json")
    except Exception as e:
        logger.error(f"Failed to load jobs_with_skills.json: {e}")
        raise e

    # 3. Load master_skills.csv
    try:
        skills_list = []
        with open(MASTER_SKILLS_FILE, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                skills_list.append({
                    "id": row["id"].strip(),
                    "skill": row["skill"].strip(),
                    "category": row["category"].strip(),
                    "source": row["source"].strip(),
                    "enabled": row["enabled"].strip().upper() == "TRUE",
                    "synonyms": [s.strip() for s in row.get("synonyms", "").split(";") if s.strip()],
                    "skill_type": row["skill_type"].strip() if "skill_type" in row else "",
                })
        _skills = skills_list
        logger.info(f"Successfully loaded {len(_skills)} skills from master_skills.csv")
    except Exception as e:
        logger.error(f"Failed to load master_skills.csv: {e}")
        raise e

    # 4. Load role classifier model + feature columns (AI & Data Science
    # domain only - see role_classifier.py for scope reasoning). Loaded
    # once here, same as everything else, so predictions never trigger
    # per-request disk I/O.
    try:
        _role_classifier_model = joblib.load(ROLE_CLASSIFIER_MODEL_FILE)
        with open(ROLE_CLASSIFIER_FEATURES_FILE, "r", encoding="utf-8") as f:
            _role_classifier_features = json.load(f)
        logger.info(f"Successfully loaded role classifier model "
                    f"({_role_classifier_features.get('model_type', 'unknown type')})")
    except Exception as e:
        logger.error(f"Failed to load role classifier model: {e}")
        raise e


# --- Read-only Accessors ---

def get_analytics_data() -> dict:
    """Return read-only cached overall analytics data."""
    global _analytics
    if _analytics is None:
        preload_data()
    return _analytics

def get_jobs_data() -> list:
    """Return read-only cached jobs list."""
    global _jobs
    if _jobs is None:
        preload_data()
    return _jobs

def get_skills_data() -> list:
    """Return read-only cached skills list from master_skills.csv."""
    global _skills
    if _skills is None:
        preload_data()
    return _skills

def get_domain_salary_stats(domain_name: str) -> dict:
    """Return salary stats for a domain, read directly from analytics.json
    (computed once by analytics.py) - not recalculated here."""
    analytics = get_analytics_data()
    domain_data = analytics.get("by_domain", {}).get(domain_name)
    if domain_data is None:
        return None
    return domain_data.get("salary")

def get_domain_names() -> list:
    """Return a list of available career domains."""
    analytics = get_analytics_data()
    return list(analytics.get("by_domain", {}).keys())

def get_role_classifier():
    """Return the cached (model, feature_columns, role_to_domain) tuple for the role
    classifier. Loaded once at startup - never re-read from disk here."""
    global _role_classifier_model, _role_classifier_features
    if _role_classifier_model is None:
        preload_data()
    role_to_domain = _role_classifier_features.get("role_to_domain", {})
    return _role_classifier_model, _role_classifier_features["feature_columns"], role_to_domain