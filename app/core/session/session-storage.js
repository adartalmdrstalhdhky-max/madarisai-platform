// app/core/session/session-storage.js

export const PRIMARY_SESSION_KEY = "madarisai_session";

export const LEGACY_SESSION_KEYS = [
  "schoolSession",
  "madarisai_school_session",
  "school_session"
];

function safeParse(value) {
  if (!value || typeof value !== "string") return null;

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export function readRawSessionCandidates() {
  const candidates = [];

  const primaryLocal = localStorage.getItem(PRIMARY_SESSION_KEY);
  const primarySession = sessionStorage.getItem(PRIMARY_SESSION_KEY);

  if (primaryLocal) candidates.push(safeParse(primaryLocal));
  if (primarySession) candidates.push(safeParse(primarySession));

  for (const key of LEGACY_SESSION_KEYS) {
    const localValue = localStorage.getItem(key);
    const sessionValue = sessionStorage.getItem(key);

    if (localValue) candidates.push(safeParse(localValue));
    if (sessionValue) candidates.push(safeParse(sessionValue));
  }

  return candidates.filter(Boolean);
}

export function persistSession(session) {
  const value = JSON.stringify(session);
  localStorage.setItem(PRIMARY_SESSION_KEY, value);
  sessionStorage.setItem(PRIMARY_SESSION_KEY, value);
}

export function clearSession() {
  localStorage.removeItem(PRIMARY_SESSION_KEY);
  sessionStorage.removeItem(PRIMARY_SESSION_KEY);

  for (const key of LEGACY_SESSION_KEYS) {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  }

  localStorage.removeItem("schoolId");
  localStorage.removeItem("schoolName");
  localStorage.removeItem("userRole");
  localStorage.removeItem("userName");
}
