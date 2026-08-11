"""
extract_skills.py

Reads cleaned_jobs.json + master_skills.csv, and produces jobs_with_skills.json
where each job is enriched with the skills found in its description, grouped
by category (technical / domain / soft).

Uses spaCy's PhraseMatcher (token-based, not regex) for matching, so:
- multi-word skills ("Machine Learning") match as whole phrases
- short acronyms ("AI", "ML") never accidentally match inside unrelated words
- case-insensitive matching is safe (handled via nlp.vocab, not raw substrings)
- overlapping matches (e.g. "Machine Learning" containing "Learning") are
  resolved via spaCy's filter_spans, which keeps the longest match and
  discards shorter ones contained inside it

Usage:
    pip install spacy
    python extract_skills.py

Reads:
    cleaned_jobs.json
    master_skills.csv
Writes:
    jobs_with_skills.json
"""

import json
import csv
import spacy
from spacy.matcher import PhraseMatcher
from spacy.util import filter_spans
import os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
CLEANED_JOBS_FILE = os.path.join(SCRIPT_DIR, "..", "data_pipeline", "cleaned_jobs.json")
MASTER_SKILLS_FILE = os.path.join(SCRIPT_DIR, "master_skills.csv")
OUTPUT_FILE = os.path.join(SCRIPT_DIR, "jobs_with_skills.json")


VALID_CATEGORIES = {"Technical", "Domain", "Soft Skill"}
CATEGORY_KEY_MAP = {
    "Technical": "technical",
    "Domain": "domain",
    "Soft Skill": "soft",
}


# ---------------------------------------------------------------------------
# Step 1: Load
# ---------------------------------------------------------------------------

