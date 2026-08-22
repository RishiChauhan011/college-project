"""
role_classifier.py

Trains a supervised ML model to predict which specific role a person's
skill profile best fits, WITHIN the AI & Data Science domain (scoped
deliberately - see project notes on why other domains were excluded
based on skill density).

Labels come FREE from data already collected: every job's search_keyword
(e.g. "data scientist", "ml engineer") IS its role label - no manual
annotation needed.

Features: a binary skill vector - one column per enabled skill, 1 if that
job's extracted skills include it, 0 otherwise. This reuses extraction
output directly; no new NLP work required.

Usage:
    pip install scikit-learn joblib
    python role_classifier.py

Reads:
    jobs_with_skills.json
    master_skills.csv
Writes:
    role_classifier_model.joblib   (trained model)
    role_classifier_features.json  (the exact skill column order used -
                                     required to build feature vectors
                                     consistently at prediction time)
"""

import json
import os
import sys
import joblib
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(SCRIPT_DIR)
from extract_skills import (
    load_master_skills,
    build_phrase_matcher,
    extract_skills_from_text,
)
import spacy
from spacy.tokens import Span

JOBS_WITH_SKILLS_FILE = os.path.join(SCRIPT_DIR, "jobs_with_skills.json")
MODEL_OUTPUT_FILE = os.path.join(SCRIPT_DIR, "role_classifier_model.joblib")
FEATURES_OUTPUT_FILE = os.path.join(SCRIPT_DIR, "role_classifier_features.json")

TARGET_DOMAIN = "AI & Data Science"

KEYWORD_TO_ROLE = {
    "ai engineer": "AI Engineer",
    "data analyst": "Data Analyst",
    "data scientist": "Data Scientist",
    "machine learning engineer": "ML Engineer",

    "bi analyst": "Business Intelligence Analyst",
    "business analyst": "Business Analyst",
    "business intelligence analyst": "Business Intelligence Analyst",

    "content strategist": "Content Strategist",
    "digital marketing executive": "Digital Marketing Executive",
    "seo specialist": "SEO Specialist",
    "social media manager": "Social Media Manager",

    "lecturer": "Educator",
    "teacher": "Educator",
    "tutor": "Educator",

    "graphic designer": "Graphic Designer",
    "motion designer": "Motion Designer",
    "ui designer": "UI Designer",
    "ux designer": "UX Designer",

    "backend developer": "Backend Developer",
    "full stack developer": "Full Stack Developer",
    "java developer": "Java Developer",
    "python developer": "Python Developer",
    "software engineer": "Software Engineer",
}

ROLE_TO_DOMAIN = {
    "AI Engineer": "AI & Data Science",
    "Data Analyst": "AI & Data Science",
    "Data Scientist": "AI & Data Science",
    "ML Engineer": "AI & Data Science",
    "Business Analyst": "Business Analytics",
    "Business Intelligence Analyst": "Business Analytics",
    "Content Strategist": "Digital Marketing",
    "Digital Marketing Executive": "Digital Marketing",
    "SEO Specialist": "Digital Marketing",
    "Social Media Manager": "Digital Marketing",
    "Educator": "Education",
    "Graphic Designer": "Graphic Design",
    "Motion Designer": "Graphic Design",
    "UI Designer": "Graphic Design",
    "UX Designer": "Graphic Design",
    "Backend Developer": "Software Development",
    "Full Stack Developer": "Software Development",
    "Java Developer": "Software Development",
    "Python Developer": "Software Development",
    "Software Engineer": "Software Development",
}


