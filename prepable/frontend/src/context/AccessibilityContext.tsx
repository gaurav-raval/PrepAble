import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

// ---------- Accessibility preferences ----------
export type FontFamily = "opendyslexic" | "lexend" | "inter" | "system";
export type FontSize = "sm" | "md" | "lg" | "xl";
export type LetterSpacing = "normal" | "increased" | "high";
export type LineSpacing = "normal" | "comfortable" | "spacious";
export type ReadingWidth = "standard" | "reduced";
export type Motion = "standard" | "reduced";
export type Theme = "default" | "hc-light" | "hc-dark" | "dyslexia";

export interface InterviewPrefs {
  autoReadQuestions: boolean;
  simplifyByDefault: boolean;
  starGuidance: boolean;
  reduceDistractions: boolean;
}

interface AccessibilityState {
  fontFamily: FontFamily;
  fontSize: FontSize;
  letterSpacing: LetterSpacing;
  lineSpacing: LineSpacing;
  readingWidth: ReadingWidth;
  motion: Motion;
  theme: Theme;
  interview: InterviewPrefs;
  setFontFamily: (v: FontFamily) => void;
  setFontSize: (v: FontSize) => void;
  setLetterSpacing: (v: LetterSpacing) => void;
  setLineSpacing: (v: LineSpacing) => void;
  setReadingWidth: (v: ReadingWidth) => void;
  setMotion: (v: Motion) => void;
  setTheme: (v: Theme) => void;
  setInterview: (patch: Partial<InterviewPrefs>) => void;
  reset: () => void;
}

const AccessibilityContext = createContext<AccessibilityState | null>(null);

// ---------- Session state ----------
interface UserProfile {
  name: string;
  email?: string;
  role: string;
  experience: string;
}

interface SessionState {
  profile: UserProfile | null;
  category: string | null;
  setProfile: (p: UserProfile) => void;
  setCategory: (c: string) => void;
  // Stats used for the report's accessibility reflection card.
  a11yUsage: { simplifyCount: number; readAloudCount: number; voiceAnswers: number };
  bumpUsage: (k: keyof SessionState["a11yUsage"]) => void;
  resetUsage: () => void;
}
const SessionContext = createContext<SessionState | null>(null);

const DEFAULT_PREFS = {
  fontFamily: "opendyslexic" as FontFamily,
  fontSize: "md" as FontSize,
  letterSpacing: "normal" as LetterSpacing,
  lineSpacing: "comfortable" as LineSpacing,
  readingWidth: "standard" as ReadingWidth,
  motion: "standard" as Motion,
  theme: "default" as Theme,
  interview: {
    autoReadQuestions: false,
    simplifyByDefault: false,
    starGuidance: true,
    reduceDistractions: false,
  } as InterviewPrefs,
};

