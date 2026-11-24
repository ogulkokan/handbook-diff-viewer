#!/usr/bin/env bash
# Prose lint for the Markdown files of this repository.
#
# The linter is one Python file from danyuchn/asd-ste100-skill (MIT). It is not kept in
# this repository (D12). This script reads it from one pinned commit, checks its SHA-256,
# and keeps a copy in node_modules/.cache. A file with another hash never runs.
#
# The rule "synonym-rotation" is off: it flags normal pairs such as "get" and "fetch".
set -euo pipefail

COMMIT="d714e5364e16825dbb6fe7194671d6a435e9fb3f"
SHA256="66c454b94dea0f81334f36b222775b62b6ec24e25c0e62308f23c550ef3eaa3d"
URL="https://raw.githubusercontent.com/danyuchn/asd-ste100-skill/${COMMIT}/scripts/ste-lint.py"

root="$(cd "$(dirname "$0")/.." && pwd)"
cache="${root}/node_modules/.cache/ste-lint"
linter="${cache}/ste-lint-${COMMIT:0:7}.py"

sha256_of() {
  if command -v sha256sum >/dev/null 2>&1; then
    sha256sum "$1" | cut -d' ' -f1
  else
    shasum -a 256 "$1" | cut -d' ' -f1
  fi
}

for tool in python3 curl; do
  if ! command -v "$tool" >/dev/null 2>&1; then
    echo "lint:prose NOT RUN: '$tool' is missing." >&2
    exit 2
  fi
done

if [ ! -f "$linter" ]; then
  mkdir -p "$cache"
  curl -fsSL "$URL" -o "${linter}.tmp"
  mv "${linter}.tmp" "$linter"
fi

actual="$(sha256_of "$linter")"
if [ "$actual" != "$SHA256" ]; then
  rm -f "$linter"
  echo "lint:prose FAILED: the linter has an unexpected SHA-256 (${actual})." >&2
  exit 2
fi

cd "$root"
shopt -s nullglob
files=(
  README.md CLAUDE.md GLOSSARY.md PROGRESS.md
  docs/SPEC.md docs/DECISIONS.md
  docs/conventions/*.md
  docs/cards/*.md
  .claude/skills/README.md
  .claude/skills/*/SKILL.md
  .claude/agents/*.md
)

# -I keeps Python from loading code from the current folder.
python3 -I "$linter" --disable synonym-rotation "${files[@]}"
