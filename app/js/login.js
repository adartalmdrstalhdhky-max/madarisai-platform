import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  limit
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAzQKhPMSZNevhb6LlNh9pt9yA4Au9G7Cw",
  authDomain: "madaris-ai.firebaseapp.com",
  projectId: "madaris-ai",
  storageBucket: "madaris-ai.firebasestorage.app",
  messagingSenderId: "915394447224",
  appId: "1:915394447224:web:3d7750a7fcd3f41bedaa8d",
  measurementId: "G-SC7VE6F20S"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const SCHOOL_HOME_URL = `${window.location.origin}/app/school/index.html`;

const SESSION_KEYS = [
  "schoolSession",
  "madaris_school_session",
  "madarisSchoolSession",
  "activeSchoolSession",
  "madaris_session",
  "school_auth_session",
  "schoolUserSession"
];

const SCHOOL_ID_KEYS = [
  "schoolId",
  "selectedSchoolId",
  "currentSchoolId",
  "activeSchoolId",
  "madaris_school_id"
];

function $(selectors) {
  for (const selector of selectors) {
    const el = document.querySelector(selector);
    if (el) return el;
  }
  return null;
}

function normalizeString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function getEmailInput() {
  return $([
    "#email",
    "#emailInput",
    "#loginEmail",
    "input[type='email']",
    "input[name='email']"
  ]);
}

function getPasswordInput() {
  return $([
    "#password",
    "#passwordInput",
    "#loginPassword",
    "input[type='password']",
    "input[name='password']"
  ]);
}

function getForm() {
  return $([
    "#loginForm",
    "form"
  ]);
}

function getSubmitButton() {
  return $([
    "#loginButton",
    "#submitLogin",
    "button[type='submit']",
    ".login-btn",
    ".submit-btn"
  ]);
}

function getStatusBox() {
  let box = $([
    "#loginStatus",
    "#statusMessage",
    "#authStatus",
    "#authMessage",
    "#messageBox",
    ".status-message",
    ".auth-message",
    ".login-message"
  ]);

  if (!box) {
    box = document.createElement("div");
    box.id = "loginStatus";
    box.style.marginTop = "18px";
    box.style.padding = "16px 18px";
    box.style.borderRadius = "16px";
    box.style.lineHeight = "1.8";
    box.style.fontSize = "18px";
    box.style.display = "none";
    const form = getForm();
    if (form && form.parentNode) {
      form.parentNode.insertBefore(box, form.nextSibling);
    } else {
      document.body.appendChild(box);
    }
  }

  return box;
}

function showStatus(message, type = "info") {
  const box = getStatusBox();
  if (!box) return;

  box.textContent = message;
  box.style.display = "block";
  box.style.border = "1px solid rgba(255,255,255,0.12)";

  if (type === "success") {
    box.style.background = "rgba(16, 185, 129, 0.14)";
    box.style.color = "#dcfce7";
  } else if (type === "error") {
    box.style.background = "rgba(244, 63, 94, 0.12)";
    box.style.color = "#ffe4e6";
  } else {
    box.style.background = "rgba(59, 130, 246, 0.10)";
    box.style.color = "#e0f2fe";
  }
}

function hideStatus() {
  const box = getStatusBox();
  if (box) {
    box.style.display = "none";
  }
}

function setBusy(isBusy, text = "جارٍ تسجيل الدخول...") {
  const button = getSubmitButton();
  const emailInput = getEmailInput();
  const passwordInput = getPasswordInput();

  if (button) {
    if (!button.dataset.originalText) {
      button.dataset.originalText = button.textContent || "دخول المنصة";
    }
    button.disabled = isBusy;
    button.textContent = isBusy ? text : button.dataset.originalText;
    button.style.opacity = isBusy ? "0.85" : "1";
  }

  if (emailInput) emailInput.disabled = isBusy;
  if (passwordInput) passwordInput.disabled = isBusy;
}

function safeSet(storage, key, value) {
  try {
    storage.setItem(key, value);
  } catch (_) {}
}

function safeRemove(storage, key) {
  try {
    storage.removeItem(key);
  } catch (_) {}
}

function clearSchoolSession() {
  for (const key of SESSION_KEYS) {
    safeRemove(localStorage, key);
    safeRemove(sessionStorage, key);
  }

  for (const key of SCHOOL_ID_KEYS) {
    safeRemove(localStorage, key);
    safeRemove(sessionStorage, key);
  }

  safeRemove(localStorage, "user");
  safeRemove(sessionStorage, "user");
}

