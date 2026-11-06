import "../../styles/auth.css";
import { SiJavascript, SiPython, SiReact, SiDjango } from "react-icons/si";

function Logo() {
  return (
    <div className="auth-logo">
      <div>
        <div className="auth-logo-name">
          Resume <span style={{ color: "var(--color-primary)" }}>Build</span>
        </div>
        <div className="auth-logo-tag">RESUME • CAREER • BETTER</div>
      </div>
    </div>
  );
}

function ResumeIllustration() {
  return (
    <div className="auth-art" aria-hidden="true">
      <div className="auth-document">
        <span className="auth-avatar">
          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="white"
            opacity="0.65"
            aria-hidden="true"
          >
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8H4z" />
          </svg>
          

        </span>
        <i className="auth-document-line" style={{ width: "55%" }} />

        <i className="auth-document-line" style={{ width: "80%" }} />

        <i className="auth-document-line" style={{ width: "65%" }} />
        <i className="auth-document-line" style={{ width: "80%" }} />

        <i className="auth-document-line" style={{ width: "65%" }} />

        <i className="auth-document-line" style={{ width: "90%" }} />

        <i className="auth-document-line" style={{ width: "50%" }} />
        <i className="auth-document-line" style={{ width: "90%" }} />

        <i className="auth-document-line" style={{ width: "50%" }} />
      </div>

      <span className="auth-chip auth-chip-1">
        <SiJavascript /> JavaScript
      </span>

      <span className="auth-chip auth-chip-2">
        <SiPython /> Python
      </span>

      <span className="auth-chip auth-chip-3">
        <SiReact /> React
      </span>

      <span className="auth-chip auth-chip-4">
        <SiDjango /> Django
      </span>
      <span className="auth-chip auth-chip-5">✓ Resume</span>
    </div>
  );
}

function FeatureIcon({ type }) {
  const paths = {
    bolt: <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8Z" />,

    pen: <path d="M4 20h4L19 9l-4-4L4 16v4Z" />,

    download: <path d="M12 4v11m0 0-4-4m4 4 4-4M5 20h14" />,
  };

  return (
    <svg
      className="auth-feature-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[type]}
    </svg>
  );
}

function AuthHero({ mode }) {
  const heroContent = {
    register: {
      first: "Build a resume",
      second: "that gets noticed.",
      description:
        "Create an ATS-friendly resume and take the next step in your career.",
    },

    login: {
      first: "Your next career",
      second: "opportunity awaits.",
      description:
        "Welcome back! Continue building your resume and moving closer to your career goals.",
    },
  };

  const content = heroContent[mode] || heroContent.register;

  return (
    <section className="auth-hero">
      <Logo />

      <div className="auth-hero-content">
        <h1>
          {content.first}
          <br />
          <span className="auth-highlight">{content.second}</span>
        </h1>

        <p className="auth-hero-description">{content.description}</p>

        <ResumeIllustration />
      </div>

      <ul className="auth-features">
        <li className="auth-feature">
          <FeatureIcon type="bolt" />
          <span>
            ATS-ready
            <br />
            templates
          </span>
        </li>

        <li className="auth-feature">
          <FeatureIcon type="pen" />
          <span>
            Easy guided
            <br />
            editing
          </span>
        </li>

        <li className="auth-feature">
          <FeatureIcon type="download" />
          <span>
            Download
            <br />
            in minutes
          </span>
        </li>
      </ul>
    </section>
  );
}

export default function AuthLayout({ children, mode = "register" }) {
  return (
    <>
    <div className="auth-top-wave" aria-hidden="true">
    <svg viewBox="0 0 1440 150" preserveAspectRatio="none">
      <path
        d="M0 0H1440V70C1100 150 900 20 600 90C300 160 150 50 0 110Z"
        fill="#2563EB"
        opacity="0.12"
      />
    </svg>
  </div>
      <main className="auth-page">
        <AuthHero mode={mode} />

        <section className="auth-panel">
          <div className="auth-mobile-logo">
            <Logo />
          </div>

          <div className="auth-card">{children}</div>
        </section>
        
      </main>
      
       

      <footer className="auth-footer">
        
        © 2026 ResumeBuild. All rights reserved.
      </footer>
    </>
  );
}
