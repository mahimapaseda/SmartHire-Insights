#!/usr/bin/env python
"""CLI: run extraction evaluation and print P/R/F1 metrics."""

import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from eval.metrics import run_extraction_eval  # noqa: E402


def _extract_from_text(text: str) -> dict:
    import app as cv_app

    education_section = cv_app.extract_section(
        text,
        [
            "Education",
            "Academic Qualifications",
            "Educational Qualifications",
        ],
    )
    experience_section = cv_app.extract_section(
        text,
        ["Experience", "Work Experience", "Professional Experience"],
    )
    return {
        "email": cv_app.extract_email(text),
        "skills": cv_app.extract_skills(text),
        "education": cv_app.extract_education(
            education_section if education_section.strip() else text
        ),
        "experience": cv_app.extract_experience(
            experience_section if experience_section.strip() else text
        ),
    }


if __name__ == "__main__":
    report = run_extraction_eval(_extract_from_text)
    print(json.dumps(report, indent=2))
