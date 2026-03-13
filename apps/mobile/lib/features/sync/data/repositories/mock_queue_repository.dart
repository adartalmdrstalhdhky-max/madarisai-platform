import '../../domain/entities/pending_change_entity.dart';
import '../../domain/repositories/queue_repository.dart';
import '../datasources/local_queue_data_source.dart';
import '../models/pending_change_model.dart';

class MockQueueRepository implements QueueRepository {
  final LocalQueueDataSource localDataSource;

  MockQueueRepository({
    LocalQueueDataSource? localDataSource,
  }) : localDataSource = localDataSource ?? InMemoryLocalQueueDataSource();

  @override
  Future<void> enqueue(PendingChangeEntity change) async {
    await localDataSource.enqueue(
      PendingChangeModel.fromEntity(change),
    );
  }

  @override
  Future<List<PendingChangeEntity>> getAllPending() async {
    return localDataSource.getAllPending();
  }

  @override
  Future<int> getPendingCount() async {
    return localDataSource.getPendingCount();
  }
}
