import { useState } from "react";
import WelcomeAnimation from "./components/WelcomeAnimation";
import "./App.css";

export default function App() {
  const [animDone, setAnimDone] = useState(false);

  return (
    <>
      {!animDone && <WelcomeAnimation onComplete={() => setAnimDone(true)} />}

      {/* Main website content — revealed after animation */}
      <main className={`main-content ${animDone ? "visible" : ""}`}>
        <header className="site-header">
          <div className="logo">
            <span className="logo-en">Avar</span>
            <span className="logo-hi">रण</span>
          </div>
          <nav className="nav-links">
            <a href="#audit">Audit</a>
            <a href="#patterns">Patterns</a>
            <a href="#about">About</a>
            <a href="#contact" className="nav-cta">Get Started</a>
          </nav>
        </header>

        <section className="hero">
          <div className="hero-badge">Dark Pattern Detection Platform</div>
          <h1 className="hero-title">
            Expose the <span className="hero-highlight">Hidden Manipulation</span>
            <br />in Digital Interfaces
          </h1>
          <p className="hero-sub">
            Avarana audits websites and apps for deceptive UX patterns — protecting
            users and holding platforms accountable.
          </p>
          <div className="hero-actions">
            <button className="btn-primary">Start Audit</button>
            <button className="btn-ghost">View Reports</button>
          </div>
        </section>

        {/* Decorative eye symbol */}
        <div className="hero-emblem">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="hg" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#2a1f0a" />
                <stop offset="100%" stopColor="#0f0a02" />
              </radialGradient>
              <radialGradient id="irisH" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#f5c842" />
                <stop offset="70%" stopColor="#c8960a" />
                <stop offset="100%" stopColor="#7a5500" />
              </radialGradient>
            </defs>
            <circle cx="100" cy="100" r="95" fill="url(#hg)" stroke="#c8960a" strokeWidth="1.5" />
            {Array.from({ length: 16 }).map((_, i) => {
              const a = (i / 16) * Math.PI * 2;
              return <circle key={i} cx={100 + Math.cos(a) * 88} cy={100 + Math.sin(a) * 88} r="3.5" fill="#c8960a" opacity="0.55" />;
            })}
            <ellipse cx="100" cy="100" rx="50" ry="28" fill="#1a1200" />
            <circle cx="100" cy="100" r="20" fill="url(#irisH)" />
            <circle cx="100" cy="100" r="9" fill="#0a0700" />
            <circle cx="91" cy="93" r="3.5" fill="white" opacity="0.7" />
            <path d="M50 92 Q100 65 150 92" fill="none" stroke="#c8960a" strokeWidth="2" />
            <path d="M50 108 Q100 135 150 108" fill="none" stroke="#c8960a" strokeWidth="2" />
            <circle cx="100" cy="100" r="33" fill="none" stroke="#f5c842" strokeWidth="0.8" opacity="0.4" strokeDasharray="4 5" />
          </svg>
        </div>
      </main>
    </>
  );
}
