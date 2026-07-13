"""
Flask routes for AI answer evaluation and session report generation.

Exposes:
    POST /evaluate-answer
    POST /generate-report
"""

from typing import Any, Dict

from flask import Blueprint, jsonify, request

from services.evaluation_service import evaluate_answer
from services.report_service import generate_report

evaluation_bp = Blueprint("evaluation", __name__)


@evaluation_bp.route("/evaluate-answer", methods=["POST"])
def evaluate_answer_route():
    body: Dict[str, Any] = request.get_json(silent=True) or {}

    question_id = body.get("question_id", "")
    question_text = body.get("question_text", "")
    answer_text = body.get("answer_text", "")

    if not question_text or not answer_text:
        return jsonify({"error": "Missing required fields"}), 400

    try:
        result = evaluate_answer(question_text, answer_text)
    except Exception as exc:  # noqa: BLE001 - surface a clean error to the client
        return jsonify({"error": f"Failed to evaluate answer: {exc}"}), 502

    return jsonify(result), 200


@evaluation_bp.route("/generate-report", methods=["POST"])
def generate_report_route():
    body: Dict[str, Any] = request.get_json(silent=True) or {}

    session_id = body.get("session_id", "")
    evaluations = body.get("evaluations")

    if not session_id or not evaluations or not isinstance(evaluations, list):
        return jsonify({"error": "Missing required fields"}), 400

    try:
        result = generate_report(evaluations)
    except Exception as exc:  # noqa: BLE001 - surface a clean error to the client
        return jsonify({"error": f"Failed to generate report: {exc}"}), 502

    return jsonify(result), 200
