import '../repository/sync_queue_repository.dart';

class MarkSyncOperationFailed {
  final SyncQueueRepository repository;

  MarkSyncOperationFailed(this.repository);

  Future<void> call(String id, {required String errorMessage}) {
    return repository.markFailed(id, errorMessage: errorMessage);
  }
}
