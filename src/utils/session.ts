// utils/session.ts
export function getSessionId(): string {
  const key = "chatSessionId";
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID(); // generate unique ID
    sessionStorage.setItem(key, id);
  }
  return id;
}
