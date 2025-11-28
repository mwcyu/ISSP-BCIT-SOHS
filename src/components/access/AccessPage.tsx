import React, { useState } from "react";
import "./AccessPage.css";
import bcitLogo from "../../assets/bcit-logo.png";
import { supabaseAccess } from "../../lib/supabaseAccessClient";

type View = "login" | "admin-login" | "user" | "admin";

interface AccessPageProps {
  onLoginSuccess: (role: "user" | "admin") => void;
}

export default function AccessPage({ onLoginSuccess }: AccessPageProps) {
  const [view, setView] = useState<View>("login");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");

  // -------------------------
  // VALIDATION (Supabase)
  // -------------------------
  const validateCode = async (role: "user" | "admin") => {
    const { data, error } = await supabaseAccess
      .from("access_codes")
      .select("code")
      .eq("role", role)
      .single();

    if (error || !data) {
      setMessage("❌ Unable to validate access code.");
      return false;
    }

    return data.code === code.trim();
  };

  const handleUserLogin = async () => {
    const ok = await validateCode("user");
    if (ok) onLoginSuccess("user");
    else setMessage("❌ Invalid user code.");
  };

  const handleAdminLogin = async () => {
    const ok = await validateCode("admin");
    if (ok) onLoginSuccess("admin");
    else setMessage("❌ Invalid admin code.");
  };

  // -------------------------
  // ENTER KEY
  // -------------------------
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    if (view === "login") handleUserLogin();
    else handleAdminLogin();
  };

  // -------------------------
  // UI (unchanged)
  // -------------------------
  const handleViewChange = (target: View) => {
    setView(target);
    setCode("");
    setMessage("");
  };

  return (
    <div className="bcit-page">
      <div className="bcit-page__texture" aria-hidden="true" />
      <div className="access-hero">
        <header className="hero-header">
          <div className="hero-badge">School of Health Sciences</div>
          <h1>
            Clinical Feedback <span>Helper</span>
          </h1>
          <p>
            Secure access for BCIT preceptors to deliver structured, BCCNM-aligned
            performance feedback with confidence.
          </p>
        </header>

        <div className="access-shell">
          <section className="info-panel">
            <img src={bcitLogo} alt="BCIT" className="info-panel__logo" />
            <h2>Designed for modern clinical teaching</h2>
            <p>
              Guided workflows help you document observations, map them to
              provincial standards, and export professional summaries in minutes.
            </p>

            <ul className="info-panel__list">
              <li>Guided prompts mapped to BCCNM standards</li>
              <li>Evidence-based coaching suggestions</li>
              <li>Secure PDF-ready summaries</li>
              <li>Support for preceptors &amp; clinical leads</li>
            </ul>

            <div className="contact-card">
              <p className="contact-card__label">Need help?</p>
              <p>Contact your clinical instructor or Program Operations.</p>
              <a href="mailto:sohs@bcit.ca">sohs@bcit.ca</a>
            </div>
          </section>

          <section className="form-panel">
            <div className="form-tabs" role="tablist">
              <button
                className={`form-tab ${view === "login" ? "is-active" : ""}`}
                onClick={() => handleViewChange("login")}
                role="tab"
              >
                Preceptor Access
              </button>
              <button
                className={`form-tab ${view === "admin-login" ? "is-active" : ""}`}
                onClick={() => handleViewChange("admin-login")}
                role="tab"
              >
                Administrator
              </button>
            </div>

            <div className="secure-box fade-area">
              <h5 className="secure-title">🔒 Secure Access</h5>

              {view === "login" ? (
                <>
                  <p className="secure-desc">
                    Enter your preceptor access code to launch the feedback workspace.
                  </p>
                  <label className="input-label">Preceptor access code</label>

                  <input
                    type="password"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="access-input"
                    placeholder="••••••••"
                  />

                  <button
                    onClick={handleUserLogin}
                    className="access-btn main-btn">
                    Access system
                  </button>
                </>
              ) : (
                <>
                  <p className="secure-desc">
                    Administrators can manage standards, prompts, and analytics.
                  </p>

                  <label className="input-label">Administrator code</label>

                  <input
                    type="password"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="access-input"
                    placeholder="••••••••"
                  />

                  <button
                    onClick={handleAdminLogin}
                    className="access-btn main-btn">
                    Login as admin
                  </button>
                </>
              )}

              {message && <p className="access-message">{message}</p>}

              <div className="notice-box">
                <p>⚠ Authorized BCIT clinical personnel only.</p>
              </div>
            </div>
          </section>
        </div>

        <footer className="bcit-footer">
          <div>
            British Columbia Institute of Technology · School of Health Sciences
          </div>
          <div>Clinical Education &amp; Student Success</div>
        </footer>
      </div>
    </div>
  );
}
