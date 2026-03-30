// ===============================
// Madaris AI - Login System
// Production Version
// ===============================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged
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
  apiKey: "PUT_YOUR_API_KEY",
  authDomain: "PUT_YOUR_AUTH_DOMAIN",
  projectId: "PUT_YOUR_PROJECT_ID",
  storageBucket: "PUT_YOUR_STORAGE_BUCKET",
  messagingSenderId: "PUT_YOUR_MESSAGING_SENDER_ID",
  appId: "PUT_YOUR_APP_ID"
};


// ===============================
// Initialize Firebase
// ===============================

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


// ===============================
// Login Function
// ===============================

window.loginUser = async function () {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    alert("الرجاء إدخال البريد وكلمة المرور");
    return;
  }

  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = userCredential.user;
    const uid = user.uid;

    console.log("User UID:", uid);

    // ===============================
    // Read User from Firestore
    // ===============================

    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      alert("المستخدم غير موجود في قاعدة البيانات");
      return;
    }

    const userData = userSnap.data();

    console.log("User Data:", userData);

    // ===============================
    // Build Session
    // ===============================

    const session = {
      uid: uid,
      email: userData.email || "",
      name: userData.name || "",
      role: userData.role || "",
      roleLevel: userData.roleLevel || "",
      schoolId: userData.schoolId || "",
      status: userData.status || "active",
      loginAt: Date.now()
    };

    // ===============================
    // Save Session
    // ===============================

    localStorage.setItem(
      "madaris_user_session",
      JSON.stringify(session)
    );

    console.log("Session Saved:", session);

    // ===============================
    // Redirect
    // ===============================

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

    window.location.href = "dashboard.html";

  } catch (error) {
    console.error(error);
    alert("فشل تسجيل الدخول: " + error.message);
  }
};


// ===============================
// Auto Login Check
// ===============================

onAuthStateChanged(auth, (user) => {
  if (!user) return;

  const session = localStorage.getItem("madaris_user_session");

  if (session) {
    const data = JSON.parse(session);

    if (data.role === "school") {
      window.location.href = "school/index.html";
    }
  }
});
