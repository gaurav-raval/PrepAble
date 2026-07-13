# Member 4 — Project Lead & Integration

**Read `SPEC.md` in the repo root first.** You own the parts everyone else depends on — do Steps 1-3 on Day 1, before anyone else can properly start.

---

## Step 1 — Set up the Neon database (do this first, today)

1. Go to neon.tech, sign up free, create a new project.
2. Copy the connection string it gives you (looks like `postgresql://user:password@host/dbname?sslmode=require`).
3. Add it to your local `.env` as `DATABASE_URL` (copy `.env.example` from the repo root to `.env` first).
4. Share the connection string with the team through a private channel (not committed to git, not posted in a public Slack/Discord channel).

Prompt for your coding agent:

```
Read SPEC.md section 6 (Database Schema). Using the SQL in that section,
create the tables in my Neon database. You can do this by connecting with
psycopg2 in a one-off Python script, or by pasting the SQL into Neon's built-
in SQL editor in their web dashboard — pick whichever is faster. Confirm the
four tables (users, sessions, questions, answers) exist by querying
information_schema.tables.
```

Check: all four tables exist in your Neon project (visible in the Neon dashboard's table view).

---

## Step 2 — Scaffold the shared Flask backend

Prompt:

```
Read SPEC.md sections 2, 6, and 8. Inside /backend, create app.py: a Flask
app with flask-cors enabled (frontend will run on a different port during
development), python-dotenv loading .env, and a health check route at
GET /health returning {"status": "ok"}. Create backend/database.py using
SQLAlchemy with models matching the schema in SPEC.md section 6 exactly
(User, Session, Question, Answer), connected via the DATABASE_URL environment
variable. Create backend/requirements.txt with flask, flask-cors,
python-dotenv, sqlalchemy, psycopg2-binary, and google-generativeai.
```

Check: `python app.py` runs without errors and `/health` responds correctly; SQLAlchemy models match the Neon schema.

---

## Step 3 — Publish mock JSON fixtures so Member 1 isn't blocked

Prompt:

```
Read SPEC.md section 5 (API Contracts). Create a backend/mocks/ folder with
one JSON file per endpoint (mock_generate_question.json,
mock_simplify_question.json, mock_evaluate_answer.json,
mock_generate_report.json), each containing a realistic example response
matching the exact shape in SPEC.md section 5. These are for Member 1 to copy
into the frontend's mock data file — make sure the JSON is valid and the
values are realistic (not just "string" or "test123" placeholders), since
Member 1 will be building real UI against these values.
```

Check: JSON files exist and validate (no syntax errors), values look like genuine interview content, not placeholder text.

Tell Member 1 these are ready — this unblocks their Step 4.

---

## Step 4 — Wire routes together as Members 2 and 3 finish theirs

This happens through Week 1 as their work lands. Prompt (run again as each member finishes a piece):

```
Read SPEC.md section 8. Check backend/routes/ for question_routes.py and
evaluation_routes.py. Make sure both are registered as Blueprints in app.py
without route conflicts, and that CORS is configured to allow requests from
the frontend's dev server (usually http://localhost:5173 for Vite). Run the
Flask app and confirm all four endpoints from SPEC.md section 5 respond
correctly via curl or Postman: /generate-question, /simplify-question,
/evaluate-answer, /generate-report.
```

Check: all four real endpoints (not mocks) respond with correctly-shaped JSON when the backend runs.

---

## Step 5 — Full integration test (Week 2)

Prompt:

```
Read SPEC.md section 4 (User Flow). With the Flask backend running locally
and the React frontend pointed at it via VITE_API_BASE_URL, manually run
through the entire user flow end to end: enter profile, choose role, generate
a question, simplify it, hear it read aloud, answer by both text and voice,
see real AI evaluation, view feedback, repeat for 3-4 questions, then view
the final session report. Note every place it breaks and fix or flag it.
```

Check: one full session completes end-to-end without manual workarounds.

---

## Step 6 — Accessibility testing (don't skip this — it's core to the pitch)

Prompt:

```
Read SPEC.md section 8's accessibility testing checklist. Test the Interview
page for: full keyboard-only navigation (tab through every control, confirm
nothing is unreachable or requires a mouse), a screen reader pass (use
VoiceOver on Mac or NVDA on Windows — confirm the question text, buttons, and
feedback are all announced sensibly), and color contrast in both the default
and high-contrast themes (use a browser extension like axe DevTools or the
Chrome Lighthouse accessibility audit to check WCAG AA compliance). Report
and fix any failures.
```

Check: keyboard nav works throughout, screen reader announces content sensibly, Lighthouse/axe accessibility score is reasonably high (ideally 90+) on both themes.

---

## Step 7 — Deploy

Prompt:

```
Read SPEC.md section 2 for the stack. Deploy the /frontend React app to
Vercel or Netlify (connect the GitHub repo, set the root directory to
/frontend, add VITE_API_BASE_URL as an environment variable pointing to the
deployed backend URL). Deploy the /backend Flask app to Render or Railway
(set GEMINI_API_KEY and DATABASE_URL as environment variables there). Confirm
the deployed frontend can successfully call the deployed backend, and the
backend can reach Neon, by running through the full flow on the live URL.
```

Check: the live deployed link works end-to-end for a stranger with no local setup.

---

## Step 8 — Submission materials

Prompt:

```
Read SPEC.md section 10 (README / Resume Checklist). Write the final root
README.md for the repo: project pitch (from SPEC.md section 1), a simple
architecture diagram description (React → Flask → Gemini → Neon), the live
deployed link, instructions to record and embed a 60-90 second demo video/GIF
at the top, and an explicit "Design Decisions" section explaining why there's
no real authentication (SPEC.md section 7). Keep it concise — judges skim.
```

Check: README is genuinely readable by someone who's never seen the project, live link works, demo video is embedded or linked prominently.
