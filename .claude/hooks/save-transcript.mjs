#!/usr/bin/env node
// Converts Claude Code transcripts (JSONL) into readable Markdown under docs/ai/sessions/.
//
// As a SessionEnd hook: reads { session_id, transcript_path } from stdin.
// Manually: `node .claude/hooks/save-transcript.mjs --all` exports every session of this project.
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { basename, join } from 'node:path';

const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const outDir = join(projectDir, 'docs', 'ai', 'sessions');
const MAX_TEXT_CHARS = 6000;
const MAX_INPUT_CHARS = 300;

function clip(text, max) {
  return text.length > max ? `${text.slice(0, max)} [...]` : text;
}

function describeToolInput(input) {
  if (!input || typeof input !== 'object') return '';
  const key = ['command', 'file_path', 'pattern', 'skill', 'subagent_type', 'description', 'url'].find(
    (k) => typeof input[k] === 'string',
  );
  return key ? clip(input[key].replace(/\s+/g, ' '), MAX_INPUT_CHARS) : '';
}

function renderContent(content) {
  if (typeof content === 'string') return { text: content, tools: [], isToolResult: false };
  const parts = Array.isArray(content) ? content : [];
  const text = parts
    .filter((p) => p.type === 'text')
    .map((p) => p.text)
    .join('\n\n');
  const tools = parts
    .filter((p) => p.type === 'tool_use')
    .map((p) => `\`${p.name}\` ${describeToolInput(p.input)}`.trim());
  const isToolResult = parts.length > 0 && parts.every((p) => p.type === 'tool_result');
  return { text, tools, isToolResult };
}

function convert(transcriptPath) {
  const lines = readFileSync(transcriptPath, 'utf8').split('\n').filter(Boolean);
  const out = [];
  let firstTimestamp = '';
  for (const line of lines) {
    let entry;
    try {
      entry = JSON.parse(line);
    } catch {
      continue;
    }
    if (!['user', 'assistant'].includes(entry.type) || !entry.message || entry.isMeta) continue;
    firstTimestamp ||= entry.timestamp || '';
    const { text, tools, isToolResult } = renderContent(entry.message.content);
    if (isToolResult) continue;
    if (entry.type === 'user' && text.trim()) {
      out.push(`## James\n\n${clip(text.trim(), MAX_TEXT_CHARS)}\n`);
    }
    if (entry.type === 'assistant') {
      if (text.trim()) out.push(`**Claude:** ${clip(text.trim(), MAX_TEXT_CHARS)}\n`);
      for (const tool of tools) out.push(`- ferramenta: ${tool}`);
      if (tools.length > 0) out.push('');
    }
  }
  if (out.length === 0) return null;
  const sessionId = basename(transcriptPath, '.jsonl');
  const date = (firstTimestamp || new Date().toISOString()).slice(0, 10);
  const name = `${date}_${sessionId.slice(0, 8)}.md`;
  const header = `# Sessão ${sessionId.slice(0, 8)} (${date})\n\nExportada de \`${basename(transcriptPath)}\` por \`.claude/hooks/save-transcript.mjs\`. Resultados de ferramentas omitidos.\n\n`;
  writeFileSync(join(outDir, name), header + out.join('\n') + '\n');
  return name;
}

function projectTranscriptsDir() {
  const encoded = projectDir.replace(/[^a-zA-Z0-9]/g, '-');
  return join(homedir(), '.claude', 'projects', encoded);
}

function readStdin() {
  return new Promise((resolve) => {
    if (process.stdin.isTTY) return resolve('');
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => (data += chunk));
    process.stdin.on('end', () => resolve(data));
  });
}

try {
  mkdirSync(outDir, { recursive: true });
  if (process.argv.includes('--all')) {
    const dir = projectTranscriptsDir();
    if (!existsSync(dir)) {
      console.error(`Nenhum transcript encontrado em ${dir}`);
      process.exit(1);
    }
    const files = readdirSync(dir).filter((f) => f.endsWith('.jsonl'));
    for (const file of files) {
      const name = convert(join(dir, file));
      if (name) console.log(`docs/ai/sessions/${name}`);
    }
  } else {
    const input = JSON.parse((await readStdin()) || '{}');
    if (input.transcript_path && existsSync(input.transcript_path)) convert(input.transcript_path);
  }
} catch (error) {
  console.error(`save-transcript: ${error.message}`);
}
process.exit(0);
