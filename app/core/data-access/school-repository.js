// ============================================================
// School Repository
// ============================================================

import { getBySchool } from "./base-repository.js";

export async function getTeachers(schoolId) {
  return getBySchool("teachers", schoolId);
}

export async function getClasses(schoolId) {
  return getBySchool("classes", schoolId);
}

export async function getSubjects(schoolId) {
  return getBySchool("subjects", schoolId);
}

export async function getClassSubjects(schoolId) {
  return getBySchool("classSubjects", schoolId);
}

export async function getSchedules(schoolId) {
  return getBySchool("schedules", schoolId);
}
