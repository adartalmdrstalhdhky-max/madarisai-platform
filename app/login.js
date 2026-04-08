import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
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

function normalizeEmail(value) {
  return normalize(value).toLowerCase();
}

function nowIso() {
  return new Date().toISOString();
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getSessionApi() {
  return window.MadarisSession && typeof window.MadarisSession === "object"
    ? window.MadarisSession
    : null;
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

function saveSession(session) {
  const sessionApi = getSessionApi();

  if (sessionApi && typeof sessionApi.saveSession === "function") {
    return sessionApi.saveSession(session);
  }

  const normalized = {
    uid: normalize(session?.uid),
    userId: normalize(session?.userId || session?.uid),
    email: normalizeEmail(session?.email),
    fullName: normalize(session?.fullName || session?.userName || session?.name),
    userName: normalize(session?.fullName || session?.userName || session?.name),
    role: normalize(session?.role).toLowerCase(),
    schoolId: normalize(session?.schoolId),
    schoolName: normalize(session?.schoolName),
    status: normalize(session?.status || session?.schoolStatus || "active"),
    schoolStatus: normalize(session?.status || session?.schoolStatus || "active"),
    createdAt: normalize(session?.createdAt || nowIso()),
    school: {
      id: normalize(session?.schoolId),
      schoolId: normalize(session?.schoolId),
      name: normalize(session?.schoolName),
      schoolName: normalize(session?.schoolName),
      status: normalize(session?.status || session?.schoolStatus || "active"),
    },
  };

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
    return sessionApi.getSession();
  }

  const raw =
    localStorage.getItem("madarisai_session") ||
    sessionStorage.getItem("madarisai_session") ||
    localStorage.getItem("schoolSession") ||
    sessionStorage.getItem("schoolSession");

  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch (_error) {
    return null;
  }
}

function redirect() {
  window.location.replace(LOGIN_REDIRECT);
}

function redirectIfAlreadyLoggedIn() {
  const session = getExistingSession();
  if (!session) return false;

  const role = normalize(session.role).toLowerCase();
  const schoolId = normalize(session.schoolId || session.school?.schoolId);
  const status = normalize(session.status || session.schoolStatus || "active").toLowerCase();

  if (role === "school" && schoolId && (!status || status === "active")) {
    redirect();
    return true;
  }

  return false;
}

function ensureMessageBox() {
  let box = document.getElementById("loginMessage");
  if (box) return box;

  box = document.createElement("div");
  box.id = "loginMessage";
  box.style.display = "none";
  box.style.marginTop = "20px";
  box.style.padding = "14px";
  box.style.borderRadius = "14px";
  box.style.fontSize = "16px";
  box.style.lineHeight = "1.7";
  box.style.textAlign = "center";
  box.style.border = "1px solid rgba(255,255,255,.08)";

  const form = document.querySelector("form");
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
    box.style.color = "#ffd7d2";
  } else if (type === "success") {
    box.style.background = "rgba(16, 185, 129, 0.14)";
    box.style.color = "#d7ffef";
  } else {
    box.style.background = "rgba(59, 130, 246, 0.12)";
    box.style.color = "#dbeafe";
  }

  box.textContent = message;
}

function setLoadingState(isLoading) {
  const submitButton = document.querySelector("button[type='submit']");
  const emailInput = document.querySelector("#email");
  const passwordInput = document.querySelector("#password");

  if (submitButton) {
    submitButton.disabled = isLoading;
    submitButton.style.opacity = isLoading ? "0.7" : "1";
    submitButton.style.cursor = isLoading ? "wait" : "pointer";
  }

  if (emailInput) emailInput.disabled = isLoading;
  if (passwordInput) passwordInput.disabled = isLoading;
}

async function findUser(uid, email) {
  const normalizedUid = normalize(uid);
  const normalizedEmail = normalizeEmail(email);

  if (normalizedUid) {
    const ref = doc(db, "users", normalizedUid);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      return { id: snap.id, ...snap.data() };
    }
  }

  if (normalizedEmail) {
    const q = query(
      collection(db, "users"),
      where("email", "==", normalizedEmail),
      limit(1)
    );
    const res = await getDocs(q);

    if (!res.empty) {
      const d = res.docs[0];
      return { id: d.id, ...d.data() };
    }
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
  ];

  for (const possibleId of possibleIds) {
    const id = normalize(possibleId);
    if (!id) continue;

    const ref = doc(db, "schools", id);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      return { id: snap.id, ...snap.data() };
    }
  }

  const checks = [
    ["managerEmail", normalizeEmail(email)],
    ["email", normalizeEmail(email)],
    ["ownerEmail", normalizeEmail(email)],
    ["managerUid", normalize(uid)],
    ["uid", normalize(uid)],
  ];

  for (const [field, value] of checks) {
    if (!value) continue;

    const q = query(collection(db, "schools"), where(field, "==", value), limit(1));
    const res = await getDocs(q);

    if (!res.empty) {
      const d = res.docs[0];
      return { id: d.id, ...d.data() };
    }
  }

  const allSchools = await getDocs(collection(db, "schools"));
  if (allSchools.size === 1) {
    const d = allSchools.docs[0];
    return { id: d.id, ...d.data() };
  }

  return null;
}

