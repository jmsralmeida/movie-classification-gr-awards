# Uso de IA neste projeto

Este projeto foi desenvolvido com Claude Code (CLI, no WSL) seguindo Spec-Driven
Development com o [Spec Kit](https://github.com/github/spec-kit). A IA trabalhou dentro
de regras definidas por mim (constitution, specs, skills e agentes) e todo código
gerado passou pela minha revisão, por lint, typecheck e testes antes do commit.

## Como ler este registro

| Arquivo | O que mostra | Como é gerado |
| --- | --- | --- |
| [`prompts.md`](prompts.md) | todos os prompts que enviei ao agente, em ordem | automático, hook `UserPromptSubmit` |
| [`sessions/`](sessions/) | cada sessão completa (prompts, respostas, ferramentas usadas) | automático, hook `SessionEnd` |
| [`decisions.md`](decisions.md) | quando discordei da IA, o que mudei e por quê | manual, skill `ai-interaction-log` |
| [`reviews/`](reviews/) | code reviews por feature e o destino de cada achado | agente `code-reviewer` + minha decisão |
| `../../specs/` | spec, plan, tasks e checklists de cada feature | comandos `/speckit-*` |
| `../../.specify/memory/constitution.md` | as regras que a IA precisou seguir | `/speckit-constitution` |

## Ferramentas, skills e agentes

- **Agente:** Claude Code (CLI).
- **Spec Kit:** integração `claude`; versão registrada no README do projeto.
- **Skills do projeto** (`.claude/skills/`), adaptadas do meu hub pessoal de skills:
  `frontend-engineering`, `test-engineering`, `review-pull-request`,
  `focused-bug-resolution`, `ai-interaction-log`.
- **Agentes** (`.claude/agents/`): `frontend-implementer`, `test-engineer`, `code-reviewer`.

## Princípios que segui

1. Nenhuma linha de feature antes da spec, do plan e das tasks revisados.
2. A IA propõe, eu decido. Rejeições e correções ficam em `decisions.md`.
3. Uma tarefa por commit, sempre com teste.
4. Code review por agente antes de cada merge, com a decisão final minha.

## Linha do tempo

| Data | Feature | Fase | Comando/skill | Artefato | O que revisei ou mudei |
| --- | --- | --- | --- | --- | --- |
| 2026-10-31 | projeto | constitution | `/speckit-constitution` | `.specify/memory/constitution.md` (v1.0.0), `plan-template.md`, `CLAUDE.md` | Adicionei os artigos IX e X, troquei o VI pela estratégia de pirâmide com Playwright, incluí a seção de restrições de tecnologia e pedi o Constitution Check com PASS/FAIL no plan-template |
| 2026-10-31 | projeto | fundação (fora do Spec Kit) | prompt direto, sem skill | `e7b3f1e`, `01547ba` (deps, TypeScript strict, ESLint/Prettier, Vitest + MSW, Playwright mínimo, CI), `docs/tooling.md` | Aprovei a lista de dependências antes da instalação e pedi o Playwright com config mínima; o agente fixou o ESLint na 9.x por incompatibilidade dos plugins `react` e `jsx-a11y` (registrado em `docs/tooling.md`) |
