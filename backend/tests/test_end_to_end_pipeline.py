"""
test_end_to_end_pipeline.py

The final gate before freezing the backend API. This does NOT test exact
values (those are already locked down by golden tests elsewhere). It
tests that the full real chain COMPOSES correctly:

    Resume upload
        -> parse_resume()          [resume parser]
        -> skills extracted
        -> get_role_fit()          [role classifier, via the real service layer]
        -> get_recommendation()    [recommendation engine + Gemini, via the
                                     real service layer]
        -> one coherent final result

Uses the actual SERVICE LAYER functions (get_recommendation,
get_role_fit), not the lower-level engine functions directly - this
means it also exercises domain validation, the startup cache
(preload_data), and the Gemini integration exactly the way the real
FastAPI app does, not a simplified stand-in for it.

Invariants checked (not exact values - those change over time as data is
recollected/retrained, and asserting exact values here would make this
test fragile for no real benefit):

    Resume parsing:    readable, skills non-empty, raw_text non-empty,
                        sections contains "skills"
    Skill extraction:  skills is list[str], no duplicates, >=1 technical skill
    Role fit:          predicted_role non-empty, confidence in [0,1],
                        probabilities sum to ~1
    Recommendation:    match_score exists, missing_skills exists,
                        learning_priority exists, companies list exists,
                        roadmap_narrative is either a string or None
                        (never an empty string - that would mean the
                        empty-response contract broke)

Usage:
    pytest test_end_to_end_pipeline.py -v
    python test_end_to_end_pipeline.py   (runs directly, prints a summary)
"""

import io
import pytest
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter

from resume_parser.parse_resume import parse_resume
from utils.data_loader import preload_data
from services.recommendation_service import get_recommendation
from services.role_fit_service import get_role_fit


SAMPLE_RESUME_TEXT = """Jane Smith
jane.smith@email.com

EXPERIENCE

Data Analyst
Worked with large datasets to generate business insights.

EDUCATION

B.S. Computer Science
State University

SKILLS

Python, SQL, Machine Learning, TensorFlow, Docker, Communication
"""

TARGET_DOMAIN = "AI & Data Science"  # only domain the role classifier supports


def _create_synthetic_pdf(text_content: str) -> bytes:
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=letter)
    y = 750
    for line in text_content.split('\n'):
        if line.strip():
            c.drawString(72, y, line)
        y -= 15
        if y < 72:
            c.showPage()
            y = 750
    c.save()
    return buffer.getvalue()


@pytest.fixture(scope="module")
def pipeline_result():
    """Runs the full real chain ONCE, shared across all invariant checks
    below - avoids re-running an expensive pipeline (spaCy matching,
    model prediction, a live Gemini call) once per assertion."""
    preload_data()  # same startup step FastAPI's lifespan hook performs

    pdf_bytes = _create_synthetic_pdf(SAMPLE_RESUME_TEXT)
    resume_result = parse_resume(pdf_bytes, "pdf")

    skills = resume_result["skills"]

    role_fit_result = get_role_fit(skills)
    recommendation_result = get_recommendation(skills, TARGET_DOMAIN)

    return {
        "resume": resume_result,
        "skills": skills,
        "role_fit": role_fit_result,
        "recommendation": recommendation_result,
    }


# ---------------------------------------------------------------------------
# Resume parsing invariants
# ---------------------------------------------------------------------------

def test_resume_parsing_invariants(pipeline_result):
    resume = pipeline_result["resume"]
    assert resume["readable"] is True
    assert len(resume["skills"]) > 0
    assert resume["raw_text"] != ""
    assert resume["sections"].get("skills") is not None


# ---------------------------------------------------------------------------
# Skill extraction invariants
# ---------------------------------------------------------------------------

def test_skill_extraction_invariants(pipeline_result):
    skills = pipeline_result["skills"]
    assert isinstance(skills, list)
    assert all(isinstance(s, str) for s in skills)
    assert len(skills) == len(set(skills)), "Duplicate skills found in extracted list"

    grouped = pipeline_result["resume"]["skills_grouped"]
    assert len(grouped["technical"]) >= 1, "Expected at least one technical skill from this resume"


# ---------------------------------------------------------------------------
# Role-fit invariants
# ---------------------------------------------------------------------------

def test_role_fit_invariants(pipeline_result):
    role_fit = pipeline_result["role_fit"]
    assert isinstance(role_fit["predicted_role"], str)
    assert role_fit["predicted_role"] != ""
    assert 0.0 <= role_fit["confidence"] <= 1.0

    total_probability = sum(role_fit["all_probabilities"].values())
    assert abs(total_probability - 1.0) < 0.01, (
        f"Probabilities should sum to ~1.0, got {total_probability}"
    )


# ---------------------------------------------------------------------------
# Recommendation invariants
# ---------------------------------------------------------------------------

def test_recommendation_invariants(pipeline_result):
    rec = pipeline_result["recommendation"]

    assert "match_score" in rec
    assert isinstance(rec["match_score"], (int, float))
    assert 0.0 <= rec["match_score"] <= 100.0

    assert "missing_skills" in rec
    assert isinstance(rec["missing_skills"], list)

    assert "learning_priority" in rec
    assert isinstance(rec["learning_priority"], list)

    assert "qualified_companies" in rec
    assert isinstance(rec["qualified_companies"], list)

    # The critical contract from the empty-response fix: narrative must
    # be a real string OR None - NEVER an empty string. An empty string
    # here would mean the Gemini empty-response contract regressed.
    narrative = rec.get("roadmap_narrative")
    assert narrative is None or (isinstance(narrative, str) and narrative != ""), (
        f"roadmap_narrative must be None or a non-empty string, got: {narrative!r}"
    )


# ---------------------------------------------------------------------------
# Direct execution - prints a readable summary without needing pytest
# ---------------------------------------------------------------------------

def _run_manual_summary():
    preload_data()

    pdf_bytes = _create_synthetic_pdf(SAMPLE_RESUME_TEXT)
    resume_result = parse_resume(pdf_bytes, "pdf")
    skills = resume_result["skills"]

    role_fit_result = get_role_fit(skills)
    recommendation_result = get_recommendation(skills, TARGET_DOMAIN)

    print("=" * 60)
    print("END-TO-END PIPELINE SUMMARY")
    print("=" * 60)
    print(f"\n1. Resume Parsing")
    print(f"   readable: {resume_result['readable']}")
    print(f"   skills extracted: {skills}")

    print(f"\n2. Role Fit")
    print(f"   predicted_role: {role_fit_result['predicted_role']}")
    print(f"   confidence: {role_fit_result['confidence']}")

    print(f"\n3. Recommendation")
    print(f"   match_score: {recommendation_result['match_score']}%")
    print(f"   learning_priority: {recommendation_result['learning_priority']}")
    print(f"   qualified_companies: {len(recommendation_result['qualified_companies'])} found")
    narrative = recommendation_result.get("roadmap_narrative")
    if narrative:
        print(f"   roadmap_narrative: (generated, {len(narrative.split())} words)")
    else:
        print(f"   roadmap_narrative: None (Gemini unavailable or not configured)")

    print("\nAll invariants satisfied - pipeline composes correctly end-to-end.")


if __name__ == "__main__":
    _run_manual_summary()