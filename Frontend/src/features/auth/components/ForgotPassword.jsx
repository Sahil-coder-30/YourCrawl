/**
 * LEVEL 1 — UI
 * ForgotPassword — user enters email to receive reset OTP.
 */
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, KeyRound, Loader2 } from "lucide-react";
import AvaranaLogo from "../../../components/common/AvaranaLogo/AvaranaLogo";
import { useForgotPassword } from "../hooks/useAuth";
import "./auth.styles.css";

export default function ForgotPassword() {
  const { forgotPassword, loading, error } = useForgotPassword();
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    forgotPassword(email);
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-orb auth-bg-orb--1" />
      <div className="auth-bg-orb auth-bg-orb--2" />

      <div className="auth-card">
        <Link to="/login" className="auth-back">
          <ArrowLeft size={14} /> Back to login
        </Link>

        <div className="auth-brand">
          <AvaranaLogo size={52} showName={true} showSub={true} inline={false} />
        </div>

        {/* Icon */}
        <div style={{ textAlign: "center", marginBottom: "1rem" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 56,
              height: 56,
              background: "rgba(212,175,122,0.1)",
              border: "1px solid rgba(212,175,122,0.2)",
              borderRadius: "50%",
            }}
          >
            <KeyRound size={26} color="#D4AF7A" />
          </div>
        </div>

        <h1 className="auth-heading" style={{ textAlign: "center" }}>
          Forgot password?
        </h1>
        <p className="auth-sub" style={{ textAlign: "center" }}>
          Enter your registered email and we&apos;ll send you a reset code.
        </p>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="forgot-email" className="auth-label">
              Email address
            </label>
            <input
              id="forgot-email"
              type="email"
              className="auth-input"
              placeholder="you@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <button
            id="forgot-submit-btn"
            type="submit"
            className="auth-btn auth-btn--primary"
            disabled={loading}
          >
            {loading ? (
              <Loader2 size={18} className="auth-spinner" />
            ) : (
              <>
                <KeyRound size={18} />
                Send Reset Code
              </>
            )}
          </button>
        </form>

        <p className="auth-footer">
          Remembered it?{" "}
          <Link to="/login" className="auth-link">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
