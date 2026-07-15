import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function GrowthPanel() {
  return (
    <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-[#0F2E2B] p-10 text-white lg:flex">
      <div className="text-[15px] font-semibold tracking-tight">AI Career Coach</div>

      <div>
        <h2 className="font-serif text-[34px] leading-[1.15] text-white">
          Start closer to<br />the role you want.
        </h2>
        <p className="mt-3 max-w-xs text-[13.5px] text-white/60">
          Resume feedback, skill gaps, and interview prep — tailored to your goal.
        </p>
      </div>

      <svg viewBox="0 0 320 160" className="absolute -bottom-6 -left-4 h-[220px] w-[360px] opacity-90">
        <path
          d="M10 150 C 70 150, 60 90, 120 90 S 190 40, 250 40 S 300 15, 310 10"
          fill="none"
          stroke="#E8B04B"
          strokeWidth="2"
          strokeDasharray="4 5"
          opacity="0.5"
        />
        {[
          [10, 150], [120, 90], [250, 40], [310, 10],
        ].map(([cx, cy], i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={i === 3 ? 6 : 4}
            fill={i === 3 ? "#E8B04B" : "#F5F1E8"}
            fillOpacity={i === 3 ? 1 : 0.85}
          />
        ))}
      </svg>
    </div>
  );
}

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await signup(email, password);
      navigate("/");
    } catch (err) {
      setError("Could not create account. Try a different email.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    try {
      await loginWithGoogle();
      navigate("/");
    } catch (err) {
      setError("Google sign-in failed.");
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      <GrowthPanel />

      <div className="flex w-full flex-col justify-center px-8 lg:w-1/2 lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          <h1 className="text-[22px] font-semibold text-ink-900">Create your account</h1>
          <p className="mt-1.5 text-[13.5px] text-ink-500">Free to start, no card required.</p>

          {error && (
            <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-[12.5px] text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3.5">
            <label className="flex flex-col gap-1.5">
              <span className="text-[12.5px] font-medium text-ink-700">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="rounded-lg border border-border bg-card px-3.5 py-2.5 text-[13.5px] outline-none transition-colors focus:border-[#0F2E2B] focus:ring-2 focus:ring-[#0F2E2B]/10"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[12.5px] font-medium text-ink-700">Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="At least 6 characters"
                className="rounded-lg border border-border bg-card px-3.5 py-2.5 text-[13.5px] outline-none transition-colors focus:border-[#0F2E2B] focus:ring-2 focus:ring-[#0F2E2B]/10"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[12.5px] font-medium text-ink-700">Confirm password</span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Re-enter your password"
                className="rounded-lg border border-border bg-card px-3.5 py-2.5 text-[13.5px] outline-none transition-colors focus:border-[#0F2E2B] focus:ring-2 focus:ring-[#0F2E2B]/10"
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 rounded-lg bg-[#0F2E2B] py-2.5 text-[13.5px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {loading ? "Creating account…" : "Sign up"}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3 text-[11px] font-medium uppercase tracking-wide text-ink-500">
            <div className="h-px flex-1 bg-border" /> or <div className="h-px flex-1 bg-border" />
          </div>

          <button
            onClick={handleGoogle}
            className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-border bg-white py-2.5 text-[13px] font-semibold text-ink-700 transition-colors hover:bg-canvas"
          >
            <svg width="16" height="16" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.6 20.5H24v7.6h11.3C34 32.9 29.6 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.4-5.4C33.6 6 29 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z"/>
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3 0 5.8 1.1 7.9 3l5.4-5.4C33.6 6 29 4 24 4c-7.4 0-13.8 4.2-17.7 10.7z"/>
              <path fill="#4CAF50" d="M24 44c5 0 9.6-1.9 13-5.1l-6-5.1c-2 1.5-4.6 2.4-7 2.4-5.6 0-10-3.8-11.6-9l-6.6 5C9.6 39.6 16.2 44 24 44z"/>
              <path fill="#1976D2" d="M43.6 20.5H24v7.6h11.3c-.7 3.2-2.6 5.8-5.2 7.5l6 5.1C39.6 37.4 44 31.4 44 24c0-1.2-.1-2.4-.4-3.5z"/>
            </svg>
            Continue with Google
          </button>

          <p className="mt-6 text-center text-[13px] text-ink-500">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-[#0F2E2B]">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}