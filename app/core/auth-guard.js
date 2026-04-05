// app/core/auth-guard.js

import { getSession } from "./session.js";

export function guardPage(options = {}) {
  const {
    requiredRole = null,
    loginPath = "/app/login.html",
    unauthorizedPath = "/app/login.html"
  } = options;

  const session = getSession();

  if (!session || !session.uid) {
    window.location.href = loginPath;
    return null;
  }

  if (requiredRole && session.role !== requiredRole) {
    window.location.href = unauthorizedPath;
    return null;
  }

  return session;
}

export function injectUserName(elementId = "userName") {
  const session = getSession();
  const el = document.getElementById(elementId);

  if (!session || !el) return;

  el.textContent = session.fullName || session.email || "User";
}
