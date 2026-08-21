"""
analytics.py

Computes ALL derived/analytical data from jobs_with_skills.json - nothing
here is stored manually, everything is calculated fresh from real extracted
job data. This is the "Derived Data" half of the architecture we agreed on;
master_skills.csv remains the "Reference Data" half and is never touched
by this script.

Produces:
  - Top skills per domain (ranked by frequency)
  - Overall top skills across all domains
  - Skill popularity (which domains a skill appears in, and how strongly)
  - Domain statistics (job counts, average skills/job, category breakdown)
  - Top companies / top cities, overall and per domain
  - Salary disclosure stats (real salary shown when available, otherwise
    honestly reported as not disclosed - no invented numbers)

Usage:
    python analytics.py

Reads:
    jobs_with_skills.json
Writes:
    analytics.json
"""

import json
import os
from collections import Counter, defaultdict
from datetime import datetime, timezone

# Resolve paths relative to THIS script's own location, not whatever folder
# the terminal happens to be standing in - same fix applied to
# fetch_jobs_api.py earlier, for the same reason.
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

# Assumes this file lives at backend/analytics/analytics.py, a SIBLING of
# backend/ml/ - adjust the "../ml" part if you place it somewhere else.
JOBS_WITH_SKILLS_FILE = os.path.join(SCRIPT_DIR, "..", "ml", "jobs_with_skills.json")
OUTPUT_FILE = os.path.join(SCRIPT_DIR, "analytics.json")

TOP_N_SKILLS = 20
TOP_N_COMPANIES = 10
TOP_N_CITIES = 10


