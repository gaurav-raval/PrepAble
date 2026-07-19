import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useSession } from "../context/AccessibilityContext";
import {
  mockResumeInsights,
  resumeQuestionTypes,
  type ResumeQuestionType,
} from "../data/mockData";

export const Route = createFileRoute("/resume")({
  head: () => ({
    meta: [
      { title: "Resume-Based Interview — PrepAble" },
      { name: "description", content: "Upload your resume and get an interview tailored to your real skills, projects and background." },
    ],
  }),
  component: ResumeFlow,
});

type Step = "upload" | "processing" | "insights" | "setup";

function ResumeFlow() {
  const session = useSession();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("upload");
  const [fileName, setFileName] = useState<string | null>(null);

  if (!session.profile) return <Navigate to="/auth" />;

  return (
    <div className="pa-stack">
      <header>
        <span className="pa-eyebrow">Resume-based interview</span>
        <h1 style={{ margin: "0.25rem 0" }}>
          {step === "upload" && "Upload your resume"}
          {step === "processing" && "Preparing your interview…"}
          {step === "insights" && "We found the following in your resume"}
          {step === "setup" && "Choose how you'd like to practice"}
        </h1>
        <p className="pa-muted">
          Nothing leaves your browser in this demo — we mock the AI parsing so you can preview the whole flow.
        </p>
      </header>

      <StepIndicator step={step} />

      {step === "upload" && (
        <Upload
          onFile={(name) => {
            setFileName(name);
            setStep("processing");
          }}
        />
      )}
      {step === "processing" && <Processing fileName={fileName} onDone={() => setStep("insights")} />}
      {step === "insights" && <Insights onContinue={() => setStep("setup")} />}
      {step === "setup" && (
        <Setup
          onStart={() => {
            session.setCategory("Resume");
            navigate({ to: "/interview" });
          }}
        />
      )}
    </div>
  );
}

function StepIndicator({ step }: { step: Step }) {
  const order: Step[] = ["upload", "processing", "insights", "setup"];
  const labels: Record<Step, string> = {
    upload: "Upload resume",
    processing: "Analyse & extract",
    insights: "Confirm insights",
    setup: "Choose questions",
  };
  const currentIdx = order.indexOf(step);
  return (
    <ol className="pa-steps" aria-label="Progress">
      {order.map((s, i) => {
        const state = i < currentIdx ? "done" : i === currentIdx ? "active" : "todo";
        return (
          <li key={s} className="pa-step" data-state={state} aria-current={state === "active" ? "step" : undefined}>
            <div className="mark" aria-hidden="true">{i < currentIdx ? "✓" : i + 1}</div>
            <div>
              <div style={{ fontWeight: 700 }}>{labels[s]}</div>
              <div className="pa-muted" style={{ fontSize: "0.9em" }}>
                {state === "done" ? "Complete" : state === "active" ? "In progress" : "Waiting"}
              </div>
            </div>
            <div className="pa-tag" aria-hidden="true">{`Step ${i + 1}`}</div>
          </li>
        );
      })}
    </ol>
  );
}

function Upload({ onFile }: { onFile: (name: string) => void }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <section className="pa-card" aria-labelledby="upl-title">
      <div className="pa-row" style={{ marginBottom: "0.75rem" }}>
        <span className="pa-tag accent">✨ Recommended feature</span>
        <span className="pa-tag sage">Most personalised</span>
      </div>
      <h2 id="upl-title">Drop your resume or choose a file</h2>
      <div
        className="pa-drop"
        data-drag={dragging || undefined}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const f = e.dataTransfer.files?.[0];
          if (f) onFile(f.name);
        }}
      >
        <div className="icon" aria-hidden="true">📄</div>
        <h3 style={{ margin: "0.5rem 0 0.25rem" }}>Drag & drop your resume here</h3>
        <p className="pa-muted">Or click below to browse your files</p>
        <div className="pa-row" style={{ justifyContent: "center", marginTop: "0.75rem" }}>
          <button type="button" className="pa-btn lg" onClick={() => inputRef.current?.click()}>
            Choose file
          </button>
          <button type="button" className="pa-btn secondary" onClick={() => onFile("Sample_Resume.pdf")}>
            Try with sample resume
          </button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,.txt"
          className="sr-only"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f.name); }}
        />
        <p className="pa-muted" style={{ marginTop: "1rem", marginBottom: 0 }}>
          Supported formats: <strong>PDF</strong>, <strong>DOCX</strong>, <strong>TXT</strong> · up to 5MB
        </p>
      </div>
    </section>
  );
}

