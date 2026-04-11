// app/core/utils/guards.js
export function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

export function ensure(condition, message) {
  if (!condition) throw new Error(message);
}

export function safeText(value, fallback = "") {
  return typeof value === "string" ? value : fallback;
}
