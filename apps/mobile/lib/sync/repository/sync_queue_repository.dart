import '../models/sync_operation.dart';

abstract class SyncQueueRepository {
  Future<void> enqueue(SyncOperation operation);

  Future<List<SyncOperation>> getPendingOperations();

  Future<void> markAsSyncing(String operationId);

  Future<void> markAsSynced(String operationId);

  Future<void> markAsFailed(String operationId, String error);

  Future<void> deleteOperation(String operationId);

  Future<void> clearQueue();
}
