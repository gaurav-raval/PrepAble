import { createFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PrepAble — Interview practice built for every mind" },
      { name: "description", content: "Accessible AI interview coaching designed for neurodiverse job seekers — ADHD, Dyslexia, Autism, and Social Anxiety friendly." },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  const navigate = useNavigate();
  const go = () => navigate({ to: "/auth" });

  return (
    <div className="pa-stack">
      <Hero onCta={go} />
      <Features />
      <WhyPrepAble />
      <FinalCta onCta={go} />
    </div>
  );
}

function Hero({ onCta }: { onCta: () => void }) {
  return (
    <section className="pa-hero" aria-labelledby="hero-title">
      <span className="pa-eyebrow">Accessibility-first · Built with neurodiverse users</span>
      <h1 id="hero-title" style={{ marginTop: "0.6rem" }}>
        Interview practice built for <span style={{ color: "var(--pa-primary)" }}>every mind</span>.
      </h1>
      <p className="lead">
        PrepAble is an accessible AI interview coach designed for neurodiverse job seekers.
        Calmer questions, clearer feedback, and accessibility choices baked into every screen.
      </p>
      <div className="pa-badges" role="list" aria-label="Designed for">
        <span className="pa-tag sage" role="listitem">🧠 ADHD friendly</span>
        <span className="pa-tag sage" role="listitem">📖 Dyslexia friendly</span>
        <span className="pa-tag sage" role="listitem">🌱 Autism friendly</span>
        <span className="pa-tag sage" role="listitem">🕊️ Social Anxiety friendly</span>
      </div>
      <div className="pa-row">
        <button type="button" className="pa-btn lg" onClick={onCta}>Start Practicing</button>
      </div>
    </section>
  );
}

function Features() {
  const items = [
    { icon: "🪄", title: "Simplify Questions", body: "Complex interview questions rewritten into clearer, calmer language." },
    { icon: "🔊", title: "Read Aloud", body: "Any question can be spoken aloud at a comfortable pace." },
    { icon: "🎙️", title: "Voice Answers", body: "Practice by speaking your answer — great for reading-heavy days." },
    { icon: "💡", title: "AI Feedback", body: "Understand why an answer works and get an improved version to learn from." },
  ];
  return (
    <section aria-labelledby="feat-title" className="pa-stack">
      <div>
        <span className="pa-eyebrow">Accessibility features</span>
        <h2 id="feat-title">Four accessibility superpowers</h2>
      </div>
      <div className="pa-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
        {items.map((it) => (
          <article key={it.title} className="pa-feature">
            <div className="icon" aria-hidden="true">{it.icon}</div>
            <h3>{it.title}</h3>
            <p className="pa-muted" style={{ marginBottom: 0 }}>{it.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function WhyPrepAble() {
  const items = [
    { k: "Simplified questions", v: "Complex prompts rewritten into calmer, clearer language you can actually parse." },
    { k: "Accessibility-first design", v: "OpenDyslexic, calm cream theme, spacing and motion controls on every screen." },
    { k: "STAR guidance", v: "Behavioural answers scaffolded with Situation, Task, Action, Result prompts." },
    { k: "Recruiter-style feedback", v: "Honest, constructive AI feedback with an improved version to learn from." },
    { k: "Resume-based interviews", v: "Upload your resume — get questions from your real skills, projects and experience." },
  ];
  return (
    <section aria-labelledby="why-title" className="pa-card raised">
      <span className="pa-eyebrow">Why PrepAble</span>
      <h2 id="why-title" style={{ margin: "0.25rem 0 1rem" }}>Practice that adapts to how you think.</h2>
      <div className="pa-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
        {items.map((i) => (
          <div key={i.k}>
            <div className="pa-eyebrow">{i.k}</div>
            <p className="pa-muted" style={{ margin: "0.25rem 0 0" }}>{i.v}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function FinalCta({ onCta }: { onCta: () => void }) {
  return (
    <section className="pa-card raised" style={{ textAlign: "center" }}>
      <h2 style={{ margin: 0 }}>Ready to start?</h2>
      <p className="pa-muted" style={{ maxWidth: "50ch", margin: "0.5rem auto 1rem" }}>
        Create a free profile and jump into a calm, accessible interview practice session.
      </p>
      <button type="button" className="pa-btn lg" onClick={onCta}>Start Practicing</button>
    </section>
  );
}
