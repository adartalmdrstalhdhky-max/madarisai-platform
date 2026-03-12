class School {
  final String id;
  final String name;
  final String address;

  School({
    required this.id,
    required this.name,
    required this.address,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
      'address': address,
    };
  }

  factory School.fromMap(Map<String, dynamic> map) {
    return School(
      id: map['id'] ?? '',
      name: map['name'] ?? '',
      address: map['address'] ?? '',
    );
  }
}
