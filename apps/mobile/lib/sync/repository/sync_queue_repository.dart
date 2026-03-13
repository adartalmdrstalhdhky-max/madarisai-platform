import '../models/sync_operation.dart';

abstract class SyncQueueRepository {
  Future<void> enqueue(SyncOperation operation);

  Future<List<SyncOperation>> getQueuedOperations({int limit = 100});

  Future<SyncOperation?> getById(String id);

  Future<void> markProcessing(String id);

  Future<void> markCompleted(String id);

  Future<void> markFailed(String id, {required String errorMessage});

  Future<void> deleteCompleted();
}
