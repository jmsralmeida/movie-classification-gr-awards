#!/usr/bin/env node
// UserPromptSubmit hook: appends each prompt to docs/ai/prompts.md.
// Writes nothing to stdout, because stdout from this hook is added to the agent context.
import { appendFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const MAX_PROMPT_CHARS = 4000;

function readStdin() {
  return new Promise((resolve) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => (data += chunk));
    process.stdin.on('end', () => resolve(data));
  });
}

function formatPrompt(prompt) {
  const trimmed = prompt.trim();
  const body =
    trimmed.length > MAX_PROMPT_CHARS
      ? `${trimmed.slice(0, MAX_PROMPT_CHARS)}\n\n[... ${trimmed.length - MAX_PROMPT_CHARS} caracteres omitidos]`
      : trimmed;
  return body
    .split('\n')
    .map((line) => `> ${line}`)
    .join('\n');
}

try {
  const input = JSON.parse(await readStdin());
  const prompt = typeof input.prompt === 'string' ? input.prompt : '';
  if (prompt.trim()) {
    const projectDir = process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();
    const file = join(projectDir, 'docs', 'ai', 'prompts.md');
    if (!existsSync(file)) {
      mkdirSync(dirname(file), { recursive: true });
      writeFileSync(file, '# Log de prompts\n\nGerado automaticamente pelo hook `.claude/hooks/log-prompt.mjs`.\n');
    }
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const session = String(input.session_id || 'unknown').slice(0, 8);
    appendFileSync(file, `\n### ${timestamp} UTC · sessão ${session}\n\n${formatPrompt(prompt)}\n`);
  }
} catch {
  // Never block the prompt because of logging.
}
process.exit(0);
