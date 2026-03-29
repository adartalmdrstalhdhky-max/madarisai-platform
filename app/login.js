<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Madaris AI | تسجيل الدخول</title>

  <style>
    :root{
      --bg:#020b2a;
      --bg-2:#06153d;
      --card:#0a1f56;
      --card-2:#0c255f;
      --text:#ffffff;
      --muted:#b9c7e6;
      --primary:#35d0ff;
      --primary-dark:#18b8ea;
      --danger:#ff5d73;
      --success:#25c281;
      --border:rgba(255,255,255,0.08);
      --shadow:0 20px 60px rgba(0,0,0,0.35);
      --radius:28px;
    }

    *{
      box-sizing:border-box;
      margin:0;
      padding:0;
    }

    html,body{
      width:100%;
      min-height:100%;
      font-family:"Tahoma","Arial",sans-serif;
      background:
        radial-gradient(circle at top right, rgba(53,208,255,0.08), transparent 22%),
        radial-gradient(circle at top left, rgba(53,208,255,0.05), transparent 18%),
        linear-gradient(180deg, #021033 0%, #020b2a 100%);
      color:var(--text);
    }

    body{
      display:flex;
      align-items:center;
      justify-content:center;
      padding:24px;
    }

    .page{
      width:100%;
      max-width:520px;
    }

    .login-card{
      background:linear-gradient(180deg, rgba(10,31,86,0.96) 0%, rgba(7,24,67,0.98) 100%);
      border:1px solid var(--border);
      border-radius:var(--radius);
      box-shadow:var(--shadow);
      padding:32px 24px;
      overflow:hidden;
      position:relative;
    }

    .login-card::before{
      content:"";
      position:absolute;
      top:-120px;
      left:-120px;
      width:240px;
      height:240px;
      background:radial-gradient(circle, rgba(53,208,255,0.18) 0%, transparent 70%);
      pointer-events:none;
    }

    .brand{
      position:relative;
      z-index:1;
      text-align:center;
      margin-bottom:26px;
    }

    .brand h1{
      font-size:48px;
      line-height:1.15;
      font-weight:800;
      letter-spacing:0.3px;
      margin-bottom:14px;
    }

    .brand p{
      color:var(--muted);
      font-size:17px;
      line-height:1.9;
    }

    .status-box{
      display:none;
      margin-bottom:18px;
      border-radius:18px;
      padding:14px 16px;
      font-size:15px;
      line-height:1.9;
      border:1px solid transparent;
    }

    .status-box.show{
      display:block;
    }

    .status-box.error{
      background:rgba(255,93,115,0.12);
      color:#ffd3d9;
      border-color:rgba(255,93,115,0.22);
    }

    .status-box.success{
      background:rgba(37,194,129,0.12);
      color:#d7ffef;
      border-color:rgba(37,194,129,0.22);
    }

    .status-box.info{
      background:rgba(53,208,255,0.12);
      color:#daf7ff;
      border-color:rgba(53,208,255,0.22);
    }

    form{
      position:relative;
      z-index:1;
    }

    .field{
      margin-bottom:18px;
    }

    .field label{
      display:block;
      margin-bottom:10px;
      font-size:15px;
      color:#dbe8ff;
      font-weight:700;
    }

    .input-wrap{
      position:relative;
    }

    .input{
      width:100%;
      border:none;
      outline:none;
      border-radius:20px;
      background:rgba(255,255,255,0.92);
      color:#0b1435;
      padding:18px 18px;
      font-size:20px;
      min-height:62px;
      transition:0.2s ease;
      box-shadow:inset 0 0 0 2px transparent;
    }

    .input:focus{
      box-shadow:inset 0 0 0 2px rgba(53,208,255,0.9);
      background:#ffffff;
    }

    .input::placeholder{
      color:#7f8bab;
    }

    .password-toggle{
      position:absolute;
      left:14px;
      top:50%;
      transform:translateY(-50%);
      border:none;
      background:transparent;
      color:#2d4a84;
      font-size:14px;
      font-weight:700;
      cursor:pointer;
      padding:8px 10px;
      border-radius:12px;
    }

    .password-toggle:disabled{
      opacity:0.5;
      cursor:not-allowed;
    }

    .actions{
      margin-top:10px;
    }

    .submit-btn{
      width:100%;
      border:none;
      outline:none;
      cursor:pointer;
      border-radius:22px;
      min-height:66px;
      font-size:22px;
      font-weight:800;
      color:#ffffff;
      background:linear-gradient(180deg, #3873f3 0%, #2d64df 100%);
      box-shadow:0 14px 30px rgba(45,100,223,0.35);
      transition:transform 0.15s ease, opacity 0.15s ease, filter 0.15s ease;
    }

    .submit-btn:hover{
      filter:brightness(1.03);
    }

    .submit-btn:active{
      transform:scale(0.995);
    }

    .submit-btn:disabled{
      cursor:not-allowed;
      opacity:0.75;
    }

    .secondary-link{
      text-align:center;
      margin-top:18px;
    }

    .secondary-link a{
      color:var(--primary);
      text-decoration:none;
      font-size:17px;
      font-weight:700;
    }

    .secondary-link a:hover{
      text-decoration:underline;
    }

    .helper{
      margin-top:22px;
      text-align:center;
      color:var(--muted);
      font-size:14px;
      line-height:1.9;
    }

    .loader{
      display:inline-block;
      width:18px;
      height:18px;
      border:2px solid rgba(255,255,255,0.35);
      border-top-color:#fff;
      border-radius:50%;
      animation:spin 0.8s linear infinite;
      vertical-align:middle;
      margin-inline-start:8px;
    }

    @keyframes spin{
      to{ transform:rotate(360deg); }
    }

    @media (max-width:600px){
      body{
        padding:14px;
      }

      .login-card{
        padding:26px 18px;
        border-radius:24px;
      }

      .brand h1{
        font-size:34px;
      }

      .brand p{
        font-size:16px;
      }

      .input{
        font-size:18px;
        min-height:58px;
      }

      .submit-btn{
        font-size:20px;
        min-height:62px;
      }
    }
  </style>
</head>
<body>
  <main class="page">
    <section class="login-card">
      <div class="brand">
        <h1>Madaris AI</h1>
        <p>تسجيل الدخول إلى المنصة</p>
      </div>

      <div id="statusBox" class="status-box"></div>

      <form id="loginForm" novalidate>
        <div class="field">
          <label for="email">البريد الإلكتروني</label>
          <div class="input-wrap">
            <input
              id="email"
              name="email"
              class="input"
              type="email"
              inputmode="email"
              autocomplete="username"
              placeholder="البريد الإلكتروني"
              required
            />
          </div>
        </div>

        <div class="field">
          <label for="password">كلمة المرور</label>
          <div class="input-wrap">
            <input
              id="password"
              name="password"
              class="input"
              type="password"
              autocomplete="current-password"
              placeholder="كلمة المرور"
              required
            />
            <button type="button" id="togglePassword" class="password-toggle">إظهار</button>
          </div>
        </div>

        <div class="actions">
          <button id="loginButton" type="submit" class="submit-btn">تسجيل الدخول</button>
        </div>
      </form>

      <div class="secondary-link">
        <a href="/app/register.html">إنشاء حساب جديد</a>
      </div>

      <div class="helper">
        بعد تسجيل الدخول الصحيح سيتم حفظ الجلسة والانتقال تلقائيًا إلى لوحة المستخدم المناسبة.
      </div>
    </section>
  </main>

  <script type="module">
    import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
    import {
      getAuth,
      setPersistence,
      browserLocalPersistence,
      signInWithEmailAndPassword,
      onAuthStateChanged
    } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";
    import {
      getFirestore,
      doc,
      getDoc,
      collection,
      query,
      where,
      getDocs,
      limit
    } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

    const firebaseConfig = {
      apiKey: "AIzaSyAzQKhPMSZNevhb6L1Nh9pt9yA4Au9G7Cw",
      authDomain: "madaris-ai.firebaseapp.com",
      projectId: "madaris-ai",
      storageBucket: "madaris-ai.firebasestorage.app",
      messagingSenderId: "915394447224",
      appId: "1:915394447224:web:3d7750a7fcd3f41bedaa8d",
      measurementId: "G-SC7VE6F20S"
    };

    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);

    const loginForm = document.getElementById("loginForm");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const loginButton = document.getElementById("loginButton");
    const togglePassword = document.getElementById("togglePassword");
    const statusBox = document.getElementById("statusBox");

    let authInitialized = false;

    function showStatus(message, type = "info") {
      statusBox.textContent = message;
      statusBox.className = `status-box show ${type}`;
    }

    function hideStatus() {
      statusBox.textContent = "";
      statusBox.className = "status-box";
    }

    function setLoading(isLoading, buttonText = "تسجيل الدخول") {
      loginButton.disabled = isLoading;
      emailInput.disabled = isLoading;
      passwordInput.disabled = isLoading;
      togglePassword.disabled = isLoading;

      if (isLoading) {
        loginButton.innerHTML = `جارٍ تسجيل الدخول <span class="loader"></span>`;
      } else {
        loginButton.textContent = buttonText;
      }
    }

    function normalizeEmail(value) {
      return String(value || "").trim().toLowerCase();
    }

    function getRoleRoute(role) {
      const safeRole = String(role || "").trim().toLowerCase();

      if (safeRole === "school") return "/app/school/dashboard.html";
      if (safeRole === "admin") return "/app/admin/dashboard.html";
      if (safeRole === "teacher") return "/app/teacher/dashboard.html";
      if (safeRole === "student") return "/app/student/dashboard.html";

      return "/app/dashboard.html";
    }

    async function findUserProfile(uid, email) {
      const normalizedEmail = normalizeEmail(email);

      try {
        const directDoc = await getDoc(doc(db, "users", uid));
        if (directDoc.exists()) {
          return {
            id: directDoc.id,
            ...directDoc.data()
          };
        }
      } catch (error) {
        console.warn("Direct user lookup failed:", error);
      }

      try {
        if (normalizedEmail) {
          const q = query(
            collection(db, "users"),
            where("email", "==", normalizedEmail),
            limit(1)
          );
          const snap = await getDocs(q);
          if (!snap.empty) {
            const userDoc = snap.docs[0];
            return {
              id: userDoc.id,
              ...userDoc.data()
            };
          }
        }
      } catch (error) {
        console.warn("Email user lookup failed:", error);
      }

      return null;
    }

    function saveSession(user, profile) {
      const sessionPayload = {
        uid: user.uid || "",
        email: normalizeEmail(user.email || ""),
        role: profile?.role || "",
        schoolId: profile?.schoolId || "",
        name: profile?.name || user.displayName || "",
        isAI: !!profile?.isAI,
        teacherType: profile?.teacherType || "",
        savedAt: Date.now()
      };

      localStorage.setItem("madaris_user_session", JSON.stringify(sessionPayload));
        }
async function redirectAuthenticatedUser(user) {
      try {
        const profile = await findUserProfile(user.uid, user.email || "");
        saveSession(user, profile);

        const role = profile?.role || "";
        const destination = getRoleRoute(role);

        showStatus("تم تسجيل الدخول بنجاح. جارٍ تحويلك الآن...", "success");

        setTimeout(() => {
          window.location.href = destination;
        }, 500);
      } catch (error) {
        console.error("Redirect error:", error);
        showStatus("تم تسجيل الدخول، لكن حدث خطأ أثناء تجهيز الجلسة. حاول مرة أخرى.", "error");
        setLoading(false);
      }
    }

    togglePassword.addEventListener("click", () => {
      const isPassword = passwordInput.type === "password";
      passwordInput.type = isPassword ? "text" : "password";
      togglePassword.textContent = isPassword ? "إخفاء" : "إظهار";
    });

    onAuthStateChanged(auth, async (user) => {
      if (!authInitialized) {
        authInitialized = true;

        if (user) {
          setLoading(true, "تسجيل الدخول");
          await redirectAuthenticatedUser(user);
          return;
        }
      }
    });

    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      hideStatus();

      const email = normalizeEmail(emailInput.value);
      const password = String(passwordInput.value || "");

      if (!email) {
        showStatus("اكتب البريد الإلكتروني أولًا.", "error");
        emailInput.focus();
        return;
      }

      if (!password) {
        showStatus("اكتب كلمة المرور أولًا.", "error");
        passwordInput.focus();
        return;
      }

      try {
        setLoading(true);

        await setPersistence(auth, browserLocalPersistence);

        const credential = await signInWithEmailAndPassword(auth, email, password);
        const user = credential.user;

        await redirectAuthenticatedUser(user);
      } catch (error) {
        console.error("Login error:", error);

        let message = "فشل تسجيل الدخول. تأكد من البريد الإلكتروني وكلمة المرور.";

        if (error?.code === "auth/invalid-email") {
          message = "صيغة البريد الإلكتروني غير صحيحة.";
        } else if (
          error?.code === "auth/invalid-credential" ||
          error?.code === "auth/user-not-found" ||
          error?.code === "auth/wrong-password"
        ) {
          message = "البريد الإلكتروني أو كلمة المرور غير صحيحة.";
        } else if (error?.code === "auth/too-many-requests") {
          message = "تمت محاولات كثيرة. انتظر قليلًا ثم حاول مرة أخرى.";
        } else if (error?.code === "auth/network-request-failed") {
          message = "يوجد خلل في الشبكة. تأكد من الاتصال بالإنترنت ثم أعد المحاولة.";
        }

        showStatus(message, "error");
        setLoading(false);
      }
    });
  </script>
</body>
</html>
