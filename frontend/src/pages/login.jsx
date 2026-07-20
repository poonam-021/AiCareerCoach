import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "../components/authlayout";
import FormField from "../components/FormField";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("idle"); 
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      await login(email, password);
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
        <button className="auth-tab is-active" type="button">Log in</button>
        <button className="auth-tab" type="button" onClick={() => navigate("/signup")}>Sign up</button>
        <div className="auth-tab-slider pos-0" />
      </div>

      <p className="auth-eyebrow">Welcome back</p>
      <h2 className="auth-title">Pick up where you left off</h2>
      <p className="auth-subtitle">Log in to keep working your roadmap.</p>

      {status === "error" && <div className="auth-error">{errorMsg}</div>}

      <form onSubmit={handleSubmit}>
        <FormField id="email" label="Email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <FormField id="password" label="Password" isPassword autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />

        <div className="auth-row-between">
          <label className="auth-checkbox-line">
            <input type="checkbox" /> Stay logged in
          </label>
          <Link className="auth-link" to="/forgot-password">Forgot password?</Link>
        </div>

        <button type="submit" className={`auth-submit${status === "success" ? " is-success" : ""}`} disabled={status === "loading" || status === "success"}>
          {status === "loading" && <span className="auth-spinner" />}
          {status === "success" && <span className="auth-check">✓</span>}
          {status === "loading" ? "Logging in…" : status === "success" ? "Welcome back" : "Log in"}
        </button>
      </form>

      <div className="auth-divider">or</div>      

      <p className="auth-switch-line">
        New to Career Coach? <Link className="auth-link" to="/signup">Create an account</Link>
      </p>
    </AuthLayout>
  );
}