function Processing({ fileName, onDone }: { fileName: string | null; onDone: () => void }) {
  const stages = [
    "Resume uploaded",
    "Skills identified",
    "Projects identified",
    "Experience identified",
    "Questions generated",
  ];
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (idx >= stages.length) {
      const t = setTimeout(onDone, 400);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setIdx((i) => i + 1), 700);
    return () => clearTimeout(t);
  }, [idx, onDone]);

  return (
    <section className="pa-card" aria-labelledby="proc-title" aria-live="polite">
      <h2 id="proc-title">Analysing {fileName ?? "your resume"}</h2>
      <ol className="pa-steps" style={{ marginTop: "1rem" }}>
        {stages.map((s, i) => (
          <li
            key={s}
            className="pa-step"
            data-state={i < idx ? "done" : i === idx ? "active" : "todo"}
          >
            <div className="mark" aria-hidden="true">{i < idx ? "✓" : i + 1}</div>
            <div style={{ fontWeight: 700 }}>{s}</div>
            <div className="pa-tag">
              {i < idx ? "Done" : i === idx ? "Working…" : "Waiting"}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Insights({ onContinue }: { onContinue: () => void }) {
  const r = mockResumeInsights;
  return (
    <div className="pa-stack">
      <section className="pa-card">
        <span className="pa-eyebrow">Candidate</span>
        <h2 style={{ margin: "0.25rem 0 0.25rem" }}>{r.name}</h2>
        <p className="pa-muted" style={{ margin: 0 }}>{r.headline}</p>
      </section>

      <section className="pa-card" aria-labelledby="sk-title">
        <h2 id="sk-title">Skills detected</h2>
        <div className="pa-chips" role="list">
          {r.skills.map((s) => <span key={s} className="pa-tag sage" role="listitem">{s}</span>)}
        </div>
      </section>

      <section className="pa-card" aria-labelledby="pr-title">
        <h2 id="pr-title">Projects</h2>
        <div className="pa-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
          {r.projects.map((p) => (
            <div key={p.title} className="pa-feature">
              <h3 style={{ margin: 0 }}>{p.title}</h3>
              <p className="pa-muted" style={{ marginBottom: 0 }}>{p.description}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="pa-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
        <section className="pa-card" aria-labelledby="ed-title">
          <h2 id="ed-title">Education</h2>
          <ul className="pa-list">{r.education.map((e) => <li key={e}>{e}</li>)}</ul>
        </section>
        <section className="pa-card" aria-labelledby="ce-title">
          <h2 id="ce-title">Certifications</h2>
          <ul className="pa-list">{r.certifications.map((c) => <li key={c}>{c}</li>)}</ul>
        </section>
      </div>

      <div className="pa-row" style={{ justifyContent: "flex-end" }}>
        <button type="button" className="pa-btn lg" onClick={onContinue}>Looks good — continue</button>
      </div>
    </div>
  );
}

function Setup({ onStart }: { onStart: () => void }) {
  const [types, setTypes] = useState<ResumeQuestionType[]>(["Resume Follow-Up", "Project-Based", "Behavioral"]);
  const [count, setCount] = useState<3 | 5 | 10>(5);
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");

  const toggle = (t: ResumeQuestionType) =>
    setTypes((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]));

  return (
    <div className="pa-stack">
      <section className="pa-card" aria-labelledby="qt-title">
        <h2 id="qt-title">Question types</h2>
        <p className="pa-muted">Pick any combination. We'll blend them into your session.</p>
        <div className="pa-chips" role="group" aria-label="Question types">
          {resumeQuestionTypes.map((t) => (
            <button key={t} type="button" className="pa-chip" aria-pressed={types.includes(t)} onClick={() => toggle(t)}>
              {t}
            </button>
          ))}
        </div>
      </section>

      <div className="pa-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
        <section className="pa-card" aria-labelledby="qc-title">
          <h2 id="qc-title">Number of questions</h2>
          <div className="pa-chips" role="group" aria-label="Question count">
            {([3, 5, 10] as const).map((n) => (
              <button key={n} type="button" className="pa-chip" aria-pressed={count === n} onClick={() => setCount(n)}>
                {n}
              </button>
            ))}
          </div>
        </section>
        <section className="pa-card" aria-labelledby="qd-title">
          <h2 id="qd-title">Difficulty</h2>
          <div className="pa-chips" role="group" aria-label="Difficulty">
            {(["Easy", "Medium", "Hard"] as const).map((d) => (
              <button key={d} type="button" className="pa-chip" aria-pressed={difficulty === d} onClick={() => setDifficulty(d)}>
                {d}
              </button>
            ))}
          </div>
        </section>
      </div>

      <div className="pa-row" style={{ justifyContent: "flex-end" }}>
        <button
          type="button"
          className="pa-btn lg"
          disabled={types.length === 0}
          onClick={onStart}
        >
          Start interview
        </button>
      </div>
    </div>
  );
}
