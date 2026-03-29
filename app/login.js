import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  limit
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAzQKhPMSZNevhb6LNn9pt9yA4Au9G7Cw",
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

const form =
  document.getElementById("loginForm") ||
  document.querySelector('form');

const emailInput =
  document.getElementById("email") ||
  document.querySelector('input[type="email"]') ||
  document.querySelector('input[name="email"]');

const passwordInput =
  document.getElementById("password") ||
  document.querySelector('input[type="password"]') ||
  document.querySelector('input[name="password"]');

const submitButton =
  document.getElementById("loginButton") ||
  document.getElementById("submitBtn") ||
  document.querySelector('button[type="submit"]');

const errorBox = createMessageBox("error");
const successBox = createMessageBox("success");

if (form) {
  form.appendChild(errorBox);
  form.appendChild(successBox);
}

function createMessageBox(type) {
  const box = document.createElement("div");
  box.style.display = "none";
  box.style.marginTop = "14px";
  box.style.padding = "12px 14px";
  box.style.borderRadius = "12px";
  box.style.fontSize = "15px";
  box.style.lineHeight = "1.8";
  box.style.textAlign = "right";
  box.style.direction = "rtl";
  box.style.border = "1px solid transparent";

  if (type === "error") {
    box.style.background = "rgba(255, 82, 82, 0.12)";
    box.style.color = "#ffd2d2";
    box.style.borderColor = "rgba(255, 82, 82, 0.25)";
  } else {
    box.style.background = "rgba(0, 200, 255, 0.12)";
    box.style.color = "#d7f7ff";
    box.style.borderColor = "rgba(0, 200, 255, 0.25)";
  }

  return box;
}

function showError(message) {
  if (!errorBox) return;
  successBox.style.display = "none";
  errorBox.textContent = message;
  errorBox.style.display = "block";
}

function showSuccess(message) {
  if (!successBox) return;
  errorBox.style.display = "none";
  successBox.textContent = message;
  successBox.style.display = "block";
}

function clearMessages() {
  if (errorBox) errorBox.style.display = "none";
  if (successBox) successBox.style.display = "none";
}

function setLoading(isLoading) {
  if (!submitButton) return;

  submitButton.disabled = isLoading;
  submitButton.style.opacity = isLoading ? "0.7" : "1";
  submitButton.style.cursor = isLoading ? "not-allowed" : "pointer";

  if (isLoading) {
    submitButton.dataset.originalText = submitButton.textContent;
    submitButton.textContent = "جارٍ تسجيل الدخول...";
  } else if (submitButton.dataset.originalText) {
    submitButton.textContent = submitButton.dataset.originalText;
  }
}

async function findOneByField(collectionName, fieldName, value) {
  const q = query(
    collection(db, collectionName),
    where(fieldName, "==", value),
    limit(1)
  );

  const snap = await getDocs(q);

  if (snap.empty) return null;

  const first = snap.docs[0];
  return {
    id: first.id,
    ...first.data()
  };
}

async function resolveUserAccess(user) {
  if (!user || !user.email) {
    throw new Error("المستخدم غير متوفر أو لا يحتوي على بريد إلكتروني.");
  }

  const uid = user.uid;
  const email = user.email.toLowerCase().trim();

  try {
    const userDocRef = doc(db, "users", uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      const data = userDocSnap.data() || {};
      return {
        source: "users_by_uid",
        role: data.role || "user",
        schoolId: data.schoolId || null,
        userId: uid,
        profile: data
      };
    }
  } catch (e) {
    console.warn("users/{uid} not found or unreadable", e);
  }

  const userByEmail = await findOneByField("users", "email", email);
  if (userByEmail) {
    return {
      source: "users_by_email",
      role: userByEmail.role || "user",
      schoolId: userByEmail.schoolId || null,
      userId: userByEmail.id,
      profile: userByEmail
    };
  }

  const schoolByManagerEmail = await findOneByField("schools", "managerEmail", email);
  if (schoolByManagerEmail) {
    return {
      source: "schools_by_managerEmail",
      role: "school",
      schoolId: schoolByManagerEmail.id,
      userId: uid,
      profile: schoolByManagerEmail
    };
  }

  const teacherByEmail = await findOneByField("teachers", "email", email);
  if (teacherByEmail) {
    return {
      source: "teachers_by_email",
      role: "teacher",
      schoolId: teacherByEmail.schoolId || null,
      userId: teacherByEmail.id,
      profile: teacherByEmail
    };
  }

  return {
    source: "auth_only",
    role: "user",
    schoolId: null,
    userId: uid,
    profile: {}
  };
}

