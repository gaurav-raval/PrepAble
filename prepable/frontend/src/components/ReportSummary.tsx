import { useSession } from "../context/AccessibilityContext";
import type { Report } from "../data/mockData";

// Final summary rendered on the Report page.
export function ReportSummary({ report }: { report: Report }) {
  const session = useSession();
  const { a11yUsage } = session;

  return (
    <div className="pa-stack">
      <section className="pa-card raised" aria-labelledby="ov-title">
        <div className="pa-between">
          <div>
            <span className="pa-eyebrow">Overall score</span>
            <h2 id="ov-title" style={{ margin: "0.25rem 0" }}>{report.overall} / 100</h2>
            <p className="pa-muted" style={{ margin: 0 }}>Strong session — see where to focus next.</p>
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div className="pa-progress" role="progressbar" aria-valuenow={report.overall} aria-valuemin={0} aria-valuemax={100} aria-label="Overall interview score">
              <span style={{ width: `${report.overall}%` }} />
            </div>
          </div>
        </div>
      </section>

      <div className="pa-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
        <section className="pa-card" aria-labelledby="rs-title">
          <h2 id="rs-title">Strength areas</h2>
          <ul className="pa-list">{report.strengths.map((s) => <li key={s}>{s}</li>)}</ul>
        </section>
        <section className="pa-card" aria-labelledby="ri-title">
          <h2 id="ri-title">Improvement areas</h2>
          <ul className="pa-list">{report.improvements.map((s) => <li key={s}>{s}</li>)}</ul>
        </section>
      </div>

      <section className="pa-card accent-border" aria-labelledby="rr-title">
        <span className="pa-eyebrow">Next steps</span>
        <h2 id="rr-title" style={{ margin: "0.25rem 0 0.5rem" }}>Recommended actions</h2>
        <ul className="pa-list">{report.recommendations.map((s) => <li key={s}>{s}</li>)}</ul>
      </section>

      {/* Accessibility reflection */}
      <section className="pa-card" aria-labelledby="ra-title" style={{ borderTop: "6px solid var(--pa-secondary)" }}>
        <span className="pa-eyebrow">Accessibility reflection</span>
        <h2 id="ra-title" style={{ margin: "0.25rem 0 0.5rem" }}>Tools that helped you today</h2>
        <div className="pa-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
          <UsageCard label="Simplified questions" value={a11yUsage.simplifyCount} suffix="times" />
          <UsageCard label="Read aloud used" value={a11yUsage.readAloudCount} suffix="times" />
          <UsageCard label="Voice answers" value={a11yUsage.voiceAnswers} suffix="answers" />
        </div>
        <p className="pa-muted" style={{ marginTop: "1rem", marginBottom: 0 }}>
          Using accessibility tools is a strength, not a workaround. Keep the settings that work for you.
        </p>
      </section>
    </div>
  );
}

function UsageCard({ label, value, suffix }: { label: string; value: number; suffix: string }) {
  return (
    <div className="pa-score">
      <div className="n">{value}</div>
      <div className="l">{label} · {suffix}</div>
    </div>
  );
}
