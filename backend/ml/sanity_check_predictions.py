"""
sanity_check_predictions.py

QUALITATIVE SANITY CHECK - NOT A MODEL EVALUATION.

This script runs the trained role classifier against a handful of
hand-constructed, realistic resume skill lists (NOT derived from any real
job posting, to avoid reintroducing the leakage issue we diagnosed in
role_classifier.py).

Purpose:
  - Validate the END-TO-END flow (skills in -> role prediction out) works
    the way a real user would actually use it
  - Catch obviously wrong behavior before deployment (e.g. a clearly
    ML-heavy skillset getting classified as Data Analyst)
  - Build qualitative confidence that the model behaves sensibly

This is explicitly NOT:
  - A statistical evaluation
  - Evidence of model accuracy
  - Something to cite as "the model scored X% on these examples"

5 examples is not a sample size that supports any accuracy claim. This is
a smoke test, the same way you'd manually click through a UI before
shipping it - useful, but not a substitute for the real test-set metrics
already reported by role_classifier.py.

Usage:
    python sanity_check_predictions.py
"""

import os
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(SCRIPT_DIR)
from role_classifier import predict_role

# Hand-constructed skill lists, based on domain knowledge of what each
# role's resume would realistically look like - NOT copied from any real
# job posting in the dataset.
TEST_CASES = [
    {
        "label": "Clear-cut ML Engineer profile",
        "skills": ["Python", "TensorFlow", "PyTorch", "Deep Learning", "Docker", "Git"],
        "expected": "ML Engineer",
    },
    {
        "label": "Clear-cut Data Analyst profile",
        "skills": ["SQL", "Power BI", "Excel", "Data Analysis", "Business Intelligence"],
        "expected": "Data Analyst",
    },
    {
        "label": "Clear-cut AI Engineer profile",
        "skills": ["Python", "Large Language Models", "Retrieval Augmented Generation",
                    "API", "Cloud Computing", "Generative AI"],
        "expected": "AI Engineer",
    },
    {
        "label": "Clear-cut Data Scientist profile",
        "skills": ["Python", "Statistics", "Data Science", "Communication",
                    "Business Analysis", "SQL"],
        "expected": "Data Scientist",
    },
    {
        "label": "Deliberately AMBIGUOUS - Data Scientist / ML Engineer overlap",
        "skills": ["Python", "Machine Learning", "Deep Learning", "Statistics", "SQL"],
        "expected": None,  # no single "correct" answer expected - this tests how
                            # the model handles genuine overlap, not a right/wrong case
    },
    {
        # Follow-up diagnostic: identical to "Clear-cut ML Engineer profile"
        # above (which predicted Data Scientist, unexpectedly), but with
        # the literal term "Machine Learning" added. If this now predicts
        # ML Engineer confidently, it confirms the model IS internally
        # consistent - it just weights "Machine Learning" as its strongest
        # signal for that class, more than tool names like TensorFlow/
        # PyTorch. That would mean the first result wasn't a flaw, just a
        # visible look at which feature the model leans on most.
        "label": "Resume B - same as ML Engineer profile above, PLUS 'Machine Learning'",
        "skills": ["Python", "Machine Learning", "TensorFlow", "PyTorch",
                    "Deep Learning", "Docker", "Git"],
        "expected": "ML Engineer",
    },
]


def run_sanity_check():
    print("=" * 60)
    print("QUALITATIVE SANITY CHECK (not a model evaluation)")
    print("=" * 60)

    for case in TEST_CASES:
        result = predict_role(case["skills"])

        print(f"\n{case['label']}")
        print(f"  Input skills: {case['skills']}")
        print(f"  Predicted: {result['predicted_role']} "
              f"(confidence={result['confidence']})")
        print(f"  Full probability breakdown: {result['all_probabilities']}")

        if case["expected"]:
            match = "as expected" if result["predicted_role"] == case["expected"] else \
                    f"DIFFERENT from expected ({case['expected']}) - worth a look, not a failure"
            print(f"  -> {match}")
        else:
            print(f"  -> Ambiguous case, no single correct answer - "
                  f"just observe how confidence is distributed across roles")

    print("\n" + "=" * 60)
    print("Reminder: this checked 5 hand-written examples for sanity, "
          "not statistical accuracy. See role_classifier.py's test-set "
          "metrics for actual evaluation numbers.")
    print("=" * 60)


if __name__ == "__main__":
    run_sanity_check()