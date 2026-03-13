enum SyncOperationStatus { pending, processing, completed, failed }

extension SyncOperationStatusX on SyncOperationStatus {
  String get value {
    switch (this) {
      case SyncOperationStatus.pending:
        return 'pending';
      case SyncOperationStatus.processing:
        return 'processing';
      case SyncOperationStatus.completed:
        return 'completed';
      case SyncOperationStatus.failed:
        return 'failed';
    }
  }

  static SyncOperationStatus fromValue(String value) {
    switch (value) {
      case 'pending':
        return SyncOperationStatus.pending;
      case 'processing':
        return SyncOperationStatus.processing;
      case 'completed':
        return SyncOperationStatus.completed;
      case 'failed':
        return SyncOperationStatus.failed;
      default:
        return SyncOperationStatus.pending;
    }
  }
}

class SyncOperation {
  final String id;
  final String entityType;
  final String entityId;
  final String action;
  final Map<String, dynamic> payload;
  final SyncOperationStatus status;
  final int retryCount;
  final int maxRetries;
  final DateTime createdAt;
  final DateTime updatedAt;
  final String? errorMessage;

  const SyncOperation({
    required this.id,
    required this.entityType,
    required this.entityId,
    required this.action,
    required this.payload,
    required this.status,
    required this.retryCount,
    required this.maxRetries,
    required this.createdAt,
    required this.updatedAt,
    this.errorMessage,
  });

  SyncOperation copyWith({
    String? id,
    String? entityType,
    String? entityId,
    String? action,
    Map<String, dynamic>? payload,
    SyncOperationStatus? status,
    int? retryCount,
    int? maxRetries,
    DateTime? createdAt,
    DateTime? updatedAt,
    String? errorMessage,
    bool clearErrorMessage = false,
  }) {
    return SyncOperation(
      id: id ?? this.id,
      entityType: entityType ?? this.entityType,
      entityId: entityId ?? this.entityId,
      action: action ?? this.action,
      payload: payload ?? this.payload,
      status: status ?? this.status,
      retryCount: retryCount ?? this.retryCount,
      maxRetries: maxRetries ?? this.maxRetries,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      errorMessage: clearErrorMessage
          ? null
          : (errorMessage ?? this.errorMessage),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'entityType': entityType,
      'entityId': entityId,
      'action': action,
      'payload': payload,
      'status': status.value,
      'retryCount': retryCount,
      'maxRetries': maxRetries,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
      'errorMessage': errorMessage,
    };
  }

  factory SyncOperation.fromMap(Map<String, dynamic> map) {
    return SyncOperation(
      id: map['id'] as String,
      entityType: map['entityType'] as String,
      entityId: map['entityId'] as String,
      action: map['action'] as String,
      payload: Map<String, dynamic>.from(map['payload'] as Map),
      status: SyncOperationStatusX.fromValue(map['status'] as String),
      retryCount: map['retryCount'] as int,
      maxRetries: map['maxRetries'] as int,
      createdAt: DateTime.parse(map['createdAt'] as String),
      updatedAt: DateTime.parse(map['updatedAt'] as String),
      errorMessage: map['errorMessage'] as String?,
    );
  }
}
