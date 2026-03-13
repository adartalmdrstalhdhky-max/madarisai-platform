enum SyncEntityType {
  student,
  teacher,
  classroom,
  attendance,
  exam,
  grade,
  assignment,
  lesson,
  announcement,
  unknown,
}

enum SyncOperationType {
  create,
  update,
  delete,
}

enum SyncStatus {
  pending,
  syncing,
  synced,
  failed,
  conflict,
}

class SyncOperation {
  final String id;
  final SyncEntityType entityType;
  final String entityId;
  final SyncOperationType operationType;
  final Map<String, dynamic> payload;
  final DateTime createdAt;
  final DateTime updatedAt;
  final SyncStatus status;
  final int retryCount;
  final String? errorMessage;
  final String? deviceId;
  final String? userId;

  const SyncOperation({
    required this.id,
    required this.entityType,
    required this.entityId,
    required this.operationType,
    required this.payload,
    required this.createdAt,
    required this.updatedAt,
    required this.status,
    this.retryCount = 0,
    this.errorMessage,
    this.deviceId,
    this.userId,
  });

  SyncOperation copyWith({
    String? id,
    SyncEntityType? entityType,
    String? entityId,
    SyncOperationType? operationType,
    Map<String, dynamic>? payload,
    DateTime? createdAt,
    DateTime? updatedAt,
    SyncStatus? status,
    int? retryCount,
    String? errorMessage,
    String? deviceId,
    String? userId,
  }) {
    return SyncOperation(
      id: id ?? this.id,
      entityType: entityType ?? this.entityType,
      entityId: entityId ?? this.entityId,
      operationType: operationType ?? this.operationType,
      payload: payload ?? this.payload,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      status: status ?? this.status,
      retryCount: retryCount ?? this.retryCount,
      errorMessage: errorMessage ?? this.errorMessage,
      deviceId: deviceId ?? this.deviceId,
      userId: userId ?? this.userId,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'entityType': entityType.name,
      'entityId': entityId,
      'operationType': operationType.name,
      'payload': payload,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
      'status': status.name,
      'retryCount': retryCount,
      'errorMessage': errorMessage,
      'deviceId': deviceId,
      'userId': userId,
    };
  }

  factory SyncOperation.fromMap(Map<String, dynamic> map) {
    return SyncOperation(
      id: map['id'] as String,
      entityType: SyncEntityType.values.firstWhere(
        (e) => e.name == map['entityType'],
        orElse: () => SyncEntityType.unknown,
      ),
      entityId: map['entityId'] as String,
      operationType: SyncOperationType.values.firstWhere(
        (e) => e.name == map['operationType'],
      ),
      payload: Map<String, dynamic>.from(map['payload'] as Map),
      createdAt: DateTime.parse(map['createdAt'] as String),
      updatedAt: DateTime.parse(map['updatedAt'] as String),
      status: SyncStatus.values.firstWhere(
        (e) => e.name == map['status'],
      ),
      retryCount: (map['retryCount'] as num?)?.toInt() ?? 0,
      errorMessage: map['errorMessage'] as String?,
      deviceId: map['deviceId'] as String?,
      userId: map['userId'] as String?,
    );
  }
}
