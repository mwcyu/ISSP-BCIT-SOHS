import React, { useEffect, useState } from "react";
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
    <div className="flex justify-center items-center min-h-screen w-full bg-[radial-gradient(circle_at_10%_20%,var(--color-bcit-blue),var(--color-bcit-dark)_70%)] text-slate-800 font-sans p-6">
      <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-xl max-w-[460px] w-full text-center relative overflow-hidden before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-bcit-gold before:to-bcit-blue">
        <h1 className="text-2xl font-extrabold mb-1.5 text-bcit-blue tracking-tight">🛠 Admin Panel</h1>
        <p className="text-slate-600 mb-7 text-[0.95rem] leading-relaxed">
          Manage access codes and download backup information below.
        </p>

        <div className="flex flex-col gap-5 text-left mb-6">
          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-slate-900 mb-1.5 text-sm flex items-center gap-1 before:content-['•'] before:text-bcit-gold before:font-bold">Admin Code</label>
            <input
              type="text"
              className="bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 text-base outline-none transition-all w-full focus:border-bcit-blue focus:ring-4 focus:ring-bcit-blue/20"
              value={adminCode}
              onChange={(e) => setAdminCodeInput(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-slate-900 mb-1.5 text-sm flex items-center gap-1 before:content-['•'] before:text-bcit-gold before:font-bold">User Code</label>
            <input
              type="text"
              className="bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 text-base outline-none transition-all w-full focus:border-bcit-blue focus:ring-4 focus:ring-bcit-blue/20"
              value={userCode}
              onChange={(e) => setUserCodeInput(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 mt-6">
          <button className="bg-bcit-blue text-white border-none rounded-md px-3.5 py-2.5 font-semibold transition-all duration-200 cursor-pointer hover:bg-bcit-dark hover:shadow-md hover:-translate-y-1 active:translate-y-0 active:shadow-sm" onClick={handleSave}>
            💾 Save Changes
          </button>

          <button
            className="bg-emerald-600 text-white border-none rounded-md px-3.5 py-2.5 font-semibold transition-all duration-200 cursor-pointer hover:bg-emerald-700 hover:shadow-md hover:-translate-y-1 active:translate-y-0 active:shadow-sm"
            onClick={handleDownloadInfo}>
            📁 Download Access Info
          </button>
        </div>

        {statusMsg && <p className="text-sm text-[#9effb3] mt-2">{statusMsg}</p>}

        <button onClick={onBackClick} className="bg-transparent text-[#434343] mt-5 underline text-sm hover:text-black cursor-pointer border-none">
          ← Back to Main App
        </button>
      </div>
    </div>
  );
}
