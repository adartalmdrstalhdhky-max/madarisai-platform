// app/core/role-router.js

export function getRoleHomePath(role) {
  switch (role) {
    case "admin":
      return "./admin/index.html";
    case "school":
      return "./school/index.html";
    case "teacher":
      return "./teacher/index.html";
    case "student":
      return "./student/index.html";
    default:
      return "./dashboard.html";
  }
}

export function getAbsoluteRoleHomePath(role) {
  switch (role) {
    case "admin":
      return "/app/admin/index.html";
    case "school":
      return "/app/school/index.html";
    case "teacher":
      return "/app/teacher/index.html";
    case "student":
      return "/app/student/index.html";
    default:
      return "/app/dashboard.html";
  }
}

export function redirectByRole(role) {
  const target = getRoleHomePath(role);
  window.location.href = target;
}

export function redirectByRoleAbsolute(role) {
  const target = getAbsoluteRoleHomePath(role);
  window.location.href = target;
}
