// ============================================================
// Madaris AI Firebase Core
// Single Source of Truth
// ============================================================

import { initializeApp, getApps, getApp } 
from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";

import { getAuth } 
from "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js";

import { getFirestore } 
from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

import { getAnalytics } 
from "https://www.gstatic.com/firebasejs/12.12.0/firebase-analytics.js";


// ============================================================
// Firebase Config
// ============================================================

const firebaseConfig = {
  apiKey: "AIzaSyAzQKhPMSZNevhb6LlNh9pt9yA4Au9G7Cw",
  authDomain: "madaris-ai.firebaseapp.com",
  projectId: "madaris-ai",
  storageBucket: "madaris-ai.firebasestorage.app",
  messagingSenderId: "915394447224",
  appId: "1:915394447224:web:3d7750a7fcd3f41bedaa8d",
  measurementId: "G-SC7VE6F20S"
};


// ============================================================
// Initialize Firebase
// ============================================================

const app = getApps().length 
  ? getApp() 
  : initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

let analytics = null;

try {
  analytics = getAnalytics(app);
} catch (e) {
  console.warn("Analytics not available", e);
}


// ============================================================
// Export
// ============================================================

export {
  app,
  auth,
  db,
  analytics,
  firebaseConfig
};