def load_master_skills(path=MASTER_SKILLS_FILE):
    """Read master_skills.csv into a list of dicts."""
    skills = []
    with open(path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            skills.append({
                "id": row["id"].strip(),
                "skill": row["skill"].strip(),
                "category": row["category"].strip(),
                "source": row["source"].strip(),
                "enabled": row["enabled"].strip().upper(),
                "synonyms": [
                    s.strip() for s in row.get("synonyms", "").split(";")
                    if s.strip()
                ],
                "skill_type": row["skill_type"].strip() if "skill_type" in row else "",
            })
    return skills


# ---------------------------------------------------------------------------
# Step 2: Validate (fail early instead of silently producing wrong results)
# ---------------------------------------------------------------------------

def validate_master_skills(skills):
    """Check master_skills.csv for problems that would corrupt extraction
    results. Raises ValueError with a clear message and stops the program
    if anything is wrong."""
    errors = []
    VALID_TYPES = {"Language", "Framework", "Tool", "Knowledge Area", "Soft Skill", "Broad Domain"}
    BROAD_DOMAINS_WHITELIST = {"Artificial Intelligence", "Data Science", "Graphic Design", "Digital Marketing", "Marketing Strategy", "Teaching"}
    CONCRETE_PROTECTED_SKILLS = {"Python", "SQL", "React", "Docker", "Figma", "TensorFlow"}

    seen_ids = {}
    seen_names = {}
    synonym_owner = {}  # lowercase synonym/name -> canonical skill name

    for row in skills:
        skill_id = row["id"]
        name = row["skill"]
        category = row["category"]
        enabled = row["enabled"]
        skill_type = row["skill_type"]

        if not name:
            errors.append(f"Empty skill name for ID '{skill_id}'")

        if category not in VALID_CATEGORIES:
            errors.append(
                f"Invalid category '{category}' for skill '{name}' "
                f"(must be one of {sorted(VALID_CATEGORIES)})"
            )

        if enabled not in {"TRUE", "FALSE"}:
            errors.append(
                f"Invalid Enabled value '{enabled}' for skill '{name}' "
                f"(must be TRUE or FALSE)"
            )

        # 1. Type Checks
        if skill_type not in VALID_TYPES:
            errors.append(
                f"Invalid skill_type '{skill_type}' for skill '{name}' "
                f"(must be one of {sorted(VALID_TYPES)})"
            )

        # 2. Category/Type Lock
        if category == "Soft Skill" and skill_type != "Soft Skill":
            errors.append(
                f"Category is 'Soft Skill' but skill_type is '{skill_type}' for skill '{name}'"
            )
        if skill_type == "Soft Skill" and category != "Soft Skill":
            errors.append(
                f"Skill type is 'Soft Skill' but category is '{category}' for skill '{name}'"
            )

        # 3. Whitelist Check
        if skill_type == "Broad Domain" and name not in BROAD_DOMAINS_WHITELIST:
            errors.append(
                f"Skill '{name}' is labeled as 'Broad Domain' but is not in the whitelist: {sorted(BROAD_DOMAINS_WHITELIST)}"
            )

        # 4. Concrete Protections
        if name in CONCRETE_PROTECTED_SKILLS and skill_type in {"Broad Domain", "Soft Skill"}:
            errors.append(
                f"Concrete skill '{name}' cannot be labeled as a '{skill_type}'"
            )

        if skill_id in seen_ids:
            errors.append(
                f"Duplicate ID '{skill_id}' used by both "
                f"'{seen_ids[skill_id]}' and '{name}'"
            )
        else:
            seen_ids[skill_id] = name

        name_key = name.lower()
        if name_key in seen_names:
            errors.append(
                f"Duplicate skill name '{name}' (also appears as "
                f"'{seen_names[name_key]}')"
            )
        else:
            seen_names[name_key] = name

        # Check the canonical name and every synonym for cross-skill collisions
        all_terms = [name] + row["synonyms"]
        for term in all_terms:
            term_key = term.lower()
            if term_key in synonym_owner and synonym_owner[term_key] != name:
                errors.append(
                    f'Duplicate synonym "{term}"\n'
                    f"  Used by: {synonym_owner[term_key]}\n"
                    f"  Used by: {name}"
                )
            else:
                synonym_owner[term_key] = name

    if errors:
        error_message = "master_skills.csv validation FAILED:\n\n" + "\n\n".join(
            f"ERROR: {e}" for e in errors
        )
        raise ValueError(error_message)

    print(f"master_skills.csv validated successfully ({len(skills)} skills, no errors).")


# ---------------------------------------------------------------------------
# Step 3: Build the PhraseMatcher
# ---------------------------------------------------------------------------

def build_phrase_matcher(nlp, skills):
    """Build a spaCy PhraseMatcher with one pattern per canonical skill name
    AND one pattern per synonym, all pointing back to the same skill ID.
    Only enabled skills are included."""
    matcher = PhraseMatcher(nlp.vocab, attr="LOWER")  # case-insensitive matching
    skill_lookup = {}  # skill_id -> full skill metadata, used after matching

    for row in skills:
        if row["enabled"] != "TRUE":
            continue  # disabled skills (e.g. Hadoop) are fully ignored

        skill_id = row["id"]
        skill_lookup[skill_id] = row

        all_terms = [row["skill"]] + row["synonyms"]
        patterns = [nlp.make_doc(term) for term in all_terms]
        matcher.add(skill_id, patterns)

    return matcher, skill_lookup


# ---------------------------------------------------------------------------
# Step 4: Extraction logic for one job description
# ---------------------------------------------------------------------------

def extract_skills_from_text(nlp, matcher, skill_lookup, text):
    """Run the matcher on one piece of text, resolve overlapping matches
    (longest phrase wins), and return a deduplicated list of found skills
    with the exact text that triggered each match."""
    if not text:
        return []

    doc = nlp(text)
    matches = matcher(doc)

    # Build spans so we can use filter_spans to resolve overlaps
    # (e.g. "Machine Learning" should win over the shorter "Learning")
    spans = []
    for match_id, start, end in matches:
        span = doc[start:end]
        span._.skill_id = nlp.vocab.strings[match_id]
        spans.append(span)

    filtered_spans = filter_spans(spans)  # keeps longest, drops contained overlaps

    found_skills = {}  # skill_id -> matched_by text (first occurrence kept)
    for span in filtered_spans:
        skill_id = span._.skill_id
        if skill_id not in found_skills:
            found_skills[skill_id] = span.text

    results = []
    for skill_id, matched_by in found_skills.items():
        skill_meta = skill_lookup[skill_id]
        results.append({
            "id": skill_id,
            "name": skill_meta["skill"],
            "category": skill_meta["category"],
            "matched_by": matched_by,
        })

    return results


# ---------------------------------------------------------------------------
# Step 5: Process all jobs
# ---------------------------------------------------------------------------

def group_skills_by_category(skill_list):
    """Convert a flat list of matched skills into the frozen output shape:
    {"technical": [...], "domain": [...], "soft": [...]}"""
    grouped = {"technical": [], "domain": [], "soft": []}
    for skill in skill_list:
        key = CATEGORY_KEY_MAP[skill["category"]]
        grouped[key].append(skill)
    return grouped


def process_all_jobs(jobs, nlp, matcher, skill_lookup):
    """Loop through every job, extract skills, and build the enriched
    output. Also tracks a simple success/failure log."""
    enriched_jobs = []
    success_count = 0
    skipped_count = 0
    skip_reasons = []

    for job in jobs:
        description = job.get("description", "")
        title = job.get("title", "")
        search_text = f"{title}. {description}"

        if not description:
            skipped_count += 1
            skip_reasons.append(f"{job.get('title', 'Unknown title')} - missing description")
            # still include the job, just with empty skills, rather than dropping it
            skill_list = []
        else:
            skill_list = extract_skills_from_text(nlp, matcher, skill_lookup, search_text)
            success_count += 1

        grouped_skills = group_skills_by_category(skill_list)

        # Copy the complete job record first, then only modify what
        # actually changes here (skills, skill_count). This prevents
        # accidentally dropping fields - this exact bug has happened
        # three times before (career_domain/adzuna_category, then
        # salary_min/salary_max/posted_date, then search_keyword) because
        # the old code manually rebuilt a new dict field-by-field and
        # simply forgot to list newly-added fields each time. A shallow
        # copy cannot forget a field, so this closes that entire bug class
        # rather than patching it a fourth time later.
        output_job = job.copy()
        output_job["description"] = description  # overwrite with cleaned/searched version
        output_job["skills"] = grouped_skills
        output_job["skill_count"] = len(skill_list)
        enriched_jobs.append(output_job)

    log_summary = {
        "total_jobs": len(jobs),
        "successfully_processed": success_count,
        "skipped": skipped_count,
        "skip_reasons": skip_reasons,
    }

    return enriched_jobs, log_summary


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    # Load and validate the skill reference data first - fail early if broken
    skills = load_master_skills()
    validate_master_skills(skills)

    # Blank English model - we only need tokenization for PhraseMatcher,
    # not a full pretrained pipeline (faster, and no extra download needed)
    nlp = spacy.blank("en")

    from spacy.tokens import Span
    if not Span.has_extension("skill_id"):
        Span.set_extension("skill_id", default=None)

    matcher, skill_lookup = build_phrase_matcher(nlp, skills)
    print(f"PhraseMatcher built with {len(skill_lookup)} enabled skills "
          f"(patterns include canonical names + synonyms).")

    with open(CLEANED_JOBS_FILE, "r", encoding="utf-8") as f:
        jobs = json.load(f)
    print(f"Loaded {len(jobs)} jobs from {CLEANED_JOBS_FILE}.")

    enriched_jobs, log_summary = process_all_jobs(jobs, nlp, matcher, skill_lookup)

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(enriched_jobs, f, indent=2, ensure_ascii=False)

    # Simple console log summary
    print("\n--- Extraction Summary ---")
    print(f"{log_summary['total_jobs']} Jobs")
    print(f"{log_summary['successfully_processed']} Success")
    print(f"{log_summary['skipped']} Skipped")
    if log_summary["skip_reasons"]:
        print("Skip reasons:")
        for reason in log_summary["skip_reasons"][:10]:  # show first 10 max
            print(f"  - {reason}")
    print(f"\nSaved enriched data to {OUTPUT_FILE}")


if __name__ == "__main__":
    main()