echo "Starting safe cleanup..."

# حذف المجلدات الزائدة التي غالباً تكون نتيجة محاولات سابقة
rm -rf flutter
rm -rf madarisai_app

# حذف الملفات المؤقتة الشائعة
rm -rf build
rm -rf .dart_tool
rm -rf .idea

# التأكد من أن مشروع Flutter الأساسي موجود
if [ -f pubspec.yaml ]; then
  echo "pubspec.yaml found. Running dependency install..."
  flutter pub get
else
  echo "Warning: pubspec.yaml not found in root. Please check project structure."
fi

# تحديث المستودع بعد التنظيف
git add .
git commit -m "cleanup: normalize repository to single Flutter project"
git push

echo "Cleanup completed."
