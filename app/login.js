تimport { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  limit,
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAzQKhPMSZNevhb6LlNh9pt9yA4Au9G7Cw",
  authDomain: "madaris-ai.firebaseapp.com",
  projectId: "madaris-ai",
  storageBucket: "madaris-ai.firebasestorage.app",
  messagingSenderId: "915394447224",
  appId: "1:915394447224:web:3d7750a7fcd3f41bedaa8d",
  measurementId: "G-SC7VE6F20S",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const LOGIN_REDIRECT = "/app/school/index.html";
const LOGIN_PAGE_PATH = "/app/login.html";

function normalize(value) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function normalizeLower(value) {
  return normalize(value).toLowerCase();
}

function normalizeEmail(value) {
  return normalizeLower(value);
}

function nowIso() {
  return new Date().toISOString();
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function safeJsonParse(value) {
  try {
    return JSON.parse(value);
  } catch (_error) {
    return null;
  }
}

function pickFirstNonEmpty(...values) {
  for (const value of values) {
    const normalized = normalize(value);
    if (normalized) return normalized;
  }
  return "";
}

function pickEmail(...values) {
  for (const value of values) {
    const normalized = normalizeEmail(value);
    if (normalized) return normalized;
  }
  return "";
}

function getSessionApi() {
  return window.MadarisSession && typeof window.MadarisSession === "object"
    ? window.MadarisSession
    : null;
}

function getCurrentPath() {
  try {
    return window.location.pathname || "";
  } catch (_error) {
    return "";
  }
}

function isLoginPage() {
  const path = getCurrentPath();
  return path === LOGIN_PAGE_PATH || path.endsWith("/app/login.html") || path.endsWith("/login.html");
}

function redirectToSchool() {
  window.location.replace(LOGIN_REDIRECT);
}

function ensureMessageBox() {
  let box = document.getElementById("loginMessage");
  if (box) return box;

  box = document.createElement("div");
  box.id = "loginMessage";
  box.style.display = "none";
  box.style.marginTop = "18px";
  box.style.padding = "14px 16px";
  box.style.borderRadius = "14px";
  box.style.fontSize = "15px";
  box.style.lineHeight = "1.8";
  box.style.textAlign = "center";
  box.style.border = "1px solid rgba(255,255,255,.08)";
  box.style.backdropFilter = "blur(8px)";

  const form =
    document.querySelector("form") ||
    document.querySelector("#loginForm") ||
    document.querySelector(".login-form") ||
    document.querySelector(".form");

  if (form && form.parentNode) {
    form.parentNode.appendChild(box);
  } else {
    document.body.appendChild(box);
  }

  return box;
}

function showMessage(message, type = "info") {
  const box = ensureMessageBox();
  box.style.display = "block";

  if (type === "error") {
    box.style.background = "rgba(255, 59, 48, 0.12)";
    box.style.color = "#ffd8d8";
    box.style.borderColor = "rgba(255, 59, 48, 0.22)";
  } else if (type === "success") {
    box.style.background = "rgba(16, 185, 129, 0.12)";
    box.style.color = "#dcfff1";
    box.style.borderColor = "rgba(16, 185, 129, 0.22)";
  } else {
    box.style.background = "rgba(59, 130, 246, 0.12)";
    box.style.color = "#dbeafe";
    box.style.borderColor = "rgba(59, 130, 246, 0.22)";
  }

  box.textContent = message;
}

function hideMessage() {
  const box = document.getElementById("loginMessage");
  if (box) box.style.display = "none";
}

function getEmailInput() {
  return (
    document.querySelector("#email") ||
    document.querySelector("input[type='email']") ||
    document.querySelector("input[name='email']")
  );
}

function getPasswordInput() {
  return (
    document.querySelector("#password") ||
    document.querySelector("input[type='password']") ||
    document.querySelector("input[name='password']")
  );
}

function getSubmitButton() {
  return (
    document.querySelector("button[type='submit']") ||
    document.querySelector("#loginBtn") ||
    document.querySelector(".login-btn") ||
    document.querySelector("button")
  );
}

function setLoadingState(isLoading) {
  const emailInput = getEmailInput();
  const passwordInput = getPasswordInput();
  const submitButton = getSubmitButton();

  if (emailInput) emailInput.disabled = isLoading;
  if (passwordInput) passwordInput.disabled = isLoading;

  if (submitButton) {
    if (!submitButton.dataset.originalText) {
      submitButton.dataset.originalText = submitButton.textContent || "تسجيل الدخول";
    }
    submitButton.disabled = isLoading;
    submitButton.style.opacity = isLoading ? "0.75" : "1";
    submitButton.style.cursor = isLoading ? "wait" : "pointer";
    submitButton.textContent = isLoading
      ? "جارٍ تسجيل الدخول..."
      : submitButton.dataset.originalText;
  }
}

function clearLegacySessionKeys() {
  const keys = [
    "madarisai_session",
    "schoolSession",
    "school_session",
    "madaris_user_session",
    "madaris_session",
    "session",
    "userSession",
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
    "schoolAuth",
    "authUser",
    "currentSchool",
  ];

  for (const key of keys) {
    try {
      localStorage.removeItem(key);
    } catch (_error) {}
    try {
      sessionStorage.removeItem(key);
    } catch (_error) {}
  }
}

function normalizeSessionCandidate(session) {
  if (!session || typeof session !== "object") return null;

  const uid = pickFirstNonEmpty(session.uid, session.userId, session.id);
  const schoolId = pickFirstNonEmpty(
    session.schoolId,
    session.schoolID,
    session.school_id,
    session.school?.id,
    session.school?.schoolId
  );
  const schoolName = pickFirstNonEmpty(
    session.schoolName,
    session.school_name,
    session.school?.name,
    session.school?.schoolName
  );
  const role = normalizeLower(session.role || session.userRole || session.type);
  const email = pickEmail(session.email, session.userEmail, session.mail);
  const fullName = pickFirstNonEmpty(
    session.fullName,
    session.userName,
    session.name,
    session.displayName
  );
  const status = normalizeLower(
    session.status || session.schoolStatus || session.school?.status || "active"
  );

  if (!uid && !schoolId && !email) return null;

  return {
    uid,
    userId: pickFirstNonEmpty(session.userId, uid),
    email,
    fullName: fullName || "مستخدم المدرسة",
    userName: fullName || "مستخدم المدرسة",
    role: role || "school",
    schoolId,
    schoolName,
    status: status || "active",
    schoolStatus: status || "active",
    createdAt: pickFirstNonEmpty(session.createdAt, nowIso()),
    school: {
      id: schoolId,
      schoolId,
      name: schoolName,
      schoolName,
      status: status || "active",
    },
  };
}

function saveSession(session) {
  const normalized = normalizeSessionCandidate(session);
  if (!normalized) {
    throw new Error("تعذر إنشاء الجلسة");
  }

  const sessionApi = getSessionApi();
  if (sessionApi && typeof sessionApi.saveSession === "function") {
    try {
      return sessionApi.saveSession(normalized);
    } catch (_error) {}
  }

  const payload = JSON.stringify(normalized);

  localStorage.setItem("madarisai_session", payload);
  sessionStorage.setItem("madarisai_session", payload);

  localStorage.setItem("schoolSession", payload);
  sessionStorage.setItem("schoolSession", payload);

  localStorage.setItem("schoolId", normalized.schoolId);
  sessionStorage.setItem("schoolId", normalized.schoolId);

  localStorage.setItem("schoolName", normalized.schoolName);
  sessionStorage.setItem("schoolName", normalized.schoolName);

  localStorage.setItem("userRole", normalized.role);
  sessionStorage.setItem("userRole", normalized.role);

  localStorage.setItem("userName", normalized.fullName);
  sessionStorage.setItem("userName", normalized.fullName);

  localStorage.setItem("email", normalized.email);
  sessionStorage.setItem("email", normalized.email);

  return normalized;
}

function getExistingSession() {
  const sessionApi = getSessionApi();
  if (sessionApi && typeof sessionApi.getSession === "function") {
    try {
      const session = sessionApi.getSession();
      return normalizeSessionCandidate(session);
    } catch (_error) {}
  }

  const rawCandidates = [
    localStorage.getItem("madarisai_session"),
    sessionStorage.getItem("madarisai_session"),
    localStorage.getItem("schoolSession"),
    sessionStorage.getItem("schoolSession"),
  ];

  for (const raw of rawCandidates) {
    if (!raw) continue;
    const parsed = safeJsonParse(raw);
    const normalized = normalizeSessionCandidate(parsed);
    if (normalized) return normalized;
  }

  const legacySchoolId = pickFirstNonEmpty(
    localStorage.getItem("schoolId"),
    sessionStorage.getItem("schoolId")
  );

  if (!legacySchoolId) return null;

  return normalizeSessionCandidate({
    uid: pickFirstNonEmpty(localStorage.getItem("uid"), sessionStorage.getItem("uid")),
    userId: pickFirstNonEmpty(localStorage.getItem("uid"), sessionStorage.getItem("uid")),
    email: pickEmail(localStorage.getItem("email"), sessionStorage.getItem("email")),
    fullName: pickFirstNonEmpty(
      localStorage.getItem("userName"),
      sessionStorage.getItem("userName")
    ),
    role: pickFirstNonEmpty(localStorage.getItem("userRole"), sessionStorage.getItem("userRole"), "school"),
    schoolId: legacySchoolId,
    schoolName: pickFirstNonEmpty(
      localStorage.getItem("schoolName"),
      sessionStorage.getItem("schoolName")
    ),
    status: "active",
  });
}

function hasValidSchoolSession(session) {
  const normalized = normalizeSessionCandidate(session);
  if (!normalized) return false;

  const role = normalizeLower(normalized.role);
  const schoolId = normalize(normalized.schoolId);
  const status = normalizeLower(normalized.status || normalized.schoolStatus || "active");

  if (role && role !== "school") return false;
  if (!schoolId) return false;
  if (status && status !== "active") return false;

  return true;
}

async function readDocIfExists(collectionName, id) {
  const normalizedId = normalize(id);
  if (!normalizedId) return null;

  try {
    const ref = doc(db, collectionName, normalizedId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() };
  } catch (_error) {
    return null;
  }
}

async function queryFirstByField(collectionName, field, value) {
  const normalizedValue = normalize(value);
  if (!normalizedValue) return null;

  try {
    const q = query(collection(db, collectionName), where(field, "==", value), limit(1));
    const res = await getDocs(q);
    if (res.empty) return null;
    const first = res.docs[0];
    return { id: first.id, ...first.data() };
  } catch (_error) {
    return null;
  }
}

async function queryFirstByFieldLower(collectionName, field, value) {
  const raw = normalize(value);
  if (!raw) return null;

  const exact = await queryFirstByField(collectionName, field, raw);
  if (exact) return exact;

  const lowered = normalizeLower(raw);
  if (lowered && lowered !== raw) {
    return await queryFirstByField(collectionName, field, lowered);
  }

  return null;
  }
async function findUser(uid, email) {
  const normalizedUid = normalize(uid);
  const normalizedEmail = normalizeEmail(email);

  if (normalizedUid) {
    const byId = await readDocIfExists("users", normalizedUid);
    if (byId) return byId;
  }

  const emailFields = ["email", "userEmail", "mail"];
  for (const field of emailFields) {
    const byEmail = await queryFirstByFieldLower("users", field, normalizedEmail);
    if (byEmail) return byEmail;
  }

  return null;
}

async function findSchool(userDoc, email, uid) {
  const possibleIds = [
    userDoc?.schoolId,
    userDoc?.schoolID,
    userDoc?.school_id,
    userDoc?.school?.id,
    userDoc?.school?.schoolId,
    userDoc?.schoolRef,
    userDoc?.schoolDocId,
  ];

  for (const possibleId of possibleIds) {
    const schoolById = await readDocIfExists("schools", possibleId);
    if (schoolById) return schoolById;
  }

  const checks = [
    ["managerUid", normalize(uid)],
    ["uid", normalize(uid)],
    ["ownerUid", normalize(uid)],
    ["managerEmail", normalizeEmail(email)],
    ["email", normalizeEmail(email)],
    ["ownerEmail", normalizeEmail(email)],
    ["adminEmail", normalizeEmail(email)],
  ];

  for (const [field, value] of checks) {
    const result = await queryFirstByFieldLower("schools", field, value);
    if (result) return result;
  }

  try {
    const allSchools = await getDocs(collection(db, "schools"));
    if (allSchools.size === 1) {
      const only = allSchools.docs[0];
      return { id: only.id, ...only.data() };
    }
  } catch (_error) {}

  return null;
}

function getUserRole(userDoc) {
  return normalizeLower(
    userDoc?.role ||
      userDoc?.userRole ||
      userDoc?.type ||
      userDoc?.accountType ||
      "school"
  );
}

function getSchoolStatus(schoolDoc) {
  return normalizeLower(
    schoolDoc?.status ||
      schoolDoc?.schoolStatus ||
      schoolDoc?.state ||
      "active"
  ) || "active";
}

function buildSession(authUser, userDoc, schoolDoc) {
  const uid = pickFirstNonEmpty(authUser?.uid, userDoc?.id);
  const email = pickEmail(authUser?.email, userDoc?.email, userDoc?.userEmail);
  const fullName =
    pickFirstNonEmpty(
      userDoc?.name,
      userDoc?.fullName,
      userDoc?.userName,
      userDoc?.displayName
    ) || "مستخدم المدرسة";

  const schoolId = pickFirstNonEmpty(
    schoolDoc?.id,
    userDoc?.schoolId,
    userDoc?.schoolID,
    userDoc?.school_id
  );

  const schoolName =
    pickFirstNonEmpty(
      schoolDoc?.name,
      schoolDoc?.schoolName,
      schoolDoc?.title,
      userDoc?.schoolName
    ) || "مدرسة بدون اسم";

  const schoolStatus = getSchoolStatus(schoolDoc);

  return {
    uid,
    userId: pickFirstNonEmpty(userDoc?.id, uid),
    email,
    fullName,
    userName: fullName,
    role: "school",
    schoolId,
    schoolName,
    status: schoolStatus,
    schoolStatus,
    createdAt: nowIso(),
    school: {
      id: schoolId,
      schoolId,
      name: schoolName,
      schoolName,
      status: schoolStatus,
    },
  };
}

async function forceCleanAuthIfNeeded() {
  try {
    if (auth.currentUser) {
      await signOut(auth);
    }
  } catch (_error) {}
}

function getErrorMessage(error) {
  const code = normalize(error?.code);
  const message = normalize(error?.message);

  if (code === "auth/invalid-email") return "البريد الإلكتروني غير صحيح";
  if (code === "auth/missing-password") return "ادخل كلمة المرور";
  if (code === "auth/user-not-found") return "الحساب غير موجود";
  if (code === "auth/wrong-password") return "كلمة المرور غير صحيحة";
  if (code === "auth/invalid-credential") return "بيانات الدخول غير صحيحة";
  if (code === "auth/too-many-requests") return "تمت محاولات كثيرة، حاول لاحقًا";
  if (code === "auth/network-request-failed") return "فشل الاتصال بالشبكة";
  if (code === "auth/user-disabled") return "تم تعطيل هذا الحساب";

  if (message.includes("لم يتم العثور على المستخدم")) return "لم يتم العثور على المستخدم";
  if (message.includes("لم يتم العثور على المدرسة")) return "لم يتم العثور على المدرسة";
  if (message.includes("ليس حساب مدرسة")) return "هذا الحساب ليس حساب مدرسة";
  if (message.includes("غير نشط")) return "حساب المدرسة غير نشط حاليًا";

  return message || "فشل تسجيل الدخول";
}

async function performLogin(email, password) {
  const normalizedEmail = normalizeEmail(email);
  const normalizedPassword = normalize(password);

  if (!normalizedEmail) {
    throw new Error("ادخل البريد الإلكتروني");
  }

  if (!normalizedPassword) {
    throw new Error("ادخل كلمة المرور");
  }

  const credential = await signInWithEmailAndPassword(auth, normalizedEmail, normalizedPassword);
  const authUser = credential?.user;

  if (!authUser) {
    throw new Error("تعذر قراءة بيانات الحساب");
  }

  const userDoc = await findUser(authUser.uid, authUser.email || normalizedEmail);
  if (!userDoc) {
    await forceCleanAuthIfNeeded();
    throw new Error("لم يتم العثور على المستخدم");
  }

  const role = getUserRole(userDoc);
  if (role && role !== "school") {
    await forceCleanAuthIfNeeded();
    throw new Error("هذا الحساب ليس حساب مدرسة");
  }

  const schoolDoc = await findSchool(userDoc, authUser.email || normalizedEmail, authUser.uid);
  if (!schoolDoc) {
    await forceCleanAuthIfNeeded();
    throw new Error("لم يتم العثور على المدرسة");
  }

  const schoolStatus = getSchoolStatus(schoolDoc);
  if (schoolStatus && schoolStatus !== "active") {
    await forceCleanAuthIfNeeded();
    throw new Error("حساب المدرسة غير نشط حاليًا");
  }

  clearLegacySessionKeys();
  const session = buildSession(authUser, userDoc, schoolDoc);
  return saveSession(session);
}

async function tryAutoLoginFromAuthUser(authUser) {
  if (!authUser || !isLoginPage()) return false;

  const existing = getExistingSession();
  if (hasValidSchoolSession(existing)) {
    showMessage("جارٍ فتح لوحة المدرسة...", "info");
    await delay(200);
    redirectToSchool();
    return true;
  }

  try {
    const userDoc = await findUser(authUser.uid, authUser.email);
    if (!userDoc) return false;

    const role = getUserRole(userDoc);
    if (role && role !== "school") return false;

    const schoolDoc = await findSchool(userDoc, authUser.email, authUser.uid);
    if (!schoolDoc) return false;

    const schoolStatus = getSchoolStatus(schoolDoc);
    if (schoolStatus && schoolStatus !== "active") return false;

    clearLegacySessionKeys();
    const session = buildSession(authUser, userDoc, schoolDoc);
    saveSession(session);

    showMessage("جارٍ فتح لوحة المدرسة...", "info");
    await delay(200);
    redirectToSchool();
    return true;
  } catch (error) {
    console.warn("Madaris auto login skipped:", error);
    return false;
  }
}

async function ensureCleanLoginPageState() {
  const existing = getExistingSession();
  if (hasValidSchoolSession(existing)) {
    redirectToSchool();
    return;
  }

  try {
    if (auth.currentUser) {
      await tryAutoLoginFromAuthUser(auth.currentUser);
    }
  } catch (_error) {}
}

async function handleLogin(event) {
  if (event) event.preventDefault();

  const emailInput = getEmailInput();
  const passwordInput = getPasswordInput();

  const email = normalizeEmail(emailInput?.value);
  const password = normalize(passwordInput?.value);

  try {
    setLoadingState(true);
    hideMessage();
    showMessage("جارٍ تسجيل الدخول...", "info");

    await setPersistence(auth, browserLocalPersistence);

    const session = await performLogin(email, password);
    console.log("Madaris login session:", session);

    showMessage("تم تسجيل الدخول بنجاح", "success");
    await delay(350);
    redirectToSchool();
  } catch (error) {
    console.error("Madaris login error:", error);
    showMessage(getErrorMessage(error), "error");
  } finally {
    setLoadingState(false);
  }
}

function bindLogin() {
  const form =
    document.querySelector("form") ||
    document.querySelector("#loginForm") ||
    document.querySelector(".login-form") ||
    document.querySelector(".form");

  const submitButton = getSubmitButton();

  if (form) {
    form.addEventListener("submit", handleLogin);
  }

  if (submitButton && !form) {
    submitButton.addEventListener("click", handleLogin);
  }

  const passwordInput = getPasswordInput();
  if (passwordInput) {
    passwordInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        handleLogin(event);
      }
    });
  }
}

function setupAutoLogin() {
  onAuthStateChanged(auth, async (authUser) => {
    if (!authUser) return;
    if (!isLoginPage()) return;
    await tryAutoLoginFromAuthUser(authUser);
  });
}

function exposeForDebug() {
  window.MadarisLogin = {
    app,
    auth,
    db,
    performLogin,
    findUser,
    findSchool,
    buildSession,
    saveSession,
    getExistingSession,
    clearLegacySessionKeys,
    tryAutoLoginFromAuthUser,
    forceCleanAuthIfNeeded,
  };
}

document.addEventListener("DOMContentLoaded", async () => {
  exposeForDebug();
  bindLogin();
  setupAutoLogin();
  await ensureCleanLoginPageState();
});

export { auth, db, performLogin };
