import 'package:flutter/material.dart';
import 'package:uuid/uuid.dart';
import '../models/school_model.dart';
import '../services/school_service.dart';

class AddSchoolScreen extends StatefulWidget {
  const AddSchoolScreen({Key? key}) : super(key: key);

  @override
  State<AddSchoolScreen> createState() => _AddSchoolScreenState();
}

class _AddSchoolScreenState extends State<AddSchoolScreen> {

  final _formKey = GlobalKey<FormState>();

  final TextEditingController nameController = TextEditingController();
  final TextEditingController addressController = TextEditingController();

  final SchoolService schoolService = SchoolService();

  bool loading = false;

  void saveSchool() async {

    if (!_formKey.currentState!.validate()) return;

    setState(() {
      loading = true;
    });

    String schoolId = const Uuid().v4();

    School school = School(
      schoolId: schoolId,
      name: nameController.text.trim(),
      address: addressController.text.trim(),
    );

    await schoolService.addSchool(school);

    setState(() {
      loading = false;
    });

    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {

    return Scaffold(
      appBar: AppBar(
        title: const Text("Add School"),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            children: [

              TextFormField(
                controller: nameController,
                decoration: const InputDecoration(
                  labelText: "School Name",
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return "Enter school name";
                  }
                  return null;
                },
              ),

              const SizedBox(height: 16),

              TextFormField(
                controller: addressController,
                decoration: const InputDecoration(
                  labelText: "School Address",
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return "Enter school address";
                  }
                  return null;
                },
              ),

              const SizedBox(height: 30),

              loading
                  ? const CircularProgressIndicator()
                  : ElevatedButton(
                      onPressed: saveSchool,
                      child: const Text("Save School"),
                    ),

            ],
          ),
        ),
      ),
    );
  }
}
