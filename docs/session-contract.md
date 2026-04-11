# Session Contract

## Official session shape

```json
{
  "userId": "string",
  "email": "string",
  "role": "school",
  "schoolId": "string",
  "schoolName": "string",
  "displayName": "string",
  "status": "active",
  "loginAt": 0
}

Official storage key
madarisai_session
Transitional support
Legacy keys may still be read temporarily, but all pages must write back only the normalized official session.
---

## ملف 11
`docs/firestore-schema.md`

### المحتوى المقترح

```markdown
# Firestore Schema Contract

## Operational collections
- schools
- users
- teachers
- students
- classes
- subjects
- classSubjects
- schedules

## Operational read policy
Top-level collections filtered by `schoolId`.

## Transitional audit policy
Nested paths like `schools/{schoolId}/...` may still be read by debug/audit tools during migration only.
