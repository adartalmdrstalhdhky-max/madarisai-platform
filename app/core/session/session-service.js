// app/core/session/session-service.js

import { readRawSessionCandidates, persistSession, clearSession } from "./session-storage.js";
import { normalizeSession } from "./session-normalizer.js";

export function getSession() {
  const candidates = readRawSessionCandidates();

  for (const candidate of candidates) {
    const normalized = normalizeSession(candidate);
    if (normalized) {
      persistSession(normalized);
      return normalized;
    }
  }

  return null;
}

export function requireSchoolSession() {
  const session = getSession();

  if (!session || session.role !== "school" || !session.schoolId) {
    window.location.href = "/app/login.html";
    return null;
  }

  return session;
}

export function saveSession(session) {
  const normalized = normalizeSession(session);

  if (!normalized) {
    throw new Error("Invalid session payload");
  }

  persistSession(normalized);
  return normalized;
}

export function logout() {
  clearSession();
  window.location.href = "/app/login.html";
}
