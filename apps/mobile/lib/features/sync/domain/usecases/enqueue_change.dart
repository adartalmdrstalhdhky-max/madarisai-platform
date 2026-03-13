import '../entities/pending_change_entity.dart';
import '../repositories/queue_repository.dart';

class EnqueueChange {
  final QueueRepository repository;

  const EnqueueChange(this.repository);

  Future<void> call(PendingChangeEntity change) {
    return repository.enqueue(change);
  }
}
