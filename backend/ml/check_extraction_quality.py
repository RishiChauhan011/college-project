"""
check_extraction_quality.py

A DEV/QA TOOL — not part of the core pipeline, not something your dashboard
or database will ever read. Its only job is to help you and your partner
verify that extract_skills.py actually worked correctly, before you build
anything on top of jobs_with_skills.json.

Covers:
  - Priority 1: overall accuracy stats (0-skill jobs, average, outliers)
  - Priority 3: master skill list coverage (which skills were never matched)
  - Priority 5: category balance (technical vs domain vs soft skill counts)
  - Priority 6: duplicate-match check (a skill should never appear twice
                for the same job)
  - Priority 4: a built-in synonym deduplication test (Node JS / Node.js
                should collapse into one match, not two)
  - Priority 8: a printed summary report

Usage:
    python check_extraction_quality.py

Reads:
    jobs_with_skills.json
    master_skills.csv (via extract_skills.py's loader)
"""

import json
import statistics
import os

from extract_skills import (
    load_master_skills,
    build_phrase_matcher,
    extract_skills_from_text,
)
import spacy
from spacy.tokens import Span

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
JOBS_WITH_SKILLS_FILE = os.path.join(SCRIPT_DIR, "jobs_with_skills.json")

# How many skills in one job counts as "unusually high" and worth a manual look
HIGH_SKILL_COUNT_THRESHOLD = 15
# How many top jobs to show when flagging possible over-matching
TOP_N_TO_SHOW = 10


