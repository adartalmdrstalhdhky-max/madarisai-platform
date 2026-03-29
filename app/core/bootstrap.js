// Madaris AI - Bootstrap Engine
// Professional Initialization System

import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where,
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { app } from "../../firebase-config.js";

const db = getFirestore(app);

async function bootstrapSystem() {

  console.log("Madaris AI Bootstrap Starting...");

  try {

    // =========================
    // Check School
    // =========================

    const schoolQuery = query(
      collection(db, "schools"),
      where("name", "==", "مدارس AI النموذجية")
    );

    const schoolSnapshot = await getDocs(schoolQuery);

    let schoolId;

    if (schoolSnapshot.empty) {

      const schoolRef = await addDoc(collection(db, "schools"), {
        name: "مدارس AI النموذجية",
        type: "primary",
        country: "Yemen",
        status: "active",
        createdAt: serverTimestamp()
      });

      schoolId = schoolRef.id;

      console.log("School Created:", schoolId);

    } else {

      schoolId = schoolSnapshot.docs[0].id;
      console.log("School Exists:", schoolId);

    }

    // =========================
    // Create Subject
    // =========================

    const subjectQuery = query(
      collection(db, "subjects"),
      where("name", "==", "رياضيات")
    );

    const subjectSnapshot = await getDocs(subjectQuery);

    let subjectId;

    if (subjectSnapshot.empty) {

      const subjectRef = await addDoc(collection(db, "subjects"), {
        name: "رياضيات",
        code: "MATH",
        schoolId: schoolId,
        status: "active",
        createdAt: serverTimestamp()
      });

      subjectId = subjectRef.id;

      console.log("Subject Created:", subjectId);

    } else {

      subjectId = subjectSnapshot.docs[0].id;

    }

    // =========================
    // Create Class
    // =========================

    const classQuery = query(
      collection(db, "classes"),
      where("name", "==", "الصف الأول")
    );

    const classSnapshot = await getDocs(classQuery);

    let classId;

    if (classSnapshot.empty) {

      const classRef = await addDoc(collection(db, "classes"), {
        name: "الصف الأول",
        grade: 1,
        schoolId: schoolId,
        status: "active",
        createdAt: serverTimestamp()
      });

      classId = classRef.id;

      console.log("Class Created:", classId);

    } else {

      classId = classSnapshot.docs[0].id;

    }

    // =========================
    // Create Human Teacher
    // =========================

    const humanQuery = query(
      collection(db, "teachers"),
      where("teacherType", "==", "human")
    );

    const humanSnapshot = await getDocs(humanQuery);

    let humanTeacherId;

    if (humanSnapshot.empty) {

      const humanRef = await addDoc(collection(db, "teachers"), {
        name: "أستاذ الرياضيات",
        role: "teacher",
        teacherType: "human",
        isAI: false,
        email: "teacher@madarisai.com",
        phone: "777000000",
        schoolId: schoolId,
        subjectId: subjectId,
        classId: classId,
        status: "active",
        createdAt: serverTimestamp()
      });

      humanTeacherId = humanRef.id;

      console.log("Human Teacher Created:", humanTeacherId);

    } else {

      humanTeacherId = humanSnapshot.docs[0].id;

    }
// =========================
    // Create AI Teacher
    // =========================

    const aiQuery = query(
      collection(db, "teachers"),
      where("teacherType", "==", "ai")
    );

    const aiSnapshot = await getDocs(aiQuery);

    let aiTeacherId;

    if (aiSnapshot.empty) {

      const aiRef = await addDoc(collection(db, "teachers"), {
        name: "المعلم الذكي - رياضيات",
        role: "teacher",
        teacherType: "ai",
        isAI: true,
        aiModel: "madaris-ai-v1",
        title: "معلم ذكي",
        email: "ai@madarisai.com",
        phone: "000000000",
        schoolId: schoolId,
        subjectId: subjectId,
        classId: classId,
        status: "active",
        createdAt: serverTimestamp()
      });

      aiTeacherId = aiRef.id;

      console.log("AI Teacher Created:", aiTeacherId);

    } else {

      aiTeacherId = aiSnapshot.docs[0].id;

    }

    // =========================
    // Create Student 1
    // =========================

    const studentQuery1 = query(
      collection(db, "students"),
      where("studentId", "==", "STD001")
    );

    const studentSnapshot1 = await getDocs(studentQuery1);

    if (studentSnapshot1.empty) {
      await addDoc(collection(db, "students"), {
        studentId: "STD001",
        studentNumber: "STU-001",
        name: "محمد أحمد",
        gender: "male",
        age: 17,
        phone: "777000111",
        parentPhone: "777000222",
        schoolId: schoolId,
        classId: classId,
        className: "الصف الأول",
        status: "active",
        createdAt: serverTimestamp()
      });

      console.log("Student 1 Created");
    }

    // =========================
    // Create Student 2
    // =========================

    const studentQuery2 = query(
      collection(db, "students"),
      where("studentId", "==", "STD002")
    );

    const studentSnapshot2 = await getDocs(studentQuery2);

    if (studentSnapshot2.empty) {
      await addDoc(collection(db, "students"), {
        studentId: "STD002",
        studentNumber: "STU-002",
        name: "علي محمد",
        gender: "male",
        age: 16,
        phone: "777111333",
        parentPhone: "777999000",
        schoolId: schoolId,
        classId: classId,
        className: "الصف الأول",
        status: "active",
        createdAt: serverTimestamp()
      });

      console.log("Student 2 Created");
    }

    // =========================
    // Create Schedule Row
    // =========================

    const scheduleQuery = query(
      collection(db, "schedules"),
      where("schoolId", "==", schoolId),
      where("subjectName", "==", "رياضيات"),
      where("day", "==", "Sunday"),
      where("period", "==", 1)
    );

    const scheduleSnapshot = await getDocs(scheduleQuery);

    if (scheduleSnapshot.empty) {
      await addDoc(collection(db, "schedules"), {
        schoolId: schoolId,
        classId: classId,
        subjectId: subjectId,
        subjectName: "رياضيات",
        teacherId: humanTeacherId,
        day: "Sunday",
        period: 1,
        startTime: "08:00",
        endTime: "08:45",
        status: "active",
        createdAt: serverTimestamp()
      });

      console.log("Schedule Created");
    }

    console.log("Madaris AI Bootstrap Finished Successfully");

    alert("تم إنشاء النظام التجريبي بنجاح");

  } catch (error) {
    console.error("Bootstrap Error:", error);
    alert("حدث خطأ: " + error.message);
  }
}

window.bootstrapSystem = bootstrapSystem;
bootstrapSystem();
