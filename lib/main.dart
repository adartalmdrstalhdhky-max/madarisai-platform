import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'screens/schools/school_list_screen.dart';
import 'firebase_options.dart'; // هذا الملف يُنشأ تلقائياً عند إعداد Firebase

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'MadarisAI',
      theme: ThemeData(
        primarySwatch: Colors.blue,
      ),
      debugShowCheckedModeBanner: false,
      home: const SchoolListScreen(),
    );
  }
}
