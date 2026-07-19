import type { Feedback } from "../data/mockData";

interface Props {
  feedback: Feedback;
}

// Renders scores, STAR analysis, strengths, improvements, recruiter view, and improved answer.
export function FeedbackPanel({ feedback }: Props) {
  const { scores, star, strengths, improvements, recruiter, improvedAnswer } = feedback;

  return (
    <div className="pa-stack">
      {/* Overall score hero */}
      <section className="pa-card raised" aria-labelledby="ov-title">
        <div className="pa-between">
          <div>
            <span className="pa-eyebrow">Overall score</span>
            <h2 id="ov-title" style={{ margin: "0.25rem 0" }}>You scored {scores.overall} / 100</h2>
            <p className="pa-muted" style={{ margin: 0 }}>
              Strong answer overall — see the breakdown and improved version below.
            </p>
          </div>
          <div
            aria-hidden="true"
            style={{
              width: 110, height: 110, borderRadius: "50%",
              display: "grid", placeItems: "center",
              background: `conic-gradient(var(--pa-primary) ${scores.overall * 3.6}deg, var(--pa-surface-3) 0)`,
              boxShadow: "inset 0 0 0 8px var(--pa-surface)",
            }}
          >
            <div style={{ fontWeight: 800, fontSize: "1.75rem" }}>{scores.overall}</div>
          </div>
        </div>
      </section>

      {/* Score breakdown */}
      <section className="pa-card" aria-labelledby="sb-title">
        <h2 id="sb-title">Score breakdown</h2>
        <Meter label="Relevance" value={scores.relevance} max={10} />
        <Meter label="Clarity" value={scores.clarity} max={10} />
        <Meter label="Professionalism" value={scores.professionalism} max={10} />
        <Meter label="STAR structure" value={scores.starStructure} max={10} />
      </section>

      {/* STAR */}
      <section className="pa-card" aria-labelledby="star-title">
        <h2 id="star-title">STAR structure</h2>
        <p className="pa-muted">A well-rounded answer covers all four elements.</p>
        <div className="pa-star" role="list">
          {(Object.keys(star) as (keyof typeof star)[]).map((k) => {
            const ok = star[k];
            return (
              <span key={k} role="listitem" className={`item ${ok ? "ok" : "warn"}`} aria-label={`${k}: ${ok ? "present" : "missing"}`}>
                <span aria-hidden="true">{ok ? "✔" : "⚠"}</span> {k}
              </span>
            );
          })}
        </div>
      </section>

      <div className="pa-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
        <section className="pa-card" aria-labelledby="str-title">
          <h2 id="str-title">Strengths</h2>
          <ul className="pa-list">{strengths.map((s) => <li key={s}>{s}</li>)}</ul>
        </section>
        <section className="pa-card" aria-labelledby="imp-title">
          <h2 id="imp-title">Improvements</h2>
          <ul className="pa-list">{improvements.map((s) => <li key={s}>{s}</li>)}</ul>
        </section>
      </div>

      {/* Recruiter perspective - highlighted */}
      <section className="pa-recruiter" aria-labelledby="rec-title" role="region">
        <h3 id="rec-title">🧭 Recruiter perspective</h3>
        <p><strong>What they liked:</strong> {recruiter.strength}</p>
        <p style={{ marginBottom: 0 }}><strong>What worried them:</strong> {recruiter.concern}</p>
      </section>

      {/* Improved answer */}
      <section className="pa-card accent-border" aria-labelledby="imp-a-title">
        <span className="pa-eyebrow">Learn from this</span>
        <h2 id="imp-a-title" style={{ margin: "0.25rem 0 0.5rem" }}>An improved version of your answer</h2>
        <p style={{ marginBottom: 0 }}>{improvedAnswer}</p>
      </section>
    </div>
  );
}

function Meter({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="pa-meter" aria-label={`${label}: ${value} out of ${max}`}>
      <div className="label">{label}</div>
      <div className="bar" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}>
        <span style={{ width: `${pct}%` }} />
      </div>
      <div className="val">{value}/{max}</div>
    </div>
  );
}
