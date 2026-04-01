import 'package:cloud_firestore/cloud_firestore.dart';

import '../models/schedule_item_model.dart';

class TimetableFirestoreService {
  final FirebaseFirestore firestore;

  const TimetableFirestoreService({
    required this.firestore,
  });

  Future<List<ScheduleItem>> fetchClassSchedule({
    required String classId,
    required String day,
  }) async {
    final normalizedClassId = classId.trim();
    final normalizedDay = day.trim().toLowerCase();

    if (normalizedClassId.isEmpty) {
      throw ArgumentError('classId cannot be empty');
    }

    if (normalizedDay.isEmpty) {
      throw ArgumentError('day cannot be empty');
    }

    try {
      final schedulesQuery = await firestore
          .collection('schedules')
          .where('classId', isEqualTo: normalizedClassId)
          .where('day', isEqualTo: normalizedDay)
          .where('status', isEqualTo: 'active')
          .orderBy('period')
          .get();

      if (schedulesQuery.docs.isEmpty) {
        return <ScheduleItem>[];
      }

      final scheduleDocs = schedulesQuery.docs;

      final subjectIds = <String>{};
      final teacherIds = <String>{};

      for (final doc in scheduleDocs) {
        final data = doc.data();

        final subjectId = _readString(data['subjectId']);
        final teacherId = _readString(data['teacherId']);

        if (subjectId.isNotEmpty) {
          subjectIds.add(subjectId);
        }

        if (teacherId.isNotEmpty) {
          teacherIds.add(teacherId);
        }
      }

      final subjectsMap = await _fetchNamesMap(
        collectionName: 'subjects',
        ids: subjectIds,
        nameFieldCandidates: const ['name', 'title', 'subjectName'],
      );

      final teachersMap = await _fetchNamesMap(
        collectionName: 'teachers',
        ids: teacherIds,
        nameFieldCandidates: const ['name', 'teacherName', 'title'],
      );

      final items = <ScheduleItem>[];

      for (final doc in scheduleDocs) {
        final data = doc.data();

        final subjectId = _readString(data['subjectId']);
        final teacherId = _readString(data['teacherId']);

        final subjectName = subjectsMap[subjectId] ?? 'مادة غير معروفة';
        final teacherName = teachersMap[teacherId] ?? 'معلم غير معروف';

        final item = ScheduleItem.fromMap(
          id: doc.id,
          map: data,
          subjectName: subjectName,
          teacherName: teacherName,
        );

        items.add(item);
      }

      items.sort((a, b) {
        if (a.period != b.period) {
          return a.period.compareTo(b.period);
        }
        return a.subjectName.compareTo(b.subjectName);
      });

      return items;
    } on FirebaseException catch (e) {
      throw Exception('Firestore error while loading class schedule: ${e.message}');
    } catch (e) {
      throw Exception('Unexpected error while loading class schedule: $e');
    }
  }

  Future<Map<String, String>> _fetchNamesMap({
    required String collectionName,
    required Set<String> ids,
    required List<String> nameFieldCandidates,
  }) async {
    if (ids.isEmpty) {
      return <String, String>{};
    }

    final result = <String, String>{};

    for (final id in ids) {
      try {
        final doc = await firestore.collection(collectionName).doc(id).get();

        if (!doc.exists) {
          continue;
        }

        final data = doc.data();
        if (data == null) {
          continue;
        }

        final resolvedName = _resolveNameFromCandidates(
          data: data,
          candidates: nameFieldCandidates,
        );

        result[id] = resolvedName;
      } catch (_) {
        // نتجاوز السجل المكسور ونكمل بقية البيانات
      }
    }

    return result;
  }

  String _resolveNameFromCandidates({
    required Map<String, dynamic> data,
    required List<String> candidates,
  }) {
    for (final field in candidates) {
      final value = _readString(data[field]);
      if (value.isNotEmpty) {
        return value;
      }
    }

    return 'غير معروف';
  }

  String _readString(dynamic value) {
    if (value == null) return '';
    return value.toString().trim();
  }
}
