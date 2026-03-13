import '../entities/sync_entity.dart';
import '../repositories/sync_repository.dart';

class GetSyncStatus {
  final SyncRepository repository;

  const GetSyncStatus(this.repository);

  Future<SyncEntity> call() {
    return repository.getStatus();
  }
}
