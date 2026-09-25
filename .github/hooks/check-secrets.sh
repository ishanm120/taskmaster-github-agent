#!/usr/bin/env bash
set -euo pipefail
# Lightweight staged-additions check; not a replacement for dedicated secret scanning.
if ! git diff --cached --quiet --; then
  if git diff --cached --unified=0 -- . ':!package-lock.json' | grep '^+' | grep -v '^+++' | grep -Eiq '(password|api[_-]?key|secret|token)[[:space:]]*[:=][[:space:]]*["\x27][^"\x27]+["\x27]'; then
    echo "Potential secret in staged additions. Review before committing." >&2
    exit 1
  fi
fi
echo "Lightweight staged secret check passed."
