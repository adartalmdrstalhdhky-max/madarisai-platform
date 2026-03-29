import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
  getAuth,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

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

const form = document.getElementById("loginForm");

form.addEventListener("submit", async (e) => {

  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  try {

    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = userCredential.user;

    const userDoc = await getDoc(doc(db, "users", user.uid));

    if (!userDoc.exists()) {

      alert("لا يوجد حساب مرتبط");

      return;
    }

    const data = userDoc.data();

    const session = {
      uid: user.uid,
      email: data.email,
      role: data.role,
      schoolId: data.schoolId,
      schoolName: data.schoolName || "مدرسة"
    };

    localStorage.setItem(
      "madaris_user_session",
      JSON.stringify(session)
    );

    if (data.role === "school") {

      window.location.href = "/app/school/dashboard.html";

    } else if (data.role === "teacher") {

      window.location.href = "/app/teacher/dashboard.html";

    } else if (data.role === "student") {

      window.location.href = "/app/student/dashboard.html";

    } else if (data.role === "admin") {

      window.location.href = "/app/admin/dashboard.html";

    }

  } catch (error) {

    alert("فشل تسجيل الدخول");

    console.error(error);
  }

});
