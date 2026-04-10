// ============================================================
// Madaris AI Firestore Schema Contract
// ============================================================

export const SCHEMA = {

  schools: [
    "id",
    "name",
    "status",
    "managerName",
    "managerEmail",
    "city"
  ],

  users: [
    "id",
    "name",
    "email",
    "role",
    "schoolId",
    "status"
  ],

  teachers: [
    "id",
    "name",
    "schoolId",
    "teacherType",
    "isAI",
    "status"
  ],

  classes: [
    "id",
    "name",
    "schoolId",
    "grade"
  ],

  subjects: [
    "id",
    "name",
    "schoolId"
  ],

  classSubjects: [
    "id",
    "classId",
    "subjectId",
    "teacherId",
    "schoolId"
  ],

  schedules: [
    "id",
    "classId",
    "subjectId",
    "teacherId",
    "day",
    "period",
    "schoolId"
  ]

};


export function validateSchema(collection, data) {

  const required = SCHEMA[collection];

  if (!required) return true;

  for (const field of required) {
    if (!(field in data)) {
      console.warn(
        "Schema Missing Field:",
        collection,
        field,
        data
      );
      return false;
    }
  }

  return true;

}
