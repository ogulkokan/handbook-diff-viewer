#!/usr/bin/env node
// PostToolUse hook. Lints the one file that an agent just edited.
// Exit 2 sends the findings to the model, so it fixes them in the same turn.
// The hook never blocks on its own failure: a missing tool or bad input exits 0.

import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'

const LINTED = /\.(ts|mts|js|mjs|vue)$/

function main() {
  let input
  try {
    input = JSON.parse(readFileSync(0, 'utf8'))
  } catch {
    return 0
  }

  const file = input?.tool_input?.file_path
  const root = process.env.CLAUDE_PROJECT_DIR ?? process.cwd()
  if (typeof file !== 'string' || !LINTED.test(file) || !existsSync(file)) return 0

  const rel = relative(root, file)
  if (rel.startsWith('..') || rel.startsWith('node_modules') || rel.startsWith('dist')) return 0

  // Before card 001 there is no ESLint. The hook stays silent until then.
  const eslint = join(root, 'node_modules', '.bin', 'eslint')
  if (!existsSync(eslint)) return 0

  const run = spawnSync(eslint, ['--no-warn-ignored', file], { cwd: root, encoding: 'utf8' })
  if (run.status === 0 || run.status === null) return 0

  process.stderr.write(`ESLint findings in ${rel}. Fix them before the next step.\n`)
  process.stderr.write(`${run.stdout}${run.stderr}`)
  return 2
}

process.exit(main())
