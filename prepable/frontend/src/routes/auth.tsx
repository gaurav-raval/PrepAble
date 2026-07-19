import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { ProfileForm } from "../components/ProfileForm";
import { useSession } from "../context/AccessibilityContext";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Log in or sign up — PrepAble" },
      { name: "description", content: "Log in or create your PrepAble profile to start practicing accessible interviews." },
    ],
  }),
  component: AuthPage,
});

type Mode = "login" | "signup";

function AuthPage() {
  const navigate = useNavigate();
  const session = useSession();
  const [mode, setMode] = useState<Mode>("login");

  return (
    <div className="pa-auth-wrap">
      <div className="pa-auth-card pa-card raised" aria-labelledby="auth-title">
        <div style={{ textAlign: "center", marginBottom: "1rem" }}>
          <Link to="/" className="pa-brand" aria-label="PrepAble home">
            Prep<span>Able</span>
          </Link>
          <h1 id="auth-title" style={{ margin: "0.75rem 0 0.25rem" }}>
            {mode === "login" ? "Welcome back" : "Create your profile"}
          </h1>
          <p className="pa-muted" style={{ margin: 0 }}>
            {mode === "login" ? "Log in to continue practicing." : "Set up your profile to personalise your interviews."}
          </p>
        </div>

        <div className="pa-tabs" role="tablist" aria-label="Authentication mode" style={{ justifyContent: "center", marginBottom: "1rem" }}>
          <button role="tab" aria-selected={mode === "login"} onClick={() => setMode("login")} type="button">Log in</button>
          <button role="tab" aria-selected={mode === "signup"} onClick={() => setMode("signup")} type="button">Sign up</button>
        </div>

        {mode === "login" ? (
          <LoginForm
            onSubmit={({ email }) => {
              session.setProfile({
                name: email.split("@")[0] || "Guest",
                email,
                role: "Frontend Developer",
                experience: "Fresher",
              });
              navigate({ to: "/dashboard" });
            }}
          />
        ) : (
          <ProfileForm
            onSubmit={(v) => {
              session.setProfile(v);
              navigate({ to: "/dashboard" });
            }}
          />
        )}

        <p className="pa-muted" style={{ textAlign: "center", marginTop: "1rem", marginBottom: 0, fontSize: "0.9em" }}>
          <Link to="/">← Back to product overview</Link>
        </p>
      </div>
    </div>
  );
}

function LoginForm({ onSubmit }: { onSubmit: (v: { email: string; password: string }) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const next: typeof errors = {};
    if (!email.trim()) next.email = "Please enter your email.";
    else if (!/^\S+@\S+\.\S+$/.test(email)) next.email = "Please enter a valid email.";
    if (!password) next.password = "Please enter your password.";
    setErrors(next);
    if (Object.keys(next).length) return;
    onSubmit({ email: email.trim(), password });
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="pa-field">
        <label htmlFor="login-email">Email</label>
        <input
          id="login-email" type="email" className="pa-input" placeholder="you@example.com"
          value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email"
          aria-invalid={!!errors.email} aria-describedby={errors.email ? "login-email-err" : undefined} required
        />
        {errors.email && <span id="login-email-err" role="alert" className="hint" style={{ color: "var(--pa-danger)" }}>{errors.email}</span>}
      </div>

      <div className="pa-field">
        <label htmlFor="login-password">Password</label>
        <input
          id="login-password" type="password" className="pa-input"
          value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password"
          aria-invalid={!!errors.password} aria-describedby={errors.password ? "login-password-err" : undefined} required
        />
        {errors.password && <span id="login-password-err" role="alert" className="hint" style={{ color: "var(--pa-danger)" }}>{errors.password}</span>}
      </div>

      <button type="submit" className="pa-btn lg" style={{ width: "100%" }}>Log in</button>
    </form>
  );
}
