from flask import Blueprint, request, jsonify

from services.standard_interview_service import (
    start_session,
    generate_next_step,
    end_session,
)

standard_bp = Blueprint("standard_interview", __name__)


@standard_bp.route("/standard/start-session", methods=["POST"])
def create_session():
    data = request.get_json()

    if not data:
        return jsonify({"error": "Request body must be valid JSON."}), 400

    role = data.get("role")
    experience = data.get("experience_level")
    category = data.get("category_focus")

    if not role:
        return jsonify({"error": "role is required."}), 400

    if not experience:
        return jsonify({"error": "experience_level is required."}), 400

    try:
        result = start_session(role, experience, category)
        return jsonify(result), 200

    except Exception as e:
        return jsonify({
            "error": "Failed to start interview session.",
            "details": str(e)
        }), 500


@standard_bp.route("/standard/next-step", methods=["POST"])
def next_step():
    data = request.get_json()

    if not data:
        return jsonify({"error": "Request body must be valid JSON."}), 400

    session_id = data.get("session_id")
    answer = data.get("answer")

    if not session_id:
        return jsonify({"error": "session_id is required."}), 400

    if not answer:
        return jsonify({"error": "answer is required."}), 400

    try:
        result = generate_next_step(session_id, answer)
        return jsonify(result), 200

    except ValueError as e:
        return jsonify({
            "error": str(e)
        }), 404

    except Exception as e:
        return jsonify({
            "error": "Failed to generate next interview question.",
            "details": str(e)
        }), 500


@standard_bp.route("/standard/end-session", methods=["POST"])
def finish_session():
    data = request.get_json()

    if not data:
        return jsonify({"error": "Request body must be valid JSON."}), 400

    session_id = data.get("session_id")

    if not session_id:
        return jsonify({"error": "session_id is required."}), 400

    session = end_session(session_id)

    if session is None:
        return jsonify({
            "error": "Session not found."
        }), 404

    return jsonify({
        "message": "Interview session ended successfully."
    }), 200