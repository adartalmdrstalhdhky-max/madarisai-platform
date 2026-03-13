import '../models/sync_operation.dart';
import '../repository/sync_queue_repository.dart';

class EnqueueSyncOperation {
  final SyncQueueRepository repository;

  EnqueueSyncOperation(this.repository);

  Future<void> call(SyncOperation operation) async {
    await repository.enqueue(operation);
  }
}
