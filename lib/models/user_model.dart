class UserModel {
  final String id;
  final String name;
  final String role;
  final String schoolId;

  UserModel({
    required this.id,
    required this.name,
    required this.role,
    required this.schoolId,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
      'role': role,
      'schoolId': schoolId,
    };
  }

  factory UserModel.fromMap(Map<String, dynamic> map) {
    return UserModel(
      id: map['id'] ?? '',
      name: map['name'] ?? '',
      role: map['role'] ?? '',
      schoolId: map['schoolId'] ?? '',
    );
  }
}
