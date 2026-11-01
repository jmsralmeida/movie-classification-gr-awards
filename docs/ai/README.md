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
| 2026-10-31 | 001-app-shell | specify | `/speckit-specify` | `specs/001-app-shell/spec.md`, `checklists/requirements.md` | Defini o escopo (cabeçalho, menu, rotas vazias, cliente HTTP com host em variável pública, QueryClient, página não encontrado, layout do anexo 1, 768x1280); a IA não deixou marcadores de clarificação e o checklist de qualidade passou |
| 2026-10-31 | 001-app-shell | clarify | `/speckit-clarify` | `specs/001-app-shell/spec.md` (seção Clarifications) | Duas perguntas: escolhi "Outsera Razzies" como título, contra a recomendação da IA ("Frontend React Test"), e aceitei que o cliente só garante JSON válido, com a conferência dos campos no mapper de cada feature |
| 2026-10-31 | 001-app-shell | plan | `/speckit-plan` | `specs/001-app-shell/plan.md`, `research.md`, `data-model.md`, `quickstart.md`, `contracts/` | A IA conferiu a API real contra o OpenAPI (divergência no corpo de erro registrada em `research.md`); sem dependência nova; Constitution Check e matriz de testes gerados |
| 2026-10-31 | 001-app-shell | tasks | `/speckit-tasks` | `specs/001-app-shell/tasks.md` | 22 tarefas por user story, uma por commit, com teste junto; revisadas na etapa seguinte (analyze) |
| 2026-10-31 | 001-app-shell | analyze | `/speckit-analyze` | relatório no chat; ajustes em `spec.md`, `plan.md`, `research.md`, `tasks.md` | Aprovei o desvio do Art. I (features só com `ui/`), exigi `end` no `NavLink`, cabeçalho fixo, título e links afirmados no teste do app real, e removi uma tarefa; ficaram 21 tarefas |
| 2026-10-31 | 001-app-shell | implement | `/speckit-implement` com o agente `frontend-implementer` | T001 a T018 em commits separados na branch `001-app-shell` (último: `d6ad39c`) | Pedi a execução por agente, com commits pequenos e lógicos; decidi restringir a glob do teste E2E (d) depois que a T016 o quebrou; a T011 (conferência visual contra o anexo 1) ficou pendente para mim |
| 2026-10-31 | 001-app-shell | review | agente `code-reviewer` (T020) | `docs/ai/reviews/001-app-shell.md`; commits `236953c`, `fc5e812`, `1bdfae1` | Veredito "aprovar com ressalvas", sem defeito reproduzível; escolhi tratar 3 de 5 achados e adiar os outros dois |
| 2026-10-31 | 002-dashboard | specify | `/speckit-specify` | `specs/002-dashboard/spec.md`, `checklists/requirements.md` | Defini os 4 painéis, o uso dos endpoints agregados (sem cálculo no cliente) e estados independentes por painel; a IA não deixou marcadores de clarificação, registrou em Assumptions que `winnersByYear` devolve lista no OpenAPI (o PDF mostrava um objeto) e o checklist de qualidade passou. Revisão do James da spec ainda pendente |
| 2026-10-31 | 002-dashboard | clarify | `/speckit-clarify` | nenhum (spec inalterada) | A IA varreu a spec pela taxonomia e não encontrou ambiguidade que mude arquitetura, testes ou UX; zero perguntas, checklist de qualidade segue 16/16. Decisões por padrão do specify (ano de 4 dígitos, corte em 3 estúdios, empates) seguem valendo e podem ser revistas pelo James |
| 2026-10-31 | 002-dashboard | plan | `/speckit-plan` | `specs/002-dashboard/plan.md`, `research.md`, `data-model.md`, `quickstart.md`, `contracts/` | A IA conferiu os 4 endpoints na API real contra o OpenAPI (`winnersByYear` devolve lista; ano sem prêmio é `200 []`; ano inválido é 400) e propôs `Panel` e `DataTable<T>` em `shared/ui`, mappers com guards manuais (sem zod) e ano em `?year=`; sem dependência nova; Constitution Check 10/10 PASS e matriz de testes com 3 E2E. Revisão do James pendente
| 2026-10-31 | 002-dashboard | tasks | `/speckit-tasks` | `specs/002-dashboard/tasks.md` | 22 tarefas por user story, uma por commit com teste junto (fatias verticais por painel: mappers e depois API+painel); acrescentei `expectRecord` aos guards do plan. Revisão do James pendente (nenhuma implementação antes dela) |
| 2026-10-31 | 002-dashboard | analyze | `/speckit-analyze` | relatório no chat (somente leitura; nenhum artefato da feature alterado) | 7 achados: 1 crítico (teste duplicado entre níveis, Art. VI), 1 alto (import das fixtures no E2E quebra o `tsc -b` do projeto node), 2 médios (cobertura de edge cases), 3 baixos. Aguardando a decisão do James sobre as correções antes de implementar |
| 2026-10-31 | 002-dashboard | analyze (correções) | edição manual guiada pelo relatório | `specs/002-dashboard/tasks.md`, `plan.md` (matriz), `research.md` (R9) | Aprovei aplicar D1, I1, C1 e C2: removi os testes duplicados entre níveis (Art. VI), o E2E importa as fixtures com extensão `.ts` por causa do `tsconfig.node.json`, e entraram os testes de duplo clique e de nome longo |
| 2026-10-31 | 002-dashboard | implement | `/speckit-implement` com o agente `frontend-implementer` | T001 a T019 em commits separados na branch `002-dashboard` (de `8f74d78` a `129e93f`); T020 verde (lint, typecheck, 167 testes, build, 14 E2E) | Pedi a execução por agente; a T022 (conferência manual com a API real e visual contra o anexo 1) ficou pendente para mim |
| 2026-10-31 | 002-dashboard | review | agente `code-reviewer` (T021) | `docs/ai/reviews/002-dashboard.md`; commits `e2c15b3`, `6465f7f`, `3059a9a`, `6a7ce99`, `a8218a2` | Veredito "aprovar com ressalvas"; mandei corrigir 4 de 5 achados e mantive `docs/api-divergences.md`, contra a sugestão de removê-lo |
