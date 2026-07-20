"""
Flask routes for resume upload and resume-based interview question generation.

Exposes:
    POST /upload-resume            — accept a file, extract text, return upload_id
    POST /generate-resume-questions — analyze resume + role, return personalized questions
"""

from typing import Any, Dict

from flask import Blueprint, jsonify, request

from services.resume_service import (
    generate_resume_questions,
    get_upload_metadata,
    upload_resume,
)

resume_bp = Blueprint("resume", __name__)

# Maximum upload size enforced at the route level (belt-and-suspenders alongside
# Flask's MAX_CONTENT_LENGTH set in app.py). 5 MB covers any realistic resume.
MAX_FILE_BYTES = 5 * 1024 * 1024  # 5 MB

# MIME types expected for each supported format. Checked as a secondary defence
# only — MIME is client-supplied and can be spoofed, so extension + try/except
# parse in text_extraction_service.py remain the primary validation.
ALLOWED_MIMETYPES = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
}


@resume_bp.route("/upload-resume", methods=["POST"])
def upload_resume_route():
    """
    Accepts multipart/form-data with a 'resume' file field.
    Returns {"upload_id": "...", "status": "uploaded"} on success.
    """
    if "resume" not in request.files:
        return jsonify({"error": "No file uploaded. Send the file under the 'resume' field."}), 400

    file = request.files["resume"]
    if not file.filename:
        return jsonify({"error": "Uploaded file has no filename"}), 400

    # Secondary MIME check — not a hard block because MIME is client-supplied
    # and can be spoofed; extension + parse guard in the service is primary.
    if file.mimetype and file.mimetype not in ALLOWED_MIMETYPES:
        return jsonify({
            "error": (
                f"Unexpected file type '{file.mimetype}'. "
                "Please upload a PDF, DOCX, or TXT file."
            )
        }), 415

    file_bytes = file.read()

    if not file_bytes:
        return jsonify({"error": "Uploaded file is empty"}), 400

    if len(file_bytes) > MAX_FILE_BYTES:
        return jsonify({"error": "File too large. Maximum resume size is 5 MB."}), 413

    try:
        result = upload_resume(file_bytes, file.filename)
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400
    except RuntimeError as exc:
        return jsonify({"error": str(exc)}), 502

    return jsonify(result), 200


@resume_bp.route("/generate-resume-questions", methods=["POST"])
def generate_resume_questions_route():
    """
    Accepts JSON: {"upload_id": "...", "role": "Backend Developer", "count": 10}
    Returns {"questions": [{question_id, category, question_text}, ...]}

    The resume analysis Gemini call is cached per upload_id — repeated calls
    with different roles or counts do not re-analyze the same resume.

    Questions feed directly into the existing POST /evaluate-answer endpoint —
    no changes to the evaluation or reporting flow are needed.
    """
    body: Dict[str, Any] = request.get_json(silent=True) or {}

    upload_id = body.get("upload_id", "").strip()
    role = body.get("role", "").strip()
    count = body.get("count", 10)

    if not upload_id:
        return jsonify({"error": "Missing required field: upload_id"}), 400
    if not role:
        return jsonify({"error": "Missing required field: role"}), 400

    if not isinstance(count, int) or count < 1:
        count = 10

    # Verify upload exists before making any Gemini calls
    try:
        get_upload_metadata(upload_id)
    except KeyError as exc:
        return jsonify({"error": str(exc)}), 404

    try:
        result = generate_resume_questions(upload_id, role, count)
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400
    except RuntimeError as exc:
        return jsonify({"error": str(exc)}), 502

    return jsonify(result), 200
