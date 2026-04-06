(function () {
  const PRIMARY_SESSION_KEY = "madarisai_session";
  const FALLBACK_KEYS = [
    "madarisai_session",
    "school_session",
    "madaris_session",
    "session",
    "userSession"
  ];

  function isNonEmptyString(value) {
    return typeof value === "string" && value.trim().length > 0;
  }

  function safeParse(raw) {
    try {
      return JSON.parse(raw);
    } catch (error) {
      return null;
    }
  }

  function normalizeSession(input) {
    if (!input || typeof input !== "object") return null;

    const session = {
      uid: isNonEmptyString(input.uid) ? input.uid.trim() : "",
      email: isNonEmptyString(input.email) ? input.email.trim().toLowerCase() : "",
      fullName:
        (isNonEmptyString(input.fullName) && input.fullName.trim()) ||
        (isNonEmptyString(input.name) && input.name.trim()) ||
        "",
      role: isNonEmptyString(input.role) ? input.role.trim().toLowerCase() : "",
      schoolId:
        (isNonEmptyString(input.schoolId) && input.schoolId.trim()) ||
        (isNonEmptyString(input.school?.schoolId) && input.school.schoolId.trim()) ||
        "",
      schoolName:
        (isNonEmptyString(input.schoolName) && input.schoolName.trim()) ||
        (isNonEmptyString(input.school?.schoolName) && input.school.schoolName.trim()) ||
        (isNonEmptyString(input.school?.name) && input.school.name.trim()) ||
        "",
      status: isNonEmptyString(input.status) ? input.status.trim() : "active"
    };

    if (!session.uid || !session.role) return null;
    return session;
  }

  function readRawSession() {
    for (const key of FALLBACK_KEYS) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;

      const parsed = safeParse(raw);
      const normalized = normalizeSession(parsed);

      if (normalized) {
        if (key !== PRIMARY_SESSION_KEY) {
          localStorage.setItem(PRIMARY_SESSION_KEY, JSON.stringify(normalized));
        }
        return normalized;
      }
    }

    return null;
  }

  function getSession() {
    return readRawSession();
  }

  function saveSession(session) {
    const normalized = normalizeSession(session);
    if (!normalized) {
      throw new Error("INVALID_SESSION");
    }

    localStorage.setItem(PRIMARY_SESSION_KEY, JSON.stringify(normalized));
    return normalized;
  }

  function clearSession() {
    FALLBACK_KEYS.forEach((key) => localStorage.removeItem(key));
  }

  function redirectToLogin() {
    window.location.href = "/app/login.html";
  }

  function logoutToLogin() {
    clearSession();
    redirectToLogin();
  }

  function requireSchoolSession() {
    const session = getSession();

    if (!session) {
      redirectToLogin();
      return null;
    }

    if (session.role !== "school") {
      clearSession();
      redirectToLogin();
      return null;
    }

    return session;
  }

  window.MadarisSession = {
    getSession,
    saveSession,
    clearSession,
    redirectToLogin,
    logoutToLogin,
    requireSchoolSession
  };
})();
