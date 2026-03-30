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


// Firebase Config

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


// Login

window.loginUser = async function () {

  const email =
    document.getElementById("email")?.value.trim();

  const password =
    document.getElementById("password")?.value.trim();


  if (!email || !password) {
    alert("الرجاء إدخال البريد وكلمة المرور");
    return;
  }

  try {

    const userCredential =
      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

    const user = userCredential.user;

    const uid = user.uid;


    const userRef =
      doc(db, "users", uid);

    const userSnap =
      await getDoc(userRef);


    if (!userSnap.exists()) {

      alert("المستخدم غير موجود في قاعدة البيانات");

      return;

    }


    const userData =
      userSnap.data();


    const session = {

      uid: uid,

      email: user.email,

      role: userData.role || "",

      schoolId: userData.schoolId || "",

      name: userData.name || "",

      loginTime: Date.now()

    };


    localStorage.setItem(
      "madaris_user_session",
      JSON.stringify(session)
    );


    localStorage.setItem(
      "madaris_session",
      JSON.stringify(session)
    );console.log("Session Saved", session);


    if (session.role === "school") {

      window.location.href =
        "/app/school/index.html";

      return;

    }


    if (session.role === "teacher") {

      window.location.href =
        "/app/teacher/index.html";

      return;

    }


    if (session.role === "admin") {

      window.location.href =
        "/app/admin/index.html";

      return;

    }


    window.location.href =
      "/app/dashboard.html";


  } catch (error) {

    console.error(error);

    alert("فشل تسجيل الدخول: " + error.message);

  }

};


// Auto Login

onAuthStateChanged(auth, async (user) => {

  if (!user) return;


  const session =
    localStorage.getItem(
      "madaris_user_session"
    );


  if (session) {

    const data =
      JSON.parse(session);


    if (data.role === "school") {

      window.location.href =
        "/app/school/index.html";

    }

  }

});
