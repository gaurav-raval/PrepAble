# PrepAble — Consolidated Build Spec
**AI-Powered Accessible Interview Coach for Neurodiverse Job Seekers**

This is the single source of truth for the build. Give this file to every team member and every coding agent (Claude Code / Codex / Antigravity) instead of the original drafts — it resolves the duplication and contradictions between them.

---

## 1. Problem & Pitch (for judges + README)

Traditional interview practice tools assume the user can parse dense questions quickly, self-regulate under timed pressure, and infer feedback. That's a bad assumption for candidates with ASD, ADHD, dyslexia, or social anxiety — and it filters out qualified people before they ever reach a human interviewer.

**PrepAble** doesn't just help people answer interview questions — it removes the accessibility barriers that stop neurodiverse candidates from practicing in the first place: simplified language, read-aloud questions, voice answers, no-timer mode, and feedback that explains *why*, not just *what*.

One-line pitch: *"Most interview-prep apps help people answer questions. PrepAble helps people who couldn't access the practice in the first place."*

---

## 2. Tech Stack (locked — no "or")

| Layer | Choice |
|---|---|
| Frontend | **React (Vite)** |
| Backend | Python + Flask |
| Database | **Neon (serverless Postgres)** |
| AI | **Gemini API** (generous free tier — safer for live demos) |
| Voice | Browser Speech Synthesis API (TTS) + Speech Recognition API (STT) — used inside React components, no change in behavior |
| Auth | None — see §7 |

**Why React over vanilla JS:** the app is fundamentally state-driven (question → answer → evaluation → next question → report), which maps cleanly onto components and hooks. Accessibility settings (font size, contrast, spacing, font family) become a single global context/provider instead of DOM class-toggling spread across files. Coding agents also scaffold React more reliably than hand-wired vanilla JS.

**Why Neon over SQLite:** free-tier serverless Postgres, no local `.db` file to lose between redeploys, and the schema in §6 ports over almost 1:1. Appwrite was considered but rejected — it's a full BaaS (auth + DB + storage) and since the team is deliberately skipping real auth (§7), most of that surface would go unused; it would also mean partially replacing the Flask architecture this spec already defines, which is unnecessary risk this close to a deadline.

---

## 3. MVP Scope (build these 6 — everything else is stretch)

1. Role Selection & Profile
2. Question Generation
3. Question Accessibility (Simplify + Read Aloud)
4. Answer Collection (Text + Voice)
5. AI Evaluation (includes STAR check + Recruiter Perspective as fields, not separate modules)
6. Accessibility Settings (font, contrast, spacing, dyslexia font)

Session Report is a **thin wrapper** around data already produced by #5 across questions — build it last, it's mostly aggregation, not new AI logic.

**Explicitly cut from MVP** (build only if Week 3 has slack): Anxiety-Friendly Mode, Focus Mode, standalone Progress Tracking dashboard, multi-session history.

> Change from original draft: STAR analysis and Recruiter Perspective are **not** separate modules/endpoints. They're extra fields in the `/evaluate-answer` response — same LLM call, richer output, zero extra dev cost. Recruiter Perspective in particular is your strongest differentiator for judges, so it should ship in the MVP, not as a stretch goal.

---

## 4. User Flow (single canonical version)

```
Enter Profile (name, role, experience level)
        ↓
Choose Job Role
        ↓
Generate Interview Question
        ↓
[Optional] Simplify Question
        ↓
[Optional] Read Question Aloud
        ↓
Answer via Text or Voice
        ↓
AI Evaluation  (relevance, clarity, structure/STAR, professionalism, recruiter view)
        ↓
Personalized Feedback shown
        ↓
Next Question  →  (loop 3–5 questions)
        ↓
Final Session Report
```

---

## 5. API Contracts (define these on Day 1 — build mock JSON matching this before real integration)

All endpoints return JSON. Frontend should be built against these mocked shapes immediately so Member 1 is never blocked waiting on Member 2/3.

### `POST /generate-question`
Request:
```json
{ "role": "Software Developer", "experience_level": "Fresher", "category": "HR" }
```
Response:
```json
{
  "question_id": "q_001",
  "category": "HR",
  "question_text": "Describe a circumstance in which you demonstrated leadership."
}
```

### `POST /simplify-question`
Request:
```json
{ "question_id": "q_001", "question_text": "Describe a circumstance in which you demonstrated leadership." }
```
Response:
```json
{ "question_id": "q_001", "simplified_text": "Tell me about a time you led a team or helped others finish a task." }
```

### `POST /evaluate-answer`
Request:
```json
{
  "question_id": "q_001",
  "question_text": "Describe a circumstance in which you demonstrated leadership.",
  "answer_text": "I led a group project in college where..."
}
```
Response:
```json
{
  "scores": {
    "relevance": 8,
    "clarity": 7,
    "professionalism": 9,
    "overall": 80
  },
  "star_check": {
    "situation": true,
    "task": true,
    "action": true,
    "result": false
  },
  "feedback": {
    "strengths": ["Clear description of the project context"],
    "improvements": ["Add the final outcome — what changed because of your action?"],
    "sample_improved_answer": "..."
  },
  "recruiter_perspective": {
    "strength": "Strong ownership of the project",
    "concern": "Missing measurable result — recruiters want to see impact"
  }
}
```

### `POST /generate-report`
Request:
```json
{ "session_id": "s_001", "evaluations": [ /* array of /evaluate-answer responses */ ] }
```
Response:
```json
{
  "overall_score": 82,
  "strength_areas": ["Communication", "Project Explanation"],
  "improvement_areas": ["Confidence", "Answer Structure"],
  "recommendations": ["Practice the STAR method on situational questions"]
}
```

