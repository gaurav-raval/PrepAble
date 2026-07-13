"""
PrepAble backend entrypoint.

Minimal Flask app registering the evaluation blueprint (Member 3's module:
AI answer evaluation and session report generation). Other members'
blueprints (question generation, auth, etc.) should be registered here
alongside this one as they're built.
"""

import os
from dotenv import load_dotenv

from flask import Flask
from flask_cors import CORS

from routes.evaluation_routes import evaluation_bp


load_dotenv()

def create_app() -> Flask:
    app = Flask(__name__)
    CORS(app)

    app.register_blueprint(evaluation_bp)

    @app.route("/health")
    def health():
        return {"status": "ok"}

    return app


app = create_app()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
