import 'package:flutter/material.dart';

void main() {
  runApp(const MadarisAIApp());
}

class MadarisAIApp extends StatelessWidget {
  const MadarisAIApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'MadarisAI',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        primarySwatch: Colors.blue,
      ),
      home: const Scaffold(
        body: Center(
          child: Text('MadarisAI Platform Starting...'),
        ),
      ),
    );
  }
}