---

## 6. Database Schema (Neon / Postgres)

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name TEXT,
  role TEXT,
  experience_level TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  started_at TIMESTAMP DEFAULT NOW(),
  overall_score INTEGER
);

CREATE TABLE questions (
  id SERIAL PRIMARY KEY,
  session_id INTEGER REFERENCES sessions(id),
  category TEXT,
  question_text TEXT,
  simplified_text TEXT
);

CREATE TABLE answers (
  id SERIAL PRIMARY KEY,
  question_id INTEGER REFERENCES questions(id),
  answer_text TEXT,
  input_mode TEXT,        -- 'text' or 'voice'
  scores_json JSONB,       -- serialized /evaluate-answer response — use JSONB, not TEXT, so Postgres can index/query into it if needed
  created_at TIMESTAMP DEFAULT NOW()
);
```

No `password` field, no auth table — see §7.

**Setup notes:**
- Create a free Neon project at neon.tech, grab the connection string, store it as `DATABASE_URL` in a `.env` file (never commit this).
- Use `SQLAlchemy` + `psycopg2-binary` in Flask rather than raw SQLite3 calls — lets Member 4 swap connection strings without rewriting query logic, and it's what most Flask+Postgres agent scaffolding expects by default.
- Run the schema above once via Neon's SQL editor or a migration script before Week 2 integration starts, so Members 2 and 3 aren't blocked on DB access when their endpoints go live.

---

## 7. Auth (deliberately skipped)

The login screen is a **name-entry screen**, not real auth. Store `user_id` in a client-side session variable / sessionStorage, or a signed cookie from Flask. Do not build JWT, OAuth, or password hashing — it burns hours judges won't reward. State this explicitly in the README so it reads as a decision, not an oversight.

---

## 8. Team Task Allocation

### Member 1 — Frontend & Accessibility
- Project: Vite + React app (`npm create vite@latest` with the react template)
- Pages/routes (via `react-router-dom`): `Login`, `Dashboard`, `Interview`, `Feedback`, `Report`
- Components: `ProfileForm.jsx`, `QuestionCard.jsx`, `AnswerInput.jsx` (text + voice toggle), `FeedbackPanel.jsx`, `ReportSummary.jsx`
- Accessibility: a single `AccessibilityContext.jsx` provider (font size, dyslexia font toggle, high contrast, spacing) consumed by every page — avoids re-implementing toggles per screen
- Styling: CSS modules or plain CSS files per component; keep a shared `accessibility.css` for the theme variables (font stacks, contrast palettes)
- **Day 1**: build all components against the mock JSON in §5, not live APIs — swap in real `fetch` calls during Week 2 integration

### Member 2 — AI Question Generation & Simplification
- `routes/question_routes.py` → `/generate-question`, `/simplify-question`
- `services/gemini_service.py`, `services/question_service.py`
- Generates HR / Technical / Situational questions by role + experience level

### Member 3 — AI Evaluation & Feedback
- `routes/evaluation_routes.py` → `/evaluate-answer`, `/generate-report`
- `services/evaluation_service.py`, `services/report_service.py`
- Single Gemini call per answer returns scores + STAR check + feedback + recruiter perspective (see §5 schema — don't split into separate calls, costs latency and API quota during live demo)

### Member 4 — Project Lead & Integration
- Repo setup (separate `/frontend` React app and `/backend` Flask app, or a monorepo with both), Flask app skeleton
- Neon project setup, `DATABASE_URL` distributed to the team via `.env.example`, schema from §6 applied
- `database.py` using SQLAlchemy models mapped to the schema, not raw SQL
- Wires frontend → question gen → simplify → evaluate → report; handles CORS between the Vite dev server and Flask API
- Implements TTS/STT via browser APIs — pure frontend, but coordinate with Member 1 since it lives inside `AnswerInput.jsx` and `QuestionCard.jsx`
- Owns testing: module, integration, accessibility (see below), demo run-through
- Deployment: frontend to Vercel or Netlify, backend to Render/Railway, database already hosted on Neon; wire environment variables across all three before demo day

**Accessibility testing checklist (Member 4, don't skip):**
- Full keyboard-only navigation through the interview flow
- One screen reader pass (VoiceOver or NVDA) on the interview screen
- Color contrast check against WCAG AA on both light and high-contrast themes

---

## 9. Timeline

**Week 1 — Build in parallel**
- M1: all UI screens against mock JSON
- M2: question generator + simplifier working end-to-end
- M3: evaluation engine returning full schema from §5
- M4: Flask skeleton, DB, repo, mock JSON fixtures published for M1

**Week 2 — Integrate**
- Swap mocks for live endpoints
- Connect Gemini API end-to-end
- Run full interview flow start to finish, fix breakages

**Week 3 — Polish & submit**
- Accessibility pass (checklist above)
- Voice features (TTS/STT) wired in
- Session report finished
- Deploy live, record 60-second demo video
- Write README (architecture diagram, live link, demo video, resume-ready description)

If this is a 24–48hr hackathon instead of 3 weeks, compress each week into a day and cut Session Report polish first — a working 4-question loop with real feedback beats a full report screen with no working interview.

---

## 10. README / Resume Checklist

- [ ] Live deployed link
- [ ] 60-second demo video/GIF embedded at top of README
- [ ] Architecture diagram: React (Vite) → Flask API → Gemini → Neon (Postgres)
- [ ] Explicit "Design Decisions" section explaining the no-auth choice
- [ ] Resume bullet drafted now, e.g.:
  *"Built and deployed an AI-powered accessibility tool supporting neurodiverse job seekers, using LLM-driven question simplification and real-time answer evaluation to reduce interview-prep barriers for 5 disability categories."*
