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
  return (
    <div className="bcit-page">
      <div className="access-card">
        <div className="logo-section">
          <img src={bcitLogo} alt="BCIT Logo" className="bcit-logo" />
          <h2 className="bcit-subtitle">Clinical Feedback Helper</h2>
        </div>

        <div className="secure-box fade-area">
          <h5 className="secure-title">🔒 Secure Access Required</h5>

          {view === "login" ? (
            <>
              <p className="secure-desc">
                Enter your universal access code to begin the feedback process.
              </p>
              <label className="input-label">ACCESS CODE</label>

              <input
                type="password"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyPress={handleKeyPress}
                className="access-input"
                placeholder="Enter access code"
              />

              <button onClick={handleUserLogin} className="access-btn main-btn">
                ACCESS SYSTEM
              </button>

              <button
                onClick={() => {
                  setView("admin-login");
                  setCode("");
                  setMessage("");
                }}
                className="access-btn admin-btn">
                ADMIN ACCESS
              </button>
            </>
          ) : (
            <>
              <p className="secure-desc">Administrator login required.</p>

              <label className="input-label">ADMIN ACCESS CODE</label>

              <input
                type="password"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyPress={handleKeyPress}
                className="access-input"
                placeholder="Enter admin code"
              />

              <button
                onClick={handleAdminLogin}
                className="access-btn main-btn">
                LOGIN AS ADMIN
              </button>

              <button
                onClick={() => {
                  setView("login");
                  setCode("");
                  setMessage("");
                }}
                className="access-btn admin-btn">
                BACK TO USER ACCESS
              </button>
            </>
          )}

          {message && <p className="access-message">{message}</p>}
        </div>

        <div className="info-grid">
          <div className="notice-box">
            <p>⚠ This system is authorized for use by BCIT preceptors only.</p>
          </div>

          <div className="about-box">
            <p className="about-title">About this tool:</p>
            <ul>
              <li>Structured feedback based on BCCNM standards</li>
              <li>AI-powered prompting for detailed examples</li>
              <li>Automated report generation</li>
              <li>No personal data stored locally</li>
            </ul>
          </div>

          <div className="contact-box">
            <p>Contact your clinical instructor if you need an access code.</p>
          </div>
        </div>

        <footer className="footer">
          <p>British Columbia Institute of Technology</p>
          <p>School of Health Sciences – Nursing Program</p>
        </footer>
      </div>
    </div>
  );
}
