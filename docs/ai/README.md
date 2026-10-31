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
