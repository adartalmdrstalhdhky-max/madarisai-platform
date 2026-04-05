// app/core/session.js

const SESSION_KEY = "madarisai_session";

export function saveSession(userData) {
  if (!userData || typeof userData !== "object") {
    throw new Error("saveSession: invalid userData");
  }

  const safeSession = {
    uid: userData.uid || "",
    email: userData.email || "",
    fullName: userData.fullName || "",
    role: userData.role || "",
    schoolId: userData.schoolId || "",
    schoolName: userData.schoolName || "",
    status: userData.status || "active",
    lastLoginAt: Date.now()
  };

  localStorage.setItem(SESSION_KEY, JSON.stringify(safeSession));
  return safeSession;
}

export function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.uid) return null;

    return parsed;
  } catch (error) {
    console.error("getSession error:", error);
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function isLoggedIn() {
  const session = getSession();
  return !!(session && session.uid);
}

export function hasRole(expectedRole) {
  const session = getSession();
  if (!session) return false;
  return session.role === expectedRole;
}

export function requireSession(redirectPath = "../login.html") {
  const session = getSession();

  if (!session || !session.uid) {
    window.location.href = redirectPath;
    return null;
  }

  return session;
}

export function requireRole(expectedRole, redirectPath = "../login.html") {
  const session = requireSession(redirectPath);
  if (!session) return null;

  if (session.role !== expectedRole) {
    window.location.href = redirectPath;
    return null;
  }

  return session;
}
