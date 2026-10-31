#!/usr/bin/env node
// Merges .claude/settings.hooks.json into .claude/settings.json without removing
// what Spec Kit (or anything else) already put there. Safe to run more than once.
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs'

const target = '.claude/settings.json'
const source = '.claude/settings.hooks.json'

const read = (path) => (existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : {})
const settings = read(target)
const extra = read(source)

settings.hooks ??= {}
for (const [event, groups] of Object.entries(extra.hooks ?? {})) {
  const current = (settings.hooks[event] ??= [])
  const knownCommands = new Set(current.flatMap((g) => (g.hooks ?? []).map((h) => h.command)))
  for (const group of groups) {
    const fresh = (group.hooks ?? []).filter((h) => !knownCommands.has(h.command))
    if (fresh.length > 0) current.push({ ...group, hooks: fresh })
  }
}

writeFileSync(target, `${JSON.stringify(settings, null, 2)}\n`)
if (existsSync(source)) rmSync(source)
const events = Object.keys(extra.hooks ?? {})
console.log(
  events.length > 0
    ? `Hooks merged into ${target}: ${events.join(', ')}`
    : `Nothing to merge (${source} not found).`,
)
