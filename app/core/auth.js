// app/core/auth.js

import { auth, db } from "./firebase-config.js";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  limit,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { saveSession, clearSession, getSession } from "./session.js";

function cleanString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeEmail(email) {
  return cleanString(email).toLowerCase();
}

async function getUserProfileByUid(uid) {
  if (!cleanString(uid)) return null;

  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) return null;

  return {
    id: userSnap.id,
    ...userSnap.data(),
  };
}

async function getUserProfileByEmail(email) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return null;

  const usersRef = collection(db, "users");
  const q = query(usersRef, where("email", "==", normalizedEmail), limit(1));
  const querySnap = await getDocs(q);

  if (querySnap.empty) return null;

  const found = querySnap.docs[0];
  return {
    id: found.id,
    ...found.data(),
  };
}

async function getSchoolProfileByUid(uid) {
  if (!cleanString(uid)) return null;

  const schoolRef = doc(db, "schools", uid);
  const schoolSnap = await getDoc(schoolRef);

  if (!schoolSnap.exists()) return null;

  return {
    id: schoolSnap.id,
    ...schoolSnap.data(),
  };
}

async function getSchoolProfileByOwnerUid(uid) {
  if (!cleanString(uid)) return null;

  const schoolsRef = collection(db, "schools");
  const q = query(schoolsRef, where("ownerUid", "==", uid), limit(1));
  const querySnap = await getDocs(q);

  if (querySnap.empty) return null;

  const found = querySnap.docs[0];
  return {
    id: found.id,
    ...found.data(),
  };
}

async function getUserProfile(firebaseUser) {
  if (!firebaseUser || !firebaseUser.uid) {
    throw new Error("AUTH_USER_MISSING");
  }

  const uid = cleanString(firebaseUser.uid);
  const email = normalizeEmail(firebaseUser.email || "");

  const byUid = await getUserProfileByUid(uid);
  if (byUid) return byUid;

  const byEmail = await getUserProfileByEmail(email);
  if (byEmail) return byEmail;

  throw new Error("USER_PROFILE_NOT_FOUND");
}

async function enrichSchoolSession(firebaseUser, profile) {
  let schoolId = cleanString(profile.schoolId || "");
  let schoolName = cleanString(profile.schoolName || "");

  if (schoolId && schoolName) {
    return { schoolId, schoolName };
  }

  const schoolByUid = await getSchoolProfileByUid(firebaseUser.uid);
  if (schoolByUid) {
    schoolId =
      cleanString(schoolByUid.schoolId || "") ||
      cleanString(schoolByUid.id || "") ||
      cleanString(firebaseUser.uid);
    schoolName =
      cleanString(schoolByUid.schoolName || "") ||
      cleanString(schoolByUid.name || "") ||
      schoolName;

    return { schoolId, schoolName };
  }

  const schoolByOwner = await getSchoolProfileByOwnerUid(firebaseUser.uid);
  if (schoolByOwner) {
    schoolId =
      cleanString(schoolByOwner.schoolId || "") ||
      cleanString(schoolByOwner.id || "") ||
      cleanString(firebaseUser.uid);
    schoolName =
      cleanString(schoolByOwner.schoolName || "") ||
      cleanString(schoolByOwner.name || "") ||
      schoolName;

    return { schoolId, schoolName };
  }

  if (!schoolId) {
    schoolId = cleanString(firebaseUser.uid);
  }

  return { schoolId, schoolName };
}

async function buildSession(firebaseUser, profile, fallbackEmail = "") {
  const role = cleanString(profile.role || "");
  const fullName =
    cleanString(profile.fullName || "") ||
    cleanString(profile.name || "") ||
    cleanString(firebaseUser.displayName || "");
  const email =
    normalizeEmail(firebaseUser.email || "") ||
    normalizeEmail(profile.email || "") ||
    normalizeEmail(fallbackEmail || "");

  if (!role) {
    throw new Error("USER_ROLE_MISSING");
  }

  const sessionData = {
    uid: cleanString(firebaseUser.uid || "") || cleanString(profile.uid || "") || "",
    email,
    fullName,
    role,
    schoolId: cleanString(profile.schoolId || ""),
    schoolName: cleanString(profile.schoolName || ""),
    status: cleanString(profile.status || "") || "active",
  };

  if (role === "school") {
    const schoolMeta = await enrichSchoolSession(firebaseUser, profile);
    sessionData.schoolId = cleanString(schoolMeta.schoolId || "");
    sessionData.schoolName = cleanString(schoolMeta.schoolName || "");

    if (!sessionData.schoolId) {
      throw new Error("SCHOOL_ID_MISSING");
    }
  }

  return saveSession(sessionData);
}

export async function loginWithEmail(email, password) {
  clearSession();

  const normalizedEmail = normalizeEmail(email);

  const userCredential = await signInWithEmailAndPassword(
    auth,
    normalizedEmail,
    password
  );

  const firebaseUser = userCredential.user;
  const profile = await getUserProfile(firebaseUser);
  const sessionData = await buildSession(firebaseUser, profile, normalizedEmail);

  return sessionData;
}

export async function logoutUser() {
  try {
    await signOut(auth);
  } finally {
    clearSession();
  }
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
      const sessionData = await buildSession(user, profile, user.email || "");

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
