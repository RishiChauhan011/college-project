"""
recommendation.py

Computes skill-gap analysis and resume-match scoring for a given resume's
skills against a target career domain. Uses ONLY real, computed data:

  - analytics.json (from analytics.py) - domain skill frequencies, used
    as the "demand weight" for each skill
  - jobs_with_skills.json - used to find which real companies a person
    would qualify for after closing their skill gap
  - master_skills.csv - used to normalize/validate resume skill names
    against canonical skill names (via synonyms)

No AI/LLM is used here, and nothing is invented - this module produces
the STRUCTURED, factual inputs that Gemini will later explain in natural
language. Per our design philosophy: AI explains the data, it doesn't
calculate it.

Usage (standalone test):
    python recommendation.py

As a module (once the backend is wired up):
    from recommendation import generate_recommendation
    result = generate_recommendation(resume_skills, target_domain)
"""

import json
import os
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(os.path.join(SCRIPT_DIR, "..", "ml"))
from extract_skills import load_master_skills  # reuse the same loader, no duplication

ANALYTICS_FILE = os.path.join(SCRIPT_DIR, "..", "analytics", "analytics.json")
JOBS_WITH_SKILLS_FILE = os.path.join(SCRIPT_DIR, "..", "ml", "jobs_with_skills.json")

# Approximate learning time per skill, in weeks. This is a documented,
# explainable ESTIMATE (e.g. "based on typical online-course durations
# for each category"), not a number Gemini invents on the spot. Category
# is used as a simple default; override per-skill below only where a
# skill is clearly faster/slower than its category's typical case.
DEFAULT_LEARNING_WEEKS_BY_CATEGORY = {
    "Technical": 3,
    "Domain": 4,
    "Soft Skill": 2,
}

# Per-skill overrides where the default is clearly wrong (e.g. a full
# language/framework takes longer than a typical "Technical" skill;
# a single tool is often faster). Keyed by skill ID from master_skills.csv.
LEARNING_WEEKS_OVERRIDES = {
    "T013": 6,   # TensorFlow - substantial framework, longer than average
    "T014": 6,   # PyTorch
    "D001": 8,   # Machine Learning - broad domain, not a single tool
    "D002": 8,   # Deep Learning
    "T043": 2,   # Photoshop - single tool, faster to get functional with
    "T045": 2,   # Figma
}


