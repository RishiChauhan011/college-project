"""
clean_data.py

Takes raw_jobs.json (collected via fetch_jobs_api.py) and:
1. Splits location into city/state
2. Removes duplicate postings more thoroughly
3. Runs word-frequency analysis on job descriptions to surface
   candidate skills, which seeds your master skill list.

Usage:
    python clean_data.py
Output:
    cleaned_jobs.json          - cleaned, deduplicated job postings
    skill_candidates.csv       - word-frequency table for building your
                                  master skill list (open in Excel/Sheets)
"""

import json
import re
from collections import Counter

INPUT_FILE = "raw_jobs.json"
CLEANED_OUTPUT_FILE = "cleaned_jobs.json"
SKILL_CANDIDATES_FILE = "skill_candidates.csv"

# Common English stopwords + generic job-posting filler words that are NOT
# skills, so we can filter them out of the frequency count.
STOPWORDS = set("""
a an the and or of to in on for with is are be as at by this that will
your you we our their job role team work experience years strong good
excellent skills including etc such using across also into within
candidate candidates responsibilities requirements about company looking
role description apply must should ability knowledge understanding
""".split())


def split_location(location_str):
    """Split 'City, State' into separate city and state fields."""
    if not location_str or location_str == "Unknown":
        return "Unknown", "Unknown"

    parts = [p.strip() for p in location_str.split(",")]
    if len(parts) >= 2:
        return parts[0], parts[1]
    return parts[0], "Unknown"


def normalize_text_for_matching(text):
    """Lowercase and strip extra whitespace, used for dedup comparison only."""
    return re.sub(r"\s+", " ", text.lower()).strip()


def clean_description(text):
    """Clean up the actual description text stored in cleaned_jobs.json
    (not just for word-counting - this is the real text other steps like
    NER training will read later)."""
    if not text:
        return ""

    # Collapse repeated whitespace/newlines into single spaces
    text = re.sub(r"\s+", " ", text)

    # Remove leftover HTML entities that sometimes survive API extraction
    text = text.replace("&amp;", "&").replace("&nbsp;", " ")
    text = re.sub(r"&[a-zA-Z]+;", "", text)

    # Remove stray bullet characters that don't add meaning as plain text
    text = text.replace("•", "").replace("●", "")

    return text.strip()


# Tokens that would otherwise get mangled by the general word regex below
# (e.g. ".NET" would lose its leading dot and collapse into "net", which is
# ambiguous with the ordinary English word "net"). We protect them before
# tokenizing, then restore the proper spelling afterward.
PROTECTED_TERMS = {
    ".net": ".NET",
    "c++": "C++",
    "c#": "C#",
    "node.js": "Node.js",
}


def deduplicate_jobs(jobs):
    """Remove duplicates based on normalized title + company (ignores minor
    location formatting differences that might have slipped through)."""
    seen = set()
    unique_jobs = []

    for job in jobs:
        key = (
            normalize_text_for_matching(job["title"]),
            normalize_text_for_matching(job["company"]),
        )
        if key not in seen:
            seen.add(key)
            unique_jobs.append(job)

    return unique_jobs


def extract_candidate_words(text):
    """Extract lowercase words from text, filtering out stopwords and
    very short/very long tokens that are unlikely to be skill names.

    Protected terms (.NET, C++, C#, Node.js) are detected first via
    word-boundary matching so they survive as whole tokens instead of
    being mangled by the general regex below."""
    text_lower = text.lower()
    found_protected = []

    for pattern, proper_form in PROTECTED_TERMS.items():
        escaped = re.escape(pattern)
        matches = re.findall(escaped, text_lower)
        found_protected.extend([proper_form.lower()] * len(matches))
        # remove matched occurrences so they don't also get caught by the
        # general word regex below and counted twice / incorrectly
        text_lower = re.sub(escaped, " ", text_lower)

    general_words = re.findall(r"[a-zA-Z][a-zA-Z0-9+#]*", text_lower)
    words = found_protected + general_words

    return [
        w for w in words
        if w not in STOPWORDS and 2 <= len(w) <= 25
    ]


def build_skill_frequency(jobs):
    """Count word frequency across all job descriptions to surface
    candidate skills. This is a starting point, not a final skill list —
    you'll manually review the top results and keep the real skill names."""
    counter = Counter()

    for job in jobs:
        words = extract_candidate_words(job.get("description", ""))
        counter.update(words)

    return counter


def build_skill_frequency_by_domain(jobs):
    """Same as build_skill_frequency, but split PER career_domain.

    Important: a combined frequency count across all domains lets
    high-volume domains (e.g. AI & Data Science, Software Development)
    drown out genuinely important vocabulary from smaller/newer domains
    (e.g. "photoshop", "seo", "curriculum" could rank far below generic
    tech terms). Per-domain files make each domain's real candidate
    skills visible on their own, without competing against unrelated
    domains' word volume."""
    domain_counters = {}

    for job in jobs:
        domain = job.get("career_domain", "Unknown")
        if domain not in domain_counters:
            domain_counters[domain] = Counter()
        words = extract_candidate_words(job.get("description", ""))
        domain_counters[domain].update(words)

    return domain_counters


def main():
    with open(INPUT_FILE, "r", encoding="utf-8") as f:
        jobs = json.load(f)

    print(f"Loaded {len(jobs)} raw job postings.")

    # Step 1: further deduplication
    jobs = deduplicate_jobs(jobs)
    print(f"{len(jobs)} postings remain after deduplication.")

    # Step 2: split location into city/state, and clean description text
    for job in jobs:
        city, state = split_location(job.get("location", ""))
        job["city"] = city
        job["state"] = state
        job["description"] = clean_description(job.get("description", ""))

    # Step 3: save cleaned jobs
    with open(CLEANED_OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(jobs, f, indent=2, ensure_ascii=False)
    print(f"Cleaned data saved to {CLEANED_OUTPUT_FILE}")

    # Step 4: build skill candidate frequency list
    frequency = build_skill_frequency(jobs)
    top_candidates = frequency.most_common(300)  # top 300 most frequent words

    # Map lowercase protected terms back to their proper display casing
    display_map = {k.lower(): v for k, v in PROTECTED_TERMS.items()}

    with open(SKILL_CANDIDATES_FILE, "w", encoding="utf-8") as f:
        f.write("word,frequency\n")
        for word, count in top_candidates:
            display_word = display_map.get(word, word)
            f.write(f"{display_word},{count}\n")

    print(f"Top {len(top_candidates)} candidate words saved to {SKILL_CANDIDATES_FILE}")

    # Step 5: also build PER-DOMAIN candidate files, so new/smaller domains'
    # vocabulary isn't buried under high-volume domains like AI & Data Science
    domain_frequency = build_skill_frequency_by_domain(jobs)
    for domain, counter in domain_frequency.items():
        safe_domain_name = domain.replace(" & ", "_").replace(" ", "_")
        domain_file = f"skill_candidates_{safe_domain_name}.csv"
        top_domain_candidates = counter.most_common(150)

        with open(domain_file, "w", encoding="utf-8") as f:
            f.write("word,frequency\n")
            for word, count in top_domain_candidates:
                display_word = display_map.get(word, word)
                f.write(f"{display_word},{count}\n")

        print(f"  -> {domain}: top {len(top_domain_candidates)} words saved to {domain_file}")
    print("\nNext step: open this CSV and manually mark which words are real")
    print("skills (e.g., python, sql, tensorflow) vs noise (e.g., team, product).")
    print("The marked list becomes your master skill list for PhraseMatcher + NER training.")


if __name__ == "__main__":
    main()