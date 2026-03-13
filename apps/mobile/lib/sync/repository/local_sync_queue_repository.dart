import 'dart:convert';

import '../models/sync_operation.dart';
import '../storage/sync_queue_database.dart';
import 'sync_queue_repository.dart';

class LocalSyncQueueRepository implements SyncQueueRepository {
  final SyncQueueDatabase database;

  LocalSyncQueueRepository(this.database);

  @override
  Future<void> enqueue(SyncOperation operation) async {
    final db = await database.database;

    await db.insert(SyncQueueDatabase.tableName, _toRow(operation));
  }

  @override
  Future<List<SyncOperation>> getQueuedOperations({int limit = 100}) async {
    final db = await database.database;

    final rows = await db.query(
      SyncQueueDatabase.tableName,
      where: 'status = ? OR (status = ? AND retry_count < max_retries)',
      whereArgs: const ['pending', 'failed'],
      orderBy: 'created_at ASC',
      limit: limit,
    );

    return rows.map(_fromRow).toList();
  }

  @override
  Future<SyncOperation?> getById(String id) async {
    final db = await database.database;

    final rows = await db.query(
      SyncQueueDatabase.tableName,
      where: 'id = ?',
      whereArgs: [id],
      limit: 1,
    );

    if (rows.isEmpty) {
      return null;
    }

    return _fromRow(rows.first);
  }

  @override
  Future<void> markProcessing(String id) async {
    final db = await database.database;

    await db.update(
      SyncQueueDatabase.tableName,
      <String, Object?>{
        'status': SyncOperationStatus.processing.value,
        'updated_at': DateTime.now().toIso8601String(),
        'error_message': null,
      },
      where: 'id = ?',
      whereArgs: [id],
    );
  }

  @override
  Future<void> markCompleted(String id) async {
    final db = await database.database;

    await db.update(
      SyncQueueDatabase.tableName,
      <String, Object?>{
        'status': SyncOperationStatus.completed.value,
        'updated_at': DateTime.now().toIso8601String(),
        'error_message': null,
      },
      where: 'id = ?',
      whereArgs: [id],
    );
  }

  @override
  Future<void> markFailed(String id, {required String errorMessage}) async {
    final db = await database.database;
    final current = await getById(id);

    if (current == null) {
      return;
    }

    await db.update(
      SyncQueueDatabase.tableName,
      <String, Object?>{
        'status': SyncOperationStatus.failed.value,
        'retry_count': current.retryCount + 1,
        'updated_at': DateTime.now().toIso8601String(),
        'error_message': errorMessage,
      },
      where: 'id = ?',
      whereArgs: [id],
    );
  }

  @override
  Future<void> deleteCompleted() async {
    final db = await database.database;

    await db.delete(
      SyncQueueDatabase.tableName,
      where: 'status = ?',
      whereArgs: const ['completed'],
    );
  }

  Map<String, Object?> _toRow(SyncOperation operation) {
    return <String, Object?>{
      'id': operation.id,
      'entity_type': operation.entityType,
      'entity_id': operation.entityId,
      'action': operation.action,
      'payload': jsonEncode(operation.payload),
      'status': operation.status.value,
      'retry_count': operation.retryCount,
      'max_retries': operation.maxRetries,
      'created_at': operation.createdAt.toIso8601String(),
      'updated_at': operation.updatedAt.toIso8601String(),
      'error_message': operation.errorMessage,
    };
  }

  SyncOperation _fromRow(Map<String, Object?> row) {
    return SyncOperation(
      id: row['id'] as String,
      entityType: row['entity_type'] as String,
      entityId: row['entity_id'] as String,
      action: row['action'] as String,
      payload: Map<String, dynamic>.from(
        jsonDecode(row['payload'] as String) as Map<String, dynamic>,
      ),
      status: SyncOperationStatusX.fromValue(row['status'] as String),
      retryCount: row['retry_count'] as int,
      maxRetries: row['max_retries'] as int,
      createdAt: DateTime.parse(row['created_at'] as String),
      updatedAt: DateTime.parse(row['updated_at'] as String),
      errorMessage: row['error_message'] as String?,
    );
  }
}
