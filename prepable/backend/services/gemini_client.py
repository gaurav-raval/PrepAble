"""
Shared Gemini client for PrepAble.

All services import from here — single client instance, single model constant,
shared fence-stripping utility. Eliminates the duplicated boilerplate that
previously existed in evaluation_service, report_service, and resume_service.
"""

import os
import re

from google import genai

GEMINI_MODEL = "models/gemini-3.5-flash"

_client: genai.Client | None = None


def get_client() -> genai.Client:
    """Return the shared Gemini client, creating it once on first call."""
    global _client
    if _client is None:
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            raise RuntimeError("GEMINI_API_KEY environment variable is not set")
        _client = genai.Client(api_key=api_key)
    return _client


def call_gemini(prompt: str) -> str:
    """Send a single prompt to Gemini and return the raw text response."""
    client = get_client()
    response = client.models.generate_content(model=GEMINI_MODEL, contents=prompt)
    return response.text


def strip_fences(text: str) -> str:
    """Strip ```json ... ``` or ``` ... ``` fences if Gemini wraps its output."""
    stripped = text.strip()
    match = re.match(r"^```(?:json)?\s*(.*?)\s*```$", stripped, re.DOTALL)
    return match.group(1).strip() if match else stripped
