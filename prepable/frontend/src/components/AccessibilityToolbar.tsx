import { useEffect, useRef, useState } from "react";
import {
  useAccessibility,
  type FontFamily,
  type FontSize,
  type LetterSpacing,
  type LineSpacing,
  type ReadingWidth,
  type Theme,
} from "../context/AccessibilityContext";

// Sticky accessibility control panel available on every page.
export function AccessibilityToolbar() {
  const [open, setOpen] = useState(false);
  const a11y = useAccessibility();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // Global event: other UI (e.g. dashboard's Manage Accessibility button) can open the panel.
  useEffect(() => {
    const openHandler = () => setOpen(true);
    window.addEventListener("prepable:open-a11y", openHandler);
    return () => window.removeEventListener("prepable:open-a11y", openHandler);
  }, []);

  const fontFamilies: { key: FontFamily; label: string }[] = [
    { key: "opendyslexic", label: "OpenDyslexic" },
    { key: "lexend", label: "Lexend" },
    { key: "inter", label: "Inter" },
    { key: "system", label: "System" },
  ];
  const fontSizes: { key: FontSize; label: string }[] = [
    { key: "sm", label: "A-" },
    { key: "md", label: "A" },
    { key: "lg", label: "A+" },
    { key: "xl", label: "A++" },
  ];
  const themes: { key: Theme; label: string }[] = [
    { key: "default", label: "Calm Cream" },
    { key: "dyslexia", label: "Dyslexia" },
    { key: "hc-light", label: "HC Light" },
    { key: "hc-dark", label: "HC Dark" },
  ];
  const lineSpacings: { key: LineSpacing; label: string }[] = [
    { key: "normal", label: "Normal" },
    { key: "comfortable", label: "Comfy" },
    { key: "spacious", label: "Spacious" },
  ];
  const letterSpacings: { key: LetterSpacing; label: string }[] = [
    { key: "normal", label: "Normal" },
    { key: "increased", label: "Wider" },
    { key: "high", label: "Widest" },
  ];
  const readingWidths: { key: ReadingWidth; label: string }[] = [
    { key: "standard", label: "Standard" },
    { key: "reduced", label: "Narrower" },
  ];

  return (
    <>
      <button
        type="button"
        className="pa-a11y-fab"
        aria-expanded={open}
        aria-controls="pa-a11y-panel"
        aria-label={open ? "Close accessibility centre" : "Open accessibility centre"}
        onClick={() => setOpen((v) => !v)}
      >
        <span aria-hidden="true">♿</span>
      </button>

      {open && (
        <div
          id="pa-a11y-panel"
          className="pa-a11y-panel"
          role="dialog"
          aria-label="Accessibility Centre"
          ref={panelRef}
        >
          <div className="pa-between" style={{ marginBottom: "0.5rem" }}>
            <div>
              <span className="pa-eyebrow">Accessibility Centre</span>
              <h2 style={{ margin: 0 }}>Adjust to your mind</h2>
            </div>
            <button type="button" className="pa-chip" onClick={() => setOpen(false)} aria-label="Close">✕</button>
          </div>

          <div className="pa-a11y-section">
            <h3 className="pa-a11y-heading">Appearance</h3>
            <ChipGroup label="Font family" value={a11y.fontFamily} options={fontFamilies} onChange={a11y.setFontFamily} />
            <ChipGroup label="Font size" value={a11y.fontSize} options={fontSizes} onChange={a11y.setFontSize} />
            <ChipGroup label="Theme" value={a11y.theme} options={themes} onChange={a11y.setTheme} />
          </div>

          <div className="pa-a11y-section">
            <h3 className="pa-a11y-heading">Reading accessibility</h3>
            <ChipGroup label="Line spacing" value={a11y.lineSpacing} options={lineSpacings} onChange={a11y.setLineSpacing} />
            <ChipGroup label="Letter spacing" value={a11y.letterSpacing} options={letterSpacings} onChange={a11y.setLetterSpacing} />
            <ChipGroup label="Reading width" value={a11y.readingWidth} options={readingWidths} onChange={a11y.setReadingWidth} />
          </div>

          <div className="pa-a11y-section">
            <h3 className="pa-a11y-heading">Interview accessibility</h3>
            <label className="pa-switch">
              <span>Simplify questions by default</span>
              <input
                type="checkbox"
                checked={a11y.interview.simplifyByDefault}
                onChange={(e) => a11y.setInterview({ simplifyByDefault: e.target.checked })}
              />
            </label>
            <label className="pa-switch">
              <span>Auto read questions aloud</span>
              <input
                type="checkbox"
                checked={a11y.interview.autoReadQuestions}
                onChange={(e) => a11y.setInterview({ autoReadQuestions: e.target.checked })}
              />
            </label>
            <label className="pa-switch">
              <span>STAR guidance by default</span>
              <input
                type="checkbox"
                checked={a11y.interview.starGuidance}
                onChange={(e) => a11y.setInterview({ starGuidance: e.target.checked })}
              />
            </label>
          </div>

          <div className="pa-a11y-section">
            <h3 className="pa-a11y-heading">Motion</h3>
            <label className="pa-switch">
              <span>Reduce motion</span>
              <input
                type="checkbox"
                checked={a11y.motion === "reduced"}
                onChange={(e) => a11y.setMotion(e.target.checked ? "reduced" : "standard")}
              />
            </label>
          </div>

          <div className="pa-a11y-section">
            <h3 className="pa-a11y-heading">Live preview</h3>
            <div className="pa-card" style={{ padding: "0.75rem" }}>
              <div className="pa-tag primary" style={{ marginBottom: "0.5rem" }}>Behavioural · Medium</div>
              <p style={{ margin: 0 }}>
                Tell me about a time you led a team through a difficult challenge. Focus on what you did and what changed as a result.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ChipGroup<T extends string>({
  label, value, options, onChange,
}: {
  label: string;
  value: T;
  options: { key: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <fieldset className="pa-a11y-group">
      <legend>{label}</legend>
      <div className="pa-chips" role="group" aria-label={label}>
        {options.map((o) => (
          <button
            type="button"
            key={o.key}
            className="pa-chip"
            aria-pressed={value === o.key}
            onClick={() => onChange(o.key)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
