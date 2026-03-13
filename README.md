# Madaris AI Platform

Madaris AI global education platform monorepo.

## Structure

- `apps/mobile` → mobile application
- `apps/admin` → admin dashboard
- `services/api` → backend api contracts and services
- `services/sync` → offline/online sync engine
- `packages/core` → core business primitives
- `packages/design_system` → shared ui tokens and components
- `packages/shared` → shared utilities and types
- `infra/scripts` → one-tap automation scripts
- `docs/architecture` → architecture docs
- `docs/decisions` → engineering decisions (ADRs)

## Operating Principle

No manual setup. Everything should run through repeatable scripts.

## First Commands

```bash
bash infra/scripts/bootstrap.sh
bash infra/scripts/doctor.sh
bash infra/scripts/tree.sh


