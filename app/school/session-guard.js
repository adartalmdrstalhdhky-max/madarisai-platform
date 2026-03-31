// ===============================
// Madaris AI - Unified School Session Guard
// File: app/school/session-guard.js
// Final Stable Version
// ===============================

(function () {
  "use strict";

  const LOGIN_URL = "../login.html";

  function clearAllSessions() {
    localStorage.removeItem("madaris_user_session");
    localStorage.removeItem("madaris_session");
    sessionStorage.removeItem("madaris_user_session");
    sessionStorage.removeItem("madaris_session");
  }

  function parseSession(raw) {
    if (!raw) return null;

    try {
      return JSON.parse(raw);
    } catch (error) {
      return null;
    }
  }

  function readStoredSession() {
    const raw =
      localStorage.getItem("madaris_user_session") ||
      localStorage.getItem("madaris_session") ||
      sessionStorage.getItem("madaris_user_session") ||
      sessionStorage.getItem("madaris_session");

    return parseSession(raw);
  }

  function normalizeSession(session) {
    if (!session) return null;

    return {
      uid: session.uid || "",
      email: session.email || "",
      name: session.name || "",
      role: session.role || "",
      roleLevel: session.roleLevel || "",
      schoolId: session.schoolId || "",
      status: session.status || "active",
      loginAt: session.loginAt || Date.now()
    };
  }

  function isValidSchoolSession(session) {
    return !!(
      session &&
      session.uid &&
      session.role === "school" &&
      session.schoolId &&
      session.status !== "disabled"
    );
  }

  function saveUnifiedSession(session) {
    localStorage.setItem("madaris_user_session", JSON.stringify(session));
    localStorage.setItem("madaris_session", JSON.stringify(session));
  }

  function redirectToLogin() {
    window.location.href = LOGIN_URL;
  }

  function exposeSession(session) {
    window.MADARIS_SESSION = session;
    window.MADARIS_SCHOOL_SESSION = session;
    window.MADARIS_SCHOOL_ID = session.schoolId;
  }

  function fillSessionData(session) {
    const nameEls = document.querySelectorAll(
      "#schoolName, .school-name, [data-school-name]"
    );
    const schoolIdEls = document.querySelectorAll(
      "#schoolId, .school-id, [data-school-id]"
    );
    const roleEls = document.querySelectorAll(
      "#sessionRole, .session-role, [data-session-role]"
    );
    const statusEls = document.querySelectorAll(
      "#sessionStatus, .session-status, [data-session-status]"
    );
    const ownerEls = document.querySelectorAll(
      "#ownerName, .owner-name, [data-owner-name]"
    );

    nameEls.forEach((el) => {
      el.textContent = session.name || "لوحة المدرسة";
    });

    schoolIdEls.forEach((el) => {
      el.textContent = session.schoolId || "";
    });

    roleEls.forEach((el) => {
      el.textContent = session.role || "";
    });

    statusEls.forEach((el) => {
      el.textContent = session.status || "";
    });

    ownerEls.forEach((el) => {
      el.textContent = session.name || "";
    });
  }

  function wireLogoutButtons() {
    const buttons = document.querySelectorAll(
      "#logoutBtn, .logout-btn, [data-logout]"
    );

    buttons.forEach((btn) => {
      btn.addEventListener("click", function (event) {
        event.preventDefault();
        clearAllSessions();
        redirectToLogin();
      });
    });
  }

  function boot() {
    const rawSession = readStoredSession();
    const session = normalizeSession(rawSession);

    if (!isValidSchoolSession(session)) {
      clearAllSessions();
      redirectToLogin();
      return;
    }

    saveUnifiedSession(session);
    exposeSession(session);
    fillSessionData(session);
    wireLogoutButtons();

    document.documentElement.setAttribute("data-school-auth", "ready");
    document.body.setAttribute("data-school-auth", "ready");
  }

  window.getMadarisSchoolSession = function () {
    return window.MADARIS_SCHOOL_SESSION || null;
  };

  window.getMadarisSchoolId = function () {
    return window.MADARIS_SCHOOL_ID || "";
  };

  window.logoutSchoolSession = function () {
    clearAllSessions();
    redirectToLogin();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
