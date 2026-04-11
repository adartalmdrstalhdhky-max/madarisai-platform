# App Structure

## Entry points
- `/app/login.html` → official login entry
- `/app/school/index.html` → school dashboard after login

## Core
- `app/core/firebase/` → Firebase single source of truth
- `app/core/session/` → session contract and storage
- `app/core/data/` → collections and schema contract

## School module
- `app/school/` → operational school pages only

## Internal tools
- `app/internal-tools/` → audit, debug, and migration tools only

## Rules
1. Do not duplicate Firebase config inside pages.
2. Do not duplicate session parsing inside pages.
3. All operational pages must use `app/core/`.
4. Debug and fix tools must not stay mixed with user-facing school pages long term.
