"""
Resume service for PrepAble.

Handles resume upload metadata, Gemini-powered resume analysis, and
personalized interview question generation.

Key design decisions:
- Analysis result is cached in _upload_store on first call; subsequent calls
  for the same upload_id return the cached result without a Gemini call.
- Entries are evicted after STORE_TTL_SECONDS (2 hours) to prevent unbounded
  memory and disk growth. Eviction runs at the start of each new upload.
- File storage uses a local temp directory (MVP) — swap in DB-backed storage
  when Neon is wired up. Note: the in-memory dict is NOT shared across
  multiple gunicorn workers; a DB is required for multi-process deployments.
"""

import json
import os
import time
import uuid
from pathlib import Path
from typing import Any, Dict

from services.gemini_client import call_gemini, strip_fences
from services.text_extraction_service import extract_text

ANALYSIS_PROMPT_PATH = (
    Path(__file__).resolve().parent.parent / "prompts" / "resume_analysis_prompt.txt"
)
QUESTIONS_PROMPT_PATH = (
    Path(__file__).resolve().parent.parent / "prompts" / "resume_questions_prompt.txt"
)

UPLOAD_DIR = Path(os.environ.get("UPLOAD_DIR", "/tmp/prepable_uploads"))
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".txt"}

# In-memory store: upload_id → {filename, file_type, extracted_text, analysis?, created_at}
# Replace with DB queries once Neon is wired in.
_upload_store: Dict[str, Dict[str, Any]] = {}

# Evict entries older than this many seconds to prevent unbounded memory growth.
_STORE_TTL_SECONDS = 2 * 60 * 60  # 2 hours


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _evict_stale_entries() -> None:
    """Remove in-memory store entries and disk files older than TTL."""
    now = time.time()
    stale_ids = [
        uid for uid, meta in _upload_store.items()
        if now - meta.get("created_at", now) > _STORE_TTL_SECONDS
    ]
    for uid in stale_ids:
        # Best-effort disk cleanup
        for ext in ALLOWED_EXTENSIONS:
            try:
                (UPLOAD_DIR / f"{uid}{ext}").unlink(missing_ok=True)
            except Exception:
                pass
        del _upload_store[uid]


def _parse_json(raw: str) -> Any:
    return json.loads(strip_fences(raw))


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def upload_resume(file_bytes: bytes, filename: str) -> Dict[str, str]:
    """
    Validate file type, extract text, store metadata, return upload_id.

    Returns:
        {"upload_id": "...", "status": "uploaded"}

    Raises:
        ValueError  — unsupported extension or empty file
        RuntimeError — extraction failed
    """
    suffix = Path(filename).suffix.lower()
    if suffix not in ALLOWED_EXTENSIONS:
        raise ValueError(
            f"Unsupported file type '{suffix}'. Please upload a PDF, DOCX, or TXT file."
        )

    extracted_text = extract_text(file_bytes, filename)

    # Evict stale entries before adding a new one
    _evict_stale_entries()

    upload_id = str(uuid.uuid4())

    # Persist raw file to disk (useful for debugging; not used by service logic)
    dest = UPLOAD_DIR / f"{upload_id}{suffix}"
    dest.write_bytes(file_bytes)

    _upload_store[upload_id] = {
        "filename": filename,
        "file_type": suffix.lstrip("."),
        "extracted_text": extracted_text,
        "created_at": time.time(),
        # "analysis" key is added lazily by analyze_resume() on first call
    }

    print("AFTER UPLOAD:", list(_upload_store.keys()))

    return {"upload_id": upload_id, "status": "uploaded"}


def analyze_resume(upload_id: str) -> Dict[str, Any]:
    """
    Use one Gemini call to extract structured information from a previously
    uploaded resume. Result is cached in _upload_store — repeated calls for
    the same upload_id return the cached result without a new Gemini call.

    Returns:
        {
          "skills": [...],
          "technologies": [...],
          "frameworks": [...],
          "projects": [...],
          "education": [...],
          "certifications": [...],
          "experience": [...]
        }

    Raises:
        KeyError    — upload_id not found
        RuntimeError — Gemini call or JSON parsing failed
    """
    
    print("CURRENT STORE:", list(_upload_store.keys()))
    print("LOOKING FOR:", upload_id)
    
    if upload_id not in _upload_store:
        raise KeyError(f"Upload ID '{upload_id}' not found. Upload the resume first.")

    entry = _upload_store[upload_id]

    # Return cached result if analysis was already performed for this upload
    if "analysis" in entry:
        return entry["analysis"]

    resume_text = entry["extracted_text"]

    template = ANALYSIS_PROMPT_PATH.read_text(encoding="utf-8")
    prompt = template.replace("{resume_text}", resume_text)

    try:
        raw = call_gemini(prompt)
        data = _parse_json(raw)
    except Exception as exc:
        raise RuntimeError(f"Resume analysis failed: {exc}") from exc

    required_keys = {"skills", "technologies", "frameworks", "projects",
                     "education", "certifications", "experience"}
    if not required_keys.issubset(data.keys()):
        raise RuntimeError("Gemini returned an incomplete resume analysis structure")

    # Cache the result so future calls for this upload_id skip the Gemini call
    entry["analysis"] = data
    return data


def generate_resume_questions(
    upload_id: str,
    role: str,
    count: int = 10,
) -> Dict[str, Any]:
    """
    Analyze the resume (one Gemini call, cached after first use) then generate
    personalized interview questions (one Gemini call) — at most two calls total
    on the first invocation; one call on subsequent invocations for the same
    upload_id.

    Returns:
        {"questions": [{"question_id": "rq_001", "category": "...", "question_text": "..."}, ...]}

    Raises:
        KeyError    — upload_id not found
        ValueError  — role is empty
        RuntimeError — Gemini call or JSON parsing failed
    """
    if not role or not role.strip():
        raise ValueError("A target role must be provided")

    count = max(1, min(count, 20))  # clamp between 1 and 20

    # Step 1: Analyze the resume (uses cached result if already computed)
    resume_analysis = analyze_resume(upload_id)

    # Step 2: Generate questions based on cached analysis + role
    template = QUESTIONS_PROMPT_PATH.read_text(encoding="utf-8")
    prompt = (
        template
        .replace("{role}", role)
        .replace("{count}", str(count))
        .replace("{resume_analysis_json}", json.dumps(resume_analysis, indent=2))
    )

    try:
        raw = call_gemini(prompt)
        data = _parse_json(raw)
    except Exception as exc:
        raise RuntimeError(f"Question generation failed: {exc}") from exc

    if "questions" not in data or not isinstance(data["questions"], list):
        raise RuntimeError("Gemini returned an invalid question list structure")

    return data


def get_upload_metadata(upload_id: str) -> Dict[str, Any]:
    """Return stored metadata for an upload_id (used by routes for validation)."""
    if upload_id not in _upload_store:
        raise KeyError(f"Upload ID '{upload_id}' not found")
    return _upload_store[upload_id]
