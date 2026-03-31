// ===============================
// Madaris AI - Unified Login System
// File: app/login.js
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
// Init Firebase
// ===============================

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ===============================
// Helpers
// ===============================

let loginInProgress = false;
let autoRedirectHandled = false;

function clearAllSessions() {
  localStorage.removeItem("madaris_user_session");
  localStorage.removeItem("madaris_session");
  sessionStorage.removeItem("madaris_user_session");
  sessionStorage.removeItem("madaris_session");
}

function saveUnifiedSession(session) {
  localStorage.setItem("madaris_user_session", JSON.stringify(session));
  localStorage.setItem("madaris_session", JSON.stringify(session));
}

function getStoredSession() {
  const raw =
    localStorage.getItem("madaris_user_session") ||
    localStorage.getItem("madaris_session") ||
    sessionStorage.getItem("madaris_user_session") ||
    sessionStorage.getItem("madaris_session");

  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
}

function buildSessionObject(uid, userData) {
  return {
    uid: uid,
    email: userData.email || "",
    name: userData.name || "",
    role: userData.role || "",
    roleLevel: userData.roleLevel || "",
    schoolId: userData.schoolId || "",
    status: userData.status || "active",
    loginAt: Date.now()
  };
}

function isValidSession(session) {
  return !!(
    session &&
    session.uid &&
    session.role &&
    session.status !== "disabled"
  );
}

function redirectByRole(session) {
  if (!session || !session.role) {
    window.location.href = "dashboard.html";
    return;
  }

  if (session.role === "school") {
    window.location.href = "school/index.html";
    return;
  }

  if (session.role === "admin") {
    window.location.href = "admin/index.html";
    return;
  }

  if (session.role === "teacher") {
    window.location.href = "teacher/index.html";
    return;
  }

  if (session.role === "student") {
    window.location.href = "student/index.html";
    return;
  }

  window.location.href = "dashboard.html";
}

function setLoadingState(isLoading) {
  const loginBtn = document.getElementById("loginBtn");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");

  if (loginBtn) {
    loginBtn.disabled = isLoading;
    loginBtn.textContent = isLoading ? "جاري تسجيل الدخول..." : "تسجيل الدخول";
  }

  if (emailInput) emailInput.disabled = isLoading;
  if (passwordInput) passwordInput.disabled = isLoading;
}

function showFriendlyError(error) {
  const code = error?.code || "";
  const message = error?.message || "";

  console.error("Login error:", code, message, error);

  if (
    code === "auth/network-request-failed" ||
    message.includes("network-request-failed")
  ) {
    alert("فشل الاتصال بالشبكة. تأكد من الإنترنت ثم حاول مرة أخرى.");
    return;
  }

  if (code === "auth/invalid-credential") {
    alert("البريد الإلكتروني أو كلمة المرور غير صحيحة.");
    return;
  }

  if (code === "auth/user-not-found") {
    alert("هذا المستخدم غير موجود.");
    return;
  }

  if (code === "auth/wrong-password") {
    alert("كلمة المرور غير صحيحة.");
    return;
  }

  if (code === "auth/too-many-requests") {
    alert("تمت محاولات كثيرة. انتظر قليلًا ثم أعد المحاولة.");
    return;
  }

  alert("فشل تسجيل الدخول. حاول مرة أخرى.");
}

async function buildSessionFromFirebaseUser(user) {
  if (!user || !user.uid) {
    throw new Error("لا يوجد مستخدم صالح في Firebase");
  }

  const uid = user.uid;
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    throw new Error("المستخدم غير موجود في قاعدة البيانات");
  }

  const userData = userSnap.data();
  const session = buildSessionObject(uid, userData);

  if (!isValidSession(session)) {
    throw new Error("بيانات الجلسة غير مكتملة");
  }

  saveUnifiedSession(session);
  return session;
}

// ===============================
// Main Login
// ===============================

window.loginUser = async function () {
  if (loginInProgress) return;

  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");

  const email = emailInput ? emailInput.value.trim() : "";
  const password = passwordInput ? passwordInput.value.trim() : "";

  if (!email || !password) {
    alert("الرجاء إدخال البريد الإلكتروني وكلمة المرور");
    return;
  }

  loginInProgress = true;
  setLoadingState(true);

  try {
    clearAllSessions();

    const credential = await signInWithEmailAndPassword(auth, email, password);
    const user = credential.user;

    const session = await buildSessionFromFirebaseUser(user);
    redirectByRole(session);
  } catch (error) {
    try {
      await signOut(auth);
    } catch (_) {}

    clearAllSessions();
    showFriendlyError(error);
  } finally {
    loginInProgress = false;
    setLoadingState(false);
  }
};

// ===============================
// Auto Redirect Only If Session Exists
// ===============================

async function handleAuthenticatedUser(user) {
  if (autoRedirectHandled) return;
  if (!user) return;

  const currentPage = window.location.pathname.split("/").pop() || "";
  if (currentPage !== "login.html") return;

  autoRedirectHandled = true;

  try {
    const storedSession = getStoredSession();

    if (
      storedSession &&
      isValidSession(storedSession) &&
      storedSession.uid === user.uid
    ) {
      saveUnifiedSession(storedSession);
      redirectByRole(storedSession);
      return;
    }

    const session = await buildSessionFromFirebaseUser(user);
    redirectByRole(session);
  } catch (error) {
    console.error("Auto redirect error:", error);

    try {
      await signOut(auth);
    } catch (_) {}

    clearAllSessions();
    autoRedirectHandled = false;
  }
}

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    autoRedirectHandled = false;
    return;
  }

  await handleAuthenticatedUser(user);
});

// ===============================
// Logout Helper
// ===============================

window.logoutMadaris = async function () {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Logout error:", error);
  }

  clearAllSessions();
  window.location.href = "login.html";
};

// ===============================
// Enter Key Support
// ===============================

window.addEventListener("DOMContentLoaded", () => {
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");

  function onEnter(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      window.loginUser();
    }
  }

  if (emailInput) emailInput.addEventListener("keydown", onEnter);
  if (passwordInput) passwordInput.addEventListener("keydown", onEnter);
});
