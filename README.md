# Outsera Razzies

SPA em React + TypeScript que lista indicados e vencedores da categoria **Pior Filme** do
Golden Raspberry Awards, consumindo `https://challenge.outsera.tech/api/movies`. Tem duas telas:

- **Dashboard** (`/dashboard`): anos com mais de um vencedor, top 3 estúdios, produtores com
  maior e menor intervalo entre vitórias e vencedores de um ano buscado.
- **Lista** (`/list`): tabela de filmes (ID, Year, Title, Winner?) com paginação e filtros por
  ano e por vencedor.

**App publicado:** https://outsera-razzies.vercel.app/dashboard (deploy na Vercel).

Requisitos do desafio: [`docs/requirements/challenge.md`](docs/requirements/challenge.md).
Regras do projeto: [`.specify/memory/constitution.md`](.specify/memory/constitution.md).

## Sumário

- [Requisitos](#requisitos)
- [Instalação](#instalação)
- [Como rodar](#como-rodar)
- [Testes e cobertura](#testes-e-cobertura)
- [Rotas](#rotas)
- [Estrutura de pastas](#estrutura-de-pastas)
- [Decisões técnicas](#decisões-técnicas)
- [Por que Spec Kit](#por-que-spec-kit)
- [Uso de IA](#uso-de-ia)
- [Guia dos logs de IA](#guia-dos-logs-de-ia)

## Requisitos

- **Node 22 ou superior** (`engines.node` no `package.json`; o CI usa Node 22).
- npm (vem com o Node).
- Para o E2E: Chromium do Playwright (instalação abaixo).

## Instalação

```bash
npm install
cp .env.example .env
```

A URL da API vem de `VITE_API_BASE_URL`. O `.env.example` já traz o valor padrão:

```text
VITE_API_BASE_URL=https://challenge.outsera.tech/api/movies
```

Variáveis `VITE_*` vão para o bundle do navegador, então não coloque segredo nelas. Se a variável
não estiver definida, o app usa o valor padrão acima.

## Como rodar

```bash
npm run dev       # servidor local em http://localhost:5173
npm run build     # tsc -b + build de produção em dist/
npm run preview   # serve o build de produção
```

Outros scripts: `npm run lint`, `npm run typecheck`, `npm run format` e `npm run format:check`.

## Testes e cobertura

```bash
npm test                # Vitest, uma execução (unitário e componente, API mockada com MSW)
npm run test:watch      # Vitest em modo watch
npm run test:coverage   # cobertura (v8)
npx playwright install chromium   # só na primeira vez
npm run test:e2e        # Playwright, em 1440x900 e 768x1280, com a API mockada
```

**Ver a cobertura:** `npm run test:coverage` imprime a tabela no terminal e gera
`coverage/index.html` (abra no navegador) e `coverage/lcov.info`. A pasta `coverage/` não é
versionada. Ficam fora da conta: `src/test/`, os arquivos de teste, `src/main.tsx` e os
`*.types.ts`.

Antes de considerar algo pronto: `npm run lint && npm run typecheck && npm test`. O CI
(`.github/workflows/ci.yml`) roda `format:check`, `lint`, `typecheck`, `test`, `build` e
`test:e2e` em push e PR.

Estratégia (Art. VI da constitution): pirâmide sem redundância. Regra de negócio e mappers em
teste unitário, comportamento de telas em Testing Library + MSW, e Playwright só para jornadas.
Uma requisição sem handler no MSW falha o teste. Cada `plan.md` traz a matriz
"critério de aceite → nível de teste → arquivo".

## Rotas

| Rota           | Tela                                               |
| -------------- | -------------------------------------------------- |
| `/`            | Redireciona para `/dashboard`                      |
| `/dashboard`   | Dashboard (`?year=YYYY` opcional)                  |
| `/list`        | Lista de filmes (`?page=&year=&winner=` opcionais) |
| qualquer outra | Página "não encontrada"                            |

O estado das telas fica na URL: recarregar a página e usar voltar/avançar restauram filtros,
página e tabela. Parâmetro inválido é ignorado, então a API nunca recebe valor inválido.

### Dashboard

Quatro painéis, cada um com carregando, vazio, erro (com "Try again") e sucesso, de forma
independente: falha ou lentidão em um painel não afeta os outros.

| Painel                                                    | Endpoint                         |
| --------------------------------------------------------- | -------------------------------- |
| List years with multiple winners                          | `/yearsWithMultipleWinners`      |
| Top 3 studios with winners                                | `/studiosWithWinCount`           |
| Producers with longest and shortest interval between wins | `/maxMinWinIntervalForProducers` |
| List movie winners by year                                | `/winnersByYear?year=YYYY`       |

Os dados vêm de endpoints agregados; o app só corta o top 3 de estúdios, sem recalcular
contagens nem intervalos. A busca por ano só dispara com 4 dígitos.

### Lista de filmes

15 filmes por página (`PAGE_SIZE`). O app envia `page` (base 0 na API, base 1 na URL), `size=15`
e só os filtros presentes; não filtra nem reordena nada no cliente.

| Parâmetro | Valores                           | O que faz                                                     |
| --------- | --------------------------------- | ------------------------------------------------------------- |
| `page`    | inteiro de 1 a 1.000.000 (base 1) | Página atual; ausente = página 1                              |
| `year`    | 4 dígitos (ex.: `1981`)           | Filtra por ano; o filtro roda ao completar o 4º dígito        |
| `winner`  | `true` ou `false`                 | Só vencedores ou só quem não venceu; ausente = Yes/No (todos) |

Mudar qualquer filtro volta à página 1. Diferenças entre a API real e o OpenAPI estão em
[`docs/api-divergences.md`](docs/api-divergences.md).

## Estrutura de pastas

```text
.
├── .claude/             # agentes, skills, hooks e settings do Claude Code
├── .github/workflows/   # CI (ci.yml)
├── .specify/            # Spec Kit: constitution, templates, scripts
├── docs/
│   ├── ai/              # registro do uso de IA (ver "Guia dos logs de IA")
│   ├── requirements/    # desafio, OpenAPI e anexos
│   ├── api-divergences.md
│   └── tooling.md       # justificativa das ferramentas fora da stack base
├── e2e/                 # jornadas Playwright (dashboard, list, navegação)
├── specs/               # uma pasta por feature: spec, plan, tasks, contracts
│   ├── 001-app-shell/
│   ├── 002-dashboard/
│   └── 003-movies-list/
└── src/
    ├── app/             # App, rotas, providers, página "não encontrada"
    ├── features/
    │   ├── dashboard/   # api/ (chamadas e hooks), model/ (mappers, tipos), ui/, testing/
    │   └── list/        # idem
    ├── shared/
    │   ├── api/         # cliente HTTP tipado, erros, guards, QueryClient, config
    │   ├── lib/         # utilitários puros (ex.: validação de ano)
    │   ├── styles/      # tokens e CSS global
    │   └── ui/          # AppShell, NavMenu, Panel, DataTable, Pagination, StatusMessage
    └── test/            # servidor MSW, handlers, setup e renderWithProviders
```

Cada feature segue `api/` + `model/` + `ui/` (Art. I). Fixtures e handlers MSW de cada feature
ficam em `testing/` e são reaproveitados pelos testes de componente e pelo E2E.

## Decisões técnicas

- **Stack:** Vite, React 19, TypeScript strict, React Router, TanStack Query, CSS Modules,
  Vitest, Testing Library, MSW, Playwright, ESLint e Prettier. Qualquer dependência fora dessa
  lista precisa de justificativa (ver [`docs/tooling.md`](docs/tooling.md)).
- **Server state só no TanStack Query**, sem store global nem cache paralelo. Filtros, página e
  ano buscado vivem na URL (search params), o que dá link compartilhável e voltar/avançar.
- **Contrato HTTP:** cliente tipado, e todo payload cru passa por um mapper em `model/` com
  guards manuais antes de chegar à UI. O OpenAPI é a referência; onde a API real diverge, o app
  valida o formato e a divergência fica documentada.
- **Sem lógica de negócio no cliente:** o Dashboard usa os endpoints agregados e a Lista deixa
  paginação e filtro para o servidor.
- **Estados da UI:** toda tela ou painel assíncrono trata carregando, vazio, erro e sucesso.
  Erros têm "Try again" e mantêm o foco coerente.
- **Componentização:** `Panel`, `DataTable` e `Pagination` em `shared/ui`; lógica em hooks e
  mappers, não no JSX. Sem `dangerouslySetInnerHTML` e sem `key` por índice (lint).
- **Acessibilidade e layout:** HTML semântico, labels, teclado, foco visível, `aria-disabled` na
  paginação; funciona a partir de 768x1280 (o E2E roda em 1440x900 e 768x1280).
- **ESLint na 9.x:** `eslint-plugin-react` e `eslint-plugin-jsx-a11y` ainda não suportam a 10.
- **TypeScript 5.9** fixado por compatibilidade com o `typescript-eslint`.
- **Idioma:** código, commits e textos da UI em inglês; documentação em `docs/` em português.
  Commits seguem Conventional Commits, uma tarefa por commit, com teste junto.

## Por que Spec Kit

O desafio é pequeno, mas o uso de IA também é avaliado. Deixar o agente "ir escrevendo" gera
código sem rastro de decisão. O [Spec Kit](https://github.com/github/spec-kit) (Spec-Driven
Development) inverte a ordem: primeiro se escreve o que construir e por quê, e só depois o código.

- **Requisito vira artefato revisável.** Cada feature passa por
  `/speckit-specify` → `/speckit-clarify` → `/speckit-plan` → `/speckit-tasks` →
  `/speckit-analyze` → `/speckit-implement`, e cada etapa produz um arquivo em `specs/<feature>/`
  que eu leio e aprovo antes da próxima.
- **A constitution limita a IA.** As regras (estrutura, dados, contrato, estados, testes,
  acessibilidade) ficam em um arquivo e o `plan.md` precisa passar por um Constitution Check com
  PASS/FAIL por artigo.
- **Ambiguidade aparece cedo.** O `clarify` e o `analyze` acharam inconsistências (testes
  duplicados entre níveis, critério de sucesso falso) antes de haver código para refazer.
- **Tarefas pequenas e rastreáveis.** O `tasks.md` quebra a feature em tarefas de um commit,
  com teste junto; nada é implementado antes de eu revisá-lo.
- **Auditável.** Spec, plan, tasks e decisões ficam no repositório, ligando cada critério de
  aceite a um teste.

Versão usada: **Spec Kit 1.2.5**, integração `claude`, scripts `sh`
(`.specify/init-options.json`).

## Uso de IA

O projeto foi desenvolvido com Claude Code seguindo Spec-Driven Development, com Spec Kit
**1.2.5**. A IA trabalhou dentro de regras minhas (constitution, specs, skills e agentes) e todo
código passou por revisão, lint, typecheck e testes antes do commit.

O registro completo, com a linha do tempo por feature e fase, os princípios seguidos e as
ferramentas usadas, está em **[`docs/ai/README.md`](docs/ai/README.md)**.

Apoio no projeto:

- **Skills** (`.claude/skills/`): `frontend-engineering`, `test-engineering`,
  `review-pull-request`, `focused-bug-resolution`, `ai-interaction-log` e as `speckit-*`.
- **Agentes** (`.claude/agents/`): `frontend-implementer`, `test-engineer`, `code-reviewer`.
- **Hooks** (`.claude/settings.json`): gravam prompts e sessões automaticamente.

## Guia dos logs de IA

Tudo fica em [`docs/ai/`](docs/ai/). Para o avaliador, a ordem sugerida de leitura é:

| Arquivo                                        | O que tem                                                                                                                   | Como é gerado                                                        | Quando abrir                          |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------- |
| [`docs/ai/README.md`](docs/ai/README.md)       | Visão geral e **linha do tempo** por feature e fase do Spec Kit                                                             | Manual, skill `ai-interaction-log`                                   | Comece por aqui                       |
| [`docs/ai/decisions.md`](docs/ai/decisions.md) | Cada vez que corrigi ou rejeitei uma proposta da IA: proposta, decisão, motivo e onde                                       | Manual                                                               | Para ver o julgamento humano          |
| [`docs/ai/reviews/`](docs/ai/reviews/)         | Code review por feature (`001`, `002`, `003`) e o destino de cada achado                                                    | Agente `code-reviewer` + minha decisão                               | Para ver como a qualidade foi checada |
| [`docs/ai/prompts.md`](docs/ai/prompts.md)     | Todos os prompts enviados, em ordem, com data e id da sessão                                                                | Automático, hook `UserPromptSubmit` (`.claude/hooks/log-prompt.mjs`) | Para ver o que foi pedido             |
| [`docs/ai/sessions/`](docs/ai/sessions/)       | Transcrição de cada sessão (`AAAA-MM-DD_<id>.md`): prompts, respostas e ferramentas usadas, sem o resultado das ferramentas | Automático, hook `SessionEnd` (`.claude/hooks/save-transcript.mjs`)  | Para ver o que a IA fez passo a passo |

Como cruzar os registros:

1. Em `prompts.md`, cada entrada traz `sessão <id>` (8 primeiros caracteres). Esse id é o sufixo
   do arquivo em `sessions/`, por exemplo `sessão 6f04bfd0` → `sessions/2026-11-01_6f04bfd0.md`.
2. Na linha do tempo do `docs/ai/README.md`, cada fase aponta o artefato gerado
   (`specs/<feature>/...`) e os commits correspondentes (`git show <hash>`).
3. Em `decisions.md`, cada decisão aponta o arquivo ou commit afetado.

Os logs nunca guardam segredos, tokens ou dados pessoais. O `.env` não é versionado.
