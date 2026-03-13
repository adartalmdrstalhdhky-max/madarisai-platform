import '../models/sync_operation.dart';
import '../repository/sync_queue_repository.dart';

class GetQueuedSyncOperations {
  final SyncQueueRepository repository;

  GetQueuedSyncOperations(this.repository);

  Future<List<SyncOperation>> call({int limit = 100}) {
    return repository.getQueuedOperations(limit: limit);
  }
}