def load_jobs_with_skills():
    with open(JOBS_WITH_SKILLS_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def flatten_skill_ids(job):
    """Return every skill ID mentioned for a job, across all three
    categories, as one flat list."""
    ids = []
    for category in ("technical", "domain", "soft"):
        for skill in job["skills"][category]:
            ids.append(skill["id"])
    return ids


# ---------------------------------------------------------------------------
# Priority 1: overall accuracy stats
# ---------------------------------------------------------------------------

def check_overall_stats(jobs):
    counts = [job["skill_count"] for job in jobs]
    zero_skill_jobs = [j for j in jobs if j["skill_count"] == 0]
    high_skill_jobs = sorted(
        [j for j in jobs if j["skill_count"] >= HIGH_SKILL_COUNT_THRESHOLD],
        key=lambda j: j["skill_count"],
        reverse=True,
    )

    print("=" * 60)
    print("PRIORITY 1 — Overall Extraction Stats")
    print("=" * 60)
    print(f"Jobs processed:            {len(jobs)}")
    print(f"Jobs with at least 1 skill: {len(jobs) - len(zero_skill_jobs)}")
    print(f"Jobs with ZERO skills:      {len(zero_skill_jobs)}")
    print(f"Average skills/job:        {statistics.mean(counts):.2f}")
    print(f"Median skills/job:         {statistics.median(counts)}")
    print(f"Max skills/job:            {max(counts)}")

    if zero_skill_jobs:
        print(f"\nSample of jobs with 0 skills found (first 5):")
        for job in zero_skill_jobs[:5]:
            print(f"  - {job['title']} @ {job['company']}")

    if high_skill_jobs:
        print(f"\nJobs with {HIGH_SKILL_COUNT_THRESHOLD}+ skills "
              f"(check these manually for over-matching):")
        for job in high_skill_jobs[:TOP_N_TO_SHOW]:
            print(f"  - {job['skill_count']} skills: {job['title']} @ {job['company']}")

    return zero_skill_jobs, high_skill_jobs


def check_stats_by_domain(jobs):
    """Break down extraction quality PER career_domain. Different domains
    will have very different zero-skill rates right now, since
    master_skills.csv is still mostly built around AI/DS and Software
    vocabulary - this makes those gaps visible immediately instead of
    hiding inside one combined average."""
    print("\n" + "=" * 60)
    print("PRIORITY 1b — Extraction Quality By Domain")
    print("=" * 60)

    domains = {}
    for job in jobs:
        domain = job.get("career_domain", "Unknown")
        domains.setdefault(domain, []).append(job)

    print(f"{'Domain':25s} {'Jobs':>6s} {'0-skill':>8s} {'0-skill %':>10s} {'Avg skills':>11s}")
    print("-" * 65)
    for domain, domain_jobs in sorted(domains.items(), key=lambda x: -len(x[1])):
        counts = [j["skill_count"] for j in domain_jobs]
        zero_count = len([c for c in counts if c == 0])
        zero_pct = (zero_count / len(domain_jobs)) * 100
        avg = statistics.mean(counts)
        print(f"{domain:25s} {len(domain_jobs):>6d} {zero_count:>8d} "
              f"{zero_pct:>9.1f}% {avg:>11.2f}")

    return domains


# ---------------------------------------------------------------------------
# Priority 3: master skill list coverage
# ---------------------------------------------------------------------------

def check_skill_coverage(jobs, master_skills):
    matched_ids = set()
    for job in jobs:
        matched_ids.update(flatten_skill_ids(job))

    enabled_skills = [s for s in master_skills if s["enabled"] == "TRUE"]
    never_matched = [s for s in enabled_skills if s["id"] not in matched_ids]

    print("\n" + "=" * 60)
    print("PRIORITY 3 — Master Skill List Coverage")
    print("=" * 60)
    print(f"Enabled skills in master list: {len(enabled_skills)}")
    print(f"Skills matched at least once:  {len(enabled_skills) - len(never_matched)}")
    print(f"Skills NEVER matched:          {len(never_matched)}")

    if never_matched:
        print("\nSkills with 0 matches (investigate each - genuinely absent from")
        print("your data? missing synonym? or a real matching problem?):")
        for s in never_matched:
            print(f"  - {s['skill']} (id={s['id']}, category={s['category']})")

    return never_matched


# ---------------------------------------------------------------------------
# Priority 5: category balance
# ---------------------------------------------------------------------------

def check_category_balance(jobs):
    totals = {"technical": 0, "domain": 0, "soft": 0}
    for job in jobs:
        for category in totals:
            totals[category] += len(job["skills"][category])

    print("\n" + "=" * 60)
    print("PRIORITY 5 — Category Balance")
    print("=" * 60)
    for category, count in totals.items():
        print(f"{category.capitalize():12s}: {count} total matches")

    grand_total = sum(totals.values())
    if grand_total > 0:
        for category, count in totals.items():
            pct = (count / grand_total) * 100
            print(f"  {category.capitalize():12s} = {pct:.1f}% of all matches")

    return totals


# ---------------------------------------------------------------------------
# Priority 6: duplicate-match check
# ---------------------------------------------------------------------------

def check_for_duplicate_matches(jobs):
    print("\n" + "=" * 60)
    print("PRIORITY 6 — Duplicate Match Check")
    print("=" * 60)

    jobs_with_duplicates = []
    for job in jobs:
        ids = flatten_skill_ids(job)
        if len(ids) != len(set(ids)):
            jobs_with_duplicates.append(job)

    if jobs_with_duplicates:
        print(f"FOUND {len(jobs_with_duplicates)} jobs with duplicate skill matches:")
        for job in jobs_with_duplicates[:5]:
            print(f"  - {job['title']} @ {job['company']}")
        print("This should not happen given how results are stored - investigate.")
    else:
        print(f"No duplicates found across all {len(jobs)} jobs.")
        print("Confirms the dict-based dedup in extract_skills.py works as designed.")

    return jobs_with_duplicates


# ---------------------------------------------------------------------------
# Priority 4: synonym deduplication test (built-in, not dependent on your data)
# ---------------------------------------------------------------------------

def test_synonym_deduplication(master_skills):
    print("\n" + "=" * 60)
    print("PRIORITY 4 — Synonym Deduplication Test")
    print("=" * 60)

    nlp = spacy.blank("en")
    if not Span.has_extension("skill_id"):
        Span.set_extension("skill_id", default=None)

    matcher, skill_lookup = build_phrase_matcher(nlp, master_skills)

    test_text = "We are looking for someone with Node.js and Node JS experience."
    results = extract_skills_from_text(nlp, matcher, skill_lookup, test_text)

    node_matches = [r for r in results if r["name"] == "Node.js"]

    print(f'Test input: "{test_text}"')
    print(f"Results: {results}")

    if len(node_matches) == 1:
        print("PASS - both spellings correctly collapsed into one match "
              f"(matched_by = '{node_matches[0]['matched_by']}').")
    elif len(node_matches) == 0:
        print("WARNING - Node.js not in master_skills.csv or not enabled, "
              "test could not run as intended.")
    else:
        print(f"FAIL - got {len(node_matches)} separate matches for Node.js, expected 1.")

    return node_matches


# ---------------------------------------------------------------------------
# Priority 8: final summary report
# ---------------------------------------------------------------------------

def print_final_summary(jobs, never_matched, jobs_with_duplicates):
    counts = [job["skill_count"] for job in jobs]
    zero_skill_count = len([j for j in jobs if j["skill_count"] == 0])

    matched_ids = set()
    for job in jobs:
        matched_ids.update(flatten_skill_ids(job))

    print("\n" + "=" * 60)
    print("FINAL SUMMARY")
    print("=" * 60)
    print(f"Jobs processed:          {len(jobs)}")
    print(f"Jobs with >=1 skill:     {len(jobs) - zero_skill_count}")
    print(f"Jobs with zero skills:   {zero_skill_count}")
    print(f"Average skills/job:      {statistics.mean(counts):.2f}")
    print(f"Maximum skills/job:      {max(counts)}")
    print(f"Unique skills matched:   {len(matched_ids)}")
    print(f"Skills never matched:    {len(never_matched)}")
    print(f"Jobs with duplicate IDs: {len(jobs_with_duplicates)} (should be 0)")


def main():
    master_skills = load_master_skills()
    jobs = load_jobs_with_skills()

    zero_skill_jobs, high_skill_jobs = check_overall_stats(jobs)
    check_stats_by_domain(jobs)
    never_matched = check_skill_coverage(jobs, master_skills)
    check_category_balance(jobs)
    jobs_with_duplicates = check_for_duplicate_matches(jobs)
    test_synonym_deduplication(master_skills)
    print_final_summary(jobs, never_matched, jobs_with_duplicates)


if __name__ == "__main__":
    main()