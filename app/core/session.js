// app/core/session.js

const SESSION_KEY = "madarisai_session";

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function normalizeSession(userData = {}) {
  return {
    uid: isNonEmptyString(userData.uid) ? userData.uid.trim() : "",
    email: isNonEmptyString(userData.email)
      ? userData.email.trim().toLowerCase()
      : "",
    fullName: isNonEmptyString(userData.fullName)
      ? userData.fullName.trim()
      : "",
    role: isNonEmptyString(userData.role) ? userData.role.trim() : "",
    schoolId: isNonEmptyString(userData.schoolId) ? userData.schoolId.trim() : "",
    schoolName: isNonEmptyString(userData.schoolName)
      ? userData.schoolName.trim()
      : "",
    status: isNonEmptyString(userData.status) ? userData.status.trim() : "active",
    lastLoginAt:
      typeof userData.lastLoginAt === "number" && Number.isFinite(userData.lastLoginAt)
        ? userData.lastLoginAt
        : Date.now(),
  };
}

function isValidBaseSession(session) {
  return !!(
    session &&
    isNonEmptyString(session.uid) &&
    isNonEmptyString(session.email) &&
    isNonEmptyString(session.role)
  );
}

function isValidRoleSession(session) {
  if (!isValidBaseSession(session)) return false;

  if (session.role === "school") {
    return isNonEmptyString(session.schoolId);
  }

  return true;
}

export function saveSession(userData) {
  if (!userData || typeof userData !== "object") {
    throw new Error("saveSession: invalid userData");
  }

  const safeSession = normalizeSession(userData);

  if (!isValidBaseSession(safeSession)) {
    throw new Error("saveSession: incomplete base session");
  }

  localStorage.setItem(SESSION_KEY, JSON.stringify(safeSession));
  return safeSession;
}

export function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    const normalized = normalizeSession(parsed);

    if (!isValidBaseSession(normalized)) {
      clearSession();
      return null;
    }

    return normalized;
  } catch (error) {
    console.error("getSession error:", error);
    clearSession();
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function isLoggedIn() {
  const session = getSession();
  return isValidBaseSession(session);
}

export function hasRole(expectedRole) {
  const session = getSession();
  if (!session) return false;
  return session.role === expectedRole;
}

export function requireSession(redirectPath = "../login.html") {
  const session = getSession();

  if (!isValidBaseSession(session)) {
    clearSession();
    window.location.href = redirectPath;
    return null;
  }

  return session;
}

export function requireRole(expectedRole, redirectPath = "../login.html") {
  const session = requireSession(redirectPath);
  if (!session) return null;

  if (session.role !== expectedRole) {
    clearSession();
    window.location.href = redirectPath;
    return null;
  }

  if (expectedRole === "school" && !isNonEmptyString(session.schoolId)) {
    clearSession();
    window.location.href = redirectPath;
    return null;
  }

  return session;
}

export function isCompleteSession() {
  const session = getSession();
  return isValidRoleSession(session);
}

export function repairOrClearSession() {
  const session = getSession();
  if (!session) return null;

  if (!isValidRoleSession(session)) {
    clearSession();
    return null;
  }

  return session;
}
