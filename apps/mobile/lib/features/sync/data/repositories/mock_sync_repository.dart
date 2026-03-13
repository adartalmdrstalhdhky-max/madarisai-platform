import '../../domain/entities/sync_entity.dart';
import '../../domain/repositories/sync_repository.dart';
import '../../domain/value_objects/sync_status.dart';

class MockSyncRepository implements SyncRepository {
  @override
  Future<SyncEntity> getStatus() async {
    return SyncEntity(
      status: SyncStatus.idle,
      lastSyncedAt: DateTime.now(),
      pendingItems: 0,
    );
  }
}
