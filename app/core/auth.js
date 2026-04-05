// app/core/auth.js

import { auth, db } from "./firebase-config.js";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  saveSession,
  clearSession,
  getSession
} from "./session.js";

export async function loginWithEmail(email, password) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const firebaseUser = userCredential.user;

  const userRef = doc(db, "users", firebaseUser.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    throw new Error("USER_PROFILE_NOT_FOUND");
  }

  const profile = userSnap.data();

  const sessionData = saveSession({
    uid: firebaseUser.uid,
    email: firebaseUser.email || email,
    fullName: profile.fullName || profile.name || "",
    role: profile.role || "",
    schoolId: profile.schoolId || "",
    schoolName: profile.schoolName || "",
    status: profile.status || "active"
  });

  return sessionData;
}

export async function logoutUser() {
  await signOut(auth);
  clearSession();
}

export function watchAuthState(onLoggedIn, onLoggedOut) {
  return onAuthStateChanged(auth, async (user) => {
    if (!user) {
      clearSession();
      if (typeof onLoggedOut === "function") onLoggedOut();
      return;
    }

    try {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        clearSession();
        if (typeof onLoggedOut === "function") onLoggedOut();
        return;
      }

      const profile = userSnap.data();

      const sessionData = saveSession({
        uid: user.uid,
        email: user.email || "",
        fullName: profile.fullName || profile.name || "",
        role: profile.role || "",
        schoolId: profile.schoolId || "",
        schoolName: profile.schoolName || "",
        status: profile.status || "active"
      });

      if (typeof onLoggedIn === "function") onLoggedIn(sessionData);
    } catch (error) {
      console.error("watchAuthState error:", error);
      clearSession();
      if (typeof onLoggedOut === "function") onLoggedOut();
    }
  });
}

export function getCurrentSession() {
  return getSession();
}
