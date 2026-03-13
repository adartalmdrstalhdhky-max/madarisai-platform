import 'package:flutter/material.dart';

class AppShell extends StatelessWidget {
  final Widget child;

  const AppShell({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Madaris AI'),
        centerTitle: true,
      ),
      body: SafeArea(
        child: child,
      ),
    );
  }
}
