import '../entities/sync_entity.dart';

abstract class SyncRepository {
  Future<SyncEntity> getStatus();
}
