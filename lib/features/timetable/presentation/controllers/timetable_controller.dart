import 'package:flutter/foundation.dart';

import '../../data/models/schedule_item_model.dart';
import '../../data/repositories/timetable_repository.dart';

enum TimetableViewState {
  initial,
  loading,
  loaded,
  empty,
  error,
}

class TimetableController extends ChangeNotifier {
  final TimetableRepository repository;
  final String classId;

  TimetableController({
    required this.repository,
    required this.classId,
  });

  static const List<String> supportedDays = <String>[
    'saturday',
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
  ];

  TimetableViewState _state = TimetableViewState.initial;
  List<ScheduleItem> _items = <ScheduleItem>[];
  String _selectedDay = 'saturday';
  String _errorMessage = '';
  bool _isRefreshing = false;

  TimetableViewState get state => _state;
  List<ScheduleItem> get items => List<ScheduleItem>.unmodifiable(_items);
  String get selectedDay => _selectedDay;
  String get errorMessage => _errorMessage;
  bool get isRefreshing => _isRefreshing;

  String get selectedDayLabel => arabicDayLabel(_selectedDay);

  Future<void> initialize({
    String initialDay = 'saturday',
  }) async {
    _selectedDay = _normalizeDay(initialDay);
    await loadSchedule();
  }

  Future<void> loadSchedule() async {
    _setState(TimetableViewState.loading);
    _errorMessage = '';

    try {
      final result = await repository.getClassSchedule(
        classId: classId,
        day: _selectedDay,
      );

      _items = result;

      if (_items.isEmpty) {
        _setState(TimetableViewState.empty);
      } else {
        _setState(TimetableViewState.loaded);
      }
    } catch (e) {
      _items = <ScheduleItem>[];
      _errorMessage = _friendlyErrorMessage(e);
      _setState(TimetableViewState.error);
    }
  }

  Future<void> refresh() async {
    _isRefreshing = true;
    notifyListeners();

    try {
      final result = await repository.getClassSchedule(
        classId: classId,
        day: _selectedDay,
      );

      _items = result;
      _errorMessage = '';

      if (_items.isEmpty) {
        _state = TimetableViewState.empty;
      } else {
        _state = TimetableViewState.loaded;
      }
    } catch (e) {
      _items = <ScheduleItem>[];
      _errorMessage = _friendlyErrorMessage(e);
      _state = TimetableViewState.error;
    } finally {
      _isRefreshing = false;
      notifyListeners();
    }
  }

  Future<void> changeDay(String day) async {
    final normalizedDay = _normalizeDay(day);

    if (normalizedDay == _selectedDay) {
      return;
    }

    _selectedDay = normalizedDay;
    notifyListeners();

    await loadSchedule();
  }

  bool isSelectedDay(String day) {
    return _normalizeDay(day) == _selectedDay;
  }

  String arabicDayLabel(String day) {
    switch (_normalizeDay(day)) {
      case 'saturday':
        return 'السبت';
      case 'sunday':
        return 'الأحد';
      case 'monday':
        return 'الاثنين';
      case 'tuesday':
        return 'الثلاثاء';
      case 'wednesday':
        return 'الأربعاء';
      case 'thursday':
        return 'الخميس';
      default:
        return 'غير معروف';
    }
  }

  String periodLabel(int period) {
    if (period <= 0) {
      return '-';
    }
    return 'الحصة $period';
  }

  void _setState(TimetableViewState newState) {
    _state = newState;
    notifyListeners();
  }

  String _normalizeDay(String day) {
    final value = day.trim().toLowerCase();

    switch (value) {
      case 'السبت':
      case 'saturday':
        return 'saturday';

      case 'الأحد':
      case 'الاحد':
      case 'sunday':
        return 'sunday';

      case 'الاثنين':
      case 'الإثنين':
      case 'monday':
        return 'monday';

      case 'الثلاثاء':
      case 'tuesday':
        return 'tuesday';

      case 'الأربعاء':
      case 'الاربعاء':
      case 'wednesday':
        return 'wednesday';

      case 'الخميس':
      case 'thursday':
        return 'thursday';

      default:
        return 'saturday';
    }
  }

  String _friendlyErrorMessage(Object error) {
    final raw = error.toString().toLowerCase();

    if (raw.contains('permission-denied')) {
      return 'ليس لديك صلاحية لقراءة الجدول.';
    }

    if (raw.contains('unavailable')) {
      return 'الخدمة غير متاحة الآن. حاول مرة أخرى.';
    }

    if (raw.contains('network')) {
      return 'حدثت مشكلة في الاتصال بالشبكة.';
    }

    return 'حدث خطأ أثناء تحميل الجدول.';
    }
}
