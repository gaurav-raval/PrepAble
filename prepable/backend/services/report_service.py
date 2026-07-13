"""
Report service for PrepAble.

Responsible for building the Gemini prompt for a full interview session
(a list of /evaluate-answer results), calling Gemini exactly once, and
safely parsing/validating the aggregated session report response.
"""

import json
import os
import re
from pathlib import Path
from typing import Any, Dict, List

from google import genai

PROMPT_PATH = Path(__file__).resolve().parent.parent / "prompts" / "report_prompt.txt"

_GEMINI_MODEL = "gemini-2.0-flash"
_client: genai.Client | None = None


def _get_client() -> genai.Client:
    """Create the Gemini client lazily, once, using GEMINI_API_KEY."""
    global _client
    if _client is None:
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            raise RuntimeError("GEMINI_API_KEY environment variable is not set")
        _client = genai.Client(api_key=api_key)
    return _client


def _load_prompt_template() -> str:
    return PROMPT_PATH.read_text(encoding="utf-8")


def _build_prompt(evaluations: List[Dict[str, Any]]) -> str:
    template = _load_prompt_template()
    evaluations_json = json.dumps(evaluations, indent=2)
    return template.replace("{evaluations_json}", evaluations_json)


def _strip_markdown_fences(text: str) -> str:
    """Strip ```json ... ``` or ``` ... ``` fences if Gemini wraps its output."""
    stripped = text.strip()
    fence_match = re.match(r"^```(?:json)?\s*(.*?)\s*```$", stripped, re.DOTALL)
    if fence_match:
        return fence_match.group(1).strip()
    return stripped


def _validate_shape(data: Dict[str, Any]) -> bool:
    """Validate that the parsed JSON matches the required report shape."""
    try:
        if not isinstance(data["overall_score"], (int, float)):
            return False
        if not isinstance(data["strength_areas"], list):
            return False
        if not isinstance(data["improvement_areas"], list):
            return False
        if not isinstance(data["recommendations"], list):
            return False
        return True
    except (KeyError, TypeError):
        return False


def _call_gemini(prompt: str) -> str:
    client = _get_client()
    response = client.models.generate_content(model=_GEMINI_MODEL, contents=prompt)
    return response.text


def _parse_response(raw_text: str) -> Dict[str, Any]:
    cleaned = _strip_markdown_fences(raw_text)
    data = json.loads(cleaned)
    if not _validate_shape(data):
        raise ValueError("Gemini response did not match the required report schema")
    return data


def generate_report(evaluations: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Generate an aggregated session report from a list of /evaluate-answer
    responses, using exactly ONE Gemini call.

    Raises a clear error on any failure (network, malformed JSON, or a
    response that doesn't match the required schema) — the caller is
    responsible for turning that into a clean HTTP error.

    Returns a dict matching:
        {
          "overall_score": 0,
          "strength_areas": [...],
          "improvement_areas": [...],
          "recommendations": [...]
        }
    """
    prompt = _build_prompt(evaluations)

    try:
        raw_text = _call_gemini(prompt)
        return _parse_response(raw_text)
    except Exception as exc:  # noqa: BLE001 - normalize any failure into a clear error
        raise RuntimeError(f"Failed to generate a valid session report from Gemini: {exc}") from exc
