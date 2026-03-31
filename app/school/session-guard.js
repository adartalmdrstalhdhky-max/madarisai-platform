// =========================================
// Madaris AI - Unified School Session Guard
// File: app/school/session-guard.js
// =========================================

// هذا الملف يوحّد قراءة الجلسة داخل كل صفحات المدرسة.
// يقرأ أولاً madaris_user_session
// ثم madaris_session كنسخة احتياطية.
// ويتأكد أن الدور role = school
// وأن schoolId موجود.
// إذا لم يجد جلسة صحيحة يرجّع المستخدم إلى صفحة تسجيل الدخول.

(function () {
  "use strict";

  const PRIMARY_SESSION_KEY = "madaris_user_session";
  const FALLBACK_SESSION_KEY = "madaris_session";

  function safeParse(value) {
    if (!value || typeof value !== "string") return null;
    try {
      return JSON.parse(value);
    } catch (error) {
      console.warn("تعذر قراءة JSON من الجلسة:", error);
      return null;
    }
  }

  function normalizeSession(raw) {
    if (!raw || typeof raw !== "object") return null;

    const normalized = {
      uid: raw.uid || raw.userId || raw.id || "",
      email: raw.email || "",
      name: raw.name || raw.fullName || raw.displayName || "",
      role: raw.role || "",
      roleLevel: raw.roleLevel || "",
      schoolId: raw.schoolId || raw.schoolID || "",
      status: raw.status || "active",
      loginAt: raw.loginAt || raw.createdAt || Date.now()
    };

    if (!normalized.role || !normalized.schoolId) {
      return null;
    }

    return normalized;
  }

  function readPrimarySession() {
    const raw = localStorage.getItem(PRIMARY_SESSION_KEY);
    return normalizeSession(safeParse(raw));
  }

  function readFallbackSession() {
    const raw = localStorage.getItem(FALLBACK_SESSION_KEY);
    return normalizeSession(safeParse(raw));
  }

  function persistUnifiedSession(session) {
    if (!session) return;

    const serialized = JSON.stringify(session);
    localStorage.setItem(PRIMARY_SESSION_KEY, serialized);
    localStorage.setItem(FALLBACK_SESSION_KEY, serialized);
  }

  function clearSchoolSessions() {
    localStorage.removeItem(PRIMARY_SESSION_KEY);
    localStorage.removeItem(FALLBACK_SESSION_KEY);
  }

  function getLoginUrl() {
    const currentPath = window.location.pathname || "";
    if (currentPath.includes("/app/school/")) {
      return "../login.html";
    }
    if (currentPath.includes("/school/")) {
      return "../login.html";
    }
    return "/app/login.html";
  }

  function redirectToLogin(reason) {
    if (reason) {
      console.warn("Session Guard:", reason);
    }

    clearSchoolSessions();

    const loginUrl = getLoginUrl();

    if (!window.location.pathname.endsWith("login.html")) {
      window.location.href = loginUrl;
    }
  }

  function isSchoolSession(session) {
    return !!session &&
      session.role === "school" &&
      typeof session.schoolId === "string" &&
      session.schoolId.trim() !== "";
  }

  function getSchoolSession() {
    let session = readPrimarySession();

    if (!session) {
      session = readFallbackSession();
    }

    if (!isSchoolSession(session)) {
      return null;
    }

    persistUnifiedSession(session);
    return session;
  }

  function requireSchoolSession(options = {}) {
    const settings = {
      redirectIfMissing: true,
      onValid: null,
      onInvalid: null,
      ...options
    };

    const session = getSchoolSession();

    if (!session) {
      if (typeof settings.onInvalid === "function") {
        settings.onInvalid();
      }

      if (settings.redirectIfMissing) {
        redirectToLogin("لا توجد جلسة مدرسة صحيحة.");
      }

      return null;
    }

    if (typeof settings.onValid === "function") {
      settings.onValid(session);
    }

    return session;
  }

  function getSchoolId() {
    const session = getSchoolSession();
    return session ? session.schoolId : "";
  }

  function getSchoolName() {
    const session = getSchoolSession();
    return session ? (session.name || "") : "";
  }

  function fillSessionElements(session) {
    if (!session) return;

    const schoolIdNodes = document.querySelectorAll("[data-school-id]");
    schoolIdNodes.forEach((node) => {
      node.textContent = session.schoolId || "-";
    });

    const schoolNameNodes = document.querySelectorAll("[data-school-name]");
    schoolNameNodes.forEach((node) => {
      node.textContent = session.name || "حساب المدرسة";
    });

    const roleNodes = document.querySelectorAll("[data-school-role]");
    roleNodes.forEach((node) => {
      node.textContent = session.role || "-";
    });

    const statusNodes = document.querySelectorAll("[data-school-status]");
    statusNodes.forEach((node) => {
      node.textContent = session.status || "active";
    });

    const emailNodes = document.querySelectorAll("[data-school-email]");
    emailNodes.forEach((node) => {
      node.textContent = session.email || "-";
    });
}
function bindLogoutButtons() {
    const buttons = document.querySelectorAll(
      "[data-action='logout'], .logout-btn, #logoutBtn, #btnLogout"
    );

    buttons.forEach((button) => {
      if (button.dataset.sessionGuardBound === "true") return;

      button.dataset.sessionGuardBound = "true";
      button.addEventListener("click", function () {
        clearSchoolSessions();
        window.location.href = getLoginUrl();
      });
    });
  }

  function bindDashboardButtons() {
    const buttons = document.querySelectorAll(
      "[data-action='go-dashboard'], .go-dashboard-btn, #goDashboardBtn, #btnDashboard"
    );

    buttons.forEach((button) => {
      if (button.dataset.sessionGuardBound === "true") return;

      button.dataset.sessionGuardBound = "true";
      button.addEventListener("click", function () {
        window.location.href = "index.html";
      });
    });
  }

  function autoBoot() {
    const session = requireSchoolSession({
      redirectIfMissing: true
    });

    if (!session) return;

    fillSessionElements(session);
    bindLogoutButtons();
    bindDashboardButtons();

    document.documentElement.setAttribute("data-school-session-ready", "true");
    document.body.setAttribute("data-school-session-ready", "true");

    window.dispatchEvent(
      new CustomEvent("madaris:school-session-ready", {
        detail: session
      })
    );
  }

  window.MadarisSchoolSession = {
    PRIMARY_SESSION_KEY,
    FALLBACK_SESSION_KEY,
    safeParse,
    normalizeSession,
    readPrimarySession,
    readFallbackSession,
    persistUnifiedSession,
    clearSchoolSessions,
    getSchoolSession,
    requireSchoolSession,
    getSchoolId,
    getSchoolName,
    fillSessionElements,
    redirectToLogin,
    bindLogoutButtons,
    bindDashboardButtons
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", autoBoot);
  } else {
    autoBoot();
  }
})();
