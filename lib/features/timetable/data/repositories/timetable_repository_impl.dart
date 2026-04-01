import '../models/schedule_item_model.dart';
import '../services/timetable_firestore_service.dart';
import 'timetable_repository.dart';

class TimetableRepositoryImpl implements TimetableRepository {
  final TimetableFirestoreService service;

  const TimetableRepositoryImpl({
    required this.service,
  });

  @override
  Future<List<ScheduleItem>> getClassSchedule({
    required String classId,
    required String day,
  }) async {
    final normalizedClassId = classId.trim();
    final normalizedDay = day.trim();

    if (normalizedClassId.isEmpty) {
      throw ArgumentError('classId cannot be empty');
    }

    if (normalizedDay.isEmpty) {
      throw ArgumentError('day cannot be empty');
    }

    final items = await service.fetchClassSchedule(
      classId: normalizedClassId,
      day: normalizedDay,
    );

    return items;
  }
}
