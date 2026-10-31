# Outsera Razzies: instruções para o agente

App React + TypeScript que lê a API do Golden Raspberry Awards (Pior Filme) e mostra
um Dashboard e uma Lista de filmes. Requisitos em `docs/requirements/challenge.md`.

## Fonte de verdade, em ordem

1. `.specify/memory/constitution.md` (prevalece sobre tudo abaixo)
2. A spec, o plan e as tasks da feature atual em `specs/<feature>/`
3. Este arquivo
4. `docs/requirements/challenge.md` e o OpenAPI da API

Se houver conflito, pare e pergunte. Não invente requisito.

## Fluxo de trabalho (Spec Kit)

Toda feature segue: `/speckit-specify` → `/speckit-clarify` → `/speckit-plan` →
`/speckit-tasks` → `/speckit-analyze` → `/speckit-implement`.

- Não implemente nada sem `tasks.md` revisado pelo James.
- No `plan.md`, mantenha o Constitution Check com PASS/FAIL por artigo e a matriz
  "Critério de aceite → nível de teste → arquivo".
- Implemente uma tarefa por vez. Uma tarefa = um commit, com teste junto.

## Stack

Vite, React, TypeScript (strict), React Router, TanStack Query, CSS Modules, Vitest,
Testing Library, MSW, Playwright, ESLint, Prettier. Qualquer dependência fora dessa lista
precisa de justificativa no `plan.md` (problema, alternativas, custo de bundle).

## Comandos

Mantenha esta seção atualizada quando os scripts mudarem.

- `npm run dev`: servidor local
- `npm run build`: `tsc -b` + build de produção
- `npm run lint`: ESLint
- `npm run typecheck`: `tsc -b --noEmit`
- `npm test`: Vitest (uma execução)
- `npm run test:watch`: Vitest em modo watch
- `npm run test:coverage`: cobertura (v8)
- `npm run test:e2e`: Playwright (config mínima em `playwright.config.ts`; `e2e/` ainda sem testes)
- `npm run format` / `npm run format:check`: Prettier

Antes de dizer que algo está pronto: `npm run lint && npm run typecheck && npm test`.
O CI (`.github/workflows/ci.yml`) roda format:check, lint, typecheck, test e build em push e PR.
O `test:e2e` entra no CI quando existir a primeira jornada E2E (Art. VI da constitution).

Testes: `src/test/` tem o servidor MSW (`server.ts`, `handlers.ts`), o `setup.ts` (requisição
sem handler falha o teste) e `renderWithProviders`. ESLint está fixado na 9.x porque
`eslint-plugin-react` e `eslint-plugin-jsx-a11y` ainda não suportam a 10 (ver `docs/tooling.md`).

## Convenções

- Código, nomes de arquivos, commits e textos da UI em inglês (os anexos estão em inglês).
- Documentação em `docs/` em português.
- Conventional Commits (`feat:`, `fix:`, `test:`, `docs:`, `chore:`, `refactor:`).
- Componentes pequenos; lógica de dados em hooks e mappers, não no JSX.

## Skills e agentes do projeto

- Skills em `.claude/skills/`: `frontend-engineering`, `test-engineering`,
  `review-pull-request`, `focused-bug-resolution`, `ai-interaction-log`, além das
  `speckit-*` instaladas pelo Spec Kit.
- Agentes em `.claude/agents/`: `frontend-implementer`, `test-engineer`, `code-reviewer`.
- Use a skill mais específica para a tarefa. Sem necessidade, não crie subagentes.

## Registro para o avaliador

O uso de IA é avaliado. Os hooks em `.claude/settings.json` gravam os prompts em
`docs/ai/prompts.md` e as sessões em `docs/ai/sessions/`. Além disso:

- Ao terminar uma fase do Spec Kit, use a skill `ai-interaction-log` para registrar
  o resumo da fase em `docs/ai/README.md`.
- Quando o James rejeitar ou corrigir uma proposta sua, registre em `docs/ai/decisions.md`.
- Nunca grave segredos, tokens ou dados pessoais nesses arquivos.
