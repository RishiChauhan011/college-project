# Today's Work Summary: AI Career Dashboard Backend Enhancements
**Date: July 14, 2026**

This document serves as a full summary of the discussions, architectural decisions, code changes, and verification tests completed today to improve the backend parsing, analytics, and recommendation pipeline.

---

## 1. Bug Fix: Script-Relative Path Resolution
### The Problem
When running modules (e.g. `python recommendation.py`) from subdirectories like `backend/recommendation/` rather than the workspace root or the script's own folder, Python raised `FileNotFoundError: 'master_skills.csv'`. This happened because paths were resolved relative to the terminal's current working directory (CWD).

### The Solution
We converted all relative file paths to absolute paths resolved relative to the directory containing each script using Python's `__file__` property. 
* Applied to:
  - `backend/ml/extract_skills.py` (for raw jobs json, master skills csv, and output json)
  - `backend/ml/check_extraction_quality.py` (for jobs with skills json)
  - `backend/analytics/analytics.py` (for input jobs and output analytics json)

---

## 2. Core Architecture: Separating Extraction from Recommendations
### The Problem (Buzzword Inflation in Recommendations)
During gap analysis for the target domain "AI & Data Science", the engine recommended "Artificial Intelligence" and "Data Science" as the top two missing skills. This was:
1. **Circular**: Telling someone targeting "AI & Data Science" to "learn Data Science" is not useful.
2. **Non-Actionable**: "Learn AI" is too abstract compared to concrete tools/frameworks like "Learn PyTorch" or "Learn TensorFlow".

However, we could not simply delete "AI" or "Data Science" from `master_skills.csv` because we still needed to extract them for **Raw Market Intelligence** (i.e. if a job mentions "AI", overall analytics should honestly report it).

### Our Discussion & Decisions
We agreed on a clean, scalable, metadata-driven architecture:
* **Extraction & Analytics** will continue to use every enabled skill, preserving honest market statistics.
* **Recommendations** will filter out broad, non-actionable domains using metadata.
* **No hardcoded exclusions in Python logic**: Instead of hardcoding `if skill == "Artificial Intelligence"`, the code determines actionability using metadata.
* **Intrinsic Classification (`skill_type`)**: We added a `skill_type` column to `master_skills.csv`.
* **Actionable Knowledge Areas**: Specializations like `Backend Development`, `Programming`, and `Business Analysis` are classified as `Knowledge Area` so they remain recommendable, since "I am studying Backend Development" is a meaningful, concrete milestone.
* **Broad Domains**: Only the 6 high-level career fields are classified as `Broad Domain` (excluded from recommendations).

---

## 3. Implementation Details

### A. Data Layer (`master_skills.csv`)
Added the `skill_type` column and classified all 115 skills:
* `Language` (e.g., Python, SQL, C++)
* `Framework` (e.g., TensorFlow, React, Next.js)
* `Tool` (e.g., Docker, Git, Figma)
* `Knowledge Area` (e.g., Machine Learning, Backend Development, Web Development, Programming, Business Analysis)
* `Soft Skill` (e.g., Communication, Leadership)
* `Broad Domain` (Exactly 6: `Artificial Intelligence`, `Data Science`, `Graphic Design`, `Digital Marketing`, `Marketing Strategy`, `Teaching`)

### B. Validation Layer (`extract_skills.py`)
Added strict validation rules in `validate_master_skills()` to ensure data integrity and prevent pipeline errors:
1. **Type Checks**: Checks that `skill_type` is one of our 6 valid types.
2. **Category/Type Lock**: Asserts that `category == "Soft Skill"` if and only if `skill_type == "Soft Skill"`.
3. **Whitelist Check**: Asserts that only our designated 6 career field representations are labeled as `Broad Domain`.
4. **Concrete Protections**: Asserts that concrete skills (like `Python`, `SQL`, `React`, `Docker`, `Figma`, `TensorFlow`) can never be labeled as a `Broad Domain` or `Soft Skill`.
5. **Uniqueness**: Asserts that canonical names are unique (preventing duplicate entries).

