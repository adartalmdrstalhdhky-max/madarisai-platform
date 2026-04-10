// app/core/session/session-normalizer.js

function firstNonEmpty(...values) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
  }
  return "";
}

export function normalizeSession(input) {
  if (!input || typeof input !== "object") return null;

  const role = firstNonEmpty(
    input.role,
    input.userRole,
    input.sessionRole
  ).toLowerCase();

  const schoolId = firstNonEmpty(
    input.schoolId,
    input.school?.id,
    input.school?.schoolId
  );

  const normalized = {
    userId: firstNonEmpty(input.userId, input.uid, input.id),
    email: firstNonEmpty(input.email),
    role,
    schoolId,
    schoolName: firstNonEmpty(input.schoolName, input.school?.name),
    displayName: firstNonEmpty(input.displayName, input.userName, input.name),
    status: firstNonEmpty(input.status || "active"),
    loginAt: Number(input.loginAt || Date.now())
  };

  if (!normalized.role) return null;
  if (!normalized.schoolId && normalized.role === "school") return null;

  return normalized;
}
