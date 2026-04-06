import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
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
  apiKey: "AIzaSyAzQKhPMSZNevhb6LlNh9pt9yA4Au9G7Cw",
  authDomain: "madaris-ai.firebaseapp.com",
  projectId: "madaris-ai",
  storageBucket: "madaris-ai.firebasestorage.app",
  messagingSenderId: "915394447224",
  appId: "1:915394447224:web:3d7750a7fcd3f41bedaa8d",
  measurementId: "G-SC7VE6F20S"
};


const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


const LOGIN_REDIRECT = "/app/school/index.html";


function normalize(value){
  if(!value) return "";
  return String(value).trim();
}


function setSession(session){

  const data = JSON.stringify(session);

  localStorage.setItem("schoolSession",data);
  sessionStorage.setItem("schoolSession",data);

  localStorage.setItem("schoolId",session.schoolId);
  sessionStorage.setItem("schoolId",session.schoolId);

  localStorage.setItem("schoolName",session.schoolName);
  sessionStorage.setItem("schoolName",session.schoolName);

  localStorage.setItem("userRole","school");
  sessionStorage.setItem("userRole","school");

}


async function findUser(uid,email){

  if(uid){
    const ref = doc(db,"users",uid);
    const snap = await getDoc(ref);

    if(snap.exists()){
      return {id:snap.id,...snap.data()};
    }
  }

  if(email){
    const q = query(
      collection(db,"users"),
      where("email","==",email),
      limit(1)
    );

    const res = await getDocs(q);

    if(!res.empty){
      const d = res.docs[0];
      return {id:d.id,...d.data()};
    }
  }

  return null;

}


async function findSchool(user,email,uid){

  const possible = [
    user?.schoolId,
    user?.schoolID,
    user?.school_id
  ];

  for(const id of possible){

    if(!id) continue;

    const ref = doc(db,"schools",id);
    const snap = await getDoc(ref);

    if(snap.exists()){
      return {id:snap.id,...snap.data()};
    }

  }


  const checks = [
    ["managerEmail",email],
    ["email",email],
    ["ownerEmail",email],
    ["managerUid",uid],
    ["uid",uid]
  ];


  for(const [field,val] of checks){

    if(!val) continue;

    const q = query(
      collection(db,"schools"),
      where(field,"==",val),
      limit(1)
    );

    const res = await getDocs(q);

    if(!res.empty){
      const d = res.docs[0];
      return {id:d.id,...d.data()};
    }

  }


  const all = await getDocs(collection(db,"schools"));

  if(all.size===1){
    const d = all.docs[0];
    return {id:d.id,...d.data()};
  }

  return null;

}


async function login(email,password){

  const cred = await signInWithEmailAndPassword(auth,email,password);

  const user = cred.user;

  const uid = user.uid;
  const mail = normalize(user.email).toLowerCase();


  const userDoc = await findUser(uid,mail);

  if(!userDoc){
    throw new Error("لم يتم العثور على المستخدم");
  }


  const schoolDoc = await findSchool(userDoc,mail,uid);

  if(!schoolDoc){
    throw new Error("لم يتم العثور على المدرسة");
  }


  const session = {

    uid:uid,
    email:mail,

    userId:userDoc.id,
    userName:userDoc.name || "مستخدم المدرسة",

    role:"school",

    schoolId:schoolDoc.id,
    schoolName:schoolDoc.name || "مدرسة بدون اسم",
    schoolStatus:schoolDoc.status || "active",

    createdAt:Date.now()

  };

  setSession(session);

  return session;

}
function showMessage(msg,type="info"){

  let box = document.getElementById("loginMessage");

  if(!box){

    box = document.createElement("div");
    box.id="loginMessage";
    box.style.marginTop="20px";
    box.style.padding="14px";
    box.style.borderRadius="14px";
    box.style.fontSize="18px";

    const form = document.querySelector("form");
    form.parentNode.appendChild(box);

  }

  box.style.display="block";

  if(type==="error"){
    box.style.background="rgba(255,0,0,.15)";
  }
  else if(type==="success"){
    box.style.background="rgba(0,255,150,.15)";
  }
  else{
    box.style.background="rgba(0,120,255,.15)";
  }

  box.innerText=msg;

}



function redirect(){

  setTimeout(()=>{
    window.location.href=LOGIN_REDIRECT;
  },300);


  setTimeout(()=>{
    window.location.replace(LOGIN_REDIRECT);
  },900);


  setTimeout(()=>{
    window.location.assign(LOGIN_REDIRECT);
  },1500);

}



async function handleLogin(e){

  e.preventDefault();

  const email =
    document.querySelector("#email")?.value?.trim()?.toLowerCase();

  const password =
    document.querySelector("#password")?.value?.trim();


  if(!email){
    showMessage("ادخل البريد الالكتروني","error");
    return;
  }

  if(!password){
    showMessage("ادخل كلمة المرور","error");
    return;
  }


  try{

    showMessage("جار تسجيل الدخول ...");

    await setPersistence(auth,browserLocalPersistence);

    const session = await login(email,password);

    console.log("SESSION",session);

    showMessage("تم تسجيل الدخول بنجاح","success");

    redirect();


  }catch(err){

    console.error(err);

    let msg="فشل تسجيل الدخول";

    if(err.code==="auth/wrong-password"){
      msg="كلمة المرور غير صحيحة";
    }

    if(err.code==="auth/user-not-found"){
      msg="الحساب غير موجود";
    }

    if(err.code==="auth/invalid-email"){
      msg="البريد غير صحيح";
    }

    if(err.message){
      msg=err.message;
    }

    showMessage(msg,"error");

  }

}



function bind(){

  const form =
    document.querySelector("form");

  const btn =
    document.querySelector("button[type='submit']");


  if(form){
    form.addEventListener("submit",handleLogin);
  }

  if(btn && !form){
    btn.addEventListener("click",handleLogin);
  }

}



function autoLogin(){

  onAuthStateChanged(auth,async(user)=>{

    if(!user) return;

    const schoolId =
      localStorage.getItem("schoolId");

    if(schoolId){

      showMessage("جار فتح لوحة المدرسة ...");

      redirect();

      return;
    }


    try{

      const mail = user.email;

      const userDoc =
        await findUser(user.uid,mail);

      const schoolDoc =
        await findSchool(userDoc,mail,user.uid);

      const session = {

        uid:user.uid,
        email:mail,

        userId:userDoc?.id,
        userName:userDoc?.name,

        role:"school",

        schoolId:schoolDoc?.id,
        schoolName:schoolDoc?.name,

        createdAt:Date.now()

      };

      setSession(session);

      redirect();

    }catch(e){
      console.log(e);
    }

  });

}



document.addEventListener("DOMContentLoaded",()=>{

  bind();
  autoLogin();

});