### C. Recommendation Engine (`recommendation.py`)
Modified `compute_missing_skills()` to check the skill metadata:
```python
# Exclude broad, domain-level concepts from learning recommendations
if skill_row.get("skill_type") == "Broad Domain":
    continue
```

---

## 4. Verification Results
We verified the pipeline end-to-end to ensure correctness:

1. **Validation Checks**: 
   - Confirmed that entering a typo (e.g., `Lang`) halts the pipeline with an error.
   - Confirmed that matching category/type conflicts (e.g., marking `Communication` as `Tool`) halts the pipeline.
2. **Analytics Count (Raw Market Intelligence)**:
   - Verified that "Artificial Intelligence" and "Teaching" are still tracked in analytics:
     ```text
     Top 5 skills overall:
       Artificial Intelligence: 487
       Teaching: 347
       ...
     ```
3. **Output Recommendations**:
   - Verified that a resume check for "AI & Data Science" now recommends concrete targets instead of vague domains:
     ```text
     Top missing skills (ranked by ROI = demand / learning time):
       Data Analysis                  demand=177   weeks=4   roi=44.25
       Machine Learning               demand=252   weeks=8   roi=31.5
       Cloud Computing                demand=50    weeks=3   roi=16.67
       Generative AI                  demand=63    weeks=4   roi=15.75
       Large Language Models          demand=55    weeks=4   roi=13.75
       Automation                     demand=41    weeks=3   roi=13.67
       Programming                    demand=31    weeks=3   roi=10.33
       Software Engineering           demand=29    weeks=3   roi=9.67
     
     Recommended learning priority (top 3): ['Data Analysis', 'Machine Learning', 'Cloud Computing']

     ```
   - Broad domains were successfully filtered out, and the recommended roadmap now features concrete, actionable goals (`Data Analysis`, `Machine Learning`, `Cloud Computing`).

---

## Today's Work Summary: FastAPI Backend Implementation (Phase 1)
**Date: July 16, 2026**

Today, we successfully designed, implemented, and verified the FastAPI backend (Phase 1) using a clean, layered architecture. All requirements were exposed as clean API endpoints under the `/api/v1` prefix.

---

### 1. Data Origin (ETL Pipeline Flow)
The backend acts as the serving layer for the structured data generated by our pre-existing ETL and ML extraction pipeline:
```text
Adzuna API (Jobs data)
       ↓
raw_jobs.json (Raw payloads)
       ↓
clean_data.py (Normalization & cleaning)
       ↓
extract_skills.py (spaCy PhraseMatcher skill mapping)
       ↓
jobs_with_skills.json (Reference database)
       ↓
analytics.py (Precomputed statistics compile)
       ↓
analytics.json (Derived stats database)
       ↓
FastAPI Serving Layer (Exposing to Frontend)
```

---

### 2. Core Design Philosophies & Decisions

* **Analytics vs. Recommendations**:
  Analytics always reports raw market data (preserving honest statistics like broad domain mentions). In contrast, recommendations apply metadata-driven business rules (filtering out non-actionable broad domains using the `Broad Domain` flag from `master_skills.csv`) to generate actionable, concrete roadmaps.
* **Dynamic Cross-Domain Discovery**:
  Cross-domain skill popularity (which domains a skill appears in and how strongly) is derived dynamically from real job postings during analytics compile time, rather than manually maintained in a static mapping file.
* **FastAPI Lifespan Cache**:
  Data files (`analytics.json`, `jobs_with_skills.json`, `master_skills.csv`) are loaded once during application startup via the modern FastAPI `lifespan` hook. They remain read-only in memory until the server restarts, bypassing disk I/O and enabling sub-millisecond API response times.

---

