"""
fetch_jobs_api.py

Collects job postings from the Adzuna API for India, across MULTIPLE
career domains (Software Development, AI & Data Science, Business
Analytics, Graphic Design, Digital Marketing, Education), and saves
them all into one combined raw_jobs.json - each job tagged with which
domain it was collected for.

Supports INCREMENTAL collection: you don't have to collect every domain
in one run. Set DOMAINS_TO_COLLECT below to just the domain(s) you want
to add right now, and the script will merge new results into your
existing raw_jobs.json instead of overwriting it.

Usage:
    1. Fill in APP_ID and APP_KEY below (or set as environment variables).
    2. Set DOMAINS_TO_COLLECT to the domain(s) you want to collect this run.
    3. Run: python fetch_jobs_api.py
    4. Output: raw_jobs.json (merged with any previous runs).
"""

import requests
import json
import time
import os

# Resolve paths relative to THIS script's own location, not whatever folder
# the terminal happens to be standing in when you run it. This prevents the
# script from accidentally creating a second, separate raw_jobs.json if you
# run it from the project root instead of from inside data_pipeline/.
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

# ---- CONFIG ----
APP_ID = os.getenv("ADZUNA_APP_ID", "83a7a30a")
APP_KEY = os.getenv("ADZUNA_APP_KEY", "9bbf08c2f7c1a2c3649aa8c498b57309")

COUNTRY = "in"  # India
BASE_URL = f"https://api.adzuna.com/v1/api/jobs/{COUNTRY}/search"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                  "(KHTML, like Gecko) Chrome/125.0 Safari/537.36",
    "Accept": "application/json",
}

# Keyword lists per career domain. Each domain's jobs get tagged with
# career_domain = the dict key, so downstream steps (skill extraction,
# analytics, dashboard filtering) can separate them cleanly.
DOMAIN_KEYWORDS = {
    "AI & Data Science": [
        "data scientist",
        "machine learning engineer",
        "ai engineer",
        "data analyst",
    ],
    "Software Development": [
        "software engineer",
        "backend developer",
        "full stack developer",
        "python developer",
        "java developer",
    ],
    "Business Analytics": [
        "business analyst",
        "bi analyst",
        "business intelligence analyst",
    ],
    "Graphic Design": [
        "graphic designer",
        "ui designer",
        "ux designer",
        "motion designer",
    ],
    "Digital Marketing": [
        "seo specialist",
        "digital marketing executive",
        "social media manager",
        "content strategist",
    ],
    "Education": [
        "teacher",
        "lecturer",
        "tutor",
    ],
    # Healthcare deliberately left out for now - add only later, and only
    # with extra care validating accuracy, per our earlier discussion.
}

# Adzuna category tag used to pre-filter each domain's search, confirmed
# via https://api.adzuna.com/v1/api/jobs/in/categories
# This is our FIRST level of filtering (industry), keywords are the second
# (specific role). Business Analytics only uses "it-jobs" for now, not all
# three plausible categories, to keep API call volume reasonable - revisit
# later if coverage looks thin.
DOMAIN_CATEGORY = {
    "AI & Data Science": "it-jobs",
    "Software Development": "it-jobs",
    "Business Analytics": "it-jobs",
    "Graphic Design": "creative-design-jobs",
    "Digital Marketing": "pr-advertising-marketing-jobs",
    "Education": "teaching-jobs",
}

# EDIT THIS per run - only the domains listed here get collected this time.
# This lets you build up your dataset domain-by-domain over several sessions
# instead of collecting everything in one huge run.
DOMAINS_TO_COLLECT = [
    "Business Analytics",
    "Graphic Design",
    "Digital Marketing",
    "Education",
]

PAGES_PER_KEYWORD = 3       # how many pages to pull per keyword
RESULTS_PER_PAGE = 50       # max allowed by Adzuna is typically 50
REQUEST_DELAY_SECONDS = 1   # be polite to the API, avoid rate limiting

OUTPUT_FILE = os.path.join(SCRIPT_DIR, "raw_jobs.json")


