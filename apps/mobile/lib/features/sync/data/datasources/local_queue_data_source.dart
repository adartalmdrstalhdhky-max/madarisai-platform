import '../models/pending_change_model.dart';

abstract class LocalQueueDataSource {
  Future<void> enqueue(PendingChangeModel change);
  Future<int> getPendingCount();
  Future<List<PendingChangeModel>> getAllPending();
}

class InMemoryLocalQueueDataSource implements LocalQueueDataSource {
  final List<PendingChangeModel> _items = [
    PendingChangeModel.fromRaw(
      id: 'chg-1',
      entityType: 'student',
      entityId: 'std-1001',
      changeType: 'create',
      createdAtIso: '2026-01-01T00:00:00.000',
    ),
    PendingChangeModel.fromRaw(
      id: 'chg-2',
      entityType: 'attendance',
      entityId: 'att-2001',
      changeType: 'update',
      createdAtIso: '2026-01-02T00:00:00.000',
    ),
    PendingChangeModel.fromRaw(
      id: 'chg-3',
      entityType: 'grade',
      entityId: 'grd-3001',
      changeType: 'delete',
      createdAtIso: '2026-01-03T00:00:00.000',
    ),
  ];

  @override
  Future<void> enqueue(PendingChangeModel change) async {
    _items.add(change);
  }

  @override
  Future<List<PendingChangeModel>> getAllPending() async {
    return List.unmodifiable(_items);
  }

  @override
  Future<int> getPendingCount() async {
    return _items.length;
  }
}