def load_all_jobs():
    with open(JOBS_WITH_SKILLS_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def flatten_skill_names(job):
    names = []
    for category in ("technical", "domain", "soft"):
        for skill in job["skills"][category]:
            names.append(skill["name"])
    return names


def build_dataset(jobs, all_skill_names):
    """Build the feature matrix (X) and label vector (y).

    X: one row per job, one column per skill (0/1)
    y: the normalized role label for that job

    Jobs whose search_keyword doesn't map to a known role are skipped and
    reported - this is a defensive check, not expected to trigger often,
    since this domain was collected using exactly these 4 keywords."""
    skill_index = {name: i for i, name in enumerate(all_skill_names)}

    X = []
    y = []
    skipped = 0

    for job in jobs:
        keyword = job.get("search_keyword", "").strip().lower()
        role = KEYWORD_TO_ROLE.get(keyword)
        if role is None:
            skipped += 1
            continue

        vector = np.zeros(len(all_skill_names), dtype=int)
        for skill_name in flatten_skill_names(job):
            if skill_name in skill_index:
                vector[skill_index[skill_name]] = 1

        X.append(vector)
        y.append(role)

    if skipped:
        print(f"Skipped {skipped} jobs with unrecognized search_keyword "
              f"(not one of {list(KEYWORD_TO_ROLE.keys())}).")

    return np.array(X), np.array(y)


def evaluate_model(name, model, X_train, y_train, X_test, y_test):
    train_predictions = model.predict(X_train)
    train_accuracy = accuracy_score(y_train, train_predictions)

    predictions = model.predict(X_test)
    accuracy = accuracy_score(y_test, predictions)

    print(f"\n{'=' * 60}")
    print(f"{name}")
    print(f"{'=' * 60}")
    print(f"Train Accuracy: {train_accuracy:.3f}")
    print(f"Test Accuracy:  {accuracy:.3f}")
    gap = train_accuracy - accuracy
    if gap > 0.15:
        print(f"WARNING: train/test gap is {gap:.3f} - possible overfitting, worth investigating.")
    else:
        print(f"Train/test gap: {gap:.3f} - reasonable, no strong overfitting signal.")
    print(f"\nClassification Report:")
    print(classification_report(y_test, predictions, zero_division=0))
    print(f"Confusion Matrix (rows=actual, columns=predicted):")
    labels = sorted(set(y_test))
    print(f"Labels order: {labels}")
    print(confusion_matrix(y_test, predictions, labels=labels))

    return accuracy


def show_top_predictive_skills(model, feature_names, model_name, top_n=8):
    """For Logistic Regression specifically: show which skills most
    strongly push the prediction toward each role, using the model's
    learned coefficients. This is only meaningful for linear models -
    Random Forest doesn't expose comparable per-class coefficients, so
    this is skipped if a different model was selected."""
    if model_name != "Logistic Regression":
        print(f"\n(Skipping top-predictive-skills breakdown - only "
              f"meaningful for Logistic Regression, selected model is {model_name}.)")
        return

    print(f"\n{'=' * 60}")
    print("Top skills driving each role prediction (model coefficients)")
    print(f"{'=' * 60}")

    for class_index, role in enumerate(model.classes_):
        coefficients = model.coef_[class_index]
        top_indices = np.argsort(coefficients)[::-1][:top_n]

        print(f"\n{role}:")
        for idx in top_indices:
            weight = coefficients[idx]
            if weight > 0:  # only show skills that genuinely push TOWARD this role
                print(f"  {feature_names[idx]:30s} weight={weight:.3f}")


def build_description_only_skills(jobs, master_skills):
    """Re-run skill matching using ONLY the description text, excluding
    the job title entirely. This isolates whether a role prediction is
    coming from genuine skill signal vs. the title effectively containing
    the label (e.g. title "Machine Learning Engineer" trivially matching
    the skill "Machine Learning", which is suspiciously close to the
    label itself).

    Deliberately separate from extract_skills.py's own matching (which
    correctly uses title+description for analytics/recommendation - more
    complete skill data is the right choice there). This is a narrow,
    ML-feature-specific experiment, not a change to the core pipeline."""
    nlp = spacy.blank("en")
    if not Span.has_extension("skill_id"):
        Span.set_extension("skill_id", default=None)

    matcher, skill_lookup = build_phrase_matcher(nlp, master_skills)

    description_only_skills = {}
    for job in jobs:
        description = job.get("description", "")
        matched = extract_skills_from_text(nlp, matcher, skill_lookup, description)
        description_only_skills[id(job)] = [s["name"] for s in matched]

    return description_only_skills


def build_dataset_from_skill_lists(jobs, skill_lists_by_job_id, all_skill_names):
    """Same as build_dataset, but takes pre-computed skill name lists
    (e.g. from build_description_only_skills) instead of reading
    job['skills'] directly."""
    skill_index = {name: i for i, name in enumerate(all_skill_names)}

    X = []
    y = []
    skipped = 0

    for job in jobs:
        keyword = job.get("search_keyword", "").strip().lower()
        role = KEYWORD_TO_ROLE.get(keyword)
        if role is None:
            skipped += 1
            continue

        vector = np.zeros(len(all_skill_names), dtype=int)
        for skill_name in skill_lists_by_job_id[id(job)]:
            if skill_name in skill_index:
                vector[skill_index[skill_name]] = 1

        X.append(vector)
        y.append(role)

    return np.array(X), np.array(y)


def run_leakage_comparison(jobs, master_skills, all_skill_names):
    """Trains two Logistic Regression models - one on title+description
    features (current approach), one on description-only features - and
    compares their accuracy directly. This gives a real, measured answer
    to how much of the current model's accuracy comes from title leakage,
    instead of leaving it as a documented but unverified assumption."""
    print(f"\n{'=' * 60}")
    print("LEAKAGE COMPARISON: title+description vs. description-only")
    print(f"{'=' * 60}")

    # Model A: current approach (title+description, via job["skills"])
    X_full, y_full = build_dataset(jobs, all_skill_names)
    X_train_full, X_test_full, y_train_full, y_test_full = train_test_split(
        X_full, y_full, test_size=0.2, random_state=42, stratify=y_full
    )
    model_full = LogisticRegression(max_iter=1000, random_state=42)
    model_full.fit(X_train_full, y_train_full)
    acc_full = accuracy_score(y_test_full, model_full.predict(X_test_full))

    # Model B: description-only (title excluded)
    print("Re-extracting skills from description text only (this takes a moment)...")
    desc_only_skills = build_description_only_skills(jobs, master_skills)
    X_desc, y_desc = build_dataset_from_skill_lists(jobs, desc_only_skills, all_skill_names)
    X_train_desc, X_test_desc, y_train_desc, y_test_desc = train_test_split(
        X_desc, y_desc, test_size=0.2, random_state=42, stratify=y_desc
    )
    model_desc = LogisticRegression(max_iter=1000, random_state=42)
    model_desc.fit(X_train_desc, y_train_desc)
    acc_desc = accuracy_score(y_test_desc, model_desc.predict(X_test_desc))

    print(f"\nModel A (title+description features): accuracy = {acc_full:.3f}")
    print(f"Model B (description-only features):   accuracy = {acc_desc:.3f}")
    print(f"Accuracy drop when title is excluded:   {acc_full - acc_desc:.3f} "
          f"({(acc_full - acc_desc) * 100:.1f} points)")

    print(f"\nTop skills for description-only model (leakage-resistant view):")
    for class_index, role in enumerate(model_desc.classes_):
        coefficients = model_desc.coef_[class_index]
        top_indices = np.argsort(coefficients)[::-1][:5]
        print(f"\n{role}:")
    """Demonstrates description-only features comparison."""
    pass


def main():
    print("Loading all jobs for multi-domain classifier...")
    jobs = load_all_jobs()
    print(f"Found {len(jobs)} total jobs.")

    master_skills = load_master_skills()
    all_skill_names = sorted(set(row["skill"] for row in master_skills if row["enabled"] == "TRUE"))
    print(f"Using {len(all_skill_names)} skills as features.")

    X, y = build_dataset(jobs, all_skill_names)
    print(f"Built dataset: {X.shape[0]} samples, {X.shape[1]} features.")
    
    unique_labels, label_counts = np.unique(y, return_counts=True)
    label_dist = dict(zip(unique_labels, label_counts))
    print(f"\nLabel distribution across {len(label_dist)} role classes:")
    for role, count in sorted(label_dist.items(), key=lambda item: -item[1]):
        print(f"  {role:30s}: {count} samples")

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    print(f"\nTrain set: {X_train.shape[0]} samples, Test set: {X_test.shape[0]} samples.")

    log_reg = LogisticRegression(max_iter=1000, random_state=42)
    log_reg.fit(X_train, y_train)
    log_reg_accuracy = evaluate_model("Logistic Regression", log_reg, X_train, y_train, X_test, y_test)

    rf = RandomForestClassifier(n_estimators=200, random_state=42)
    rf.fit(X_train, y_train)
    rf_accuracy = evaluate_model("Random Forest", rf, X_train, y_train, X_test, y_test)

    MEANINGFUL_IMPROVEMENT_THRESHOLD = 0.02

    if rf_accuracy - log_reg_accuracy >= MEANINGFUL_IMPROVEMENT_THRESHOLD:
        best_model, best_name = rf, "Random Forest"
        print(f"\nRandom Forest wins by {(rf_accuracy - log_reg_accuracy) * 100:.1f} points - selecting Random Forest.")
    else:
        best_model, best_name = log_reg, "Logistic Regression"
        print(f"\nDefaulting to Logistic Regression for interpretability and lower overfitting risk.")

    print(f"\n{'=' * 60}")
    print(f"Selected model: {best_name} (accuracy={max(log_reg_accuracy, rf_accuracy):.3f})")
    print(f"{'=' * 60}")

    joblib.dump(best_model, MODEL_OUTPUT_FILE)
    with open(FEATURES_OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump({
            "feature_columns": all_skill_names,
            "model_type": best_name,
            "role_to_domain": ROLE_TO_DOMAIN,
            "accuracy": max(log_reg_accuracy, rf_accuracy),
        }, f, indent=2)

    print(f"\nSaved model to {MODEL_OUTPUT_FILE}")
    print(f"Saved feature column order to {FEATURES_OUTPUT_FILE}")

    show_top_predictive_skills(best_model, all_skill_names, best_name)


def predict_role_cached(skills_list, model, feature_columns, role_to_domain=None, target_domain=None, synonym_map=None):
    """Predict role with optional domain-aware filtering, synonym resolution, and probability renormalization."""
    skill_index = {name.strip().lower(): i for i, name in enumerate(feature_columns)}

    if synonym_map is None:
        try:
            from utils.data_loader import get_skills_data
            skills_data = get_skills_data()
            synonym_map = {}
            for s in skills_data:
                if not s.get("enabled"):
                    continue
                canonical = s["skill"].strip().lower()
                if canonical in skill_index:
                    idx = skill_index[canonical]
                    synonym_map[canonical] = idx
                    for syn in s.get("synonyms", []):
                        if syn.strip():
                            synonym_map[syn.strip().lower()] = idx
        except Exception:
            synonym_map = skill_index

    vector = np.zeros(len(feature_columns), dtype=int)
    for skill in skills_list:
        clean_skill = str(skill).strip().lower()
        if clean_skill in synonym_map:
            vector[synonym_map[clean_skill]] = 1
        elif clean_skill in skill_index:
            vector[skill_index[clean_skill]] = 1

    probabilities = model.predict_proba([vector])[0]
    classes = [str(cls) for cls in model.classes_]
    prob_by_class = {cls: float(prob) for cls, prob in zip(classes, probabilities)}

    if target_domain and role_to_domain:
        domain_probs = {r: p for r, p in prob_by_class.items() if role_to_domain.get(r) == target_domain}
        if domain_probs:
            total = sum(domain_probs.values()) or 1.0
            domain_probs = {r: round(p / total, 3) for r, p in domain_probs.items()}
            predicted_role = max(domain_probs, key=domain_probs.get)
            return {
                "predicted_role": predicted_role,
                "confidence": domain_probs[predicted_role],
                "all_probabilities": domain_probs,
            }

    predicted_role = max(prob_by_class, key=prob_by_class.get)
    return {
        "predicted_role": predicted_role,
        "confidence": round(prob_by_class[predicted_role], 3),
        "all_probabilities": {k: round(v, 3) for k, v in prob_by_class.items()},
    }


def predict_role(skills_list, model_path=MODEL_OUTPUT_FILE, features_path=FEATURES_OUTPUT_FILE, target_domain=None):
    model = joblib.load(model_path)
    with open(features_path, "r", encoding="utf-8") as f:
        feature_info = json.load(f)

    feature_columns = feature_info["feature_columns"]
    role_to_domain = feature_info.get("role_to_domain", {})
    return predict_role_cached(skills_list, model, feature_columns, role_to_domain, target_domain)


if __name__ == "__main__":
    main()