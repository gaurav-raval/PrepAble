import { useState, type FormEvent } from "react";
import { experienceOptions, type Experience } from "../data/mockData";

interface Props {
  onSubmit: (values: { name: string; email: string; role: string; experience: Experience }) => void;
}

// Sign-up form — no real auth, values kept in session context.
export function ProfileForm({ onSubmit }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [experience, setExperience] = useState<Experience>("Fresher");
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; role?: string }>({});

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const next: typeof errors = {};
    if (!name.trim()) next.name = "Please enter your full name.";
    if (!email.trim()) next.email = "Please enter your email.";
    else if (!/^\S+@\S+\.\S+$/.test(email)) next.email = "Please enter a valid email.";
    if (!password) next.password = "Please enter a password.";
    else if (password.length < 6) next.password = "Password must be at least 6 characters.";
    if (!role.trim()) next.role = "Please enter the job role you are preparing for.";
    setErrors(next);
    if (Object.keys(next).length) return;
    onSubmit({ name: name.trim(), email: email.trim(), role: role.trim(), experience });
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="pa-field">
        <label htmlFor="name">Full name</label>
        <input id="name" className="pa-input" value={name} onChange={(e) => setName(e.target.value)}
          autoComplete="name" aria-invalid={!!errors.name} aria-describedby={errors.name ? "name-err" : undefined} required />
        {errors.name && <span id="name-err" role="alert" className="hint" style={{ color: "var(--pa-danger)" }}>{errors.name}</span>}
      </div>

      <div className="pa-field">
        <label htmlFor="email">Email</label>
        <input id="email" type="email" className="pa-input" placeholder="you@example.com" value={email}
          onChange={(e) => setEmail(e.target.value)} autoComplete="email"
          aria-invalid={!!errors.email} aria-describedby={errors.email ? "email-err" : undefined} required />
        {errors.email && <span id="email-err" role="alert" className="hint" style={{ color: "var(--pa-danger)" }}>{errors.email}</span>}
      </div>

      <div className="pa-field">
        <label htmlFor="password">Password</label>
        <input id="password" type="password" className="pa-input" placeholder="At least 6 characters" value={password}
          onChange={(e) => setPassword(e.target.value)} autoComplete="new-password"
          aria-invalid={!!errors.password} aria-describedby={errors.password ? "password-err" : undefined} required />
        {errors.password && <span id="password-err" role="alert" className="hint" style={{ color: "var(--pa-danger)" }}>{errors.password}</span>}
      </div>

      <div className="pa-field">
        <label htmlFor="role">Job role you're preparing for</label>
        <input id="role" className="pa-input" placeholder="e.g. Frontend Developer" value={role}
          onChange={(e) => setRole(e.target.value)}
          aria-invalid={!!errors.role} aria-describedby={errors.role ? "role-err" : undefined} required />
        {errors.role && <span id="role-err" role="alert" className="hint" style={{ color: "var(--pa-danger)" }}>{errors.role}</span>}
      </div>

      <div className="pa-field">
        <label htmlFor="exp">Experience level</label>
        <select id="exp" className="pa-select" value={experience} onChange={(e) => setExperience(e.target.value as Experience)}>
          {experienceOptions.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>

      <button type="submit" className="pa-btn lg">Create account & start</button>
    </form>
  );
}
