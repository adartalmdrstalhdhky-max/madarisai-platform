import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/school_model.dart';

class SchoolService {
  final CollectionReference schoolsCollection =
      FirebaseFirestore.instance.collection('schools');

  Future<void> addSchool(School school) async {
    await schoolsCollection.doc(school.schoolId).set(school.toMap());
  }

  Future<List<School>> getSchools() async {
    QuerySnapshot snapshot = await schoolsCollection.get();
    return snapshot.docs
        .map((doc) => School.fromMap(doc.data() as Map<String, dynamic>))
        .toList();
  }
}