function saveSessionSnapshot(user, access) {
  const payload = {
    uid: user.uid,
    email: user.email || "",
    role: access.role || "user",
    schoolId: access.schoolId || "",
    source: access.source || "",
    savedAt: Date.now()
  };

  localStorage.setItem("madaris_user_session", JSON.stringify(payload));
  localStorage.setItem("madaris_uid", payload.uid);
  localStorage.setItem("madaris_email", payload.email);
  localStorage.setItem("madaris_role", payload.role);
  localStorage.setItem("madaris_school_id", payload.schoolId);
}

function getRedirectPath(access) {
  const role = String(access?.role || "").toLowerCase();

  if (role === "school" || role === "manager" || role === "school_manager") {
    return "/app/school/index.html";
  }

  if (role === "teacher") {
    return "/app/teacher/index.html";
  }

  if (role === "student") {
    return "/app/student/index.html";
  }

  if (role === "admin" || role === "super_admin") {
    return "/app/admin/index.html";
  }

  return "/app/dashboard.html";
}

async function processLogin(email, password) {
  clearMessages();

  if (!email || !password) {
    showError("أدخل البريد الإلكتروني وكلمة المرور أولاً.");
    return;
  }

  setLoading(true);

  try {
    await setPersistence(auth, browserLocalPersistence);

    const credential = await signInWithEmailAndPassword(
      auth,
      email.trim(),
      password
    );

    const user = credential.user;
    const access = await resolveUserAccess(user);

    saveSessionSnapshot(user, access);

    showSuccess("تم تسجيل الدخول بنجاح. جاري تحويلك...");
    const redirectPath = getRedirectPath(access);

    setTimeout(() => {
      window.location.href = redirectPath;
    }, 700);

  } catch (error) {
    console.error("LOGIN_ERROR", error);

    let message = "فشل تسجيل الدخول. تحقق من البيانات ثم أعد المحاولة.";

    if (error?.code === "auth/invalid-email") {
      message = "صيغة البريد الإلكتروني غير صحيحة.";
    } else if (
      error?.code === "auth/invalid-credential" ||
      error?.code === "auth/wrong-password" ||
      error?.code === "auth/user-not-found"
    ) {
      message = "البريد الإلكتروني أو كلمة المرور غير صحيحة.";
    } else if (error?.code === "auth/too-many-requests") {
      message = "تمت محاولات كثيرة. انتظر قليلًا ثم أعد المحاولة.";
    } else if (error?.code === "auth/network-request-failed") {
      message = "فشل الاتصال بالشبكة. تحقق من الإنترنت ثم أعد المحاولة.";
    } else if (error?.message) {
      message = `حدث خطأ: ${error.message}`;
    }

    showError(message);
  } finally {
    setLoading(false);
  }
}

if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = emailInput ? emailInput.value : "";
    const password = passwordInput ? passwordInput.value : "";

    await processLogin(email, password);
  });
}

onAuthStateChanged(auth, async (user) => {
  try {
    const currentPath = window.location.pathname || "";

    if (!currentPath.includes("/app/login.html")) {
      return;
    }

    if (!user) {
      return;
    }

    await setPersistence(auth, browserLocalPersistence);

    const access = await resolveUserAccess(user);
    saveSessionSnapshot(user, access);

    const redirectPath = getRedirectPath(access);

    if (redirectPath && redirectPath !== currentPath) {
      window.location.href = redirectPath;
    }
  } catch (error) {
    console.error("AUTH_STATE_ERROR", error);
  }
});

window.madarisDebugLogin = async function () {
  const user = auth.currentUser;

  if (!user) {
    console.log("No authenticated user currently.");
    return;
  }

  const access = await resolveUserAccess(user);

  console.log("Authenticated user:", {
    uid: user.uid,
    email: user.email,
    access
  });
};
