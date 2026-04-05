// app/login.js

import { loginWithEmail } from "./core/auth.js";
import { redirectByRole } from "./core/role-router.js";
import { getSession } from "./core/session.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const submitBtn = document.getElementById("loginBtn");
  const errorBox = document.getElementById("errorMessage");

  const existingSession = getSession();
  if (existingSession && existingSession.uid && existingSession.role) {
    redirectByRole(existingSession.role);
    return;
  }

  if (!form) {
    console.error("loginForm not found in login.html");
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = emailInput?.value?.trim() || "";
    const password = passwordInput?.value || "";

    if (!email || !password) {
      showError("الرجاء إدخال البريد الإلكتروني وكلمة المرور.");
      return;
    }

    setLoading(true);
    hideError();

    try {
      const session = await loginWithEmail(email, password);

      if (!session.role) {
        throw new Error("USER_ROLE_MISSING");
      }

      redirectByRole(session.role);
    } catch (error) {
      console.error("Login error:", error);

      if (error.code === "auth/invalid-credential") {
        showError("بيانات الدخول غير صحيحة.");
      } else if (error.code === "auth/user-not-found") {
        showError("هذا المستخدم غير موجود.");
      } else if (error.code === "auth/wrong-password") {
        showError("كلمة المرور غير صحيحة.");
      } else if (error.code === "auth/invalid-email") {
        showError("البريد الإلكتروني غير صالح.");
      } else if (error.code === "auth/too-many-requests") {
        showError("تمت محاولات كثيرة. حاول لاحقًا.");
      } else if (error.message === "USER_PROFILE_NOT_FOUND") {
        showError("تم تسجيل الدخول لكن ملف المستخدم غير موجود في قاعدة البيانات.");
      } else if (error.message === "USER_ROLE_MISSING") {
        showError("ملف المستخدم موجود لكن الدور غير محدد.");
      } else {
        showError("حدث خطأ أثناء تسجيل الدخول. تحقق من الإعدادات والبيانات.");
      }
    } finally {
      setLoading(false);
    }
  });

  function setLoading(isLoading) {
    if (!submitBtn) return;

    submitBtn.disabled = isLoading;
    submitBtn.textContent = isLoading ? "جاري تسجيل الدخول..." : "تسجيل الدخول";
  }

  function showError(message) {
    if (!errorBox) {
      alert(message);
      return;
    }

    errorBox.style.display = "block";
    errorBox.textContent = message;
  }

  function hideError() {
    if (!errorBox) return;

    errorBox.style.display = "none";
    errorBox.textContent = "";
  }
});