def fetch_jobs_for_keyword(keyword, career_domain, pages=PAGES_PER_KEYWORD):
    """Fetch multiple pages of job postings for a single keyword, tagged
    with the career domain it belongs to. Also applies an Adzuna category
    filter (first-level industry filter) if one is configured for this
    domain, per our hybrid category+keyword collection strategy."""
    all_jobs = []
    category_tag = DOMAIN_CATEGORY.get(career_domain)

    for page in range(1, pages + 1):
        url = f"{BASE_URL}/{page}"
        params = {
            "app_id": APP_ID,
            "app_key": APP_KEY,
            "results_per_page": RESULTS_PER_PAGE,
            "what": keyword,
        }
        if category_tag:
            params["category"] = category_tag

        print(f"Fetching '{keyword}' [{career_domain} / category={category_tag}] - page {page}...")
        response = requests.get(url, params=params, headers=HEADERS)

        if response.status_code != 200:
            print(f"  Request failed (status {response.status_code}). Skipping this page.")
            print(f"  Response: {response.text[:200]}")
            continue

        data = response.json()
        results = data.get("results", [])

        if not results:
            print(f"  No more results for '{keyword}' at page {page}. Stopping early.")
            break

        for job in results:
            structured_job = {
                "title": job.get("title", "").strip(),
                "company": job.get("company", {}).get("display_name", "Unknown"),
                "location": job.get("location", {}).get("display_name", "Unknown"),
                "description": job.get("description", "").strip(),
                "salary_min": job.get("salary_min"),
                "salary_max": job.get("salary_max"),
                "posted_date": job.get("created", ""),
                "source": "adzuna",
                "search_keyword": keyword,
                "career_domain": career_domain,
                "adzuna_category": job.get("category", {}).get("label", "Unknown"),
            }
            all_jobs.append(structured_job)

        time.sleep(REQUEST_DELAY_SECONDS)

    return all_jobs


def deduplicate_jobs(jobs):
    """Remove duplicate postings (same title + company + location), keeping
    the first occurrence. Runs across the WHOLE combined dataset, including
    jobs from previous runs, so re-running never creates duplicates."""
    seen = set()
    unique_jobs = []

    for job in jobs:
        key = (job["title"], job["company"], job["location"])
        if key not in seen:
            seen.add(key)
            unique_jobs.append(job)

    return unique_jobs


def load_existing_jobs():
    """Load previously collected jobs, if any, so new domains get MERGED
    in rather than overwriting earlier work."""
    if os.path.exists(OUTPUT_FILE):
        with open(OUTPUT_FILE, "r", encoding="utf-8") as f:
            existing = json.load(f)
        print(f"Found existing {OUTPUT_FILE} with {len(existing)} jobs - will merge new results into it.")
        return existing
    return []


def main():
    if APP_ID == "YOUR_APP_ID_HERE" or APP_KEY == "YOUR_APP_KEY_HERE":
        print("Please set your Adzuna APP_ID and APP_KEY before running this script.")
        return

    invalid_domains = [d for d in DOMAINS_TO_COLLECT if d not in DOMAIN_KEYWORDS]
    if invalid_domains:
        print(f"Unknown domain(s) in DOMAINS_TO_COLLECT: {invalid_domains}")
        print(f"Valid options are: {list(DOMAIN_KEYWORDS.keys())}")
        return

    newly_collected = []

    for domain in DOMAINS_TO_COLLECT:
        print(f"\n=== Collecting domain: {domain} ===")
        for keyword in DOMAIN_KEYWORDS[domain]:
            jobs = fetch_jobs_for_keyword(keyword, career_domain=domain)
            print(f"  -> Collected {len(jobs)} postings for '{keyword}'")
            newly_collected.extend(jobs)

    existing_jobs = load_existing_jobs()
    combined = existing_jobs + newly_collected
    unique_jobs = deduplicate_jobs(combined)

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(unique_jobs, f, indent=2, ensure_ascii=False)

    print(f"\nDone. {len(newly_collected)} new postings collected this run.")
    print(f"Total unique job postings in {OUTPUT_FILE}: {len(unique_jobs)}")

    # Quick breakdown by domain, so you can see coverage per domain immediately
    domain_counts = {}
    for job in unique_jobs:
        d = job.get("career_domain", "Unknown")
        domain_counts[d] = domain_counts.get(d, 0) + 1
    print("\nBreakdown by domain:")
    for d, count in domain_counts.items():
        print(f"  {d}: {count}")


if __name__ == "__main__":
    main()