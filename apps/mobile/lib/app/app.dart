import 'package:flutter/material.dart';
import '../core/widgets/app_shell.dart';
import '../features/sync/presentation/sync_status_page.dart';

class MadarisApp extends StatelessWidget {
  const MadarisApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Madaris AI',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.indigo),
        useMaterial3: true,
      ),
      home: const AppShell(
        child: SyncStatusPage(),
      ),
    );
  }
}
