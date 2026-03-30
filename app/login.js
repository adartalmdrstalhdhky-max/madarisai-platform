import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";


/* Firebase Config (نفس مشروعك الحالي) */

const firebaseConfig = {
  apiKey: "AIzaSyAzQkhPMSZNevhb6LlNh9pt9yA4Au9G7Cw",
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


/* عناصر الصفحة */

const form = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const errorBox = document.getElementById("errorBox");
const loginBtn = document.getElementById("loginBtn");


/* مفاتيح الجلسة */

const SESSION_KEY_CURRENT = "madaris_user_session";
const SESSION_KEY_LEGACY = "madaris_session";


function showError(message) {
  if (!errorBox) return;
  errorBox.style.display = "block";
  errorBox.innerHTML = message;
}


function hideError() {
  if (!errorBox) return;
  errorBox.style.display = "none";
  errorBox.innerHTML = "";
}


/* حفظ الجلسة */

function saveSession(session) {
  localStorage.setItem(
    SESSION_KEY_CURRENT,
    JSON.stringify(session)
  );

  /* دعم النسخة القديمة */
  localStorage.setItem(
    SESSION_KEY_LEGACY,
    JSON.stringify(session)
  );
}


/* التحويل حسب الدور */

function redirectByRole(role) {

  if (role === "school") {
    window.location.href = "/app/school/index.html";
    return;
  }

  if (role === "teacher") {
    window.location.href = "/app/teacher/index.html";
    return;
  }

  if (role === "admin") {
    window.location.href = "/app/admin/index.html";
    return;
  }

  /* افتراضي */
  window.location.href = "/app/school/index.html";
}


/* تسجيل الدخول */

async function handleLogin(email, password) {

  try {

    hideError();

    loginBtn.disabled = true;
    loginBtn.innerText = "جارٍ تسجيل الدخول...";


    const credential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );


    const user = credential.user;

    const uid = user.uid;

    const userRef = doc(db, "users", uid);

    const userSnap = await getDoc(userRef);


    if (!userSnap.exists()) {

      showError("لم يتم العثور على حساب المستخدم داخل قاعدة البيانات.");

      loginBtn.disabled = false;
      loginBtn.innerText = "تسجيل الدخول";

      return;
    }

    const userData = userSnap.data();

    const session = {
      uid: uid,
      email: user.email || "",
      role: userData.role || "school",
      schoolId: userData.schoolId || "",
      name: userData.name || "",
      roleLevel: userData.roleLevel || ""
    };


    if (!session.schoolId && session.role === "school") {

      showError("الحساب لا يحتوي على schoolId");

      loginBtn.disabled = false;
      loginBtn.innerText = "تسجيل الدخول";

      return;
    }

    /* حفظ الجلسة */

    saveSession(session);


    /* تحويل */

    redirectByRole(session.role);

  } catch (error) {

    console.error("Login Error:", error);

    showError(error.message || "فشل تسجيل الدخول");

    loginBtn.disabled = false;
    loginBtn.innerText = "تسجيل الدخول";

  }

}/* Submit Form */

if (form) {

  form.addEventListener("submit", function (e) {

    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
      showError("يرجى إدخال البريد وكلمة المرور");
      return;
    }

    handleLogin(email, password);

  });

}


/* تحقق تلقائي من الجلسة */

onAuthStateChanged(auth, async (user) => {

  if (!user) return;

  try {

    const userRef = doc(db, "users", user.uid);

    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) return;

    const userData = userSnap.data();

    const session = {
      uid: user.uid,
      email: user.email || "",
      role: userData.role || "school",
      schoolId: userData.schoolId || "",
      name: userData.name || "",
      roleLevel: userData.roleLevel || ""
    };

    if (!session.schoolId && session.role === "school") return;

    saveSession(session);

  } catch (error) {

    console.error("Session restore error:", error);

  }

});
