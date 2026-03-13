import 'package:flutter/foundation.dart';

class SyncViewState {
  final int pendingCount;

  const SyncViewState({
    required this.pendingCount,
  });
}

class SyncStateController extends ChangeNotifier {
  SyncViewState? state;
  bool isLoading = false;

  Future<void> load() async {
    isLoading = true;
    notifyListeners();

    await Future<void>.delayed(const Duration(milliseconds: 50));

    state = const SyncViewState(
      pendingCount: 3,
    );

    isLoading = false;
    notifyListeners();
  }

  Future<void> simulateNewChange() async {
    final current = state?.pendingCount ?? 3;

    state = SyncViewState(
      pendingCount: current + 1,
    );

    notifyListeners();
  }
}
