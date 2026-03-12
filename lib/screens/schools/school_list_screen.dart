import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'add_school_screen.dart';

class SchoolListScreen extends StatelessWidget {
  const SchoolListScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final schoolsStream = FirebaseFirestore.instance.collection('schools').snapshots();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Schools List'),
      ),
      body: StreamBuilder(
        stream: schoolsStream,
        builder: (context, AsyncSnapshot snapshot) {
          if (!snapshot.hasData) {
            return const Center(child: CircularProgressIndicator());
          }
          final schools = snapshot.data.docs;
          return ListView.builder(
            itemCount: schools.length,
            itemBuilder: (context, index) {
              final school = schools[index];
              return ListTile(
                title: Text(school['name']),
                subtitle: Text(school['location'] ?? ''),
              );
            },
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => const AddSchoolScreen()),
          );
        },
        child: const Icon(Icons.add),
        tooltip: 'Add School',
      ),
    );
  }
}
