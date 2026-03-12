#!/bin/bash
# تعريف متغير للحرف f لتجاوز مشكلة الهاتف
f="f"

# استخدام المتغير في أوامر flutter
${f}lutter pub add firebase_core
${f}lutter pub add firebase_auth
${f}lutter pub add cloud_firestore

# تشغيل pub get للتأكد من تحميل كل المكتبات
${f}lutter pub get
