import os
from pathlib import Path

# Base directory: backend/
BASE_DIR = Path(__file__).resolve().parent

# Data file paths
ANALYTICS_FILE = BASE_DIR / "analytics" / "analytics.json"
JOBS_WITH_SKILLS_FILE = BASE_DIR / "ml" / "jobs_with_skills.json"
MASTER_SKILLS_FILE = BASE_DIR / "ml" / "master_skills.csv"

# Role classifier model paths (AI & Data Science domain only - see
# role_classifier.py for why this is scoped to one domain)
ROLE_CLASSIFIER_MODEL_FILE = BASE_DIR / "ml" / "role_classifier_model.joblib"
ROLE_CLASSIFIER_FEATURES_FILE = BASE_DIR / "ml" / "role_classifier_features.json"