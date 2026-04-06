
import { loginWithEmail, getCurrentSession } from "./core/auth.js";
import { repairOrClearSession } from "./core/session.js";

function redirectByRole(role) {
  switch (role) {
    case "school":
      window.location.href = "/app/school/index.html";
      break;
    case "teacher":
      window.location.href = "/app/teacher/index.html";
      break;
    case "student":
      window.location.href = "/app/student/index.html";
      break;
    case "admin":
      window.location.href = "/app/admin/index.html";
      break;
    default:
      window.location.href = "/app/dashboard.html";
      break;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const loginBtn = document.getElementById("loginBtn");
  const statusBox = document.getElementById("statusBox");

  if (!form || !emailInput || !passwordInput || !loginBtn || !statusBox) {
    console.error("Login page elements are missing.");
    return;
  }

  function showError(message) {
    statusBox.className = "status-box show error";
    statusBox.innerText = message;
  }

  function showSuccess(message) {
    statusBox.className = "status-box show success";
    statusBox.innerText = message;
  }

  function clearStatus() {
    statusBox.className = "status-box";
    statusBox.innerText = "";
  }

  function setLoading(isLoading) {
    loginBtn.disabled = isLoading;
    loginBtn.innerText = isLoading ? "جارٍ تسجيل الدخول..." : "دخول المنصة";
  }

  function tryAutoRedirect() {
    const repaired = repairOrClearSession();
    if (!repaired) return;

    const current = getCurrentSession();
    if (!current || !current.role) return;

    redirectByRole(current.role);
  }

  tryAutoRedirect();

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
      showError("يرجى إدخال البريد وكلمة المرور");
      return;
    }

    clearStatus();
    setLoading(true);

    try {
      const session = await loginWithEmail(email, password);

      if (!session || !session.role) {
        throw new Error("USER_ROLE_MISSING");
      }

      if (session.role === "school" && !session.schoolId) {
        throw new Error("SCHOOL_ID_MISSING");
      }

      showSuccess("تم تسجيل الدخول بنجاح");

      setTimeout(() => {
        redirectByRole(session.role);
      }, 350);
    } catch (error) {
      console.error("Login error:", error);

      if (error.code === "auth/invalid-credential") {
        showError("بيانات الدخول غير صحيحة");
      } else if (error.code === "auth/user-not-found") {
        showError("هذا المستخدم غير موجود");
      } else if (error.code === "auth/wrong-password") {
        showError("كلمة المرور غير صحيحة");
      } else if (error.code === "auth/invalid-email") {
        showError("البريد الإلكتروني غير صالح");
      } else if (error.code === "auth/too-many-requests") {
        showError("محاولات كثيرة، حاول لاحقًا");
      } else if (error.message === "USER_PROFILE_NOT_FOUND") {
        showError("تم تسجيل الدخول لكن ملف المستخدم غير موجود داخل users");
      } else if (error.message === "USER_ROLE_MISSING") {
        showError("ملف المستخدم موجود لكن role غير موجود");
      } else if (error.message === "SCHOOL_ID_MISSING") {
        showError("تم تسجيل الدخول لكن بيانات المدرسة ناقصة: schoolId غير موجود");
      } else {
        showError("فشل تسجيل الدخول. تحقق من البيانات والإعدادات");
      }
    } finally {
      setLoading(false);
    }
  });
});
