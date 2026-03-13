import '../repository/sync_queue_repository.dart';

class MarkSyncOperationCompleted {
  final SyncQueueRepository repository;

  MarkSyncOperationCompleted(this.repository);

  Future<void> call(String id) {
    return repository.markCompleted(id);
  }
}
