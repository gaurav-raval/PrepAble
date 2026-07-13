# Member 1 — Frontend & Accessibility

**Read `SPEC.md` in the repo root first.** Every prompt below assumes your coding agent (Claude Code, Codex, Antigravity, etc.) has access to that file — open your agent inside the repo folder so it can read it directly, or paste its contents in if your tool needs that.

Work happens inside the `/frontend` folder. Do these steps **in order** — each one builds on the last.

---

## Step 1 — Scaffold the React app

Prompt for your coding agent:

```
Read SPEC.md in the repo root, especially section 2 (Tech Stack) and section 8
(Member 1 — Frontend & Accessibility). Inside the /frontend folder, scaffold a
new Vite + React project (JavaScript, not TypeScript). Install react-router-dom
for routing. Set up a basic folder structure: src/pages, src/components,
src/context. Confirm it runs with `npm run dev`.
```

Check: `npm run dev` inside `/frontend` opens a working blank React app in the browser.

---

## Step 2 — Build the Accessibility Context

Prompt:

```
Read SPEC.md section 3 (MVP Scope) and section 8 (Member 1 tasks). Create
src/context/AccessibilityContext.jsx — a React Context + Provider that holds:
font size (small/medium/large/extra-large), dyslexia-friendly font toggle
(switches between default sans-serif and a dyslexia-friendly font like Lexend
or OpenDyslexic — load it from Google Fonts), high contrast mode toggle, and
adjustable letter/line spacing. Expose a useAccessibility() hook. Wrap the app
in this provider in main.jsx. Apply the settings as CSS variables on the root
element so any component can pick them up automatically.
```

Check: toggling settings in a temporary test button visibly changes font, spacing, and contrast across the whole page.

---

## Step 3 — Build the pages and routing

Prompt:

```
Read SPEC.md section 4 (User Flow) and section 8. Using react-router-dom,
create five pages in src/pages: Login.jsx, Dashboard.jsx, Interview.jsx,
Feedback.jsx, Report.jsx. Login.jsx is just a name/role/experience-level form
(no real auth — see SPEC.md section 7) that stores the result in
sessionStorage and navigates to Dashboard. Dashboard.jsx lets the user pick a
question category (HR/Technical/Situational) and start a session, navigating
to Interview. Wire up routing in App.jsx so the flow matches SPEC.md section 4.
```

Check: you can click through Login → Dashboard → Interview → Feedback → Report using placeholder content on each page.

---

## Step 4 — Build the core components against mock data

Prompt:

```
Read SPEC.md section 5 (API Contracts) carefully — these are the exact JSON
shapes the backend will return. For now, create a src/mocks/mockData.js file
with hardcoded objects matching those exact shapes for generate-question,
simplify-question, evaluate-answer, and generate-report.

Then build these components using the mock data:
- QuestionCard.jsx: shows the question text, a "Simplify" button, and a
  "Read Aloud" button (use the browser's SpeechSynthesis API for read-aloud —
  window.speechSynthesis.speak()).
- AnswerInput.jsx: a toggle between typing an answer and speaking it (use the
  browser's SpeechRecognition API for voice-to-text).
- FeedbackPanel.jsx: displays scores, the STAR check (situation/task/action/
  result as checkmarks), strengths, improvements, sample improved answer, and
  the recruiter perspective section.
- ReportSummary.jsx: displays overall score, strength areas, improvement
  areas, and recommendations.

Wire these into the Interview, Feedback, and Report pages using the mock data
for now — no real API calls yet.
```

Check: the full flow works end-to-end with fake data — you can generate a mock question, simplify it, hear it read aloud, answer by typing or speaking, and see mock feedback and a mock report.

---

## Step 5 — Accessibility Settings panel

Prompt:

```
Read SPEC.md section 8. Build an AccessibilitySettings.jsx component — a
panel or modal accessible from every page (put it in a shared layout/header)
that lets the user control everything in AccessibilityContext: font size,
dyslexia font toggle, high contrast, spacing. Make sure it's keyboard-
navigable and has proper aria-labels on every control.
```

Check: settings persist as you navigate between pages, and you can operate the whole panel using only the Tab and Enter keys.

---

## Step 6 — Wait for backend, then swap mocks for real calls

This step happens in **Week 2**, once Members 2, 3, and 4 have real endpoints running. Don't start it until Member 4 tells you the backend is live.

Prompt:

```
Read SPEC.md section 5 for the exact endpoint URLs and shapes. Replace every
place currently reading from src/mocks/mockData.js with a real fetch() call to
the Flask backend, using the base URL from the VITE_API_BASE_URL environment
variable (see .env.example in the repo root). Add basic loading states and
error handling (e.g. "Something went wrong, try again") for each call.
```

Check: the full flow works against the real backend, not mock data, and shows a sensible loading/error state if the API is slow or fails.
