import 'package:flutter/material.dart';
import '../models/school_model.dart';
import '../services/school_service.dart';
import 'add_school_screen.dart';

class SchoolListScreen extends StatefulWidget {
  const SchoolListScreen({Key? key}) : super(key: key);

  @override
  State<SchoolListScreen> createState() => _SchoolListScreenState();
}

class _SchoolListScreenState extends State<SchoolListScreen> {

  final SchoolService schoolService = SchoolService();
  List<School> schools = [];

  @override
  void initState() {
    super.initState();
    loadSchools();
  }

  void loadSchools() async {
    List<School> data = await schoolService.getSchools();
    setState(() {
      schools = data;
    });
  }

  @override
  Widget build(BuildContext context) {

    return Scaffold(
      appBar: AppBar(
        title: const Text("Schools"),
      ),

      body: ListView.builder(
        itemCount: schools.length,
        itemBuilder: (context, index) {

          return ListTile(
            title: Text(schools[index].name),
            subtitle: Text(schools[index].address),
          );

        },
      ),

      floatingActionButton: FloatingActionButton(
        child: const Icon(Icons.add),
        onPressed: () async {

          await Navigator.push(
            context,
            MaterialPageRoute(
              builder: (_) => const AddSchoolScreen(),
            ),
          );

          loadSchools();
        },
      ),
    );
  }
}
