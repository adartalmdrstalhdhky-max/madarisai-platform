Architecture
Foundational Rule
The platform is designed mobile-first for operators, offline-first for schools, and automation-first for engineering.
Initial spine
Monorepo
Offline sync engine
Shared domain contracts
API boundary
Admin panel
Mobile client EOG
cat > docs/decisions/ADR-001-monorepo.md <<'EOG'
ADR-001: Adopt Monorepo
Status
Accepted
Context
The project is founded and operated under mobile-first constraints and requires low operational overhead.
Decision
Adopt a single monorepo for apps, services, packages, infrastructure scripts, and architecture docs.
Consequences
Simpler operation from phone
Single source of truth
Easier automation
Lower coordination overhead in early phases EOG
cat > apps/mobile/README.md <<'EOG'
Mobile App
Reserved for the Flutter application. EOG
cat > apps/admin/README.md <<'EOG'
Admin App
Reserved for admin dashboard. EOG
cat > services/api/README.md <<'EOG'
API Service
Reserved for API contracts and server implementation. EOG
cat > services/sync/README.md <<'EOG'
Sync Service
Reserved for offline-first sync engine design and implementation. EOG
cat > packages/core/README.md <<'EOG'
Core Package
Reserved for domain entities, value objects, and core business rules. EOG
cat > packages/design_system/README.md <<'EOG'
Design System Package
Reserved for shared design tokens and components. EOG
cat > packages/shared/README.md <<'EOG'
Shared Package
Reserved for shared helpers, constants, and utilities. EOG
cat > infra/scripts/doctor.sh <<'EOG' #!/usr/bin/env bash set -euo pipefail
echo "==> Madaris AI environment doctor" echo
echo "-- Current directory:" pwd echo
echo "-- Git version:" git --version || true echo
echo "-- Bash version:" bash --version | head -n 1 || true echo
echo "-- Repository tree (top level):" find . -maxdepth 2 
-not -path '/.git/' 
-not -path './.git' 
| sort EOG
cat > infra/scripts/tree.sh <<'EOG' #!/usr/bin/env bash set -euo pipefail
echo "==> Repository structure" find . -maxdepth 3 
-not -path '/.git/' 
-not -path './.git' 
| sort EOG
chmod +x infra/scripts/bootstrap.sh infra/scripts/doctor.sh infra/scripts/tree.sh
echo "==> Bootstrap files created successfully." EOF
