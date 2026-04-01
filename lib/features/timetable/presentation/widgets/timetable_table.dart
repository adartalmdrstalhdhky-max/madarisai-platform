import 'package:flutter/material.dart';

import '../../data/models/schedule_item_model.dart';

class TimetableTable extends StatelessWidget {
  final List<ScheduleItem> items;

  const TimetableTable({
    super.key,
    required this.items,
  });

  @override
  Widget build(BuildContext context) {
    if (items.isEmpty) {
      return const _EmptyTimetableState();
    }

    return LayoutBuilder(
      builder: (context, constraints) {
        final isCompact = constraints.maxWidth < 700;

        if (isCompact) {
          return _MobileTimetableList(items: items);
        }

        return _DesktopTimetableTable(items: items);
      },
    );
  }
}

class _DesktopTimetableTable extends StatelessWidget {
  final List<ScheduleItem> items;

  const _DesktopTimetableTable({
    required this.items,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Card(
      elevation: 0,
      clipBehavior: Clip.antiAlias,
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: DataTable(
          headingRowHeight: 56,
          dataRowMinHeight: 64,
          dataRowMaxHeight: 72,
          columnSpacing: 32,
          headingTextStyle: theme.textTheme.titleSmall?.copyWith(
            fontWeight: FontWeight.w800,
          ),
          columns: const <DataColumn>[
            DataColumn(label: Text('الحصة')),
            DataColumn(label: Text('المادة')),
            DataColumn(label: Text('المعلم')),
            DataColumn(label: Text('الحالة')),
          ],
          rows: items.map((item) {
            return DataRow(
              cells: <DataCell>[
                DataCell(
                  Text(
                    'الحصة ${item.period}',
                    style: theme.textTheme.bodyMedium?.copyWith(
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
                DataCell(
                  Text(
                    item.subjectName,
                    style: theme.textTheme.bodyMedium,
                  ),
                ),
                DataCell(
                  Text(
                    item.teacherName,
                    style: theme.textTheme.bodyMedium,
                  ),
                ),
                DataCell(
                  _StatusBadge(status: item.status),
                ),
              ],
            );
          }).toList(),
        ),
      ),
    );
  }
}

class _MobileTimetableList extends StatelessWidget {
  final List<ScheduleItem> items;

  const _MobileTimetableList({
    required this.items,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: items
          .map((item) => Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: _MobileScheduleCard(item: item),
              ))
          .toList(),
    );
  }
}

class _MobileScheduleCard extends StatelessWidget {
  final ScheduleItem item;

  const _MobileScheduleCard({
    required this.item,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Card(
      elevation: 0,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            Row(
              children: <Widget>[
                Expanded(
                  child: Text(
                    'الحصة ${item.period}',
                    style: theme.textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ),
                _StatusBadge(status: item.status),
              ],
            ),
            const SizedBox(height: 12),
            _InfoRow(
              label: 'المادة',
              value: item.subjectName,
            ),
            const SizedBox(height: 8),
            _InfoRow(
              label: 'المعلم',
              value: item.teacherName,
            ),
          ],
        ),
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final String label;
  final String value;

  const _InfoRow({
    required this.label,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        Text(
          '$label: ',
          style: theme.textTheme.bodyMedium?.copyWith(
            fontWeight: FontWeight.w700,
          ),
        ),
        Expanded(
          child: Text(
            value,
            style: theme.textTheme.bodyMedium,
          ),
        ),
      ],
    );
  }
}

class _StatusBadge extends StatelessWidget {
  final String status;

  const _StatusBadge({
    required this.status,
  });

  @override
  Widget build(BuildContext context) {
    final normalized = status.trim().toLowerCase();
    final theme = Theme.of(context);

    final isActive = normalized == 'active';

    final label = isActive ? 'نشط' : status;
    final backgroundColor = isActive
        ? Colors.green.withValues(alpha: 0.12)
        : theme.colorScheme.surfaceContainerHighest;
    final foregroundColor = isActive
        ? Colors.green.shade700
        : theme.colorScheme.onSurfaceVariant;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        label,
        style: theme.textTheme.labelMedium?.copyWith(
          fontWeight: FontWeight.w800,
          color: foregroundColor,
        ),
      ),
    );
  }
}

class _EmptyTimetableState extends StatelessWidget {
  const _EmptyTimetableState();

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Card(
      elevation: 0,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 28),
        child: Center(
          child: Text(
            'لا توجد حصص مجدولة لهذا اليوم.',
            textAlign: TextAlign.center,
            style: theme.textTheme.bodyLarge?.copyWith(
              fontWeight: FontWeight.w600,
              color: theme.colorScheme.onSurfaceVariant,
            ),
          ),
        ),
      ),
    );
  }
}
