# PrepAble

**AI-Powered Accessible Interview Coach for Neurodiverse Job Seekers**

This repo is set up so all four team members can build in parallel using AI coding agents (Claude Code, Codex, Antigravity, etc.) without blocking each other.

## Start here

1. Read **[SPEC.md](./SPEC.md)** first — it's the single source of truth for the whole project (tech stack, API contracts, database schema, user flow, MVP scope). Every task file below refers back to it. Do not build from memory of a conversation or an old doc — always check SPEC.md.
2. Find your folder in `/docs`:
   - `docs/member-1-frontend-accessibility/` — React UI + accessibility settings
   - `docs/member-2-question-generation/` — Gemini question generation + simplification
   - `docs/member-3-evaluation-feedback/` — Gemini answer evaluation + session report
   - `docs/member-4-integration-lead/` — repo/DB/deploy, glues everything together
3. Open your `TASKS.md`. It's a numbered list of steps. Each step has a ready-to-paste prompt in a code block — copy it into your coding agent (Claude Code / Codex / Antigravity), let it work, check the result, move to the next step.
4. Don't skip ahead — later steps assume earlier ones exist.

## Repo layout

```
prepable/
├── README.md              ← you are here
├── SPEC.md                 ← full technical spec, read this first
├── .env.example             ← copy to .env, fill in real keys (never commit .env)
├── .gitignore
├── frontend/                ← Member 1 builds the React app here
├── backend/
│   ├── routes/               ← Member 2 & 3 add Flask route files here
│   └── services/              ← Member 2 & 3 add Gemini service files here
└── docs/
    ├── member-1-frontend-accessibility/TASKS.md
    ├── member-2-question-generation/TASKS.md
    ├── member-3-evaluation-feedback/TASKS.md
    └── member-4-integration-lead/TASKS.md
```

## Order of operations (important)

Everyone can start Day 1, but in this order of dependency:

1. **Member 4** creates the Neon database, publishes `DATABASE_URL` to the team, and pushes the mock JSON fixtures matching SPEC.md §5 — do this first, same day, so nobody else is blocked.
2. **Member 1, 2, 3** work in parallel all of Week 1. Member 1 builds against the mock JSON, not live endpoints yet.
3. **Week 2**: swap mocks for real API calls, Member 4 leads integration.
4. **Week 3**: accessibility testing, polish, deploy, record demo.

Full timeline is in SPEC.md §9.

## Tech stack (short version — see SPEC.md §2 for why)

- Frontend: React (Vite)
- Backend: Python + Flask
- Database: Neon (serverless Postgres)
- AI: Gemini API
- Voice: browser Speech Synthesis + Speech Recognition APIs
- Auth: none — see SPEC.md §7

## If you get stuck

Paste the relevant section of SPEC.md into your coding agent along with your error — the spec has the exact JSON shapes, schema, and file names everything should match, which is usually enough for the agent to self-correct.
