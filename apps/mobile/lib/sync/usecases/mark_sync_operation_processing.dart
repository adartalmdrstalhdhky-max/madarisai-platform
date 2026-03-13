import '../repository/sync_queue_repository.dart';

class MarkSyncOperationProcessing {
  final SyncQueueRepository repository;

  MarkSyncOperationProcessing(this.repository);

  Future<void> call(String id) {
    return repository.markProcessing(id);
  }
}
