import React, { useEffect, useState } from "react";
import "./AdminPage.css";
import { supabaseAccess } from "../../lib/supabaseAccessClient";

interface AdminPageProps {
  onBackClick: () => void;
}

export default function AdminPage({ onBackClick }: AdminPageProps) {
  const [adminCode, setAdminCodeInput] = useState("");
  const [userCode, setUserCodeInput] = useState("");
  const [statusMsg, setStatusMsg] = useState("");

  // Load codes from Supabase
  useEffect(() => {
    (async () => {
      const { data, error } = await supabaseAccess
        .from("access_codes")
        .select("role, code");

      if (error) {
        console.error(error);
        setStatusMsg("❌ Failed to load codes.");
        return;
      }

      const adminRow = data.find((r) => r.role === "admin");
      const userRow = data.find((r) => r.role === "user");

      setAdminCodeInput(adminRow?.code ?? "");
      setUserCodeInput(userRow?.code ?? "");
    })();
  }, []);

  // Save codes to Supabase
  const handleSave = async () => {
    if (!adminCode.trim() || !userCode.trim()) {
      setStatusMsg("⚠ Please fill in both admin and user codes.");
      return;
    }

    try {
      // Update ADMIN
      await supabaseAccess
        .from("access_codes")
        .update({ code: adminCode.trim() })
        .eq("role", "admin");

      // Update USER
      await supabaseAccess
        .from("access_codes")
        .update({ code: userCode.trim() })
        .eq("role", "user");

      setStatusMsg("✅ Access codes updated successfully!");
    } catch (err) {
      console.error(err);
      setStatusMsg("❌ Failed to update Supabase.");
    }
  };

  // Download backup file
  const handleDownloadInfo = async () => {
    try {
      const now = new Date().toLocaleString();

      const content = `
CARE8 — Access Codes Backup
Generated: ${now}

Admin Code: ${adminCode}
User Code: ${userCode}

Store securely. Do not share.
`;

      const blob = new Blob([content.trim()], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `care8_access_backup_${Date.now()}.txt`;
      a.click();
      URL.revokeObjectURL(url);

      setStatusMsg("✅ Backup downloaded.");
    } catch (err) {
      console.error(err);
      setStatusMsg("❌ Failed to download file.");
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-card">
        <h1 className="admin-title">🛠 Admin Panel</h1>
        <p className="admin-description">
          Manage access codes and download backup information below.
        </p>

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
        </div>

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

        {statusMsg && <p className="status-msg">{statusMsg}</p>}

        <button onClick={onBackClick} className="admin-btn back-btn">
          ← Back to Main App
        </button>
      </div>
    </div>
  );
}
