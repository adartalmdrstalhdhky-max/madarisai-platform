import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:uuid/uuid.dart';
import '../models/school_model.dart';

class SchoolService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final String collectionName = 'schools';

  Future<void> addSchool(String name, String address) async {
    String id = const Uuid().v4();
    School school = School(id: id, name: name, address: address);
    await _firestore.collection(collectionName).doc(id).set(school.toMap());
  }

  Stream<List<School>> getSchools() {
    return _firestore.collection(collectionName).snapshots().map(
        (snapshot) => snapshot.docs
            .map((doc) => School.fromMap(doc.data()))
            .toList());
  }
}
