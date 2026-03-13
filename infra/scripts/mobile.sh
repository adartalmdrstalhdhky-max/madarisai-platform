#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
MOBILE_DIR="$ROOT_DIR/apps/mobile"
FLUTTER_BIN="$HOME/flutter/bin/flutter"

echo "==> Madaris AI Mobile Script"
echo "Root: $ROOT_DIR"
echo "Mobile: $MOBILE_DIR"

if [ ! -x "$FLUTTER_BIN" ]; then
  echo "ERROR: Flutter not found at $FLUTTER_BIN"
  exit 1
fi

cd "$MOBILE_DIR"

echo
echo "==> Flutter version"
"$FLUTTER_BIN" --version

echo
echo "==> Pub get"
"$FLUTTER_BIN" pub get

echo
echo "==> Analyze"
"$FLUTTER_BIN" analyze

echo
echo "==> Test"
"$FLUTTER_BIN" test

echo
echo "==> Mobile pipeline completed successfully."
