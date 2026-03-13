import '../value_objects/change_type.dart';

class PendingChangeEntity {
  final String id;
  final String entityType;
  final String entityId;
  final ChangeType changeType;
  final DateTime createdAt;

  const PendingChangeEntity({
    required this.id,
    required this.entityType,
    required this.entityId,
    required this.changeType,
    required this.createdAt,
  });
}
