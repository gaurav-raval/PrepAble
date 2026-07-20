"""
PrepAble backend entrypoint.

Minimal Flask app registering the evaluation blueprint (Member 3's module:
AI answer evaluation and session report generation). Other members'
blueprints (question generation, auth, etc.) should be registered here
alongside this one as they're built.
"""

import os

from flask import Flask, jsonify
from flask_cors import CORS

from routes.evaluation_routes import evaluation_bp
from routes.resume_routes import resume_bp
from routes.standard_interview_routes import standard_bp


def create_app() -> Flask:
    app = Flask(__name__)
    CORS(app)

    # Hard cap on incoming request body size — rejects oversized uploads
    # before they reach the route handler. Matches the per-route MAX_FILE_BYTES
    # check in resume_routes.py (belt-and-suspenders).
    app.config["MAX_CONTENT_LENGTH"] = 5 * 1024 * 1024  # 5 MB

    app.register_blueprint(evaluation_bp)
    app.register_blueprint(resume_bp)
    app.register_blueprint(standard_bp)

    @app.route("/health")
    def health():
        return {"status": "ok"}

    @app.errorhandler(413)
    def request_entity_too_large(e):
        return jsonify({"error": "File too large. Maximum resume size is 5 MB."}), 413

    return app


app = create_app()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    app.run(host="0.0.0.0", port=port, debug=True)
