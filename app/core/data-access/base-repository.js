// ============================================================
// Base Repository
// Uses shared Firebase core
// ============================================================

import {
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

import { db } from "../firebase/app-firebase.js";

export async function getBySchool(collectionName, schoolId) {
  try {
    const q = query(
      collection(db, collectionName),
      where("schoolId", "==", schoolId)
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((docItem) => ({
      id: docItem.id,
      ...docItem.data()
    }));
  } catch (error) {
    console.error("Repository Error:", collectionName, error);
    return [];
  }
}

export async function getAll(collectionName) {
  try {
    const snapshot = await getDocs(
      collection(db, collectionName)
    );

    return snapshot.docs.map((docItem) => ({
      id: docItem.id,
      ...docItem.data()
    }));
  } catch (error) {
    console.error("Repository Error:", collectionName, error);
    return [];
  }
}
