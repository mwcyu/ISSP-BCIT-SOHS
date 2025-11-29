import React, { useState } from "react";
import { setAdminCode } from "../../utils/accessStorage";

interface RecoveryPromptProps {
  onClose: () => void;
}

export default function RecoveryPrompt({ onClose }: RecoveryPromptProps) {
  const [fileName, setFileName] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    try {
      const text = await file.text();
      const newPassword = text.trim();
      if (!newPassword) {
        setStatus("❌ The file is empty. Please upload a valid password file.");
        return;
      }

      await setAdminCode(newPassword);
      setStatus(
        "✅ Admin password successfully reset! You can now log in with the new password."
      );
    } catch (error) {
      console.error(error);
      setStatus("❌ Failed to reset admin password.");
    }
  };

  return (
    <div className="access-page">
      <div className="access-container">
        <h2 className="access-title">🔑 Reset Admin Password</h2>
        <p className="access-message">
          Upload a <strong>.txt</strong> file containing your new admin
          password.
        </p>

        <input
          type="file"
          accept=".txt"
          onChange={handleFileUpload}
          className="access-input"
        />

        {fileName && (
          <p className="access-message">
            Selected file: <strong>{fileName}</strong>
          </p>
        )}
        {status && <p className="access-message">{status}</p>}

        <button onClick={onClose} className="access-btn text-link">
          Close
        </button>
      </div>
    </div>
  );
}
