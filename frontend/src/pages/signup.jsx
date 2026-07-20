import { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "../components/authlayout";
import FormField from "../components/FormField";
import { useAuth } from "../context/AuthContext";

function scorePassword(pw) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(score, 4);
}

const STRENGTH_META = [
  { label: "Too short", color: "#e5484d" },
  { label: "Weak", color: "#e5484d" },
  { label: "Fair", color: "#f5a623" },
  { label: "Good", color: "#f5a623" },
  { label: "Strong", color: "#22c55e" },
];

export default function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const strength = useMemo(() => (password ? scorePassword(password) : -1), [password]);

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg("");

    if (password !== confirm) {
      setStatus("error");
      setErrorMsg("Those passwords don't match.");
      return;
    }
    if (!agreed) {
      setStatus("error");
      setErrorMsg("Please agree to the terms to continue.");
      return;
    }

    setStatus("loading");
    try {
      await signup(name, email, password);
      setStatus("success");
      setTimeout(() => navigate("/"), 500);
    } catch (err) {
      setStatus("error");
      setErrorMsg(
        err.message === "Failed to fetch"
          ? "Can't reach the server right now. Try again shortly."
          : err.message
      );
    }
  }

  return (
    <AuthLayout>
      <div className="auth-tabs">
        <button className="auth-tab" type="button" onClick={() => navigate("/login")}>Log in</button>
        <button className="auth-tab is-active" type="button">Sign up</button>
        <div className="auth-tab-slider pos-1" />
      </div>

      <p className="auth-eyebrow">Start your roadmap</p>
      <h2 className="auth-title">Create your account</h2>
      <p className="auth-subtitle">A few details and you're on your way.</p>

      {status === "error" && <div className="auth-error">{errorMsg}</div>}

      <form onSubmit={handleSubmit}>
        <FormField id="name" label="Full name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
        <FormField id="email" label="Email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <FormField id="password" label="Password" isPassword autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />

        {password && (
          <div style={{ marginBottom: 20 }}>
            <div className="auth-strength">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="auth-strength-bar" style={{ background: i <= strength ? STRENGTH_META[strength + 1].color : undefined }} />
              ))}
            </div>
            <span className="auth-strength-label">{STRENGTH_META[strength + 1].label}</span>
          </div>
        )}

        <FormField id="confirm" label="Confirm password" isPassword autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />

        <div className="auth-row-between">
          <label className="auth-checkbox-line">
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
            I agree to the <Link className="auth-link" to="/terms" style={{ marginLeft: 4 }}>terms</Link>
          </label>
        </div>

        <button type="submit" className={`auth-submit${status === "success" ? " is-success" : ""}`} disabled={status === "loading" || status === "success"}>
          {status === "loading" && <span className="auth-spinner" />}
          {status === "success" && <span className="auth-check">✓</span>}
          {status === "loading" ? "Creating account…" : status === "success" ? "Account created" : "Create account"}
        </button>
      </form>

      <p className="auth-switch-line">
        Already have an account? <Link className="auth-link" to="/login">Log in</Link>
      </p>
    </AuthLayout>
  );
}
