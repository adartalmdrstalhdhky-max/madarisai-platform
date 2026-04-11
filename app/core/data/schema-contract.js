// app/core/data/schema-contract.js
export const COLLECTIONS = {
  schools: "schools",
  users: "users",
  teachers: "teachers",
  students: "students",
  classes: "classes",
  subjects: "subjects",
  classSubjects: "classSubjects",
  schedules: "schedules"
};

export const REQUIRED_FIELDS = {
  schools: ["id", "name", "status"],
  users: ["id", "email", "name", "role", "schoolId", "status"],
  teachers: ["id", "name", "schoolId", "subjectId", "status"],
  students: ["id", "name", "schoolId", "status"],
  classes: ["id", "name", "schoolId", "status"],
  subjects: ["id", "name", "schoolId", "status"],
  classSubjects: ["id", "classId", "subjectId", "schoolId"],
  schedules: ["id", "schoolId", "day", "periodNumber", "classId", "subjectId", "teacherId", "status"]
};

export const PATH_POLICY = {
  operationalReadMode: "top-level-with-schoolId",
  legacyNestedPathsStillSupportedForAudit: true
};
