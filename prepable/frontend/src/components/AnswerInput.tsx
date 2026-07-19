import { useEffect, useState } from "react";
import { useAccessibility, useSession, useSpeechRecognition } from "../context/AccessibilityContext";

interface Props {
  onSubmit: (answer: string) => void;
}

// Answer capture with a Text / Voice tab switcher.
export function AnswerInput({ onSubmit }: Props) {
  const a11y = useAccessibility();
  const session = useSession();
  const [tab, setTab] = useState<"text" | "voice">("text");
  const [text, setText] = useState("");
  const rec = useSpeechRecognition();

  useEffect(() => {
    if (tab === "voice" && rec.transcript) setText(rec.transcript);
  }, [tab, rec.transcript]);

  const words = text.trim().length === 0 ? 0 : text.trim().split(/\s+/).length;

  return (
    <section className="pa-card" aria-label="Your answer">
      <div className="pa-between" style={{ marginBottom: "0.75rem" }}>
        <div className="pa-tabs" role="tablist" aria-label="Answer mode">
          <button role="tab" aria-selected={tab === "text"} onClick={() => setTab("text")} type="button">✏️ Text</button>
          <button role="tab" aria-selected={tab === "voice"} onClick={() => setTab("voice")} type="button">🎙️ Voice</button>
        </div>
        <span className="pa-tag" aria-live="polite">{words} words</span>
      </div>

      {a11y.interview.starGuidance && (
        <details className="pa-star-guide" style={{ marginBottom: "1rem" }}>
          <summary>💡 STAR helper — click for a gentle prompt</summary>
          <dl>
            <dt>Situation</dt><dd>Where were you? Set the scene in one sentence.</dd>
            <dt>Task</dt><dd>What were you responsible for?</dd>
            <dt>Action</dt><dd>What did <em>you</em> do — steps, decisions, tools?</dd>
            <dt>Result</dt><dd>What changed? Add a number if you can.</dd>
          </dl>
        </details>
      )}

      {tab === "text" && (
        <div className="pa-field">
          <label htmlFor="answer">Type your response</label>
          <textarea
            id="answer"
            className="pa-textarea"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Take your time. Structure with STAR: Situation, Task, Action, Result."
          />
        </div>
      )}

      {tab === "voice" && (
        <div className="pa-stack">
          {!rec.supported && (
            <p role="alert" className="pa-muted">
              Voice input isn't supported in this browser. Please use the Text tab.
            </p>
          )}
          <div className="pa-row" aria-live="polite">
            {!rec.listening ? (
              <button type="button" className="pa-mic" onClick={() => { rec.start(); session.bumpUsage("voiceAnswers"); }} disabled={!rec.supported} aria-label="Start recording your answer">
                🎙️ Start recording
              </button>
            ) : (
              <button type="button" className="pa-mic rec" onClick={rec.stop} aria-label="Stop recording">
                <span className="dot" aria-hidden="true" /> Recording — tap to stop
              </button>
            )}
          </div>
          <div className="pa-field">
            <label htmlFor="transcript">Transcript</label>
            <textarea
              id="transcript"
              className="pa-textarea"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Your spoken words will appear here. You can also edit them."
            />
          </div>
        </div>
      )}

      <div className="pa-row" style={{ marginTop: "1rem", justifyContent: "space-between" }}>
        <div className="pa-row">
          <button type="button" className="pa-btn ghost" onClick={() => setText("")} disabled={!text}>Clear</button>
          <button type="button" className="pa-btn ghost" onClick={() => {/* mock draft save */}} disabled={!text}>💾 Save draft</button>
        </div>
        <button type="button" className="pa-btn lg" onClick={() => onSubmit(text)} disabled={!text.trim()}>
          Submit answer
        </button>
      </div>
    </section>
  );
}
