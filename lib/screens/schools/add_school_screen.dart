import 'package:flutter/material.dart';
import '../../services/school_service.dart';

class AddSchoolScreen extends StatefulWidget {
  const AddSchoolScreen({super.key});

  @override
  State<AddSchoolScreen> createState() => _AddSchoolScreenState();
}

class _AddSchoolScreenState extends State<AddSchoolScreen> {
  final _nameController = TextEditingController();
  final _addressController = TextEditingController();
  final SchoolService _schoolService = SchoolService();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Add School')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            TextField(
              controller: _nameController,
              decoration: const InputDecoration(labelText: 'School Name'),
            ),
            TextField(
              controller: _addressController,
              decoration: const InputDecoration(labelText: 'Address'),
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: () async {
                if (_nameController.text.isEmpty || _addressController.text.isEmpty) return;
                await _schoolService.addSchool(
                    _nameController.text, _addressController.text);
                ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('School Added')));
                _nameController.clear();
                _addressController.clear();
              },
              child: const Text('Add School'),
            ),
          ],
        ),
      ),
    );
  }
}