async function getUserDocById(uid) {
  if (!uid) return null;
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

async function getUserDocByField(field, value) {
  if (!value) return null;
  const q = query(collection(db, "users"), where(field, "==", value), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const first = snap.docs[0];
  return { id: first.id, ...first.data() };
}

async function getSchoolDocById(schoolId) {
  if (!schoolId) return null;
  const snap = await getDoc(doc(db, "schools", schoolId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

async function getSchoolDocByField(field, value) {
  if (!value) return null;
  const q = query(collection(db, "schools"), where(field, "==", value), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const first = snap.docs[0];
  return { id: first.id, ...first.data() };
}

async function resolveUserProfile(firebaseUser) {
  const uid = firebaseUser?.uid || "";
  const email = normalizeString(firebaseUser?.email).toLowerCase();

  let userDoc = await getUserDocById(uid);
  if (userDoc) return userDoc;

  userDoc = await getUserDocByField("uid", uid);
  if (userDoc) return userDoc;

  userDoc = await getUserDocByField("email", email);
  if (userDoc) return userDoc;

  return {
    id: uid,
    uid,
    email,
    name: firebaseUser?.displayName || "",
    role: ""
  };
}

async function resolveSchoolProfile(firebaseUser, userDoc) {
  const uid = firebaseUser?.uid || "";
  const email = normalizeString(firebaseUser?.email).toLowerCase();

  const directSchoolIdCandidates = [
    userDoc?.schoolId,
    userDoc?.schoolID,
    userDoc?.school_id,
    userDoc?.selectedSchoolId,
    userDoc?.currentSchoolId,
    userDoc?.activeSchoolId
  ].map(normalizeString).filter(Boolean);

  for (const schoolId of directSchoolIdCandidates) {
    const schoolDoc = await getSchoolDocById(schoolId);
    if (schoolDoc) return schoolDoc;
  }

  const fieldCandidates = [
    ["managerUid", uid],
    ["ownerUid", uid],
    ["adminUid", uid],
    ["userId", uid],
    ["uid", uid],
    ["managerEmail", email],
    ["email", email],
    ["adminEmail", email]
  ];

  for (const [field, value] of fieldCandidates) {
    const schoolDoc = await getSchoolDocByField(field, value);
    if (schoolDoc) return schoolDoc;
  }

  return null;
}

function buildUnifiedSession(firebaseUser, userDoc, schoolDoc) {
  const schoolId =
    normalizeString(schoolDoc?.id) ||
    normalizeString(userDoc?.schoolId) ||
    normalizeString(userDoc?.schoolID) ||
    normalizeString(userDoc?.school_id);

  const schoolName =
    normalizeString(schoolDoc?.name) ||
    normalizeString(userDoc?.schoolName) ||
    "مدرسة بدون اسم";

  const session = {
    uid: firebaseUser.uid,
    email: normalizeString(firebaseUser.email).toLowerCase(),
    userId: normalizeString(userDoc?.id) || firebaseUser.uid,
    userName:
      normalizeString(userDoc?.name) ||
      normalizeString(firebaseUser.displayName) ||
      "مستخدم المدرسة",
    role:
      normalizeString(userDoc?.role) ||
      "school",
    schoolId,
    schoolName,
    schoolStatus:
      normalizeString(schoolDoc?.status) ||
      "active",
    createdAt: Date.now(),
    source: "login.js-unified"
  };

  return session;
}

function persistUnifiedSession(session) {
  const payload = JSON.stringify(session);

  clearSchoolSession();

  for (const key of SESSION_KEYS) {
    safeSet(localStorage, key, payload);
    safeSet(sessionStorage, key, payload);
  }

  for (const key of SCHOOL_ID_KEYS) {
    safeSet(localStorage, key, session.schoolId || "");
    safeSet(sessionStorage, key, session.schoolId || "");
  }

  safeSet(localStorage, "user", JSON.stringify({
    uid: session.uid,
    email: session.email,
    name: session.userName,
    role: session.role,
    schoolId: session.schoolId
  }));

  safeSet(sessionStorage, "user", JSON.stringify({
    uid: session.uid,
    email: session.email,
    name: session.userName,
    role: session.role,
    schoolId: session.schoolId
  }));
    }
function forceOpenSchoolHome() {
  const target = SCHOOL_HOME_URL;

  try {
    window.location.href = target;
  } catch (_) {}

  setTimeout(() => {
    try {
      window.location.assign(target);
    } catch (_) {}
  }, 250);

  setTimeout(() => {
    try {
      window.location.replace(target);
    } catch (_) {}
  }, 700);

  setTimeout(() => {
    const a = document.createElement("a");
    a.href = target;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
  }, 1100);
}

function humanizeAuthError(error) {
  const code = error?.code || "";

  if (code.includes("invalid-credential")) {
    return "البريد الإلكتروني أو كلمة المرور غير صحيحة.";
  }
  if (code.includes("user-not-found")) {
    return "هذا الحساب غير موجود.";
  }
  if (code.includes("wrong-password")) {
    return "كلمة المرور غير صحيحة.";
  }
  if (code.includes("invalid-email")) {
    return "صيغة البريد الإلكتروني غير صحيحة.";
  }
  if (code.includes("too-many-requests")) {
    return "تمت محاولات كثيرة. انتظر قليلًا ثم حاول مرة أخرى.";
  }
  if (code.includes("network-request-failed")) {
    return "فشل الاتصال بالشبكة. تأكد من الإنترنت ثم أعد المحاولة.";
  }

  return error?.message || "حدث خطأ غير متوقع أثناء تسجيل الدخول.";
}

async function createUnifiedSchoolSessionAfterLogin(firebaseUser) {
  const userDoc = await resolveUserProfile(firebaseUser);
  const schoolDoc = await resolveSchoolProfile(firebaseUser, userDoc);

  const session = buildUnifiedSession(firebaseUser, userDoc, schoolDoc);

  if (!session.schoolId) {
    throw new Error("لم يتم العثور على schoolId لهذا الحساب داخل بيانات Firebase.");
  }

  persistUnifiedSession(session);

  return session;
}

async function handleLoginSubmit(event) {
  if (event) event.preventDefault();

  const emailInput = getEmailInput();
  const passwordInput = getPasswordInput();

  const email = normalizeString(emailInput?.value).toLowerCase();
  const password = normalizeString(passwordInput?.value);

  hideStatus();

  if (!email) {
    showStatus("اكتب البريد الإلكتروني أولًا.", "error");
    return;
  }

  if (!password) {
    showStatus("اكتب كلمة المرور أولًا.", "error");
    return;
  }

  setBusy(true, "جارِ تسجيل الدخول...");

  try {
    await setPersistence(auth, browserLocalPersistence);

    const credential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = credential.user;

    showStatus("تم تسجيل الدخول. جارِ جلب بيانات المدرسة...", "info");

    const session = await createUnifiedSchoolSessionAfterLogin(firebaseUser);

    showStatus("تم إنشاء الجلسة الموحدة بنجاح. جارِ فتح لوحة المدرسة...", "success");

    console.log("Unified school session created:", session);

    setTimeout(() => {
      forceOpenSchoolHome();
    }, 300);
  } catch (error) {
    console.error("Login failed:", error);
    showStatus(humanizeAuthError(error), "error");
    setBusy(false);
  }
}

function bindLoginForm() {
  const form = getForm();
  const button = getSubmitButton();

  if (form) {
    form.addEventListener("submit", handleLoginSubmit);
  }

  if (button && !form) {
    button.addEventListener("click", handleLoginSubmit);
  }
}

function setupPasswordToggle() {
  const passwordInput = getPasswordInput();
  if (!passwordInput) return;

  const toggle = $([
    "#togglePassword",
    ".toggle-password",
    "[data-toggle='password']"
  ]);

  if (!toggle) return;

  toggle.addEventListener("click", (event) => {
    event.preventDefault();
    const isPassword = passwordInput.type === "password";
    passwordInput.type = isPassword ? "text" : "password";
    toggle.textContent = isPassword ? "إخفاء" : "إظهار";
  });
}

function tryAutoRedirectFromExistingSession() {
  let hasSession = false;

  for (const key of SESSION_KEYS) {
    if (localStorage.getItem(key) || sessionStorage.getItem(key)) {
      hasSession = true;
      break;
    }
  }

  if (!hasSession) return;

  const schoolId =
    localStorage.getItem("schoolId") ||
    sessionStorage.getItem("schoolId") ||
    localStorage.getItem("selectedSchoolId") ||
    sessionStorage.getItem("selectedSchoolId") ||
    "";

  if (!schoolId) return;

  showStatus("تم العثور على جلسة مدرسة محفوظة. جارِ فتح لوحة المدرسة...", "info");

  setTimeout(() => {
    forceOpenSchoolHome();
  }, 500);
}

function boot() {
  bindLoginForm();
  setupPasswordToggle();

  onAuthStateChanged(auth, async (user) => {
    if (!user) return;

    const hasExistingStoredSession = SESSION_KEYS.some((key) => {
      return Boolean(localStorage.getItem(key) || sessionStorage.getItem(key));
    });

    if (hasExistingStoredSession) {
      tryAutoRedirectFromExistingSession();
      return;
    }

    try {
      const session = await createUnifiedSchoolSessionAfterLogin(user);
      console.log("Session restored from auth state:", session);
      showStatus("تم استرجاع الجلسة. جارِ فتح لوحة المدرسة...", "success");

      setTimeout(() => {
        forceOpenSchoolHome();
      }, 400);
    } catch (error) {
      console.error("Auth state restore failed:", error);
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
