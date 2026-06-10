/**
 * LEVEL 1 — UI
 * SetPassword — for Google OAuth users who have no password yet.
 *
 * Entry points:
 *  1. Redirected from /login when the user tried email/password login but only
 *     has a Google account (no password set). Router state: { email, fromLogin: true }
 *  2. Navigated to directly (e.g. profile page "add password" link).
 */
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, Eye, EyeOff, Loader2, ShieldAlert, Info } from "lucide-react";
import { useSetPassword } from "../hooks/useAuth";
import "./auth.styles.css";

/* ── Password strength helper ───────────────────────────────────────────────── */
function getStrength(pw) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}
const STRENGTH_COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e"];
const STRENGTH_LABELS = ["Weak", "Fair", "Good", "Strong"];

/* ── Visual left-panel (matches Login aesthetic) ─────────────────────────────── */
function VisualPanel() {
  return (
    <div className="auth-panel-left">
      {/* Brand */}
      <div className="auth-panel-left__brand">
        <div className="auth-panel-left__logo-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7l10 5 10-5-10-5z" fill="white" />
            <path
              d="M2 17l10 5 10-5M2 12l10 5 10-5"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div>
          <span className="auth-panel-left__logo-text">YourCrawl</span>
          <span className="auth-panel-left__logo-sub">by Avarana</span>
        </div>
      </div>

      {/* Illustration area */}
      <div className="auth-panel-left__visual">
        <div className="setp-illustration">
          <div className="setp-illustration__ring setp-illustration__ring--outer" />
          <div className="setp-illustration__ring setp-illustration__ring--mid" />
          <div className="setp-illustration__ring setp-illustration__ring--inner">
            <Lock size={32} color="#2563eb" strokeWidth={2} />
          </div>
        </div>
      </div>

      {/* Bottom copy */}
      <div className="auth-panel-left__bottom">
        <div className="auth-panel-left__tag">
          <span className="auth-panel-left__tag-dot" />
          One account, all access methods
        </div>
        <h2 className="auth-panel-left__headline">
          Add a password<br />
          <em>unlock every sign-in.</em>
        </h2>
        <p className="auth-panel-left__desc">
          Your Google account is linked. Set a password to also sign in with
          your email — no extra account needed.
        </p>
      </div>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────────────────────── */
export default function SetPassword() {
  const { setPassword, loading, error } = useSetPassword();
  const location = useLocation();
  const navigate = useNavigate();

  // Read context passed from the login page redirect
  const fromLogin = location.state?.fromLogin === true;
  const prefillEmail = location.state?.email || "";

  const [form, setForm] = useState({
    email: prefillEmail,
    password: "",
    confirmPass: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [localError, setLocalError] = useState("");

  // If email arrives asynchronously (e.g. navigated after state hydration), sync it
  useEffect(() => {
    if (prefillEmail) {
      setForm((prev) => ({ ...prev, email: prefillEmail }));
    }
  }, [prefillEmail]);

  const strength = getStrength(form.password);

  const handleChange = (e) => {
    setLocalError("");
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPass) {
      setLocalError("Passwords do not match.");
      return;
    }
    if (form.password.length < 8) {
      setLocalError("Password must be at least 8 characters.");
      return;
    }
    setPassword(form);
  };

  const displayError = localError || error;

  return (
    <div className="auth-page">
      {/* ══ LEFT — visual panel ══════════════════════════════ */}
      <VisualPanel />

      {/* ══ RIGHT — form panel ═══════════════════════════════ */}
      <div className="auth-panel-right">
        <div className="auth-card">
          {/* Back link */}
          <Link to="/login" className="auth-back">
            <ArrowLeft size={14} /> Back to login
          </Link>

          {/* Heading */}
          <h1 className="auth-heading">Create your password</h1>
          <p className="auth-sub">
            {fromLogin
              ? "You have a Google account linked to this email. Set a password to also sign in without Google."
              : "Set a password so you can sign in with your email in addition to Google."}
          </p>

          {/* Context banner */}
          {fromLogin ? (
            <div className="setp-banner setp-banner--notice">
              <ShieldAlert size={15} strokeWidth={2} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>
                We noticed you tried to log in with <strong>email&nbsp;+&nbsp;password</strong>,
                but this account was created via <strong>Google</strong> and has no password yet.
                Create one below — it takes 10 seconds.
              </span>
            </div>
          ) : (
            <div className="setp-banner setp-banner--info">
              <Info size={15} strokeWidth={2} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>
                You signed in with <strong>Google</strong>. Setting a password is optional but
                lets you log in with your email too.
              </span>
            </div>
          )}

          {displayError && <div className="auth-error">{displayError}</div>}

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div className="auth-field">
              <label htmlFor="setp-email" className="auth-label">Email address</label>
              <input
                id="setp-email"
                type="email"
                name="email"
                className="auth-input"
                placeholder="you@domain.com"
                value={form.email}
                onChange={handleChange}
                required
                readOnly={!!prefillEmail}
                style={prefillEmail ? { background: "#f8fafc", color: "#64748b", cursor: "default" } : {}}
                autoFocus={!prefillEmail}
              />
              {prefillEmail && (
                <span style={{ fontSize: "0.72rem", color: "#94a3b8", marginTop: "0.15rem" }}>
                  Your email is pre-filled from your Google account.
                </span>
              )}
            </div>

            {/* New Password */}
            <div className="auth-field">
              <label htmlFor="setp-password" className="auth-label">New password</label>
              <div className="auth-input-wrapper">
                <input
                  id="setp-password"
                  type={showPass ? "text" : "password"}
                  name="password"
                  autoComplete="new-password"
                  className="auth-input auth-input--padded-right"
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={8}
                  autoFocus={!!prefillEmail}
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setShowPass((v) => !v)}
                  aria-label={showPass ? "Hide password" : "Show password"}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {form.password && (
                <>
                  <div className="auth-strength">
                    <div
                      className="auth-strength__bar"
                      style={{
                        width: `${(strength / 4) * 100}%`,
                        background: STRENGTH_COLORS[strength - 1] || "#ef4444",
                      }}
                    />
                  </div>
                  <span style={{ fontSize: "0.72rem", color: STRENGTH_COLORS[strength - 1] || "#ef4444", marginTop: "0.2rem" }}>
                    {STRENGTH_LABELS[strength - 1] || "Too short"}
                  </span>
                </>
              )}
            </div>

            {/* Confirm Password */}
            <div className="auth-field">
              <label htmlFor="setp-confirm" className="auth-label">Confirm password</label>
              <div className="auth-input-wrapper">
                <input
                  id="setp-confirm"
                  type={showConfirm ? "text" : "password"}
                  name="confirmPass"
                  autoComplete="new-password"
                  className="auth-input auth-input--padded-right"
                  placeholder="Repeat password"
                  value={form.confirmPass}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setShowConfirm((v) => !v)}
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {/* Mismatch hint */}
              {form.confirmPass && form.password !== form.confirmPass && (
                <span style={{ fontSize: "0.72rem", color: "#ef4444", marginTop: "0.15rem" }}>
                  Passwords don&apos;t match yet.
                </span>
              )}
            </div>

            <button
              id="set-password-btn"
              type="submit"
              className="auth-btn auth-btn--primary"
              disabled={loading}
            >
              {loading ? (
                <Loader2 size={18} className="auth-spinner" />
              ) : (
                <>
                  <Lock size={16} />
                  Save Password &amp; Sign In
                </>
              )}
            </button>
          </form>

          {/* Skip only shown when NOT redirected from login (no password = can't skip) */}
          {!fromLogin && (
            <p className="auth-footer">
              Skip for now?{" "}
              <Link to="/dashboard" className="auth-link">Go to dashboard</Link>
            </p>
          )}

          {fromLogin && (
            <p className="auth-footer">
              Want to use Google instead?{" "}
              <a href="http://localhost:3000/api/auth/google" className="auth-link">
                Sign in with Google
              </a>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
