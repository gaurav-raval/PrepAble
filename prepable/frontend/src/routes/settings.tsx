import { createFileRoute } from "@tanstack/react-router";
import {
  useAccessibility,
  type FontFamily, type FontSize, type LetterSpacing,
  type LineSpacing, type ReadingWidth, type Motion, type Theme,
} from "../context/AccessibilityContext";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Accessibility Settings — PrepAble" },
      { name: "description", content: "Personalise fonts, spacing, contrast and interview helpers to match how you read and focus best." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const a = useAccessibility();

  return (
    <div className="pa-stack">
      <header>
        <span className="pa-eyebrow">Accessibility</span>
        <h1 style={{ margin: "0.25rem 0" }}>Make PrepAble work the way you do</h1>
        <p className="pa-muted" style={{ maxWidth: "60ch" }}>
          Every setting below applies instantly across the whole app and is remembered on this device.
          There are no wrong answers — pick what feels calmest to read.
        </p>
      </header>

      <div className="pa-grid" style={{ gridTemplateColumns: "minmax(0, 1fr) minmax(280px, 380px)", alignItems: "start" }}>
        <div className="pa-stack">
          <Section title="Appearance" eyebrow="Look and feel">
            <ChipRow<Theme>
              label="Theme"
              value={a.theme}
              onChange={a.setTheme}
              options={[
                { key: "default", label: "Calm Cream (default)" },
                { key: "dyslexia", label: "Dyslexia Friendly" },
                { key: "hc-light", label: "High Contrast Light" },
                { key: "hc-dark", label: "High Contrast Dark" },
              ]}
            />
            <ChipRow<FontFamily>
              label="Font family"
              value={a.fontFamily}
              onChange={a.setFontFamily}
              options={[
                { key: "opendyslexic", label: "OpenDyslexic (default)" },
                { key: "lexend", label: "Lexend" },
                { key: "inter", label: "Inter" },
                { key: "system", label: "System default" },
              ]}
            />
            <ChipRow<FontSize>
              label="Font size"
              value={a.fontSize}
              onChange={a.setFontSize}
              options={[
                { key: "sm", label: "Small" },
                { key: "md", label: "Medium" },
                { key: "lg", label: "Large" },
                { key: "xl", label: "Extra Large" },
              ]}
            />
          </Section>

          <Section title="Reading accessibility" eyebrow="Spacing & flow">
            <ChipRow<LineSpacing>
              label="Line spacing"
              value={a.lineSpacing}
              onChange={a.setLineSpacing}
              options={[
                { key: "normal", label: "Normal" },
                { key: "comfortable", label: "Comfortable" },
                { key: "spacious", label: "Spacious" },
              ]}
            />
            <ChipRow<LetterSpacing>
              label="Letter spacing"
              value={a.letterSpacing}
              onChange={a.setLetterSpacing}
              options={[
                { key: "normal", label: "Normal" },
                { key: "increased", label: "Increased" },
                { key: "high", label: "High" },
              ]}
            />
            <ChipRow<ReadingWidth>
              label="Reading width"
              value={a.readingWidth}
              onChange={a.setReadingWidth}
              options={[
                { key: "standard", label: "Standard" },
                { key: "reduced", label: "Narrower (easier focus)" },
              ]}
            />
            <ChipRow<Motion>
              label="Motion"
              value={a.motion}
              onChange={a.setMotion}
              options={[
                { key: "standard", label: "Standard" },
                { key: "reduced", label: "Reduced motion" },
              ]}
            />
          </Section>

          <Section title="Interview accessibility" eyebrow="How the interview behaves">
            <label className="pa-switch">
              <span>Auto read questions aloud</span>
              <input
                type="checkbox"
                checked={a.interview.autoReadQuestions}
                onChange={(e) => a.setInterview({ autoReadQuestions: e.target.checked })}
              />
            </label>
            <label className="pa-switch">
              <span>Simplify questions by default</span>
              <input
                type="checkbox"
                checked={a.interview.simplifyByDefault}
                onChange={(e) => a.setInterview({ simplifyByDefault: e.target.checked })}
              />
            </label>
            <label className="pa-switch">
              <span>Show STAR answer guidance</span>
              <input
                type="checkbox"
                checked={a.interview.starGuidance}
                onChange={(e) => a.setInterview({ starGuidance: e.target.checked })}
              />
            </label>
            <label className="pa-switch">
              <span>Reduce visual distractions</span>
              <input
                type="checkbox"
                checked={a.interview.reduceDistractions}
                onChange={(e) => a.setInterview({ reduceDistractions: e.target.checked })}
              />
            </label>
          </Section>

          <div className="pa-row" style={{ justifyContent: "flex-end" }}>
            <button type="button" className="pa-btn secondary" onClick={a.reset}>Reset to defaults</button>
          </div>
        </div>

        <aside aria-label="Live preview" style={{ position: "sticky", top: "5rem" }}>
          <div className="pa-card raised">
            <span className="pa-eyebrow">Live preview</span>
            <h3 style={{ margin: "0.35rem 0 0.75rem" }}>Sample interview question</h3>
            <div className="pa-tag primary" style={{ marginBottom: "0.75rem" }}>Behavioural · Medium</div>
            <p style={{ margin: 0 }}>
              Tell me about a time you led a team through a difficult challenge.
              Focus on what you did, how you supported others, and what changed as a result.
            </p>
            <hr className="pa-divider" />
            <p className="pa-muted" style={{ marginBottom: 0 }}>
              This preview updates instantly as you change settings on the left,
              so you can find what feels calmest before starting an interview.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Section({ title, eyebrow, children }: { title: string; eyebrow: string; children: React.ReactNode }) {
  return (
    <section className="pa-card" aria-labelledby={`sec-${title}`}>
      <span className="pa-eyebrow">{eyebrow}</span>
      <h2 id={`sec-${title}`} style={{ margin: "0.25rem 0 1rem" }}>{title}</h2>
      <div className="pa-stack">{children}</div>
    </section>
  );
}

function ChipRow<T extends string>({
  label, value, options, onChange,
}: {
  label: string;
  value: T;
  options: { key: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
      <legend style={{ fontWeight: 700, marginBottom: "0.4rem" }}>{label}</legend>
      <div className="pa-chips" role="group" aria-label={label}>
        {options.map((o) => (
          <button
            key={o.key}
            type="button"
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
