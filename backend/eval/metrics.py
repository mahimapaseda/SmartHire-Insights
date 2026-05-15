"""
Precision, recall, and F1 for CV field extraction against labeled fixtures.
"""

from __future__ import annotations

import json
import os
from typing import Any


def _prf1(tp: int, fp: int, fn: int) -> dict[str, float]:
    precision = tp / (tp + fp) if (tp + fp) else 0.0
    recall = tp / (tp + fn) if (tp + fn) else 0.0
    f1 = (
        2 * precision * recall / (precision + recall)
        if (precision + recall)
        else 0.0
    )
    return {
        "precision": round(precision, 4),
        "recall": round(recall, 4),
        "f1": round(f1, 4),
        "tp": tp,
        "fp": fp,
        "fn": fn,
    }


def set_metrics(predicted: set, expected: set) -> dict[str, Any]:
    tp = len(predicted & expected)
    fp = len(predicted - expected)
    fn = len(expected - predicted)
    return _prf1(tp, fp, fn)


def run_extraction_eval(extract_fn) -> dict[str, Any]:
    """
    extract_fn(text) -> dict with keys: email, skills (list), education (list), experience (list)
    """
    fixtures_path = os.path.join(os.path.dirname(__file__), "fixtures.json")
    with open(fixtures_path, encoding="utf-8") as f:
        fixtures = json.load(f)

    skill_tp = skill_fp = skill_fn = 0
    email_correct = 0
    exp_correct = 0
    edu_correct = 0
    per_sample = []

    for sample in fixtures:
        text = sample["text"]
        exp = sample["expected"]
        out = extract_fn(text)

        pred_skills = set(s.lower() for s in (out.get("skills") or []))
        exp_skills = set(s.lower() for s in exp.get("skills", []))
        sm = set_metrics(pred_skills, exp_skills)
        skill_tp += sm["tp"]
        skill_fp += sm["fp"]
        skill_fn += sm["fn"]

        pred_email = (out.get("email") or "").lower().strip()
        exp_email = exp.get("email", "").lower().strip()
        email_ok = pred_email == exp_email and pred_email != "not found"
        if email_ok:
            email_correct += 1

        has_exp = len(out.get("experience") or []) > 0
        exp_ok = has_exp == bool(exp.get("has_experience"))
        if exp_ok:
            exp_correct += 1

        has_edu = len(out.get("education") or []) > 0
        edu_ok = has_edu == bool(exp.get("has_education"))
        if edu_ok:
            edu_correct += 1

        per_sample.append(
            {
                "id": sample["id"],
                "skills": sm,
                "emailCorrect": email_ok,
                "experienceCorrect": exp_ok,
                "educationCorrect": edu_ok,
            }
        )

    n = len(fixtures) or 1
    return {
        "samples": n,
        "perSample": per_sample,
        "skills": _prf1(skill_tp, skill_fp, skill_fn),
        "email": {
            "accuracy": round(email_correct / n, 4),
            "correct": email_correct,
            "total": n,
        },
        "experience": {
            "accuracy": round(exp_correct / n, 4),
            "correct": exp_correct,
            "total": n,
        },
        "education": {
            "accuracy": round(edu_correct / n, 4),
            "correct": edu_correct,
            "total": n,
        },
        "macroF1": round(
            (
                _prf1(skill_tp, skill_fp, skill_fn)["f1"]
                + (email_correct / n)
                + (exp_correct / n)
                + (edu_correct / n)
            )
            / 4,
            4,
        ),
    }
