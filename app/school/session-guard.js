// ============================================================
// Madaris AI
// app/school/session-guard.js
// Wrapper over shared core session service
// Backward-compatible for legacy school pages
// ============================================================

import {
  getSession as coreGetSession,
  requireSchoolSession as coreRequireSchoolSession,
  saveSession as coreSaveSession,
  logout as coreLogout,
} from "../core/session/session-service.js";

// ------------------------------------------------------------
// Constants
// ------------------------------------------------------------

const LOGIN_URL = "/app/login.html";

// ------------------------------------------------------------
// Small helpers
// ------------------------------------------------------------

function normalize(value) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function normalizeLower(value) {
  return normalize(value).toLowerCase();
}

function pickFirstNonEmpty(...values) {
  for (const value of values) {
    const normalized = normalize(value);
    if (normalized) return normalized;
  }
  return "";
}

function safeClone(value) {
  try {
    return JSON.parse(JSON.stringify(value));
  } catch (_error) {
    return value;
  }
}

function safeParseJson(value) {
  if (!value || typeof value !== "string") return null;

  try {
    return JSON.parse(value);
  } catch (_error) {
    return null;
  }
}

function redirectToLogin() {
  window.location.replace(LOGIN_URL);
}

function readStorage(key) {
  try {
    const fromLocal = localStorage.getItem(key);
    if (fromLocal) return fromLocal;
  } catch (_error) {}

  try {
    const fromSession = sessionStorage.getItem(key);
    if (fromSession) return fromSession;
  } catch (_error) {}

  return null;
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (_error) {}

  try {
    sessionStorage.setItem(key, value);
  } catch (_error) {}
}

function removeStorage(key) {
  try {
    localStorage.removeItem(key);
  } catch (_error) {}

  try {
    sessionStorage.removeItem(key);
  } catch (_error) {}
}

// ------------------------------------------------------------
// Legacy compatibility mapping
// ------------------------------------------------------------

function toLegacyCompatibleSession(coreSession) {
  if (!coreSession || typeof coreSession !== "object") return null;

  const userId = pickFirstNonEmpty(coreSession.userId, coreSession.uid);
  const displayName = pickFirstNonEmpty(
    coreSession.displayName,
    coreSession.userName,
    coreSession.name,
    coreSession.fullName,
    "مستخدم المدرسة"
  );

  const schoolId = pickFirstNonEmpty(
    coreSession.schoolId,
    coreSession.school?.id,
    coreSession.school?.schoolId
  );

  const schoolName = pickFirstNonEmpty(
    coreSession.schoolName,
    coreSession.school?.name,
    coreSession.school?.schoolName,
    "مدرسة بدون اسم"
  );

  const status = pickFirstNonEmpty(
    coreSession.status,
    coreSession.schoolStatus,
    coreSession.school?.status,
    "active"
  );

  const normalized = {
    // official core-facing shape
    userId,
    uid: userId,
    email: pickFirstNonEmpty(coreSession.email),
    role: "school",
    schoolId,
    schoolName,
    displayName,
    status,
    loginAt: Number(coreSession.loginAt || Date.now()),

    // legacy fields expected by older pages
    userName: displayName,
    name: displayName,
    fullName: displayName,
    schoolStatus: status,

    school: {
      id: schoolId,
      schoolId,
      name: schoolName,
      schoolName,
      status,
    },
  };

  return normalized;
}

function ensureLegacyStorage(session) {
  if (!session) return;

  const serialized = JSON.stringify(session);

  writeStorage("madarisai_session", serialized);
  writeStorage("schoolSession", serialized);
  writeStorage("school_session", serialized);
  writeStorage("madaris_school_session", serialized);

  writeStorage("schoolId", session.schoolId || "");
  writeStorage("schoolName", session.schoolName || "");
  writeStorage("userRole", session.role || "school");
  writeStorage("userName", session.displayName || session.userName || "");
  writeStorage("uid", session.userId || session.uid || "");
  writeStorage("email", session.email || "");
}

function clearLegacyStorage() {
  const keys = [
    "madarisai_session",
    "schoolSession",
    "school_session",
    "madaris_school_session",
    "madaris_session",
    "userSession",
    "session",
    "schoolId",
    "schoolName",
    "userRole",
    "userName",
    "uid",
    "email",
    "school_id",
    "schoolID",
    "school_name",
    "schoolAuth",
    "authUser",
    "currentSchool",
  ];

  for (const key of keys) {
    removeStorage(key);
  }
}

// ------------------------------------------------------------
// Fallback rescue for very old stored sessions
// ------------------------------------------------------------

function readLegacyCandidates() {
  const keys = [
    "madarisai_session",
    "schoolSession",
    "school_session",
    "madaris_school_session",
    "madaris_session",
    "userSession",
    "session",
  ];

  const candidates = [];

  for (const key of keys) {
    const raw = readStorage(key);
    const parsed = safeParseJson(raw);
    if (parsed && typeof parsed === "object") {
      candidates.push(parsed);
    }
  }

  return candidates;
}

