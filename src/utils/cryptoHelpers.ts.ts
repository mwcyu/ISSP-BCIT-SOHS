// src/utils/cryptoHelpers.ts
// Web Crypto helpers: PBKDF2 hashing + AES-GCM encrypt/decrypt

const enc = new TextEncoder();
const dec = new TextDecoder();

function bufToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
function hexToBuf(hex: string): ArrayBuffer {
  const bytes = new Uint8Array(hex.match(/.{1,2}/g)!.map((b) => parseInt(b, 16)));
  return bytes.buffer;
}
function randBytesHex(len = 16) {
  const b = crypto.getRandomValues(new Uint8Array(len));
  return bufToHex(b.buffer);
}

// ---------- HASHING (PBKDF2) ----------
export async function hashPassword(password: string, providedSaltHex?: string) {
  const saltBuf = providedSaltHex ? hexToBuf(providedSaltHex) : crypto.getRandomValues(new Uint8Array(16)).buffer;
  const saltHex = providedSaltHex ?? bufToHex(saltBuf);
  const baseKey = await crypto.subtle.importKey("raw", enc.encode(password), { name: "PBKDF2" }, false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt: saltBuf, iterations: 120000, hash: "SHA-256" }, baseKey, 256);
  const hashHex = bufToHex(bits);
  return { hashHex, saltHex };
}

export async function verifyHash(password: string, storedHashHex: string, saltHex: string) {
  const { hashHex } = await hashPassword(password, saltHex);
  // constant-time not necessary here as it's subtle API returning strings, but keep equality check
  return hashHex === storedHashHex;
}

// ---------- ENCRYPTION (AES-GCM derived key via PBKDF2) ----------
async function deriveAesKey(password: string, saltHex: string, iterations = 150000) {
  const salt = hexToBuf(saltHex);
  const baseKey = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey({ name: "PBKDF2", salt, iterations, hash: "SHA-256" }, baseKey, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
}

export async function encryptWithPassword(plainText: string, password: string) {
  const saltHex = randBytesHex(16);
  const ivHex = randBytesHex(12);
  const key = await deriveAesKey(password, saltHex);
  const ivBuf = new Uint8Array(hexToBuf(ivHex));
  const cipherBuf = await crypto.subtle.encrypt({ name: "AES-GCM", iv: ivBuf }, key, enc.encode(plainText));
  return { cipherHex: bufToHex(cipherBuf), ivHex, saltHex };
}

export async function decryptWithPassword(cipherHex: string, ivHex: string, saltHex: string, password: string) {
  const key = await deriveAesKey(password, saltHex);
  const ivBuf = new Uint8Array(hexToBuf(ivHex));
  const cipherBuf = hexToBuf(cipherHex);
  const plainBuf = await crypto.subtle.decrypt({ name: "AES-GCM", iv: ivBuf }, key, cipherBuf);
  return dec.decode(plainBuf);
}
