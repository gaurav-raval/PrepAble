# Member 2 — AI Question Generation & Simplification

**Read `SPEC.md` in the repo root first.** Every prompt below assumes your coding agent has access to that file — open your agent inside the repo folder, or paste SPEC.md's contents in if needed.

Work happens inside the `/backend` folder. Do these steps **in order**.

---

## Step 1 — Get a Gemini API key and set up the Flask project structure

Before writing code: go to Google AI Studio, create a free Gemini API key, and share it privately with the team (everyone will need their own key or you'll share a project key — confirm with Member 4). Add it to your local `.env` as `GEMINI_API_KEY` (copy `.env.example` from the repo root to `.env` first).

Prompt for your coding agent:

```
Read SPEC.md section 2 (Tech Stack) and section 8 (Member 2 tasks). Inside
/backend, check if a Flask app skeleton already exists (Member 4 may have set
this up). If not, create a minimal one: app.py, requirements.txt with flask,
flask-cors, google-generativeai, and python-dotenv. Set up python-dotenv to
load GEMINI_API_KEY from .env. Confirm the Flask app runs with a basic health
check route GET /health that returns {"status": "ok"}.
```

Check: `python app.py` runs, and visiting `/health` in the browser returns `{"status": "ok"}`.

---

## Step 2 — Build the Gemini service wrapper

Prompt:

```
Read SPEC.md section 8. Create backend/services/gemini_service.py — a small
wrapper module around the google-generativeai SDK that exposes one function,
generate(prompt: str) -> str, which sends a prompt to Gemini and returns the
text response. Include basic error handling (catch API errors, return a
clear exception message) since this will be reused by other team members'
services too.
```

Check: a simple test script calling `generate("Say hello in one word")` returns a real Gemini response.

---

## Step 3 — Build the question generator

Prompt:

```
Read SPEC.md section 5 (API Contracts) for the exact request/response JSON
shape of POST /generate-question, and section 8 for context. Create
backend/services/question_service.py with a function generate_question(role,
experience_level, category) that builds a prompt for Gemini asking it to
generate ONE interview question of the given category (HR / Technical /
Situational) appropriate for the given role and experience level, and returns
it as plain text. The prompt to Gemini should ask for ONLY the question text,
nothing else — no numbering, no preamble.

Then create backend/routes/question_routes.py with a Flask Blueprint exposing
POST /generate-question, matching the exact request/response JSON shape in
SPEC.md section 5. Generate a simple unique question_id (e.g. using uuid).
Register this blueprint in app.py.
```

Check: sending a POST to `/generate-question` with `{"role": "Software Developer", "experience_level": "Fresher", "category": "HR"}` returns valid JSON matching the shape in SPEC.md section 5, with a real Gemini-generated question.

---

## Step 4 — Build the question simplifier

Prompt:

```
Read SPEC.md section 5 for the exact shape of POST /simplify-question. Add a
simplify_question(question_text) function to question_service.py that asks
Gemini to rewrite the given interview question in simpler, more direct
language — short sentences, no jargon, no idioms — while keeping the same
meaning. Add the /simplify-question route to question_routes.py matching the
JSON shape in SPEC.md exactly.
```

Check: sending a POST to `/simplify-question` with a complex question returns a genuinely simpler rewrite, in the correct JSON shape.

---

## Step 5 — Test with the categories that matter

Prompt:

```
Test /generate-question with all three categories (HR, Technical,
Situational) across at least two different roles (e.g. Software Developer,
and one non-technical role like Customer Support). Confirm the questions are
sensible and appropriately scoped to the experience level. Fix the prompt in
question_service.py if any category produces low-quality output.
```

Check: questions are relevant and well-scoped across categories and roles — this is what the demo will actually run on, so don't skip testing edge cases.

---

## Step 6 — Coordinate with Member 4 for integration

Once your two endpoints work reliably, tell Member 4 they're ready. Member 4 will wire your routes into the main app if they aren't already, and Member 1 will swap their mock data for real calls to your endpoints during Week 2 — make sure your JSON response shape matches SPEC.md section 5 exactly, since that's what Member 1 built against.
