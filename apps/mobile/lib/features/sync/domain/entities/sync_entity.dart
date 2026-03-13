import '../value_objects/sync_status.dart';

class SyncEntity {
  final SyncStatus status;
  final DateTime? lastSyncedAt;
  final int pendingItems;

  const SyncEntity({
    required this.status,
    required this.lastSyncedAt,
    required this.pendingItems,
  });
}
