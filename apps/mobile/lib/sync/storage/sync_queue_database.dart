import 'package:path/path.dart' as p;
import 'package:sqflite/sqflite.dart';

class SyncQueueDatabase {
  static const String tableName = 'sync_queue';
  static const String databaseName = 'madarisai_sync_queue.db';
  static const int databaseVersion = 1;

  Database? _database;

  Future<Database> get database async {
    _database ??= await _open();
    return _database!;
  }

  Future<Database> _open() async {
    final databasesPath = await getDatabasesPath();
    final path = p.join(databasesPath, databaseName);

    return openDatabase(
      path,
      version: databaseVersion,
      onCreate: (db, version) async {
        await db.execute('''
          CREATE TABLE $tableName (
            id TEXT PRIMARY KEY,
            entity_type TEXT NOT NULL,
            entity_id TEXT NOT NULL,
            action TEXT NOT NULL,
            payload TEXT NOT NULL,
            status TEXT NOT NULL,
            retry_count INTEGER NOT NULL,
            max_retries INTEGER NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            error_message TEXT
          )
        ''');

        await db.execute(
          'CREATE INDEX idx_sync_queue_status_created_at ON $tableName(status, created_at)',
        );
      },
    );
  }
}