const STORAGE_KEY = "prepable.a11y.v2";

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [fontFamily, setFontFamily] = useState<FontFamily>(DEFAULT_PREFS.fontFamily);
  const [fontSize, setFontSize] = useState<FontSize>(DEFAULT_PREFS.fontSize);
  const [letterSpacing, setLetterSpacing] = useState<LetterSpacing>(DEFAULT_PREFS.letterSpacing);
  const [lineSpacing, setLineSpacing] = useState<LineSpacing>(DEFAULT_PREFS.lineSpacing);
  const [readingWidth, setReadingWidth] = useState<ReadingWidth>(DEFAULT_PREFS.readingWidth);
  const [motion, setMotion] = useState<Motion>(DEFAULT_PREFS.motion);
  const [theme, setTheme] = useState<Theme>(DEFAULT_PREFS.theme);
  const [interview, setInterviewState] = useState<InterviewPrefs>(DEFAULT_PREFS.interview);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [a11yUsage, setA11yUsage] = useState({ simplifyCount: 0, readAloudCount: 0, voiceAnswers: 0 });

  // Hydrate from localStorage after mount (avoids SSR hydration mismatch).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const s = JSON.parse(raw);
      if (s.fontFamily) setFontFamily(s.fontFamily);
      if (s.fontSize) setFontSize(s.fontSize);
      if (s.letterSpacing) setLetterSpacing(s.letterSpacing);
      if (s.lineSpacing) setLineSpacing(s.lineSpacing);
      if (s.readingWidth) setReadingWidth(s.readingWidth);
      if (s.motion) setMotion(s.motion);
      if (s.theme) setTheme(s.theme);
      if (s.interview) setInterviewState({ ...DEFAULT_PREFS.interview, ...s.interview });
    } catch {
      /* ignore */
    }
  }, []);

  // Persist.
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ fontFamily, fontSize, letterSpacing, lineSpacing, readingWidth, motion, theme, interview }),
      );
    } catch {
      /* ignore */
    }
  }, [fontFamily, fontSize, letterSpacing, lineSpacing, readingWidth, motion, theme, interview]);

  // Reflect settings on <html> so global CSS can react.
  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.dataset.fontFamily = fontFamily;
    root.dataset.fontSize = fontSize;
    root.dataset.letterSpacing = letterSpacing;
    root.dataset.lineSpacing = lineSpacing;
    root.dataset.readingWidth = readingWidth;
    root.dataset.motion = motion;
    root.dataset.theme = theme;
  }, [fontFamily, fontSize, letterSpacing, lineSpacing, readingWidth, motion, theme]);

  const setInterview = useCallback((patch: Partial<InterviewPrefs>) => {
    setInterviewState((prev) => ({ ...prev, ...patch }));
  }, []);

  const reset = useCallback(() => {
    setFontFamily(DEFAULT_PREFS.fontFamily);
    setFontSize(DEFAULT_PREFS.fontSize);
    setLetterSpacing(DEFAULT_PREFS.letterSpacing);
    setLineSpacing(DEFAULT_PREFS.lineSpacing);
    setReadingWidth(DEFAULT_PREFS.readingWidth);
    setMotion(DEFAULT_PREFS.motion);
    setTheme(DEFAULT_PREFS.theme);
    setInterviewState(DEFAULT_PREFS.interview);
  }, []);

  const a11yValue = useMemo(
    () => ({
      fontFamily, fontSize, letterSpacing, lineSpacing, readingWidth, motion, theme, interview,
      setFontFamily, setFontSize, setLetterSpacing, setLineSpacing, setReadingWidth, setMotion, setTheme, setInterview,
      reset,
    }),
    [fontFamily, fontSize, letterSpacing, lineSpacing, readingWidth, motion, theme, interview, setInterview, reset],
  );

  const bumpUsage = useCallback((k: keyof SessionState["a11yUsage"]) => {
    setA11yUsage((s) => ({ ...s, [k]: s[k] + 1 }));
  }, []);
  const resetUsage = useCallback(() => setA11yUsage({ simplifyCount: 0, readAloudCount: 0, voiceAnswers: 0 }), []);

  const sessionValue = useMemo<SessionState>(
    () => ({
      profile,
      category,
      setProfile: (p) => setProfile(p),
      setCategory: (c) => setCategory(c),
      a11yUsage,
      bumpUsage,
      resetUsage,
    }),
    [profile, category, a11yUsage, bumpUsage, resetUsage],
  );

  return (
    <AccessibilityContext.Provider value={a11yValue}>
      <SessionContext.Provider value={sessionValue}>{children}</SessionContext.Provider>
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) throw new Error("useAccessibility must be used within AccessibilityProvider");
  return ctx;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within AccessibilityProvider");
  return ctx;
}

// UI-only speech synthesis hook.
export function useSpeech() {
  const speak = useCallback((text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.95;
    window.speechSynthesis.speak(u);
  }, []);
  const stop = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }, []);
  return { speak, stop };
}

// UI-only speech recognition hook.
export function useSpeechRecognition() {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [supported, setSupported] = useState(true);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { setSupported(false); return; }
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";
    rec.onresult = (e: any) => {
      let text = "";
      for (let i = 0; i < e.results.length; i++) text += e.results[i][0].transcript;
      setTranscript(text);
    };
    rec.onend = () => setListening(false);
    setRecognition(rec);
  }, []);

  const start = useCallback(() => {
    if (!recognition) return;
    setTranscript("");
    try { recognition.start(); setListening(true); } catch { /* already started */ }
  }, [recognition]);

  const stop = useCallback(() => {
    if (!recognition) return;
    recognition.stop();
    setListening(false);
  }, [recognition]);

  return { listening, transcript, supported, start, stop, setTranscript };
}
