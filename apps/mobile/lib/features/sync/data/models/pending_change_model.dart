import '../../domain/entities/pending_change_entity.dart';
import '../../domain/value_objects/change_type.dart';

class PendingChangeModel extends PendingChangeEntity {
  const PendingChangeModel({
    required super.id,
    required super.entityType,
    required super.entityId,
    required super.changeType,
    required super.createdAt,
  });

  factory PendingChangeModel.fromRaw({
    required String id,
    required String entityType,
    required String entityId,
    required String changeType,
    required String createdAtIso,
  }) {
    return PendingChangeModel(
      id: id,
      entityType: entityType,
      entityId: entityId,
      changeType: _mapChangeType(changeType),
      createdAt: DateTime.parse(createdAtIso),
    );
  }

  factory PendingChangeModel.fromEntity(PendingChangeEntity entity) {
    return PendingChangeModel(
      id: entity.id,
      entityType: entity.entityType,
      entityId: entity.entityId,
      changeType: entity.changeType,
      createdAt: entity.createdAt,
    );
  }

  static ChangeType _mapChangeType(String value) {
    switch (value) {
      case 'create':
        return ChangeType.create;
      case 'update':
        return ChangeType.update;
      case 'delete':
        return ChangeType.delete;
      default:
        return ChangeType.update;
    }
  }
}
