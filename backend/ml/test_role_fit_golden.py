"""
test_role_fit_golden.py

Golden/regression tests for the role-fit classifier. These lock in
ACTUAL VERIFIED behavior from real runs (confirmed via
sanity_check_predictions.py and the live FastAPI endpoint) - not
aspirational "what we wish it predicted" values.

If any of these ever fail after a retrain or code change, it means the
model's behavior has changed - investigate before assuming it's fine.

Includes one deliberately counterintuitive case (see test 4) that is
EXPECTED to predict "wrong" - this is documented, understood model
behavior (see documentation-checklist.md, section 6), not a bug.

Usage:
    pip install pytest
    pytest test_role_fit_golden.py -v
"""

import os
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(SCRIPT_DIR)
from role_classifier import predict_role


def test_data_analyst_profile():
    """Clear-cut Data Analyst skill set - verified 99.3% confidence."""
    result = predict_role(["SQL", "Power BI", "Excel", "Data Analysis", "Business Intelligence"])
    assert result["predicted_role"] == "Data Analyst"
    assert result["confidence"] > 0.90


def test_ai_engineer_profile():
    """Clear-cut AI Engineer skill set - verified 98.0% confidence."""
    result = predict_role(["Python", "Large Language Models", "Retrieval Augmented Generation",
                             "API", "Cloud Computing", "Generative AI"])
    assert result["predicted_role"] == "AI Engineer"
    assert result["confidence"] > 0.90


def test_data_scientist_profile():
    """Clear-cut Data Scientist skill set - verified 99.8% confidence."""
    result = predict_role(["Python", "Statistics", "Data Science", "Communication",
                             "Business Analysis", "SQL"])
    assert result["predicted_role"] == "Data Scientist"
    assert result["confidence"] > 0.90


def test_ml_engineer_tools_only_KNOWN_LIMITATION():
    """
    DELIBERATELY testing a known, documented model limitation.

    This skill set (TensorFlow, PyTorch, Deep Learning, Docker, Git - real
    ML engineering tools) predicts DATA SCIENTIST, not ML Engineer, because
    the model weights the literal term "Machine Learning" far more heavily
    than any specific tool (coefficient weight 4.0, the strongest single
    signal in the entire model - see documentation-checklist.md section 6).

    This test is intentionally asserting the "wrong" answer, because it IS
    the model's real, verified, understood behavior. If this test ever
    starts failing (i.e. the model starts correctly predicting ML Engineer
    here), that means the model's behavior changed - which could be an
    IMPROVEMENT, but must be investigated and this test updated
    deliberately, not silently.
    """
    result = predict_role(["Python", "TensorFlow", "PyTorch", "Deep Learning", "Docker", "Git"])
    assert result["predicted_role"] == "Data Scientist"
    assert 0.70 < result["confidence"] < 0.85


def test_ml_engineer_with_explicit_term():
    """
    Same skills as the test above, PLUS the literal term "Machine
    Learning" added. This confirms the model is internally consistent:
    adding the one term it weights most heavily correctly flips the
    prediction to ML Engineer with high confidence.
    """
    result = predict_role(["Python", "Machine Learning", "TensorFlow", "PyTorch",
                             "Deep Learning", "Docker", "Git"])
    assert result["predicted_role"] == "ML Engineer"
    assert result["confidence"] > 0.90


def test_all_probabilities_sum_to_one():
    """Sanity check on the output shape itself - probabilities across all
    4 classes should always sum to ~1.0, regardless of input."""
    result = predict_role(["Python", "SQL"])
    total = sum(result["all_probabilities"].values())
    assert abs(total - 1.0) < 0.01


if __name__ == "__main__":
    # Allow running directly without pytest, for a quick manual check
    tests = [
        test_data_analyst_profile,
        test_ai_engineer_profile,
        test_data_scientist_profile,
        test_ml_engineer_tools_only_KNOWN_LIMITATION,
        test_ml_engineer_with_explicit_term,
        test_all_probabilities_sum_to_one,
    ]
    passed = 0
    for test in tests:
        try:
            test()
            print(f"PASS: {test.__name__}")
            passed += 1
        except AssertionError as e:
            print(f"FAIL: {test.__name__} - {e}")
    print(f"\n{passed}/{len(tests)} golden tests passed.")