def load_jobs():
    with open(JOBS_WITH_SKILLS_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def flatten_skills(job):
    """Return every matched skill (full dict, not just ID) for a job,
    across all three categories, as one flat list."""
    skills = []
    for category in ("technical", "domain", "soft"):
        skills.extend(job["skills"][category])
    return skills


# ---------------------------------------------------------------------------
# Skill frequency and ranking
# ---------------------------------------------------------------------------

def compute_skill_frequency(jobs):
    """Count how many jobs mention each skill. Returns {skill_name: count}."""
    counter = Counter()
    for job in jobs:
        for skill in flatten_skills(job):
            counter[skill["name"]] += 1
    return counter


def top_skills_list(counter, n=TOP_N_SKILLS):
    """Convert a Counter into a ranked list of {name, count} dicts."""
    return [{"skill": name, "count": count} for name, count in counter.most_common(n)]


# ---------------------------------------------------------------------------
# Skill popularity across domains (which domains use this skill, how much)
# ---------------------------------------------------------------------------

def compute_skill_popularity(jobs):
    """For every skill, find which domains it appears in and how often in
    each. This is the data-driven replacement for a manually maintained
    domain-skill mapping - it's discovered from real job data, not typed
    in by hand."""
    popularity = defaultdict(lambda: defaultdict(int))

    for job in jobs:
        domain = job.get("career_domain", "Unknown")
        for skill in flatten_skills(job):
            popularity[skill["name"]][domain] += 1

    result = {}
    for skill_name, domain_counts in popularity.items():
        total = sum(domain_counts.values())
        # domain this skill appears in most - useful as a "primary domain"
        # label if ever needed for browsing/catalog purposes
        primary_domain = max(domain_counts, key=domain_counts.get)
        result[skill_name] = {
            "total_count": total,
            "domains": dict(sorted(domain_counts.items(), key=lambda x: -x[1])),
            "primary_domain": primary_domain,
            "domain_count": len(domain_counts),  # how many domains use this skill at all
        }

    return result


# ---------------------------------------------------------------------------
# Per-domain statistics
# ---------------------------------------------------------------------------

def compute_domain_stats(jobs):
    """Full breakdown per career_domain: job counts, average skills, top
    skills, category split, top companies, top cities, and salary stats.

    Salary stats here reuse compute_salary_stats() rather than
    reimplementing the average/disclosure-rate math separately - this is
    the single source of truth for salary calculations. Anything reading
    per-domain salary (e.g. the FastAPI backend) should read it from here,
    not recompute it independently."""
    domains = defaultdict(list)
    for job in jobs:
        domains[job.get("career_domain", "Unknown")].append(job)

    result = {}
    for domain, domain_jobs in domains.items():
        skill_counter = Counter()
        category_totals = {"technical": 0, "domain": 0, "soft": 0}
        company_counter = Counter()
        city_counter = Counter()
        skill_counts_per_job = []

        for job in domain_jobs:
            skill_counts_per_job.append(job["skill_count"])
            company = job.get("company", "").strip()
            if company and company.lower() != "unknown":
                company_counter[company] += 1
            city = job.get("city", "").strip()
            if city and city.lower() != "unknown":
                city_counter[city] += 1
            for category in category_totals:
                for skill in job["skills"][category]:
                    skill_counter[skill["name"]] += 1
                    category_totals[category] += 1

        avg_skills = (
            sum(skill_counts_per_job) / len(skill_counts_per_job)
            if skill_counts_per_job else 0
        )

        result[domain] = {
            "total_jobs": len(domain_jobs),
            "average_skills_per_job": round(avg_skills, 2),
            "top_skills": top_skills_list(skill_counter),
            "category_breakdown": category_totals,
            "top_companies": [
                {"company": c, "count": n} for c, n in company_counter.most_common(TOP_N_COMPANIES)
            ],
            "top_cities": [
                {"city": c, "count": n} for c, n in city_counter.most_common(TOP_N_CITIES)
            ],
            "salary": compute_salary_stats(domain_jobs),  # reused, not duplicated
        }

    return result


# ---------------------------------------------------------------------------
# Salary stats (real data only - never invented)
# ---------------------------------------------------------------------------

def compute_salary_stats(jobs):
    """Report real salary data where available. Never estimate or invent
    missing salary values - honestly report the disclosure rate instead."""
    disclosed = [j for j in jobs if j.get("salary_min") and j.get("salary_max")]
    undisclosed_count = len(jobs) - len(disclosed)

    stats = {
        "total_jobs": len(jobs),
        "jobs_with_salary_disclosed": len(disclosed),
        "jobs_without_salary_disclosed": undisclosed_count,
        "disclosure_rate_percent": round((len(disclosed) / len(jobs)) * 100, 1) if jobs else 0,
    }

    if disclosed:
        avg_min = sum(j["salary_min"] for j in disclosed) / len(disclosed)
        avg_max = sum(j["salary_max"] for j in disclosed) / len(disclosed)
        stats["average_salary_min"] = round(avg_min, 0)
        stats["average_salary_max"] = round(avg_max, 0)
        stats["note"] = "Based only on postings that disclosed salary - not estimated for others."

    return stats


# ---------------------------------------------------------------------------
# Overall (cross-domain) stats
# ---------------------------------------------------------------------------

def compute_overall_stats(jobs):
    skill_counter = compute_skill_frequency(jobs)
    company_counter = Counter(
        job.get("company", "").strip()
        for job in jobs
        if job.get("company", "").strip() and job.get("company", "").strip().lower() != "unknown"
    )
    city_counter = Counter(
        job.get("city", "").strip()
        for job in jobs
        if job.get("city", "").strip() and job.get("city", "").strip().lower() != "unknown"
    )

    return {
        "total_jobs": len(jobs),
        "total_unique_skills_matched": len(skill_counter),
        "top_skills": top_skills_list(skill_counter),
        "top_companies": [
            {"company": c, "count": n} for c, n in company_counter.most_common(TOP_N_COMPANIES)
        ],
        "top_cities": [
            {"city": c, "count": n} for c, n in city_counter.most_common(TOP_N_CITIES)
        ],
    }


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    jobs = load_jobs()
    print(f"Loaded {len(jobs)} jobs from {JOBS_WITH_SKILLS_FILE}.")

    overall = compute_overall_stats(jobs)
    by_domain = compute_domain_stats(jobs)
    skill_popularity = compute_skill_popularity(jobs)
    salary = compute_salary_stats(jobs)

    analytics = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "overall": overall,
        "by_domain": by_domain,
        "skill_popularity": skill_popularity,
        "salary": salary,
    }

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(analytics, f, indent=2, ensure_ascii=False)

    # Console summary
    print("\n--- Analytics Summary ---")
    print(f"Total jobs analyzed: {overall['total_jobs']}")
    print(f"Unique skills matched: {overall['total_unique_skills_matched']}")
    print(f"\nTop 5 skills overall:")
    for item in overall["top_skills"][:5]:
        print(f"  {item['skill']}: {item['count']}")

    print(f"\nDomains covered: {len(by_domain)}")
    for domain, stats in by_domain.items():
        print(f"  {domain}: {stats['total_jobs']} jobs, "
              f"avg {stats['average_skills_per_job']} skills/job")

    print(f"\nSalary disclosure rate: {salary['disclosure_rate_percent']}% "
          f"({salary['jobs_with_salary_disclosed']} of {salary['total_jobs']} jobs)")

    # Cross-domain skill example - good sanity check to eyeball
    if "Python" in skill_popularity:
        python_data = skill_popularity["Python"]
        print(f"\nExample cross-domain check - Python appears in "
              f"{python_data['domain_count']} domain(s): {list(python_data['domains'].keys())}")

    print(f"\nSaved full analytics to {OUTPUT_FILE}")


if __name__ == "__main__":
    main()