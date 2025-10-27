import React, { useState } from "react";
import { getSessionId } from "../../utils/session";
import "./AccessPage.css";
import {
  verifyAdmin,
  verifyUser,
  verifyRecovery,
  setAdminCode,
  setUserCode,
} from "../../utils/accessStorage";

interface AccessPageProps {
  onLoginSuccess: (role: "user" | "admin") => void;
}

export default function AccessPage({ onLoginSuccess }: AccessPageProps) {
  const [userInput, setUserInput] = useState("");
  const [adminInput, setAdminInput] = useState("");
  const [recoveryInput, setRecoveryInput] = useState("");
  const [newAdminCode, setNewAdminCode] = useState("");
  const [newUserCode, setNewUserCode] = useState("");
  const [message, setMessage] = useState("");
  const [showRecoveryPrompt, setShowRecoveryPrompt] = useState(false);
  const [recoveryVerified, setRecoveryVerified] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false); // 👈 NEW

  const handleUserLogin = async () => {
    const ok = await verifyUser(userInput);
    if (ok) {
      // 🧹 Clear any previous session ID before making a new one
      sessionStorage.removeItem("chatSessionId");

      // 🆕 Create new session ID
      const newSessionId = getSessionId();
      console.log("🆕 New session started:", newSessionId);
      
      onLoginSuccess("user");
    } else {
      setMessage("❌ Invalid user code");
    }
  };


  // ✅ Admin login
  const handleAdminLogin = async () => {
    const ok = await verifyAdmin(adminInput);
    if (ok) {
      // 🧹 Clear any previous session ID before making a new one
      sessionStorage.removeItem("chatSessionId");

      // 🆕 Create new session ID
      const newSessionId = getSessionId();
      console.log("🆕 New session started:", newSessionId);
      
      onLoginSuccess("admin");
    } else {
      setMessage("❌ Invalid admin code");
    }
  };

  const handleRecoverySubmit = async () => {
    const ok = await verifyRecovery(recoveryInput);
    if (ok) {
      setMessage(
        "✅ Recovery code verified. You can now reset the codes below."
      );
      setRecoveryVerified(true);
    } else {
      setMessage("❌ Invalid recovery code.");
      setRecoveryVerified(false);
    }
  };

  const handleRecoverySave = async () => {
    if (!newAdminCode.trim() || !newUserCode.trim()) {
      setMessage("⚠ Please fill in both new codes.");
      return;
    }

    try {
      await setAdminCode(newAdminCode.trim());
      await setUserCode(newUserCode.trim());
      setMessage("✅ Admin and User codes have been reset successfully!");
      setRecoveryVerified(false);
      setShowRecoveryPrompt(false);
      setRecoveryInput("");
      setNewAdminCode("");
      setNewUserCode("");
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to reset codes. Please try again.");
    }
  };

  // Reset message when switching views
  const clearMessage = () => setMessage("");

  return (
    <div className="access-page">
      <div className="access-container">
        <h1 className="access-title">🔐 Access Portal</h1>

        {/* === User Login (always visible) === */}
        {!showRecoveryPrompt && !recoveryVerified && (
          <div>
            <label className="access-label">User Access Code</label>
            <input
              type="password"
              className="access-input"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
            />
            <button onClick={handleUserLogin} className="access-btn user">
              Enter as User
            </button>
          </div>
        )}

        {/* === Admin Login Toggle (hidden by default) === */}
        {/* {!showRecoveryPrompt && !recoveryVerified && (
          <div className="admin-toggle-section">
            <button
              onClick={() => {
                setShowAdminLogin(!showAdminLogin);
                clearMessage();
              }}
              className="access-btn text-link"
            >
              {showAdminLogin ? "▲ Hide Admin Login" : "▼ Show Admin Login"}
            </button>

            {showAdminLogin && (
              <div className="admin-login-section">
                <label className="access-label">Admin Access Code</label>
                <input
                  type="password"
                  className="access-input"
                  value={adminInput}
                  onChange={(e) => setAdminInput(e.target.value)}
                />
                <button onClick={handleAdminLogin} className="access-btn admin">
                  Enter as Admin
                </button>

                <button
                  onClick={() => setShowRecoveryPrompt(true)}
                  className="access-btn text-link"
                >
                  Forgot Admin Code?
                </button>
              </div>
            )}
          </div>
        )}
        // Inside your return, replace the admin toggle section with this: */}

        {!showRecoveryPrompt && !recoveryVerified && (
          <div className="admin-toggle-section">
            <button
              onClick={() => {
                setShowAdminLogin(!showAdminLogin);
                setMessage("");
              }}
              className="access-btn text-link"
              aria-expanded={showAdminLogin}
            >
              {showAdminLogin ? (
                <>▲ Hide Admin Access</>
              ) : (
                <>🔐 Need Admin Access?</>
              )}
            </button>

            {showAdminLogin && (
              <div className="admin-login-section">
                <label className="access-label">Admin Access Code</label>
                <input
                  type="password"
                  className="access-input"
                  value={adminInput}
                  onChange={(e) => setAdminInput(e.target.value)}
                />
                <button onClick={handleAdminLogin} className="access-btn admin">
                  Log In as Admin
                </button>

                <button
                  onClick={() => setShowRecoveryPrompt(true)}
                  className="access-btn text-link"
                >
                  🔑 Forgot Admin Code?
                </button>
              </div>
            )}
          </div>
        )}

        {/* === Recovery Flow === */}
        {showRecoveryPrompt && !recoveryVerified && (
          <div className="recovery-section">
            <label className="access-label">Enter Recovery Code</label>
            <input
              type="text"
              className="access-input"
              value={recoveryInput}
              onChange={(e) => setRecoveryInput(e.target.value)}
            />
            <button
              onClick={handleRecoverySubmit}
              className="access-btn recovery"
            >
              Verify Recovery Code
            </button>
            <button
              onClick={() => {
                setShowRecoveryPrompt(false);
                setRecoveryInput("");
                setMessage("");
              }}
              className="access-btn text-link"
            >
              Cancel
            </button>
            {message && <p className="access-message">{message}</p>}
          </div>
        )}

        {recoveryVerified && (
          <div className="recovery-reset-section">
            <h3 className="access-subtitle">Reset Access Codes</h3>

            <label className="access-label">New Admin Code</label>
            <input
              type="text"
              className="access-input"
              value={newAdminCode}
              onChange={(e) => setNewAdminCode(e.target.value)}
            />

            <label className="access-label">New User Code</label>
            <input
              type="text"
              className="access-input"
              value={newUserCode}
              onChange={(e) => setNewUserCode(e.target.value)}
            />

            <button onClick={handleRecoverySave} className="access-btn save-btn">
              💾 Save New Codes
            </button>

            <button
              onClick={() => {
                setRecoveryVerified(false);
                setShowRecoveryPrompt(false);
                setRecoveryInput("");
                setNewAdminCode("");
                setNewUserCode("");
                setMessage("");
              }}
              className="access-btn text-link"
            >
              Cancel
            </button>

            {message && <p className="access-message">{message}</p>}
          </div>
        )}

        {/* Global message (only when not in recovery flow) */}
        {!recoveryVerified && !showRecoveryPrompt && message && (
          <p className="access-message">{message}</p>
        )}
      </div>
    </div>
  );
}