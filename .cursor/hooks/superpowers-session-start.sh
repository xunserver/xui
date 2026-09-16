#!/usr/bin/env bash
# Project-level Superpowers SessionStart hook for Cursor.
# Injects using-superpowers the same way the official Cursor plugin does.
set -euo pipefail

# Consume the hook payload so Cursor does not see a blocked stdin.
cat >/dev/null || true

ROOT="${CURSOR_PROJECT_DIR:-${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "$0")/../.." && pwd)}}"
export CURSOR_PLUGIN_ROOT="${ROOT}/vendor/superpowers"
SESSION_START="${CURSOR_PLUGIN_ROOT}/hooks/session-start"

if [[ ! -f "${SESSION_START}" ]]; then
  printf '%s\n' '{"additional_context":"Superpowers is missing. Run: git submodule update --init --recursive"}'
  exit 0
fi

exec bash "${SESSION_START}"
