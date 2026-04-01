import '../models/schedule_item_model.dart';

abstract class TimetableRepository {
  Future<List<ScheduleItem>> getClassSchedule({
    required String classId,
    required String day,
  });
}
