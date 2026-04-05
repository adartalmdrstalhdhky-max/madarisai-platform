// app/core/auth.js

import { auth, db } from "./firebase-config.js";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  limit
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  saveSession,
  clearSession,
  getSession
} from "./session.js";

async function getUserProfile(firebaseUser) {
  if (!firebaseUser || !firebaseUser.uid) {
    throw new Error("AUTH_USER_MISSING");
  }

  const uid = firebaseUser.uid;
  const email = (firebaseUser.email || "").trim().toLowerCase();

  // 1) المحاولة الأولى: users/{uid}
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    return {
      id: userSnap.id,
      ...userSnap.data()
    };
  }

  // 2) المحاولة الثانية: البحث بالبريد
  if (email) {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email), limit(1));
    const querySnap = await getDocs(q);

    if (!querySnap.empty) {
      const found = querySnap.docs[0];
      return {
        id: found.id,
        ...found.data()
      };
    }
  }

  throw new Error("USER_PROFILE_NOT_FOUND");
}

function buildSession(firebaseUser, profile, fallbackEmail = "") {
  return saveSession({
    uid: firebaseUser.uid || profile.uid || "",
    email: firebaseUser.email || profile.email || fallbackEmail || "",
    fullName: profile.fullName || profile.name || "",
    role: profile.role || "",
    schoolId: profile.schoolId || "",
    schoolName: profile.schoolName || "",
    status: profile.status || "active"
  });
}

export async function loginWithEmail(email, password) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const firebaseUser = userCredential.user;

  const profile = await getUserProfile(firebaseUser);
  const sessionData = buildSession(firebaseUser, profile, email);

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
      const profile = await getUserProfile(user);
      const sessionData = buildSession(user, profile, user.email || "");

      if (typeof onLoggedIn === "function") {
        onLoggedIn(sessionData);
      }
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
