import CryptoJS from "crypto-js";

// ✅ constants
const SECRET_KEY = "care8_secure_v2_key";
const STORAGE_KEY = "care8_access_data_secure_v2";

// ✅ helper: generate random recovery code
function generateRecoveryCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 16; i++) {
    if (i > 0 && i % 4 === 0) code += "-";
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// ✅ helper: encrypt and save securely
function saveEncryptedData(data: any) {
  const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
  localStorage.setItem(STORAGE_KEY, encrypted);
}

// ✅ helper: decrypt securely
function decryptData(): any {
  try {
    const encryptedData = localStorage.getItem(STORAGE_KEY);
    if (!encryptedData) return null;

    const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
    if (!decryptedString) return null;

    return JSON.parse(decryptedString);
  } catch {
    return null;
  }
}

// ✅ initialize storage if missing
export async function initializeDefaultCodes(): Promise<any> {
  const existing = localStorage.getItem(STORAGE_KEY);
  if (existing) return getAccessData();

  const defaults = {
    adminCode: "admin123",
    userCode: "user123",
    recoveryCode: generateRecoveryCode(),
  };

  saveEncryptedData(defaults);
  console.log("✅ Initialized with new recovery code:", defaults.recoveryCode);
  return defaults;
}

// ✅ get decrypted data
export async function getAccessData(): Promise<any> {
  const data = decryptData();
  return data || {};
}

// ✅ verify user code
export async function verifyUser(code: string): Promise<boolean> {
  const data = decryptData();
  if (!data) return false;
  return code.trim() === data.userCode.trim();
}

// ✅ verify admin code
export async function verifyAdmin(code: string): Promise<boolean> {
  const data = decryptData();
  if (!data) return false;
  return code.trim() === data.adminCode.trim();
}

// ✅ verify recovery code (fixed)
export async function verifyRecovery(code: string): Promise<boolean> {
  const data = decryptData();
  if (!data || !data.recoveryCode) return false;

  const cleanInput = code.trim().toUpperCase();
  const cleanStored = data.recoveryCode.trim().toUpperCase();

  const isValid = cleanInput === cleanStored;

  if (!isValid) {
    console.warn("❌ Recovery code mismatch:", { input: cleanInput, stored: cleanStored });
  }

  return isValid;
}

// ✅ update admin password
export async function setAdminCode(newCode: string): Promise<void> {
  const data = decryptData() || {};
  data.adminCode = newCode;
  saveEncryptedData(data);
}

// ✅ update user password
export async function setUserCode(newCode: string): Promise<void> {
  const data = decryptData() || {};
  data.userCode = newCode;
  saveEncryptedData(data);
}

// ✅ reset all codes (for re-deployment or testing)
export async function resetAllCodes(): Promise<void> {
  const defaults = {
    adminCode: "admin123",
    userCode: "user123",
    recoveryCode: generateRecoveryCode(),
  };
  saveEncryptedData(defaults);
  console.warn("⚠ All access codes have been reset.");
}

// ✅ clear all access data (for full logout / debugging)
export function clearAccessData(): void {
  localStorage.removeItem(STORAGE_KEY);
}
