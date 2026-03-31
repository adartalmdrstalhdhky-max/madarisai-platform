import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const loginStatus = document.getElementById("loginStatus");

let isSubmitting = false;

function setStatus(message) {
  if (loginStatus) loginStatus.textContent = message;
}

function saveUnifiedSession(session) {
  const json = JSON.stringify(session);
  localStorage.setItem("madaris_user_session", json);
  localStorage.setItem("madaris_session", json);
}

function clearUnifiedSession() {
  localStorage.removeItem("madaris_user_session");
  localStorage.removeItem("madaris_session");
}

function readExistingSession() {
  const raw =
    localStorage.getItem("madaris_user_session") ||
    localStorage.getItem("madaris_session");

  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    if (!parsed.schoolId || !parsed.role) return null;
    return parsed;
  } catch {
    return null;
  }
}

function getRedirectPathByRole(role) {
  switch (role) {
    case "school":
      return "./school/index.html";
    case "admin":
      return "./admin/index.html";
    case "teacher":
      return "./teacher/index.html";
    case "student":
      return "./student/index.html";
    default:
      return "./dashboard.html";
  }
}

async function loadUserProfile(uid) {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    throw new Error("المستخدم غير موجود داخل قاعدة البيانات");
  }

  return userSnap.data();
}

function buildSession(uid, userData) {
  return {
    uid: uid || "",
    email: userData.email || "",
    name: userData.name || "",
    role: userData.role || "",
    roleLevel: userData.roleLevel || "",
    schoolId: userData.schoolId || "",
    status: userData.status || "active",
    created: userData.created || null,
    loginAt: Date.now()
  };
}

async function redirectIfAlreadyLoggedIn() {
  const session = readExistingSession();
  if (!session) {
    setStatus("أدخل البريد وكلمة المرور ثم اضغط تسجيل الدخول.");
    return;
  }

  if (!session.role || !session.schoolId) {
    clearUnifiedSession();
    setStatus("تم تنظيف جلسة قديمة غير مكتملة.");
    return;
  }

  setStatus("تم العثور على جلسة صحيحة. جاري التحويل...");
  window.location.replace(getRedirectPathByRole(session.role));
}

async function loginUser() {
  if (isSubmitting) return;

  const email = (emailInput?.value || "").trim();
  const password = (passwordInput?.value || "").trim();

  if (!email || !password) {
    setStatus("الرجاء إدخال البريد وكلمة المرور.");
    alert("الرجاء إدخال البريد وكلمة المرور");
    return;
  }

  isSubmitting = true;
  loginBtn.disabled = true;
  setStatus("جاري تسجيل الدخول...");

  try {
    clearUnifiedSession();

    await setPersistence(auth, browserLocalPersistence);

    const credential = await signInWithEmailAndPassword(auth, email, password);
    const uid = credential.user.uid;

    const userData = await loadUserProfile(uid);
    const session = buildSession(uid, userData);

    if (!session.role) {
      await signOut(auth);
      clearUnifiedSession();
      throw new Error("حقل role غير موجود داخل وثيقة المستخدم");
    }

    if (session.role === "school" && !session.schoolId) {
      await signOut(auth);
      clearUnifiedSession();
      throw new Error("حقل schoolId غير موجود داخل وثيقة المدرسة");
    }

    saveUnifiedSession(session);

    setStatus("تم تسجيل الدخول بنجاح. جاري التحويل...");
    window.location.replace(getRedirectPathByRole(session.role));
  } catch (error) {
    console.error("Login error:", error);
    clearUnifiedSession();

    let message = "فشل تسجيل الدخول";
    const code = error?.code || "";
    const raw = error?.message || "";

    if (code === "auth/invalid-credential") {
      message = "البريد أو كلمة المرور غير صحيحة";
    } else if (code === "auth/invalid-email") {
      message = "صيغة البريد الإلكتروني غير صحيحة";
    } else if (code === "auth/user-disabled") {
      message = "تم تعطيل هذا الحساب";
    } else if (code === "auth/too-many-requests") {
      message = "تمت محاولات كثيرة. حاول لاحقًا";
    } else if (code === "auth/network-request-failed") {
      message = "مشكلة في الإنترنت أو الاتصال بالشبكة";
    } else if (raw) {
      message = raw;
    }

    setStatus(message);
    alert(message);
  } finally {
    isSubmitting = false;
    loginBtn.disabled = false;
  }
}

window.loginUser = loginUser;

loginBtn?.addEventListener("click", loginUser);

emailInput?.addEventListener("input", () => {
  setStatus("أدخل كلمة المرور ثم اضغط تسجيل الدخول.");
});

passwordInput?.addEventListener("input", () => {
  setStatus("اضغط تسجيل الدخول الآن.");
});

document.addEventListener("DOMContentLoaded", async () => {
  await redirectIfAlreadyLoggedIn();
});
