// ============================================================
// Firestore Collections
// ============================================================

export const COLLECTIONS = {

  schools: "schools",

  users: "users",

  teachers: "teachers",

  classes: "classes",

  subjects: "subjects",

  classSubjects: "classSubjects",

  schedules: "schedules"

};

export function col(name) {
  return COLLECTIONS[name];
}
