class ScheduleItem {
  final String id;
  final String classId;
  final String day;
  final int period;
  final String subjectId;
  final String subjectName;
  final String teacherId;
  final String teacherName;
  final String status;

  const ScheduleItem({
    required this.id,
    required this.classId,
    required this.day,
    required this.period,
    required this.subjectId,
    required this.subjectName,
    required this.teacherId,
    required this.teacherName,
    required this.status,
  });

  factory ScheduleItem.fromMap({
    required String id,
    required Map<String, dynamic> map,
    required String subjectName,
    required String teacherName,
  }) {
    return ScheduleItem(
      id: id,
      classId: (map['classId'] ?? '') as String,
      day: (map['day'] ?? '') as String,
      period: (map['period'] ?? 0) as int,
      subjectId: (map['subjectId'] ?? '') as String,
      subjectName: subjectName,
      teacherId: (map['teacherId'] ?? '') as String,
      teacherName: teacherName,
      status: (map['status'] ?? '') as String,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'classId': classId,
      'day': day,
      'period': period,
      'subjectId': subjectId,
      'teacherId': teacherId,
      'status': status,
    };
  }

  ScheduleItem copyWith({
    String? id,
    String? classId,
    String? day,
    int? period,
    String? subjectId,
    String? subjectName,
    String? teacherId,
    String? teacherName,
    String? status,
  }) {
    return ScheduleItem(
      id: id ?? this.id,
      classId: classId ?? this.classId,
      day: day ?? this.day,
      period: period ?? this.period,
      subjectId: subjectId ?? this.subjectId,
      subjectName: subjectName ?? this.subjectName,
      teacherId: teacherId ?? this.teacherId,
      teacherName: teacherName ?? this.teacherName,
      status: status ?? this.status,
    );
  }
}
