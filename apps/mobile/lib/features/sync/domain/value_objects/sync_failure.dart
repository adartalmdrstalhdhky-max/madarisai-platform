class SyncFailure implements Exception {
  final String message;

  const SyncFailure(this.message);

  @override
  String toString() => 'SyncFailure: $message';
}
