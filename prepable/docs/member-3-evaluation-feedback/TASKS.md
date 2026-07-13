# Member 3 — AI Evaluation & Feedback

**Read `SPEC.md` in the repo root first.** Every prompt below assumes your coding agent has access to that file — open your agent inside the repo folder, or paste SPEC.md's contents in if needed.

Work happens inside the `/backend` folder, alongside Member 2's work. Do these steps **in order**.

---

## Step 1 — Confirm your environment is ready

You're sharing the `/backend` Flask app with Member 2. Before starting:
- Make sure you have a Gemini API key in your local `.env` (see `.env.example` in the repo root) — same as Member 2's setup.
- Pull the latest code from the repo so you have whatever Flask skeleton and `gemini_service.py` wrapper Member 2/4 have already built.

Prompt for your coding agent:

```
Read SPEC.md section 8 (Member 3 tasks) and check if backend/services/
gemini_service.py already exists (it should have a generate(prompt) function
built by Member 2 — reuse it, don't rebuild it). Confirm the Flask app in
/backend runs locally with `python app.py`.
```

Check: the shared Flask app runs, and you can see `gemini_service.py` already has a working `generate()` function to reuse.

---

## Step 2 — Build the evaluation service (the most important piece)

Prompt:

```
Read SPEC.md section 5 (API Contracts) very carefully — specifically the
POST /evaluate-answer response shape. This is the most important part of the
whole app, so match it exactly: scores (relevance, clarity, professionalism,
overall out of 100), star_check (situation/task/action/result as booleans),
feedback (strengths array, improvements array, sample_improved_answer
string), and recruiter_perspective (strength string, concern string).

Create backend/services/evaluation_service.py with a function
evaluate_answer(question_text, answer_text) that builds ONE Gemini prompt
asking it to evaluate the given interview answer and return ONLY a JSON
object matching that exact shape — no markdown formatting, no explanation
text outside the JSON. Parse the Gemini response as JSON (strip any ```json
fences if present) and return it as a Python dict. Include error handling for
cases where Gemini's response isn't valid JSON — retry once, then fall back to
a clear error.

Do NOT make separate Gemini calls for scores, STAR check, and feedback — one
call producing the full JSON structure keeps latency and API cost down for
the live demo.
```

Check: calling `evaluate_answer()` with a real question and answer returns a Python dict matching the exact shape in SPEC.md section 5, including believable STAR checks and a genuinely useful "sample_improved_answer".

---

## Step 3 — Build the /evaluate-answer route

Prompt:

```
Read SPEC.md section 5 for the exact request shape of POST /evaluate-answer.
Create backend/routes/evaluation_routes.py with a Flask Blueprint exposing
POST /evaluate-answer, which takes question_id, question_text, and
answer_text, calls evaluate_answer() from evaluation_service.py, and returns
the result matching SPEC.md's response shape exactly. Register this blueprint
in app.py (coordinate with whoever owns app.py so blueprints don't conflict).
```

Check: POSTing a real question/answer pair to `/evaluate-answer` returns valid JSON in the browser or via curl/Postman.

---

## Step 4 — Build the session report generator

Prompt:

```
Read SPEC.md section 5 for the exact shape of POST /generate-report. Create
backend/services/report_service.py with a function generate_report(evaluations)
that takes a list of /evaluate-answer responses from one session and produces
an aggregated summary: overall_score (average of the individual overall
scores), strength_areas and improvement_areas (pull the most common
strengths/improvements across all answers — you can do this with simple
aggregation logic, it doesn't need another Gemini call), and recommendations
(this part CAN use one Gemini call summarizing patterns across the session
into 2-3 actionable recommendations).

Add the /generate-report route to a new or existing routes file, matching
SPEC.md's shape exactly.
```

Check: passing 3-4 fake `/evaluate-answer`-shaped objects into `/generate-report` returns a sensible aggregated summary, not just a copy of the last answer's feedback.

---

## Step 5 — Test on realistic weak and strong answers

Prompt:

```
Test /evaluate-answer with three types of answers: a strong, well-structured
answer with a clear STAR shape; a weak, vague, one-sentence answer; and an
answer that's off-topic/irrelevant to the question. Confirm the scores and
feedback meaningfully differ between them — if a weak answer scores nearly
as high as a strong one, revise the Gemini prompt in evaluation_service.py to
be stricter and more specific about what "high" scores require.
```

Check: score spread is meaningful across good/bad answers — this matters a lot for the demo, since judges will likely try a deliberately weak answer to see if the feedback is honest.

---

## Step 6 — Coordinate with Member 4 for integration

Once both endpoints are reliable, tell Member 4. Member 1 will connect the Feedback and Report pages to your real endpoints during Week 2 — the JSON shape must match SPEC.md section 5 exactly, since that's what their components were built against.
