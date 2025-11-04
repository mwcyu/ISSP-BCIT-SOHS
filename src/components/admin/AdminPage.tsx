import React, { useEffect, useState } from "react";
import "./AdminPage.css";
import {
  getAccessData,
  setAdminCode,
  setUserCode,
  initializeDefaultCodes,
} from "../../utils/accessStorage";

interface AdminPageProps {
  onBackClick: () => void;
}

export default function AdminPage({ onBackClick }: AdminPageProps) {
  const [adminCode, setAdminCodeInput] = useState("");
  const [userCode, setUserCodeInput] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [statusMsg, setStatusMsg] = useState("");

  // ✅ Load existing codes on mount
  useEffect(() => {
    (async () => {
      const data = (await getAccessData()) || (await initializeDefaultCodes());
      setAdminCodeInput(data.adminCode || "");
      setUserCodeInput(data.userCode || "");
      setRecoveryCode(data.recoveryCode || "");
    })();
  }, []);

  // ✅ Handle save changes
  const handleSave = async () => {
    try {
      if (!adminCode.trim() || !userCode.trim()) {
        setStatusMsg("⚠ Please fill in both admin and user codes.");
        return;
      }

      await setAdminCode(adminCode.trim());
      await setUserCode(userCode.trim());
      setStatusMsg("✅ Access codes updated successfully!");
    } catch (err) {
      console.error(err);
      setStatusMsg("❌ Failed to update codes.");
    }
  };

  // ✅ Regenerate recovery code (random)
  const handleRegenerateRecovery = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let newCode = "";
    for (let i = 0; i < 16; i++) {
      if (i > 0 && i % 4 === 0) newCode += "-";
      newCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setRecoveryCode(newCode);
    setStatusMsg("✅ New recovery code generated. (Don't forget to save!)");
  };

  // ✅ Download access info
  const handleDownloadInfo = async () => {
    try {
      const data = await getAccessData();
      const now = new Date().toLocaleString();

      const content = `
CARE8 — Access Information Backup
Generated: ${now}

Admin Code: ${data.adminCode || "(unavailable)"}
User Code: ${data.userCode || "(unavailable)"}
Recovery Code: ${data.recoveryCode || "(unavailable)"}

⚠ IMPORTANT SECURITY NOTICE ⚠
- This file contains sensitive login information.
- Store it in an encrypted or offline location (e.g., USB or secure notes app).
- Do NOT share or upload this file publicly.
- If you have recently changed passwords, download a new copy from the Admin Panel to ensure it’s up to date.
`;

      const blob = new Blob([content.trim()], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `care8_access_info_${Date.now()}.txt`;
      a.click();
      URL.revokeObjectURL(url);

      setStatusMsg("✅ Access info file downloaded successfully.");
    } catch (err) {
      console.error(err);
      setStatusMsg("❌ Failed to download access info.");
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-card">
        <h1 className="admin-title">🛠 Admin Panel</h1>
        <p className="admin-description">
          Manage access codes, recovery, and backup information below.
        </p>

        {/* ===== Input Section ===== */}
        <div className="admin-fields">
          <div className="admin-field-group">
            <label className="admin-label">Admin Code</label>
            <input
              type="text"
              className="admin-input"
              value={adminCode}
              onChange={(e) => setAdminCodeInput(e.target.value)}
            />
          </div>

          <div className="admin-field-group">
            <label className="admin-label">User Code</label>
            <input
              type="text"
              className="admin-input"
              value={userCode}
              onChange={(e) => setUserCodeInput(e.target.value)}
            />
          </div>

          <div className="admin-field-group">
            <label className="admin-label">Recovery Code</label>
            <div className="recovery-row">
              <input
                type="text"
                className="admin-input recovery-input"
                value={recoveryCode}
                readOnly
              />
              <button
                className="admin-btn small-btn"
                onClick={handleRegenerateRecovery}>
                🔄 Regenerate
              </button>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="admin-actions">
          <button className="admin-btn save-btn" onClick={handleSave}>
            💾 Save Changes
          </button>

          <button
            className="admin-btn download-btn"
            onClick={handleDownloadInfo}>
            📁 Download Access Info
          </button>
        </div>

        {statusMsg && (
          <p className="status-msg" style={{ marginTop: "10px" }}>
            {statusMsg}
          </p>
        )}

        <button onClick={onBackClick} className="admin-btn back-btn mt-8">
          ← Back to Main App
        </button>
      </div>
    </div>
  );
}