### 3. Recommendation Engine Mechanics

Exposed through `POST /api/v1/recommendation`, the recommendation engine uses deterministic business data validations and calculations rather than black-box LLM estimations:
* **Weighted Matching**: The match score is weighted by actual market demand (how often a skill is mentioned in real postings), rather than a simple count of matching words.
* **ROI-Driven Gaps**: Missing skills are prioritized based on Return on Investment (ROI = frequency count in target domain ÷ typical learning time in weeks).
* **Roadmap Selection**: Recommends learning roadmaps targeting the top 3 highest ROI skills.
* **Factual Verification**: "Qualified companies" are determined dynamically by finding which real companies have job postings where all required skills are a subset of the user's current skills and recommended priority skills.

---

### 4. Key Architectural Implementations
- **Strict Clean Layering**: Routes only validate request shapes, call the appropriate service layer, and return schema-validated responses. No database queries or analytics calculations live in routes.
- **Portability & Path Resolution (`config.py`)**: Centralized file path resolution using `pathlib.Path` to resolve roots portably relative to the source tree. Works out-of-the-box on local laptops, Render, Linux, and Windows.
- **Performance Optimization (`utils/data_loader.py`)**: Added an in-memory cached data loader. Salary statistics for each domain are precalculated **once** at startup and cached in a hash map.
- **Structural Pydantic Schemas (`api/schemas/`)**: Built schemas for all models (`HealthResponse`, `AnalyticsSummaryResponse`, `DomainAnalyticsResponse`, `JobResponse`, `SkillResponse`, `RecommendationRequest`, `RecommendationResponse`). Implemented validator rules (e.g., duplicate resume skills and empty list validation).
- **Business Logic Services (`services/`)**: Implemented services (`analytics_service.py`, `job_service.py`, `skill_service.py`, `recommendation_service.py`) that perform case-insensitive normalization on target career domains and query cached memory structures.
- **Unified Exception Handling (`main.py`)**: Added a global catch-all middleware that logs full stack tracebacks securely in the backend server and maps exceptions to clean `HTTP 500` JSON errors without exposing tracebacks to consumers.
- **Proper Status Codes (404/422)**: Schema constraint violations return `HTTP 422 Unprocessable Entity`. Looking up an invalid or non-existent career domain correctly throws `HTTP 404 Not Found`.

---

### 5. Endpoints Exposed
| Endpoint | Method | Description |
|---|---|---|
| `/` | `GET` | Health Check endpoint returning server status. |
| `/api/v1/domains` | `GET` | List available career domains dynamically read from precomputed analytics. |
| `/api/v1/analytics` | `GET` | Fetch overall precomputed analytics summary. |
| `/api/v1/analytics/domain/{domain}` | `GET` | Fetch job count, average skills, top skills, top companies, and precalculated domain salary stats. |
| `/api/v1/skills` | `GET` | Fetch master skills list with optional filtering (`category`, `skill_type`, `enabled`). |
| `/api/v1/companies` | `GET` | Retrieve unique companies hiring in dashboard (optional filter: `domain`). |
| `/api/v1/jobs` | `GET` | List matching jobs (optional filters: `domain`, `company`, `skills`, `limit`, `offset`). |
| `/api/v1/recommendation` | `POST` | Wrapped recommend engine computing skill-gap analysis, priority learning, and qualified companies. |

---

### 6. Verification & Testing Completed
We validated the codebase from two fronts:
- **Service Unit Tests (`tests/test_services.py`)**: Added 13 isolated unit tests checking domain lookup, offset pagination, skill matching subset validation, duplicate detection, and case normalization. All **13 tests passed successfully** in `0.297s`.
- **API Integration Tests (`scratch/test_endpoints.py`)**: Added 15 integration checks validation. Checked all health checks, pagination, limit filters, valid/invalid domains (404 checks), and schema exceptions (422 checks). All **15 integration tests passed successfully**.
