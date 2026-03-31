(function () {
  function parseSession(raw) {
    if (!raw) return null;
    try {
      const session = JSON.parse(raw);
      if (!session || typeof session !== "object") return null;
      return session;
    } catch {
      return null;
    }
  }

  function normalizeSession(session) {
    if (!session) return null;

    const normalized = {
      uid: session.uid || "",
      email: session.email || "",
      name: session.name || "",
      role: session.role || "",
      roleLevel: session.roleLevel || "",
      schoolId: session.schoolId || "",
      status: session.status || "active",
      created: session.created || null,
      loginAt: session.loginAt || Date.now()
    };

    if (!normalized.role) return null;
    if (normalized.role === "school" && !normalized.schoolId) return null;

    return normalized;
  }

  function saveBoth(session) {
    const json = JSON.stringify(session);
    localStorage.setItem("madaris_user_session", json);
    localStorage.setItem("madaris_session", json);
  }

  function clearBoth() {
    localStorage.removeItem("madaris_user_session");
    localStorage.removeItem("madaris_session");
  }

  function getSession() {
    const first = parseSession(localStorage.getItem("madaris_user_session"));
    const second = parseSession(localStorage.getItem("madaris_session"));
    const session = normalizeSession(first || second);

    if (!session) return null;

    saveBoth(session);
    return session;
  }

  function requireSchoolSession() {
    const session = getSession();
    if (!session) {
      window.location.replace("../login.html");
      return null;
    }

    if (session.role !== "school") {
      window.location.replace("../login.html");
      return null;
    }

    return session;
  }

  function logoutToLogin() {
    clearBoth();
    window.location.replace("../login.html");
  }

  window.MadarisSession = {
    getSession,
    requireSchoolSession,
    logoutToLogin,
    clearBoth,
    saveBoth
  };
})();