function normalizeLegacyCandidate(candidate) {
  if (!candidate || typeof candidate !== "object") return null;

  const role = normalizeLower(
    candidate.role || candidate.userRole || candidate.sessionRole || "school"
  );

  const schoolId = pickFirstNonEmpty(
    candidate.schoolId,
    candidate.school?.id,
    candidate.school?.schoolId,
    candidate.schoolID,
    candidate.school_id
  );

  if (!schoolId) return null;
  if (role && role !== "school") return null;

  const schoolName = pickFirstNonEmpty(
    candidate.schoolName,
    candidate.school?.name,
    candidate.school?.schoolName,
    candidate.school_name,
    "مدرسة بدون اسم"
  );

  const displayName = pickFirstNonEmpty(
    candidate.displayName,
    candidate.userName,
    candidate.name,
    candidate.fullName,
    "مستخدم المدرسة"
  );

  const status = pickFirstNonEmpty(
    candidate.status,
    candidate.schoolStatus,
    candidate.school?.status,
    "active"
  );

  return {
    userId: pickFirstNonEmpty(candidate.userId, candidate.uid, candidate.id),
    uid: pickFirstNonEmpty(candidate.userId, candidate.uid, candidate.id),
    email: pickFirstNonEmpty(candidate.email),
    role: "school",
    schoolId,
    schoolName,
    displayName,
    userName: displayName,
    name: displayName,
    fullName: displayName,
    status,
    schoolStatus: status,
    loginAt: Number(candidate.loginAt || Date.now()),
    school: {
      id: schoolId,
      schoolId,
      name: schoolName,
      schoolName,
      status,
    },
  };
}

function rescueLegacySessionIntoCore() {
  const candidates = readLegacyCandidates();

  for (const candidate of candidates) {
    const normalized = normalizeLegacyCandidate(candidate);
    if (!normalized) continue;

    try {
      const saved = coreSaveSession(normalized);
      const compat = toLegacyCompatibleSession(saved);
      ensureLegacyStorage(compat);
      return compat;
    } catch (_error) {
      // continue to next candidate
    }
  }

  return null;
}
// ------------------------------------------------------------
// Public API
// ------------------------------------------------------------

function getSession() {
  const coreSession = coreGetSession();

  if (coreSession) {
    const compat = toLegacyCompatibleSession(coreSession);
    ensureLegacyStorage(compat);
    return compat;
  }

  const rescued = rescueLegacySessionIntoCore();
  if (rescued) return rescued;

  return null;
}

function saveSession(sessionLike) {
  const saved = coreSaveSession(sessionLike);
  const compat = toLegacyCompatibleSession(saved);
  ensureLegacyStorage(compat);
  return compat;
}

function updateSession(patch) {
  const current = getSession();
  if (!current) return null;

  const merged = {
    ...safeClone(current),
    ...safeClone(patch || {}),
  };

  if (patch && typeof patch === "object" && patch.school && current.school) {
    merged.school = {
      ...safeClone(current.school),
      ...safeClone(patch.school),
    };
  }

  return saveSession(merged);
}

function clearSession() {
  clearLegacyStorage();
}

function logoutToLogin() {
  clearLegacyStorage();
  coreLogout();
}

function requireSchoolSession(options = {}) {
  const {
    redirect = true,
    allowInactive = false,
  } = options;

  let session = null;

  try {
    session = getSession();
  } catch (_error) {
    session = null;
  }

  if (!session) {
    if (redirect) redirectToLogin();
    return null;
  }

  const role = normalizeLower(session.role || "school");
  const schoolId = pickFirstNonEmpty(
    session.schoolId,
    session.school?.id,
    session.school?.schoolId
  );
  const status = normalizeLower(
    session.status || session.schoolStatus || session.school?.status || "active"
  );

  if (role !== "school") {
    if (redirect) redirectToLogin();
    return null;
  }

  if (!schoolId) {
    if (redirect) redirectToLogin();
    return null;
  }

  if (!allowInactive && status && status !== "active") {
    if (redirect) redirectToLogin();
    return null;
  }

  return session;
}

// ------------------------------------------------------------
// Auto-protect school pages on load
// ------------------------------------------------------------

function shouldProtectCurrentPage() {
  const path = window.location.pathname || "";

  if (!path.includes("/app/school/")) return false;
  if (path.endsWith("/app/login.html")) return false;

  return true;
}

function bootGuard() {
  if (!shouldProtectCurrentPage()) return;

  const session = requireSchoolSession({ redirect: false });

  if (!session) {
    redirectToLogin();
    return;
  }

  // refresh legacy aliases so older pages keep working
  ensureLegacyStorage(session);
}

// ------------------------------------------------------------
// Expose compatibility globals for old pages
// ------------------------------------------------------------

const MadarisSession = {
  getSession,
  saveSession,
  updateSession,
  clearSession,
  requireSchoolSession,
  logoutToLogin,
};

window.MadarisSession = MadarisSession;
window.getSchoolSession = getSession;
window.saveSchoolSession = saveSession;
window.requireSchoolSession = requireSchoolSession;
window.logoutToLogin = logoutToLogin;

// ------------------------------------------------------------
// Start
// ------------------------------------------------------------

bootGuard();

export {
  getSession,
  saveSession,
  updateSession,
  clearSession,
  requireSchoolSession,
  logoutToLogin,
  MadarisSession,
};
