import 'package:flutter/material.dart';
import 'controllers/sync_state_controller.dart';

class SyncStatusPage extends StatefulWidget {
  const SyncStatusPage({super.key});

  @override
  State<SyncStatusPage> createState() => _SyncStatusPageState();
}

class _SyncStatusPageState extends State<SyncStatusPage> {
  late final SyncStateController controller;

  @override
  void initState() {
    super.initState();
    controller = SyncStateController();
    controller.load();
  }

  @override
  void dispose() {
    controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: controller,
      builder: (context, _) {
        if (controller.isLoading || controller.state == null) {
          return const Center(
            child: CircularProgressIndicator(),
          );
        }

        final state = controller.state!;

        return Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.cloud_sync, size: 72),
                const SizedBox(height: 16),
                const Text(
                  'Madaris AI Core Ready',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 24),
                const Text('Madaris AI'),
                const SizedBox(height: 12),
                const Text('Status'),
                const Text('Idle'),
                const SizedBox(height: 12),
                const Text('Pending Items'),
                Text('${state.pendingCount}'),
                const SizedBox(height: 12),
                const Text('Last Synced'),
                const Text('Never'),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: controller.simulateNewChange,
                  child: const Text('Simulate New Change'),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
