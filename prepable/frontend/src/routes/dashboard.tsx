import { createFileRoute, useNavigate, Navigate } from "@tanstack/react-router";
import { useAccessibility, useSession } from "../context/AccessibilityContext";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — PrepAble" },
      { name: "description", content: "Pick an interview mode and start practicing with accessibility helpers on." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const session = useSession();
  const a11y = useAccessibility();
  const navigate = useNavigate();

  if (!session.profile) return <Navigate to="/auth" />;

  const openA11y = () => {
    if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("prepable:open-a11y"));
  };

  const fontLabel: Record<string, string> = {
    opendyslexic: "OpenDyslexic",
    lexend: "Lexend",
    inter: "Inter",
    system: "System default",
  };
  const themeLabel: Record<string, string> = {
    default: "Calm Cream (default)",
    dyslexia: "Dyslexia Friendly",
    "hc-light": "High Contrast Light",
    "hc-dark": "High Contrast Dark",
  };

  return (
    <div className="pa-stack">
      <header className="pa-card raised">
        <span className="pa-eyebrow">Welcome back</span>
        <h1 style={{ margin: "0.25rem 0 0.5rem" }}>Hi {session.profile.name} 👋</h1>
        <div className="pa-row">
          <span className="pa-tag primary">Preparing for: {session.profile.role}</span>
          <span className="pa-tag sage">Experience: {session.profile.experience}</span>
        </div>
      </header>

      <section aria-labelledby="mode-title" className="pa-stack">
        <div>
          <span className="pa-eyebrow">Step 1</span>
          <h2 id="mode-title">Choose an interview mode</h2>
        </div>
        <div className="pa-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
          <button
            type="button"
            className="pa-mode featured"
            onClick={() => { session.setCategory("HR"); navigate({ to: "/interview" }); }}
          >
            <span className="pa-tag primary" style={{ alignSelf: "flex-start" }}>Full Session</span>
            <div className="icon" aria-hidden="true">💼</div>
            <h3>Standard Interview</h3>
            <p className="pa-muted" style={{ margin: 0 }}>
              Complete interview simulation with multiple questions, progress tracking, session score and a final report.
            </p>
            <ul className="pa-list" style={{ margin: "0.5rem 0 0" }}>
              <li>5 Questions</li>
              <li>10–15 Minutes</li>
              <li>AI Evaluation</li>
              <li>Final Report</li>
            </ul>
          </button>

          <button
            type="button"
            className="pa-mode featured"
            onClick={() => navigate({ to: "/resume" })}
          >
            <span className="pa-tag accent" style={{ alignSelf: "flex-start" }}>Recommended</span>
            <div className="icon" aria-hidden="true">📄</div>
            <h3>Resume-Based Interview</h3>
            <p className="pa-muted" style={{ margin: 0 }}>
              Upload your resume — we generate questions from your real skills, projects and experience.
            </p>
            <span className="pa-tag" style={{ marginTop: "auto" }}>Personalised · Premium</span>
          </button>

          <button
            type="button"
            className="pa-mode"
            onClick={() => { session.setCategory("Quick"); navigate({ to: "/interview" }); }}
          >
            <span className="pa-tag sage" style={{ alignSelf: "flex-start" }}>Quick Warm-Up</span>
            <div className="icon" aria-hidden="true">⚡</div>
            <h3>Quick Practice</h3>
            <p className="pa-muted" style={{ margin: 0 }}>
              A single, low-pressure question with instant feedback. No full session, no report — perfect for a quick warm-up.
            </p>
            <ul className="pa-list" style={{ margin: "0.5rem 0 0" }}>
              <li>1 Question</li>
              <li>1–3 Minutes</li>
              <li>Instant feedback</li>
            </ul>
          </button>
        </div>
      </section>

      <section aria-labelledby="a11y-title" className="pa-card accent-border">
        <div className="pa-between">
          <div>
            <span className="pa-eyebrow">Your accessibility profile</span>
            <h2 id="a11y-title" style={{ margin: "0.25rem 0 0" }}>Interview will adapt to you</h2>
          </div>
          <button type="button" className="pa-btn secondary" onClick={openA11y}>Manage Accessibility</button>
        </div>
        <div className="pa-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", marginTop: "1rem" }}>
          <Stat label="Font" value={fontLabel[a11y.fontFamily]} />
          <Stat label="Theme" value={themeLabel[a11y.theme]} />
          <Stat label="Simplify by default" value={a11y.interview.simplifyByDefault ? "On" : "Off"} />
          <Stat label="Auto read aloud" value={a11y.interview.autoReadQuestions ? "On" : "Off"} />
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="pa-eyebrow">{label}</div>
      <div style={{ fontWeight: 700, marginTop: 4 }}>{value}</div>
    </div>
  );
}
