"""
Evaluation service for PrepAble.

Responsible for building the Gemini prompt for a single interview answer,
calling Gemini exactly once, and safely parsing/validating the JSON response
into the shape defined in SPEC.md section 5.
"""

import json
from pathlib import Path
from typing import Any, Dict

from services.gemini_client import call_gemini, strip_fences

PROMPT_PATH = Path(__file__).resolve().parent.parent / "prompts" / "evaluation_prompt.txt"


def _load_prompt_template() -> str:
    return PROMPT_PATH.read_text(encoding="utf-8")


def _build_prompt(question_text: str, answer_text: str) -> str:
    template = _load_prompt_template()
    return template.replace("{question_text}", question_text).replace(
        "{answer_text}", answer_text
    )


def _validate_shape(data: Dict[str, Any]) -> bool:
    """Validate that the parsed JSON matches the required response shape."""
    try:
        scores = data["scores"]
        for key in ("relevance", "clarity", "professionalism", "overall"):
            if not isinstance(scores[key], (int, float)):
                return False

        star_check = data["star_check"]
        for key in ("situation", "task", "action", "result"):
            if not isinstance(star_check[key], bool):
                return False

        feedback = data["feedback"]
        if not isinstance(feedback["strengths"], list):
            return False
        if not isinstance(feedback["improvements"], list):
            return False
        if not isinstance(feedback["sample_improved_answer"], str):
            return False

        recruiter_perspective = data["recruiter_perspective"]
        if not isinstance(recruiter_perspective["strength"], str):
            return False
        if not isinstance(recruiter_perspective["concern"], str):
            return False

        return True
    except (KeyError, TypeError):
        return False


def _parse_response(raw_text: str) -> Dict[str, Any]:
    cleaned = strip_fences(raw_text)
    data = json.loads(cleaned)
    if not _validate_shape(data):
        raise ValueError("Gemini response did not match the required schema")
    return data


def evaluate_answer(question_text: str, answer_text: str) -> Dict[str, Any]:
    """
    Evaluate a single interview answer using exactly ONE Gemini call.

    Builds the evaluation prompt, calls Gemini once, parses the JSON response
    (stripping markdown fences if present), and validates the response shape.
    Raises a clear error on any failure (network, malformed JSON, or a
    response that doesn't match the required schema) — the caller is
    responsible for turning that into a clean HTTP error.

    Returns a dict matching:
        {
          "scores": {...},
          "star_check": {...},
          "feedback": {...},
          "recruiter_perspective": {...}
        }
    """
    prompt = _build_prompt(question_text, answer_text)

    try:
        raw_text = call_gemini(prompt)
        return _parse_response(raw_text)
    except Exception as exc:  # noqa: BLE001 - normalize any failure into a clear error
        raise RuntimeError(f"Failed to get a valid evaluation from Gemini: {exc}") from exc
