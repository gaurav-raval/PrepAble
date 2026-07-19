import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useAccessibility, useSession, useSpeech } from "../context/AccessibilityContext";
import type { Question } from "../data/mockData";

interface Props {
  question: Question;
  index: number;
  total: number;
}

// Shows the current interview question with Simplify / Read Aloud helpers.
export function QuestionCard({ question, index, total }: Props) {
  const a11y = useAccessibility();
  const { speak, stop } = useSpeech();
  const session = useSession();
  const [simplified, setSimplified] = useState(a11y.interview.simplifyByDefault);
  const text = simplified ? question.simplified : question.text;

  // If user changes the default preference, respect it on new questions.
  useEffect(() => { setSimplified(a11y.interview.simplifyByDefault); }, [question.id, a11y.interview.simplifyByDefault]);

  // Auto read-aloud when enabled.
  useEffect(() => {
    if (a11y.interview.autoReadQuestions) {
      speak(text);
      session.bumpUsage("readAloudCount");
    }
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question.id, a11y.interview.autoReadQuestions, simplified]);

  const progressPct = ((index + 1) / total) * 100;

  return (
    <section className="pa-card raised" aria-labelledby="q-title">
      <div className="pa-between" style={{ marginBottom: "0.75rem" }}>
        <div className="pa-row">
          <span className="pa-tag primary">Question {index + 1} of {total}</span>
          <span className="pa-tag">{question.category}</span>
          <span className="pa-tag accent">{question.difficulty}</span>
        </div>
        <Link to="/settings" className="pa-tag" aria-label="Adjust accessibility settings">⚙️ Adjust</Link>
      </div>

      <div
        className="pa-progress"
        role="progressbar"
        aria-valuenow={index + 1}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-label={`Question ${index + 1} of ${total}`}
        style={{ marginBottom: "1rem" }}
      >
        <span style={{ width: `${progressPct}%` }} />
      </div>

      <h2 id="q-title" style={{ marginTop: 0, fontSize: "clamp(1.3rem, 2.4vw, 1.7rem)" }}>{text}</h2>

      <div className="pa-row" role="group" aria-label="Question helpers">
        <button
          type="button"
          className="pa-btn secondary"
          aria-pressed={simplified}
          onClick={() => {
            setSimplified((v) => {
              const next = !v;
              if (next) session.bumpUsage("simplifyCount");
              return next;
            });
          }}
        >
          🪄 {simplified ? "Show original" : "Simplify question"}
        </button>
        <button
          type="button"
          className="pa-btn secondary"
          onClick={() => { speak(text); session.bumpUsage("readAloudCount"); }}
          aria-label="Read the question aloud"
        >
          🔊 Read aloud
        </button>
        <button type="button" className="pa-btn ghost" onClick={stop} aria-label="Pause reading">
          ⏸ Pause
        </button>
      </div>
    </section>
  );
}
