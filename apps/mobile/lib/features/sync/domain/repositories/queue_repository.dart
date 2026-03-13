import '../entities/pending_change_entity.dart';

abstract class QueueRepository {
  Future<void> enqueue(PendingChangeEntity change);
  Future<int> getPendingCount();
  Future<List<PendingChangeEntity>> getAllPending();
}
