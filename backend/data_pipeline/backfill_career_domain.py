"""
backfill_career_domain.py

ONE-TIME FIX for jobs collected before career_domain existed. Your original
818 jobs (collected before this field was added) still have their
search_keyword field saved - this script uses that to figure out which
domain each old job actually belongs to, and tags it correctly.

Run this ONCE, right after noticing "Unknown" domain jobs in raw_jobs.json.
You will not need it again after this.

Usage:
    python backfill_career_domain.py
"""

import json

RAW_JOBS_FILE = "raw_jobs.json"

# Maps each ORIGINAL keyword (from your very first collection run) to the
# correct career_domain, based on DOMAIN_KEYWORDS in fetch_jobs_api.py
KEYWORD_TO_DOMAIN = {
    "data scientist": "AI & Data Science",
    "data analyst": "AI & Data Science",
    "machine learning engineer": "AI & Data Science",
    "ai engineer": "AI & Data Science",
    "python developer": "Software Development",
    "business analyst": "Business Analytics",
}


def main():
    with open(RAW_JOBS_FILE, "r", encoding="utf-8") as f:
        jobs = json.load(f)

    fixed_count = 0
    still_unknown = []

    for job in jobs:
        if job.get("career_domain") == "Unknown" or "career_domain" not in job:
            keyword = job.get("search_keyword", "")
            domain = KEYWORD_TO_DOMAIN.get(keyword)
            if domain:
                job["career_domain"] = domain
                fixed_count += 1
            else:
                still_unknown.append(job.get("title", "Untitled"))

    with open(RAW_JOBS_FILE, "w", encoding="utf-8") as f:
        json.dump(jobs, f, indent=2, ensure_ascii=False)

    print(f"Backfilled career_domain for {fixed_count} jobs.")
    if still_unknown:
        print(f"{len(still_unknown)} jobs could not be matched to a domain "
              f"(unrecognized search_keyword). Examples:")
        for title in still_unknown[:5]:
            print(f"  - {title}")
    else:
        print("All jobs now have a valid career_domain. Nothing left as 'Unknown'.")


if __name__ == "__main__":
    main()