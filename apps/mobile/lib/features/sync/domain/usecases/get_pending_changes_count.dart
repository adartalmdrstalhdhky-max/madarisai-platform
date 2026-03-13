import '../repositories/queue_repository.dart';

class GetPendingChangesCount {
  final QueueRepository repository;

  const GetPendingChangesCount(this.repository);

  Future<int> call() {
    return repository.getPendingCount();
  }
}