def load_analytics():
    with open(ANALYTICS_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def load_jobs_with_skills():
    with open(JOBS_WITH_SKILLS_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def build_skill_normalizer(master_skills):
    """Build a lookup so raw resume skill strings (which may be typed in
    any casing, or as a synonym) resolve to the canonical skill name used
    everywhere else in the pipeline. Exact/synonym matching only, no
    fuzzy matching - consistent with the rest of the project."""
    lookup = {}
    for row in master_skills:
        if row["enabled"] != "TRUE":
            continue
        canonical = row["skill"]
        lookup[canonical.lower()] = row
        for synonym in row["synonyms"]:
            lookup[synonym.lower()] = row
    return lookup


def normalize_resume_skills(raw_skills, skill_lookup):
    """Convert a list of raw resume skill strings into canonical skill
    records. Unrecognized strings are dropped (not guessed at) and
    reported separately, so nothing is silently misinterpreted."""
    matched = []
    unrecognized = []

    for raw in raw_skills:
        key = raw.strip().lower()
        if key in skill_lookup:
            matched.append(skill_lookup[key])
        else:
            unrecognized.append(raw)

    return matched, unrecognized


def get_learning_weeks(skill_row):
    skill_id = skill_row["id"]
    if skill_id in LEARNING_WEEKS_OVERRIDES:
        return LEARNING_WEEKS_OVERRIDES[skill_id]
    return DEFAULT_LEARNING_WEEKS_BY_CATEGORY.get(skill_row["category"], 3)


def compute_match_score(resume_skill_ids, domain_top_skills):
    """Weighted match score: how much of the domain's real skill demand
    does this resume already cover?

    weight of a skill = how many jobs in this domain mention it
    match_score = (sum of weights of resume skills present in domain)
                  / (sum of weights of ALL top skills in domain)

    This is a deterministic FORMULA, not an ML model output and not a
    role-fit classification - keep that distinction clear in the report."""
    total_weight = sum(item["count"] for item in domain_top_skills)
    if total_weight == 0:
        return 0.0, []

    matched_weight = 0
    matched_skill_names = []
    for item in domain_top_skills:
        if item["skill"] in resume_skill_ids:  # resume_skill_ids is a set of skill NAMES here
            matched_weight += item["count"]
            matched_skill_names.append(item["skill"])

    match_percent = round((matched_weight / total_weight) * 100, 1)
    return match_percent, matched_skill_names


def compute_missing_skills(resume_skill_names, domain_top_skills, master_skills_by_name, top_n=10):
    """Rank the domain's most in-demand skills that the resume does NOT
    already have, by a simple ROI formula: demand weight / learning time.
    Higher ROI = more market value for less learning effort."""
    missing = []

    for item in domain_top_skills:
        skill_name = item["skill"]
        if skill_name in resume_skill_names:
            continue

        skill_row = master_skills_by_name.get(skill_name)
        if not skill_row:
            continue  # shouldn't happen, but skip safely if analytics and master list ever drift

        # Exclude broad, domain-level concepts from learning recommendations
        if skill_row.get("skill_type") == "Broad Domain":
            continue

        weeks = get_learning_weeks(skill_row)
        demand = item["count"]
        roi = round(demand / weeks, 2)

        missing.append({
            "skill": skill_name,
            "category": skill_row["category"],
            "demand_count": demand,
            "estimated_learning_weeks": weeks,
            "roi_score": roi,
        })

    missing.sort(key=lambda x: x["roi_score"], reverse=True)
    return missing[:top_n]


def estimate_total_learning_time(missing_skills, top_n=3):
    """Sum learning weeks for the TOP N highest-ROI missing skills only -
    not all of them, since recommending someone learn 10 skills at once
    isn't a realistic roadmap. This becomes the "estimated learning time"
    figure shown to the user."""
    top_gap_skills = missing_skills[:top_n]
    total_weeks = sum(s["estimated_learning_weeks"] for s in top_gap_skills)
    return total_weeks, [s["skill"] for s in top_gap_skills]


def find_qualifying_companies(resume_skill_names, missing_skill_names, domain, all_jobs, max_results=15):
    """Find real companies (from actual collected job data) whose postings
    the person would qualify for after learning the recommended missing
    skills - i.e. the job's required skills are a subset of
    (resume skills + newly learned skills)."""
    future_skill_set = set(resume_skill_names) | set(missing_skill_names)
    qualifying_companies = set()

    for job in all_jobs:
        if job.get("career_domain") != domain:
            continue

        job_skill_names = set()
        for category in ("technical", "domain", "soft"):
            for skill in job["skills"][category]:
                job_skill_names.add(skill["name"])

        if not job_skill_names:
            continue  # skip jobs where nothing was extracted, not meaningful evidence

        if job_skill_names.issubset(future_skill_set):
            qualifying_companies.add(job.get("company", "Unknown"))

        if len(qualifying_companies) >= max_results:
            break

    return sorted(qualifying_companies)


# ---------------------------------------------------------------------------
# Main entry point
# ---------------------------------------------------------------------------

def generate_recommendation(raw_resume_skills, target_domain):
    """Main function. Takes a list of raw skill strings (as they'd come
    from the resume parser or manual entry form) and a target career
    domain, returns the full structured recommendation."""
    analytics = load_analytics()
    all_jobs = load_jobs_with_skills()
    master_skills = load_master_skills()
    skill_lookup = build_skill_normalizer(master_skills)
    master_skills_by_name = {row["skill"]: row for row in master_skills}

    if target_domain not in analytics["by_domain"]:
        raise ValueError(
            f"Unknown domain '{target_domain}'. Valid options: "
            f"{list(analytics['by_domain'].keys())}"
        )

    domain_top_skills = analytics["by_domain"][target_domain]["top_skills"]

    matched_skill_rows, unrecognized = normalize_resume_skills(raw_resume_skills, skill_lookup)
    resume_skill_names = set(row["skill"] for row in matched_skill_rows)

    match_percent, matched_against_domain = compute_match_score(resume_skill_names, domain_top_skills)
    missing_skills = compute_missing_skills(resume_skill_names, domain_top_skills, master_skills_by_name)
    total_weeks, priority_skills = estimate_total_learning_time(missing_skills)
    qualifying_companies = find_qualifying_companies(
        resume_skill_names, priority_skills, target_domain, all_jobs
    )

    return {
        "target_domain": target_domain,
        "resume_skills_recognized": sorted(resume_skill_names),
        "resume_skills_unrecognized": unrecognized,
        "match_percent": match_percent,
        "missing_skills": missing_skills,
        "recommended_learning_priority": priority_skills,
        "estimated_learning_weeks": total_weeks,
        "companies_you_would_qualify_for": qualifying_companies,
    }


if __name__ == "__main__":
    # Standalone test - simulates a resume with a few known skills, since
    # the real resume parser isn't wired in yet (that's your partner's
    # module). Replace this list to test different scenarios.
    sample_resume_skills = ["Python", "Excel", "Communication", "SQL"]
    sample_target_domain = "AI & Data Science"

    result = generate_recommendation(sample_resume_skills, sample_target_domain)

    print(f"--- Recommendation for target domain: {sample_target_domain} ---")
    print(f"Resume skills recognized: {result['resume_skills_recognized']}")
    if result["resume_skills_unrecognized"]:
        print(f"Resume skills NOT recognized (not in master list): {result['resume_skills_unrecognized']}")
    print(f"\nMatch score: {result['match_percent']}%")
    print(f"\nTop missing skills (ranked by ROI = demand / learning time):")
    for s in result["missing_skills"]:
        print(f"  {s['skill']:30s} demand={s['demand_count']:<5} "
              f"weeks={s['estimated_learning_weeks']:<3} roi={s['roi_score']}")
    print(f"\nRecommended learning priority (top 3): {result['recommended_learning_priority']}")
    print(f"Estimated total learning time: {result['estimated_learning_weeks']} weeks")
    print(f"\nCompanies you'd qualify for after closing this gap "
          f"({len(result['companies_you_would_qualify_for'])} found):")
    for company in result["companies_you_would_qualify_for"][:10]:
        print(f"  - {company}")