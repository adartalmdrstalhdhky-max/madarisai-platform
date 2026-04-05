// app/core/firebase-config.js
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/*
  مهم جداً:
  ضع هنا نفس Firebase Config الحقيقي الذي كان يعمل سابقاً مع مشروعك.
  لا تضع Config جديد من مشروع آخر.
*/
const firebaseConfig = {
  apiKey: "PUT_YOUR_REAL_API_KEY_HERE",
  authDomain: "PUT_YOUR_REAL_AUTH_DOMAIN_HERE",
  projectId: "PUT_YOUR_REAL_PROJECT_ID_HERE",
  storageBucket: "PUT_YOUR_REAL_STORAGE_BUCKET_HERE",
  messagingSenderId: "PUT_YOUR_REAL_MESSAGING_SENDER_ID_HERE",
  appId: "PUT_YOUR_REAL_APP_ID_HERE"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
