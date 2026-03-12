class School {
  String schoolId;
  String name;
  String address;

  School({
    required this.schoolId,
    required this.name,
    required this.address,
  });

  Map<String, dynamic> toMap() {
    return {
      'schoolId': schoolId,
      'name': name,
      'address': address,
    };
  }

  factory School.fromMap(Map<String, dynamic> map) {
    return School(
      schoolId: map['schoolId'] ?? '',
      name: map['name'] ?? '',
      address: map['address'] ?? '',
    );
  }
}
