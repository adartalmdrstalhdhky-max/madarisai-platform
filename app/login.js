// ===============================
// Madaris AI - Login System
// Final Stable Version
// ===============================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ===============================
// Firebase Config
// ===============================
const firebaseConfig = {
  apiKey: "AIzaSyAzQKhPMSZNevhb6LlNh9pt9yA4Au9G7Cw",
  authDomain: "madaris-ai.firebaseapp.com",
  projectId: "madaris-ai",
  storageBucket: "madaris-ai.firebasestorage.app",
  messagingSenderId: "915394447224",
  appId: "1:915394447224:web:3d7750a7fcd3f41bedaa8d",
  measurementId: "G-SC7VE6F20S"
};

// ===============================
// Initialize Firebase
// ===============================
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ===============================
// Internal State
// ===============================
let loginInProgress = false;
let authCheckHandled = false;
let redirectInProgress = false;

// ===============================
// Helpers
// ===============================
function setStatus(message) {
  const statusEl = document.getElementById("login-status");
  if (statusEl) {
    statusEl.textContent = message || "";
  }
}

function clearStoredSessions() {
  localStorage.removeItem("madaris_user_session");
  localStorage.removeItem("madaris_session");
}

function safeParse(raw) {
  try {
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
}

function normalizeSession(sessionLike) {
  if (!sessionLike || typeof sessionLike !== "object") return null;

  const normalized = {
    uid: sessionLike.uid || "",
    email: sessionLike.email || "",
    name: sessionLike.name || "",
    role: sessionLike.role || "",
    roleLevel: sessionLike.roleLevel || "",
    schoolId: sessionLike.schoolId || sessionLike.schoolid || "",
    status: sessionLike.status || "active",
    loginAt: sessionLike.loginAt || Date.now()
  };

  if (!normalized.uid) return null;
  if (!normalized.role) return null;

  return normalized;
}

function getStoredSession() {
  const primary = normalizeSession(
    safeParse(localStorage.getItem("madaris_user_session"))
  );
  if (primary) return primary;

  const legacy = normalizeSession(
    safeParse(localStorage.getItem("madaris_session"))
  );
  if (legacy) return legacy;

  return null;
}

function saveSession(sessionLike) {
  const session = normalizeSession(sessionLike);
  if (!session) return null;

  localStorage.setItem("madaris_user_session", JSON.stringify(session));
  localStorage.setItem("madaris_session", JSON.stringify(session));

  return session;
}

function getRedirectPath(role) {
  if (role === "school") return "school/index.html";
  if (role === "admin") return "admin/index.html";
  if (role === "teacher") return "teacher/index.html";
  if (role === "student") return "student/index.html";
  return "dashboard.html";
}

function redirectByRole(role) {
  if (redirectInProgress) return;
  redirectInProgress = true;
  window.location.href = getRedirectPath(role);
}

async function cleanLogout() {
  try {
    await signOut(auth);
  } catch (error) {
    console.warn("signOut warning:", error);
  }
  clearStoredSessions();
}

async function buildSessionFromFirestore(firebaseUser) {
  if (!firebaseUser || !firebaseUser.uid) return null;

  const userRef = doc(db, "users", firebaseUser.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    return null;
  }

  const userData = userSnap.data() || {};

  const session = {
    uid: firebaseUser.uid,
    email: userData.email || firebaseUser.email || "",
    name: userData.name || "",
    role: userData.role || "",
    roleLevel: userData.roleLevel || "",
    schoolId: userData.schoolId || "",
    status: userData.status || "active",
    loginAt: Date.now()
  };

  return saveSession(session);
}

async function restoreFromExistingFirebaseUser(firebaseUser) {
  try {
    const rebuiltSession = await buildSessionFromFirestore(firebaseUser);

    if (!rebuiltSession) {
      await cleanLogout();
      setStatus("تعذر إعادة بناء الجلسة من قاعدة البيانات.");
      return false;
    }

    setStatus("تم العثور على جلسة صالحة. جاري التحويل...");
    redirectByRole(rebuiltSession.role);
    return true;
  } catch (error) {
    console.error("restoreFromExistingFirebaseUser error:", error);
    await cleanLogout();
    setStatus("حدث خطأ أثناء استعادة الجلسة.");
    return false;
  }
}

// ===============================
// Main Login Function
// ===============================
window.loginUser = async function () {
  if (loginInProgress) return;

  const emailEl = document.getElementById("email");
  const passwordEl = document.getElementById("password");

  const email = emailEl ? emailEl.value.trim() : "";
  const password = passwordEl ? passwordEl.value.trim() : "";

  if (!email || !password) {
    alert("الرجاء إدخال البريد الإلكتروني وكلمة المرور.");
    return;
  }

  loginInProgress = true;
  setStatus("جاري تسجيل الدخول...");

  try {
    clearStoredSessions();

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    if (!firebaseUser || !firebaseUser.uid) {
      throw new Error("لم يتم استلام بيانات مستخدم صالحة.");
    }

    const session = await buildSessionFromFirestore(firebaseUser);

    if (!session) {
      await cleanLogout();
      alert("تم تسجيل الدخول في Firebase لكن المستخدم غير موجود داخل قاعدة البيانات.");
      setStatus("المستخدم غير موجود داخل Firestore.");
      return;
    }

    setStatus("تم تسجيل الدخول بنجاح. جاري التحويل...");
    redirectByRole(session.role);
  } catch (error) {
    console.error("loginUser error:", error);

    const currentUser = auth.currentUser;

    if (
      error &&
      error.code === "auth/network-request-failed" &&
      currentUser &&
      currentUser.uid
    ) {
      setStatus("حصلت مشكلة شبكة لكن توجد جلسة Firebase. جاري الفحص...");
      const restored = await restoreFromExistingFirebaseUser(currentUser);
      if (restored) return;
    }

    if (error && error.code === "auth/invalid-credential") {
      alert("فشل تسجيل الدخول: البريد الإلكتروني أو كلمة المرور غير صحيحة.");
      setStatus("بيانات الدخول غير صحيحة.");
      return;
    }

    if (error && error.code === "auth/user-not-found") {
      alert("المستخدم غير موجود.");
      setStatus("المستخدم غير موجود.");
      return;
    }

    if (error && error.code === "auth/wrong-password") {
      alert("كلمة المرور غير صحيحة.");
      setStatus("كلمة المرور غير صحيحة.");
      return;
}
    if (error && error.code === "auth/too-many-requests") {
      alert("عدد المحاولات كبير. انتظر قليلاً ثم أعد المحاولة.");
      setStatus("عدد المحاولات كبير.");
      return;
    }

    if (error && error.code === "auth/network-request-failed") {
      alert("فشل تسجيل الدخول بسبب مشكلة في الشبكة. تأكد من الإنترنت ثم أعد المحاولة.");
      setStatus("فشل الاتصال بالشبكة.");
      return;
    }

    alert("فشل تسجيل الدخول: " + (error.message || "خطأ غير معروف"));
    setStatus("حدث خطأ أثناء تسجيل الدخول.");
  } finally {
    loginInProgress = false;
  }
};

// ===============================
// Auto Session Check
// ===============================
onAuthStateChanged(auth, async (firebaseUser) => {
  if (authCheckHandled) return;
  authCheckHandled = true;

  try {
    const path = window.location.pathname || "";
    const isLoginPage =
      path.endsWith("/app/login.html") ||
      path.endsWith("app/login.html") ||
      path.endsWith("/login.html") ||
      path.endsWith("login.html");

    if (!isLoginPage) {
      return;
    }

    if (!firebaseUser) {
      clearStoredSessions();
      setStatus("لا توجد جلسة حالية. الرجاء تسجيل الدخول.");
      return;
    }

    const storedSession = getStoredSession();

    if (
      storedSession &&
      storedSession.uid &&
      storedSession.uid === firebaseUser.uid &&
      storedSession.role
    ) {
      setStatus("تم العثور على جلسة محفوظة. جاري التحويل...");
      redirectByRole(storedSession.role);
      return;
    }

    if (
      storedSession &&
      storedSession.uid &&
      firebaseUser.uid &&
      storedSession.uid !== firebaseUser.uid
    ) {
      clearStoredSessions();
    }

    setStatus("تم العثور على جلسة Firebase. جاري إعادة بناء الجلسة...");
    const rebuiltSession = await buildSessionFromFirestore(firebaseUser);

    if (!rebuiltSession) {
      await cleanLogout();
      setStatus("تعذر إعادة بناء الجلسة. تم تنظيف الجلسة القديمة.");
      return;
    }

    redirectByRole(rebuiltSession.role);
  } catch (error) {
    console.error("onAuthStateChanged error:", error);
    setStatus("حدث خطأ أثناء فحص الجلسة.");
  }
});

// ===============================
// Optional Helper
// ===============================
window.goHome = function () {
  window.location.href = "../index.html";
};
