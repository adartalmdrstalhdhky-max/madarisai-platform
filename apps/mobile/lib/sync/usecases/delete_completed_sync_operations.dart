import '../repository/sync_queue_repository.dart';

class DeleteCompletedSyncOperations {
  final SyncQueueRepository repository;

  DeleteCompletedSyncOperations(this.repository);

  Future<void> call() {
    return repository.deleteCompleted();
  }
}
