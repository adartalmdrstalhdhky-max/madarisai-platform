(function () {
  "use strict";

  /**
   * Madaris AI - Unified School Session Guard
   * ---------------------------------------------------------
   * الهدف:
   * - قراءة الجلسة من جميع المفاتيح القديمة والجديدة
   * - تطبيعها إلى صيغة واحدة ثابتة
   * - إعادة حفظها بالمفتاح الرسمي
   * - توفير أدوات موحدة لباقي صفحات المدرسة
   */

  const PRIMARY_SESSION_KEY = "madarisai_session";

  const LEGACY_SESSION_KEYS = [
    "madarisai_session",
    "schoolSession",
    "school_session",
    "madaris_user_session",
    "madaris_session",
    "session",
    "userSession",
  ];

  const EXTRA_VALUE_KEYS = {
    schoolId: ["schoolId", "school_id", "schoolID"],
    schoolName: ["schoolName", "school_name"],
    userRole: ["userRole", "role"],
    userName: ["userName", "fullName", "name"],
    email: ["email", "userEmail"],
  };

  const LOGIN_PATH = "/app/login.html";

  function isObject(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
  }

  function isNonEmptyString(value) {
    return typeof value === "string" && value.trim().length > 0;
  }

  function toStringSafe(value) {
    if (value === null || value === undefined) return "";
    return String(value).trim();
  }

  function toLowerSafe(value) {
    return toStringSafe(value).toLowerCase();
  }

  function nowIso() {
    return new Date().toISOString();
  }

  function safeParse(raw) {
    if (!isNonEmptyString(raw)) return null;
    try {
      return JSON.parse(raw);
    } catch (_error) {
      return null;
    }
  }

  function readStorageValue(storage, key) {
    try {
      return storage.getItem(key);
    } catch (_error) {
      return null;
    }
  }

  function writeStorageValue(storage, key, value) {
    try {
      storage.setItem(key, value);
      return true;
    } catch (_error) {
      return false;
    }
  }

  function removeStorageValue(storage, key) {
    try {
      storage.removeItem(key);
      return true;
    } catch (_error) {
      return false;
    }
  }

  function getFirstNonEmptyFromObject(obj, keys) {
    if (!isObject(obj)) return "";
    for (const key of keys) {
      const value = obj[key];
      if (isNonEmptyString(value)) return value.trim();
      if (typeof value === "number" || typeof value === "boolean") {
        return String(value);
      }
    }
    return "";
  }

  function getFirstNonEmptyNested(obj, paths) {
    if (!isObject(obj)) return "";
    for (const path of paths) {
      let current = obj;
      let failed = false;

      for (const segment of path) {
        if (!isObject(current) || !(segment in current)) {
          failed = true;
          break;
        }
        current = current[segment];
      }

      if (!failed) {
        if (isNonEmptyString(current)) return current.trim();
        if (typeof current === "number" || typeof current === "boolean") {
          return String(current);
        }
      }
    }
    return "";
  }

  function getFromLooseSources(base, fieldName) {
    if (!isObject(base)) return "";

    switch (fieldName) {
      case "uid":
        return (
          getFirstNonEmptyFromObject(base, ["uid", "userId", "id"]) ||
          getFirstNonEmptyNested(base, [["user", "uid"], ["auth", "uid"]])
        );

      case "email":
        return (
          getFirstNonEmptyFromObject(base, ["email"]) ||
          getFirstNonEmptyNested(base, [["user", "email"], ["account", "email"]])
        );

      case "fullName":
        return (
          getFirstNonEmptyFromObject(base, [
            "fullName",
            "userName",
            "name",
            "displayName",
          ]) ||
          getFirstNonEmptyNested(base, [
            ["user", "name"],
            ["user", "fullName"],
            ["school", "managerName"],
          ])
        );

      case "role":
        return (
          getFirstNonEmptyFromObject(base, ["role", "userRole"]) ||
          getFirstNonEmptyNested(base, [["user", "role"]])
        );

      case "schoolId":
        return (
          getFirstNonEmptyFromObject(base, ["schoolId", "schoolID", "school_id"]) ||
          getFirstNonEmptyNested(base, [
            ["school", "id"],
            ["school", "schoolId"],
            ["meta", "schoolId"],
          ])
        );

      case "schoolName":
        return (
          getFirstNonEmptyFromObject(base, ["schoolName"]) ||
          getFirstNonEmptyNested(base, [
            ["school", "name"],
            ["school", "schoolName"],
            ["meta", "schoolName"],
          ])
        );

      case "status":
        return (
          getFirstNonEmptyFromObject(base, ["status", "schoolStatus"]) ||
          getFirstNonEmptyNested(base, [["school", "status"]])
        );

      case "createdAt":
        return (
          getFirstNonEmptyFromObject(base, ["createdAt", "created", "loginAt"]) ||
          getFirstNonEmptyNested(base, [["meta", "createdAt"]])
        );

      case "userId":
        return (
          getFirstNonEmptyFromObject(base, ["userId"]) ||
          getFirstNonEmptyNested(base, [["user", "id"]])
        );

      default:
        return "";
    }
  }

  function collectPrimitiveFallbacks() {
    const out = {
      schoolId: "",
      schoolName: "",
      userRole: "",
      userName: "",
      email: "",
    };

    for (const [target, keys] of Object.entries(EXTRA_VALUE_KEYS)) {
      for (const key of keys) {
        const fromLocal = readStorageValue(localStorage, key);
        if (isNonEmptyString(fromLocal)) {
          out[target] = fromLocal.trim();
          break;
        }

        const fromSession = readStorageValue(sessionStorage, key);
        if (isNonEmptyString(fromSession)) {
          out[target] = fromSession.trim();
          break;
        }
      }
    }

    return out;
  }

  function normalizeSession(input) {
    const fallback = collectPrimitiveFallbacks();
    const base = isObject(input) ? input : {};

    const uid = toStringSafe(getFromLooseSources(base, "uid"));
    const email = toLowerSafe(getFromLooseSources(base, "email") || fallback.email);
    const fullName = toStringSafe(
      getFromLooseSources(base, "fullName") || fallback.userName
    );
    const role = toLowerSafe(getFromLooseSources(base, "role") || fallback.userRole);
    const schoolId = toStringSafe(
      getFromLooseSources(base, "schoolId") || fallback.schoolId
    );
    const schoolName = toStringSafe(
      getFromLooseSources(base, "schoolName") || fallback.schoolName
    );
    const status = toStringSafe(getFromLooseSources(base, "status") || "active");
    const createdAt = toStringSafe(getFromLooseSources(base, "createdAt") || nowIso());
    const userId = toStringSafe(getFromLooseSources(base, "userId") || uid);
    const normalized = {
      uid,
      userId,
      email,
      fullName,
      userName: fullName,
      role,
      schoolId,
      schoolName,
      status,
      schoolStatus: status,
      createdAt,

      // شكل إضافي منظم ليسهل الاستعمال لاحقًا
      school: {
        id: schoolId,
        schoolId: schoolId,
        name: schoolName,
        schoolName: schoolName,
        status: status,
      },
    };

    if (!normalized.uid) return null;
    if (!normalized.role) return null;
    if (normalized.role !== "school") return null;
    if (!normalized.schoolId) return null;

    return normalized;
  }

  function persistSessionEverywhere(session) {
    const normalized = normalizeSession(session);
    if (!normalized) {
      throw new Error("INVALID_SESSION");
    }

    const payload = JSON.stringify(normalized);

    // المفتاح الرسمي الجديد
    writeStorageValue(localStorage, PRIMARY_SESSION_KEY, payload);
    writeStorageValue(sessionStorage, PRIMARY_SESSION_KEY, payload);

    // توافق مع login.js الحالي
    writeStorageValue(localStorage, "schoolSession", payload);
    writeStorageValue(sessionStorage, "schoolSession", payload);

    writeStorageValue(localStorage, "schoolId", normalized.schoolId);
    writeStorageValue(sessionStorage, "schoolId", normalized.schoolId);

    writeStorageValue(localStorage, "schoolName", normalized.schoolName);
    writeStorageValue(sessionStorage, "schoolName", normalized.schoolName);

    writeStorageValue(localStorage, "userRole", normalized.role);
    writeStorageValue(sessionStorage, "userRole", normalized.role);

    writeStorageValue(localStorage, "userName", normalized.fullName);
    writeStorageValue(sessionStorage, "userName", normalized.fullName);

    writeStorageValue(localStorage, "email", normalized.email);
    writeStorageValue(sessionStorage, "email", normalized.email);

    return normalized;
  }

  function readCandidateSessions() {
    const candidates = [];

    for (const key of LEGACY_SESSION_KEYS) {
      const rawLocal = readStorageValue(localStorage, key);
      const parsedLocal = safeParse(rawLocal);
      if (parsedLocal) {
        candidates.push(parsedLocal);
      }

      const rawSession = readStorageValue(sessionStorage, key);
      const parsedSession = safeParse(rawSession);
      if (parsedSession) {
        candidates.push(parsedSession);
      }
    }

    return candidates;
  }

  function getSession() {
    const candidates = readCandidateSessions();

    for (const candidate of candidates) {
      const normalized = normalizeSession(candidate);
      if (!normalized) continue;

      // بمجرد أن نجد جلسة صالحة، نعيد حفظها بالشكل الرسمي الموحد
      persistSessionEverywhere(normalized);
      return normalized;
    }

    // محاولة أخيرة من المفاتيح المفردة فقط
    const fallbackOnly = normalizeSession({});
    if (fallbackOnly) {
      persistSessionEverywhere(fallbackOnly);
      return fallbackOnly;
    }

    return null;
  }

  function saveSession(session) {
    return persistSessionEverywhere(session);
  }

  function updateSession(patch) {
    const current = getSession();
    if (!current) {
      throw new Error("SESSION_NOT_FOUND");
    }

    const next = {
      ...current,
      ...(isObject(patch) ? patch : {}),
      school: {
        ...(isObject(current.school) ? current.school : {}),
        ...(isObject(patch?.school) ? patch.school : {}),
      },
    };

    return persistSessionEverywhere(next);
  }

  function clearSession() {
    for (const key of LEGACY_SESSION_KEYS) {
      removeStorageValue(localStorage, key);
      removeStorageValue(sessionStorage, key);
    }

    const extraKeys = [
      "schoolId",
      "schoolName",
      "userRole",
      "userName",
      "email",
      "school_id",
      "schoolID",
      "school_name",
      "madaris_school_id",
      "madaris_school_name",
    ];

    for (const key of extraKeys) {
      removeStorageValue(localStorage, key);
      removeStorageValue(sessionStorage, key);
    }
  }

  function redirectToLogin() {
    window.location.replace(LOGIN_PATH);
  }

  function logoutToLogin() {
    clearSession();
    redirectToLogin();
  }

  function requireSchoolSession(options) {
    const config = isObject(options) ? options : {};
    const allowInactive = Boolean(config.allowInactive);
    const redirectOnFail = config.redirectOnFail !== false;

    const session = getSession();

    if (!session) {
      if (redirectOnFail) redirectToLogin();
      return null;
    }

    if (session.role !== "school") {
      clearSession();
      if (redirectOnFail) redirectToLogin();
      return null;
    }

    const normalizedStatus = toLowerSafe(session.status || session.schoolStatus || "active");
    if (!allowInactive && normalizedStatus && normalizedStatus !== "active") {
      clearSession();
      if (redirectOnFail) redirectToLogin();
      return null;
    }

    return session;
  }

  function isLoggedIn() {
    return !!getSession();
  }

  function getSchoolId() {
    const session = getSession();
    return session ? session.schoolId : "";
  }

  function getSchoolName() {
    const session = getSession();
    return session ? session.schoolName : "";
  }

  function getUserDisplayName() {
    const session = getSession();
    return session ? session.fullName || session.userName || "" : "";
  }

  // API عامة لباقي الصفحات
  window.MadarisSession = {
    PRIMARY_SESSION_KEY,
    getSession,
    saveSession,
    updateSession,
    clearSession,
    redirectToLogin,
    logoutToLogin,
    requireSchoolSession,
    isLoggedIn,
    getSchoolId,
    getSchoolName,
    getUserDisplayName,
  };

  // توافق إضافي مع أي كود قديم
  window.requireSchoolSession = requireSchoolSession;
  window.logoutToLogin = logoutToLogin;
})();
