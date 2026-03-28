import { 
getAuth, 
signInWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js"

import { 
getFirestore, 
doc, 
getDoc 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"

const auth = getAuth()
const db = getFirestore()

window.login = async function(){

const email = document.getElementById("email").value
const password = document.getElementById("password").value

try{

const userCredential = await signInWithEmailAndPassword(
auth,
email,
password
)

const user = userCredential.user

const docRef = doc(db,"users",user.uid)
const docSnap = await getDoc(docRef)

if(docSnap.exists()){

const data = docSnap.data()

localStorage.setItem("madaris_logged_in","true")
localStorage.setItem("madaris_role",data.role)
localStorage.setItem("schoolId",data.schoolId)

if(data.role==="school"){
window.location.href="../school/dashboard.html"
}

if(data.role==="admin"){
window.location.href="../admin/dashboard.html"
}

if(data.role==="student"){
window.location.href="../student/dashboard.html"
}

}

}catch(error){

alert(error.message)

}

}