function buildSession(authUser, userDoc, schoolDoc) {
  const uid = normalize(authUser?.uid);
  const email = normalizeEmail(authUser?.email || userDoc?.email);

  const fullName =
    normalize(userDoc?.name) ||
    normalize(userDoc?.fullName) ||
    normalize(userDoc?.userName) ||
    "مستخدم المدرسة";

  const schoolId = normalize(schoolDoc?.id);
  const schoolName = normalize(schoolDoc?.name) || "مدرسة بدون اسم";
  const schoolStatus = normalize(schoolDoc?.status || "active") || "active";

  return {
    uid,
    userId: normalize(userDoc?.id || uid),
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
  const authUser = credential.user;

  if (!authUser) {
    throw new Error("تعذر قراءة بيانات الحساب");
  }

  const userDoc = await findUser(authUser.uid, authUser.email || normalizedEmail);
  if (!userDoc) {
    throw new Error("لم يتم العثور على المستخدم");
  }

  const role = normalize(userDoc.role || userDoc.userRole).toLowerCase();
  if (role && role !== "school") {
    throw new Error("هذا الحساب ليس حساب مدرسة");
  }

  const schoolDoc = await findSchool(userDoc, authUser.email || normalizedEmail, authUser.uid);
  if (!schoolDoc) {
    throw new Error("لم يتم العثور على المدرسة");
  }

  const schoolStatus = normalize(schoolDoc.status || "active").toLowerCase();
  if (schoolStatus && schoolStatus !== "active") {
    throw new Error("حساب المدرسة غير نشط حالياً");
  }

  const session = buildSession(authUser, userDoc, schoolDoc);
  saveSession(session);

  return session;
}

function getErrorMessage(error) {
  const code = normalize(error?.code);
  const message = normalize(error?.message);

  if (code === "auth/invalid-email") return "البريد الإلكتروني غير صحيح";
  if (code === "auth/missing-password") return "ادخل كلمة المرور";
  if (code === "auth/user-not-found") return "الحساب غير موجود";
  if (code === "auth/wrong-password") return "كلمة المرور غير صحيحة";
  if (code === "auth/invalid-credential") return "بيانات الدخول غير صحيحة";
  if (code === "auth/too-many-requests") return "تمت محاولات كثيرة. حاول لاحقاً";
  if (code === "auth/network-request-failed") return "فشل الاتصال بالشبكة";
  if (code === "auth/user-disabled") return "تم تعطيل هذا الحساب";

  if (message) return message;
  return "فشل تسجيل الدخول";
}

async function handleLogin(event) {
  if (event) event.preventDefault();

  const emailInput = document.querySelector("#email");
  const passwordInput = document.querySelector("#password");

  const email = normalizeEmail(emailInput?.value);
  const password = normalize(passwordInput?.value);

  try {
    setLoadingState(true);
    showMessage("جار تسجيل الدخول ...", "info");

    await setPersistence(auth, browserLocalPersistence);
    clearLegacySessionKeys();

    const session = await performLogin(email, password);
    console.log("Madaris login session:", session);

    showMessage("تم تسجيل الدخول بنجاح", "success");
    await delay(350);
    redirect();
  } catch (error) {
    console.error("Login error:", error);
    showMessage(getErrorMessage(error), "error");
  } finally {
    setLoadingState(false);
  }
}

function bindLogin() {
  const form = document.querySelector("form");
  const submitButton = document.querySelector("button[type='submit']");

  if (form) {
    form.addEventListener("submit", handleLogin);
    return;
  }

  if (submitButton) {
    submitButton.addEventListener("click", handleLogin);
  }
}

async function tryAutoLoginFromAuthUser(authUser) {
  if (!authUser) return false;

  const existingSession = getExistingSession();
  if (existingSession) {
    const role = normalize(existingSession.role).toLowerCase();
    const schoolId = normalize(existingSession.schoolId || existingSession.school?.schoolId);

    if (role === "school" && schoolId) {
      showMessage("جار فتح لوحة المدرسة ...", "info");
      redirect();
      return true;
    }
  }

  try {
    const userDoc = await findUser(authUser.uid, authUser.email);
    if (!userDoc) return false;

    const role = normalize(userDoc.role || userDoc.userRole).toLowerCase();
    if (role && role !== "school") return false;

    const schoolDoc = await findSchool(userDoc, authUser.email, authUser.uid);
    if (!schoolDoc) return false;

    const schoolStatus = normalize(schoolDoc.status || "active").toLowerCase();
    if (schoolStatus && schoolStatus !== "active") return false;

    const session = buildSession(authUser, userDoc, schoolDoc);
    saveSession(session);

    showMessage("جار فتح لوحة المدرسة ...", "info");
    redirect();
    return true;
  } catch (error) {
    console.warn("Auto-login skipped:", error);
    return false;
  }
}

function setupAutoLogin() {
  onAuthStateChanged(auth, async (authUser) => {
    if (!authUser) return;

    const onLoginPage =
      window.location.pathname === LOGIN_PAGE_PATH ||
      window.location.pathname.endsWith("/app/login.html");

    if (!onLoginPage) return;

    await tryAutoLoginFromAuthUser(authUser);
  });
}

async function ensureCleanLoginPageState() {
  const session = getExistingSession();
  if (session) {
    const role = normalize(session.role).toLowerCase();
    const schoolId = normalize(session.schoolId || session.school?.schoolId);

    if (role === "school" && schoolId) {
      redirect();
      return;
    }
  }

  try {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const autoLoggedIn = await tryAutoLoginFromAuthUser(currentUser);
    if (autoLoggedIn) return;
  } catch (_error) {}
}

function exposeForDebug() {
  window.MadarisLogin = {
    auth,
    db,
    performLogin,
    findUser,
    findSchool,
    buildSession,
    saveSession,
    getExistingSession,
    clearLegacySessionKeys,
  };
}

document.addEventListener("DOMContentLoaded", async () => {
  exposeForDebug();
  bindLogin();
  setupAutoLogin();
  await ensureCleanLoginPageState();
});

export { auth, db, performLogin };
