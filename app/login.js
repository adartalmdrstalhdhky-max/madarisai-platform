import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  setPersistence,
  browserLocalPersistence
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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");

function safeAlert(message) {
  window.alert(message);
}

function setButtonLoading(isLoading) {
  if (!loginBtn) return;

  if (isLoading) {
    loginBtn.disabled = true;
    loginBtn.textContent = "جاري تسجيل الدخول...";
  } else {
    loginBtn.disabled = false;
    loginBtn.textContent = "تسجيل الدخول";
  }
}

function clearSavedSession() {
  try {
    localStorage.removeItem("madaris_user_session");
    localStorage.removeItem("madaris_session");
    sessionStorage.removeItem("madaris_user_session");
    sessionStorage.removeItem("madaris_session");
  } catch (error) {
    console.warn("تعذر حذف الجلسة المحلية:", error);
  }
}

async function resetLoginPageState() {
  clearSavedSession();

  try {
    await signOut(auth);
  } catch (error) {
    console.warn("لا توجد جلسة Firebase قديمة أو تعذر تسجيل الخروج المسبق:", error);
  }
}

function normalizeRole(role) {
  return String(role || "").trim().toLowerCase();
}

function normalizeStatus(status) {
  return String(status || "active").trim().toLowerCase();
}

function getRedirectPathByRole(role) {
  const normalizedRole = normalizeRole(role);

  if (normalizedRole === "school") return "./school/index.html";
  if (normalizedRole === "admin") return "./admin/index.html";
  if (normalizedRole === "teacher") return "./teacher/index.html";
  if (normalizedRole === "student") return "./student/index.html";

  return "./dashboard.html";
}

function buildLegacySession(session) {
  return {
    uid: session.uid,
    email: session.email,
    name: session.name,
    role: session.role,
    roleLevel: session.roleLevel,
    schoolId: session.schoolId,
    status: session.status,
    loginAt: session.loginAt
  };
}

function mapFirebaseError(error) {
  const code = error?.code || "";

  if (code === "auth/invalid-email") {
    return "البريد الإلكتروني غير صحيح.";
  }

  if (code === "auth/missing-password") {
    return "أدخل كلمة المرور.";
  }

  if (
    code === "auth/invalid-credential" ||
    code === "auth/user-not-found" ||
    code === "auth/wrong-password"
  ) {
    return "البريد الإلكتروني أو كلمة المرور غير صحيحة.";
  }

  if (code === "auth/too-many-requests") {
    return "تمت محاولات كثيرة. انتظر قليلًا ثم حاول مرة أخرى.";
  }

  if (code === "auth/network-request-failed") {
    return "فشل الاتصال بالشبكة. تأكد من الإنترنت ثم أعد المحاولة.";
  }

  return error?.message || "حدث خطأ غير متوقع أثناء تسجيل الدخول.";
}

window.loginUser = async function loginUser() {
  const email = emailInput?.value?.trim() || "";
  const password = passwordInput?.value || "";

  if (!email) {
    safeAlert("أدخل البريد الإلكتروني أولًا.");
    return;
  }

  if (!password) {
    safeAlert("أدخل كلمة المرور أولًا.");
    return;
  }

  setButtonLoading(true);

  try {
    clearSavedSession();

    await setPersistence(auth, browserLocalPersistence);

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const uid = user.uid;

    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await signOut(auth);
      clearSavedSession();
      throw new Error("هذا المستخدم غير موجود داخل مجموعة users في Firestore.");
    }

    const userData = userSnap.data() || {};
    const role = normalizeRole(userData.role);
    const status = normalizeStatus(userData.status);

    if (!role) {
      await signOut(auth);
      clearSavedSession();
      throw new Error("حساب المستخدم لا يحتوي على role داخل Firestore.");
    }

    if (status !== "active") {
      await signOut(auth);
      clearSavedSession();
      throw new Error("هذا الحساب غير نشط حاليًا.");
    }

    const session = {
      uid,
      email: userData.email || user.email || email,
      name: userData.name || "",
      role,
      roleLevel: userData.roleLevel || "",
      schoolId: userData.schoolId || "",
      status,
      loginAt: Date.now()
    };
    localStorage.setItem("madaris_user_session", JSON.stringify(session));
    localStorage.setItem("madaris_session", JSON.stringify(buildLegacySession(session)));

    sessionStorage.setItem("madaris_user_session", JSON.stringify(session));
    sessionStorage.setItem("madaris_session", JSON.stringify(buildLegacySession(session)));

    const redirectPath = getRedirectPathByRole(role);
    window.location.replace(redirectPath);
  } catch (error) {
    console.error("Login error:", error);
    clearSavedSession();
    safeAlert("فشل تسجيل الدخول: " + mapFirebaseError(error));
  } finally {
    setButtonLoading(false);
  }
};

document.addEventListener("DOMContentLoaded", async () => {
  await resetLoginPageState();

  if (emailInput) {
    emailInput.focus();
  }

  if (passwordInput) {
    passwordInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        window.loginUser();
      }
    });
  }

  if (emailInput) {
    emailInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        if (passwordInput) {
          passwordInput.focus();
        } else {
          window.loginUser();
        }
      }
    });
  }
});
