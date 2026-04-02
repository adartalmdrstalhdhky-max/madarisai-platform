import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../data/repositories/timetable_repository_impl.dart';
import '../../data/services/timetable_firestore_service.dart';
import '../controllers/timetable_controller.dart';
import '../widgets/day_selector.dart';
import '../widgets/timetable_table.dart';

class ClassTimetableScreen extends StatelessWidget {
  final String classId;
  final String className;

  const ClassTimetableScreen({
    super.key,
    required this.classId,
    required this.className,
  });

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider<TimetableController>(
      create: (_) {
        final service = TimetableFirestoreService(
          firestore: FirebaseFirestore.instance,
        );

        final repository = TimetableRepositoryImpl(
          service: service,
        );

        final controller = TimetableController(
          repository: repository,
          classId: classId,
        );

        controller.initialize(initialDay: 'saturday');
        return controller;
      },
      child: _ClassTimetableView(
        className: className,
      ),
    );
  }
}

class _ClassTimetableView extends StatelessWidget {
  final String className;

  const _ClassTimetableView({
    required this.className,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Consumer<TimetableController>(
      builder: (context, controller, _) {
        return Scaffold(
          appBar: AppBar(
            title: const Text('جدول الصف'),
            centerTitle: true,
          ),
          body: SafeArea(
            child: RefreshIndicator(
              onRefresh: controller.refresh,
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: <Widget>[
                  _HeaderCard(
                    className: className,
                    selectedDayLabel: controller.selectedDayLabel,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'اختر اليوم',
                    style: theme.textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  const SizedBox(height: 12),
                  DaySelector(
                    selectedDay: controller.selectedDay,
                    onDaySelected: controller.changeDay,
                  ),
                  const SizedBox(height: 20),
                  _buildBodyByState(
                    context: context,
                    controller: controller,
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildBodyByState({
    required BuildContext context,
    required TimetableController controller,
  }) {
    switch (controller.state) {
      case TimetableViewState.initial:
      case TimetableViewState.loading:
        return const _LoadingSection();

      case TimetableViewState.loaded:
        return TimetableTable(items: controller.items);

      case TimetableViewState.empty:
        return TimetableTable(items: controller.items);

      case TimetableViewState.error:
        return _ErrorSection(
          message: controller.errorMessage,
          onRetry: controller.loadSchedule,
        );
    }
  }
}

class _HeaderCard extends StatelessWidget {
  final String className;
  final String selectedDayLabel;

  const _HeaderCard({
    required this.className,
    required this.selectedDayLabel,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Card(
      elevation: 0,
      child: Padding(
        padding: const EdgeInsets.all(18),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            Text(
              className,
              style: theme.textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.w900,
              ),
            ),
            const SizedBox(height: 10),
            Text(
              'اليوم الحالي: $selectedDayLabel',
              style: theme.textTheme.bodyLarge?.copyWith(
                fontWeight: FontWeight.w600,
                color: theme.colorScheme.onSurfaceVariant,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'اسحب للأسفل للتحديث أو اختر يومًا آخر لعرض الحصص.',
              style: theme.textTheme.bodyMedium?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _LoadingSection extends StatelessWidget {
  const _LoadingSection();

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 0,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 28),
        child: Column(
          children: const <Widget>[
            SizedBox(
              width: 28,
              height: 28,
              child: CircularProgressIndicator(strokeWidth: 3),
            ),
            SizedBox(height: 16),
            Text('جاري تحميل الجدول...'),
          ],
        ),
      ),
    );
  }
}

class _ErrorSection extends StatelessWidget {
  final String message;
  final Future<void> Function() onRetry;

  const _ErrorSection({
    required this.message,
    required this.onRetry,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Card(
      elevation: 0,
      child: Padding(
        padding: const EdgeInsets.all(18),
        child: Column(
          children: <Widget>[
            Icon(
              Icons.error_outline_rounded,
              size: 42,
              color: theme.colorScheme.error,
            ),
            const SizedBox(height: 14),
            Text(
              message,
              textAlign: TextAlign.center,
              style: theme.textTheme.bodyLarge?.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 16),
            FilledButton.icon(
              onPressed: onRetry,
              icon: const Icon(Icons.refresh_rounded),
              label: const Text('إعادة المحاولة'),
            ),
          ],
        ),
      ),
    );
  }
}
