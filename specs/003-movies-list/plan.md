# Implementation Plan: Movies List

**Branch**: `003-movies-list` | **Date**: 2026-10-31 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-movies-list/spec.md`

## Summary

Preencher a view "List" com a tabela de filmes (ID, Year, Title, Winner?), paginada e filtrada no
servidor. A página, o ano e o vencedor vivem em `?page=&year=&winner=` (React Router); um
`useQuery` com chave `{ page, year, winner }` e `keepPreviousData` busca `GET /api/movies` com
`page` (base 0), `size=15` e os filtros presentes, e um mapper valida a página antes da UI. A
tabela usa o `DataTable` da 002 (ganha `columns[].headerControl` e `statusRow`, ambos opcionais) e as mensagens de
carregando/vazio/erro vêm de um `StatusMessage` extraído do `Panel`, de modo que os filtros no
cabeçalho continuam visíveis em todos os estados. Um componente novo `Pagination` em `shared/ui`
faz a navegação. `parseYear` sobe para `shared/lib` (a Lista não pode importar do Dashboard).
Nenhuma dependência nova.

## Technical Context

**Language/Version**: TypeScript 5.9 (strict), Node >= 22

**Primary Dependencies**: React 19, React Router 8 (`useSearchParams`), TanStack Query 5
(`keepPreviousData`). Nenhuma dependência nova.

**Storage**: N/A (server state só no TanStack Query; página e filtros na URL; rascunho do campo de
ano em `useState`)

**Testing**: Vitest + Testing Library + MSW (unitário e componente); Playwright (3 jornadas E2E)

**Target Platform**: Navegadores modernos, desktop e tablet (>= 768x1280)

**Project Type**: SPA web (Vite)

**Performance Goals**: 1 consulta por combinação página/filtros; primeira página em até 2 s (SC-001);
sem requisição com valor inválido ou parcial de ano

**Constraints**: Sem rolagem horizontal em 768x1280 e 1440x900; UI em inglês; conteúdo da API só
como texto; sem estilos inline nem valores mágicos (tokens); `size` fixo em 15

**Scale/Scope**: 1 view, 1 endpoint (GET paginado), 3 parâmetros de URL, 2 componentes
compartilhados novos (`Pagination`, `StatusMessage`), 1 alterado (`DataTable`), 1 refatorado
(`Panel`)

Nenhum item `NEEDS CLARIFICATION` pendente (ver `research.md`). O item adiado na spec (tamanho da
janela de páginas) foi decidido em R5: 5 números.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Artigo | Tema | PASS/FAIL | Evidência / justificativa |
|--------|------|-----------|---------------------------|
| I | Estrutura (`features/<name>/{api,model,ui}`, `shared/`) | PASS | `features/list/` ganha `api/`, `model/` e `ui/` (mais `testing/`, fora do bundle de produção, como na 002). `Pagination`, `StatusMessage` e `parseYear` vão para `shared/` por serem genéricos. A Lista não importa do Dashboard; `app/` só compõe. |
| II | Dados (TanStack Query, filtros/página na URL) | PASS | Um `useQuery` por combinação (`moviesKeys.list`); `keepPreviousData` é opção do próprio Query, sem cache paralelo nem store. Página e filtros só na URL (R2); o rascunho do campo de ano é estado de UI, não de servidor nem derivado (R3). |
| III | Contrato HTTP (cliente tipado, mapper, OpenAPI) | PASS | `httpClient.get` devolve `unknown`; `mapMoviesPage` valida o formato (falha vira `ApiError('parse')`). Divergências reais registradas abaixo e em `docs/api-divergences.md`. |
| IV | Estados da UI (carregando, vazio, erro, sucesso) | PASS | `getPanelStatus` + `StatusMessage` em `statusRow`: carregando (`role="status"`), vazio ("No movies found."), erro (`role="alert"` + "Try again") e sucesso; filtros sempre visíveis; lista anterior mantida (e `aria-busy`) durante a troca. |
| V | Tipagem (strict, sem `any`, tipos em arquivos próprios) | PASS | `movies.types.ts`, `Pagination.types.ts`, `StatusMessage.types.ts`; respostas `unknown` + guards (`expectBoolean` novo); sem `any`. |
| VI | Estratégia de testes (pirâmide sem redundância) | PASS | Matriz abaixo: cada critério em um nível; 3 E2E com risco declarado no título; asserções de estado saem de `Panel.test` ao ir para `StatusMessage.test` (sem duplicar). |
| VII | Acessibilidade e layout (768x1280, UI em inglês) | PASS | `h1` "List movies", `table` com `caption` e `th scope="col"`, controles com rótulo ("Filter by year", "Filter by winner"), `nav` "Pagination" com `aria-current`, nomes acessíveis e botões sem destino com `aria-disabled` (não `disabled`, para não perderem o foco, R5), mensagens com `role`, foco preservado (R5, R6), tudo operável por teclado; janela de 5 páginas cabe em 768 px. |
| VIII | Uso de IA (specify → plan → tasks, registro em `docs/ai/`) | PASS | Specify, clarify e plan feitos; tasks revisadas pelo James antes de implementar; registro via `ai-interaction-log`. |
| IX | Composição, renderização e segurança | PASS | Query e página derivadas da URL no render (sem `useState` espelho); o único `useEffect` é o de foco (R6), não busca dados; sem `memo`/`useMemo`/`useCallback`; `key` por `id`; sem `dangerouslySetInnerHTML`; filtros usam `useListParams` em vez de props encadeadas. |
| X | Componentização e reutilização | PASS | `Pagination` e `StatusMessage` apresentacionais e testados; `DataTable` estendido só por duas props opcionais de slot (`columns[].headerControl`, `statusRow`), sem prop de variação (as listras do anexo 2 vêm de composição na feature, R9); `Panel` reutiliza `StatusMessage`; estilos em CSS Modules + tokens novos; `parseYear` extraído por ter 2 usos. |

Restrições de tecnologia: PASS. Dependências fora da stack aprovada: nenhuma. Considerado e
recusado: biblioteca de paginação ou de tabela (TanStack Table), pelo custo de bundle para uma
tabela sem ordenação, e `use-debounce` (sem debounce, ver R3).

### Divergências API real × OpenAPI (Art. III)

Detalhe em [`docs/api-divergences.md`](../../docs/api-divergences.md); resumo, verificado em
2026-10-31 contra `https://challenge.outsera.tech/api/movies`:

- A página Spring (`content`, `totalPages`, `number`, `size`...) coincide com o OpenAPI.
- `page` além do total devolve `200` com `content: []`; `year` sem indicados também devolve `200 []`.
- `year` não numérico devolve `400` com `{detail, instance, status: 400, title}` (`status` numérico,
  o OpenAPI diz enum de string; já registrado na 001).
- `page < 0` e `size < 1` devolvem `500` com corpo `{status: "500 INTERNAL_SERVER_ERROR", timestamp,
  message}`, formato diferente do `ApiErrorResponse`. O app nunca envia esses valores (R2) e usa só o
  status HTTP.

### Matriz de testes (Art. VI)

| Critério de aceite | Nível (unitário / componente / E2E) | Arquivo |
|--------------------|-------------------------------------|---------|
| FR-001 / FR-002 / FR-017 / SC-004: `mapMoviesPage` devolve `movies` e `totalPages` sem alterar valores nem ordem; item sem `winner` booleano, `content` não-lista e `totalPages` ausente lançam `ApiError` `parse` | Unitário | `src/features/list/model/mappers.test.ts` |
| FR-008 / FR-011 / FR-012 / US3-4 / US3-5 / SC-007: `parseMoviesQuery` aceita `page` inteiro >= 1 até o limite; ignora `page` zero, negativa, decimal, texto e acima de `MAX_PAGE`, `year` fora de 4 dígitos e `winner` diferente de `true`/`false`; estado padrão = `{ page: 1 }` | Unitário | `src/features/list/model/moviesQuery.test.ts` |
| FR-003 / FR-004 / FR-008 / FR-011: `toApiParams` envia `page - 1` e `size=15` e omite filtros ausentes; `toSearchParams` omite `page=1`, `year` e `winner` ausentes (URL padrão sem parâmetros) | Unitário | `src/features/list/model/moviesQuery.test.ts` |
| FR-009 / US2-7 / US2-8: `classifyYearInput` separa `empty`, `partial` (1 a 3 dígitos), `valid` (com `trim`) e `invalid` (letras, decimal, negativo, 5 dígitos ou mais) | Unitário | `src/features/list/model/yearFilter.test.ts` |
| Refatoração (R10): `parseYear` aceita só `^\d{4}$` após `trim` e `null`/`undefined` viram `undefined` (teste movido, sem duplicata) | Unitário | `src/shared/lib/year.test.ts` |
| Guarda `expectBoolean` aceita booleano e rejeita número, texto e nulo | Unitário | `src/shared/api/guards.test.ts` |
| FR-006: `getPageWindow` devolve até 5 números centrados, deslocados nas pontas, limitados pelo total, e a janela final quando a página está além do total | Unitário | `src/shared/ui/Pagination/pageWindow.test.ts` |
| FR-005 / FR-006 / FR-015 / FR-020 / SC-002: `Pagination` tem `nav` "Pagination", botões "First page", "Previous page", "Page N", "Next page", "Last page"; `aria-current` só na atual; First/Previous sem destino na página 1 e Next/Last na última, marcados com `aria-disabled="true"` (continuam focáveis, não usam o atributo `disabled`) e o clique neles não chama `onPageChange`; cada botão com destino chama `onPageChange` com o destino certo; página além do total: nenhuma atual, Previous e Last levam a páginas válidas; uma só página deixa todos sem destino | Componente | `src/shared/ui/Pagination/Pagination.test.tsx` |
| FR-013 / FR-014 / FR-016 (UI): `StatusMessage` mostra "Loading…" com `role="status"`, o erro com `role="alert"` e "Try again" (`onRetry`, `retryRef`) e a mensagem de vazio; mover para cá as asserções de estado hoje em `Panel.test` | Componente | `src/shared/ui/StatusMessage/StatusMessage.test.tsx` |
| Refatoração: `Panel` mostra título, `controls` em todos os estados e delega os estados ao `StatusMessage` (sem repetir as asserções de texto) | Componente | `src/shared/ui/Panel/Panel.test.tsx` (ajuste) |
| FR-007 / FR-013 / Art. X: `columns[].headerControl` renderiza o nó dentro do `th` daquela coluna (e só dela); `statusRow` mostra uma linha com `colSpan` no lugar das linhas de dados e de `emptyMessage` e mantém o cabeçalho e os controles; sem as props novas a saída é a de antes (a regressão é provada pelos testes existentes do `DataTable` e do Dashboard, sem teste novo) | Componente | `src/shared/ui/DataTable/DataTable.test.tsx` (acréscimo) |
| FR-001 / FR-002 / FR-004 / US1-1 / US1-6: abrir a Lista mostra "List movies", tabela com ID, Year, Title e Winner?, 15 linhas da página 1 com "Yes"/"No" e a requisição `page=0&size=15` sem `year`/`winner` | Componente (MSW) | `src/features/list/ui/ListPage.test.tsx` |
| FR-003 / FR-005 / US1-2..5: next, previous, first, last e número de página trocam a tabela e a página destacada e enviam o `page` certo | Componente (MSW) | `src/features/list/ui/ListPage.test.tsx` |
| FR-007 / FR-008 / US2-1..3 / SC-004: ano de 4 dígitos, "Yes" e "No" e as combinações enviam `year`/`winner` à API; todas as linhas exibidas satisfazem aos filtros e a paginação reflete o total filtrado | Componente (MSW) | `src/features/list/ui/ListPage.test.tsx` |
| FR-010 / US2-4: mudar qualquer filtro estando na página 3 volta à página 1 (URL sem `page`) | Componente (MSW) | `src/features/list/ui/ListPage.test.tsx` |
| US2-5 / US2-6 / FR-009: esvaziar o ano e voltar o seletor a "Yes/No" removem os filtros e a requisição deixa de levar o parâmetro | Componente (MSW) | `src/features/list/ui/ListPage.test.tsx` |
| FR-009 / US2-7 / US2-8: 1 a 3 dígitos não consultam nem mostram mensagem (lista anterior permanece); texto inválido mostra "Enter a 4-digit year." ligado ao campo (`aria-invalid`, `aria-describedby`, `role="alert"`) e não consulta; o foco continua no campo ao completar o 4º dígito | Componente (MSW) | `src/features/list/ui/ListPage.test.tsx` |
| FR-011 / US3-1 / SC-005: renderizar com `?page=2&year=1981&winner=false` preenche campo, seletor, página atual e tabela (as regras de parâmetro inválido ficam só no teste unitário acima) | Componente (MSW + `MemoryRouter`) | `src/features/list/ui/ListPage.test.tsx` |
| US3-6 / FR-015: `?page=99` mostra "No movies found." com a paginação e "Previous page" leva a uma página com dados | Componente (MSW) | `src/features/list/ui/ListPage.test.tsx` |
| FR-013 / FR-014 / US4-1 / US4-2: carregando mostra "Loading…" com título e filtros; trocar de página mantém a lista anterior com `aria-busy="true"` só no corpo da tabela (filtros e paginação ficam fora) até a resposta | Componente (MSW) | `src/features/list/ui/ListPage.test.tsx` |
| FR-013 / FR-015 / US4-3: combinação sem filmes mostra "No movies found." no lugar das linhas, sem paginação | Componente (MSW) | `src/features/list/ui/ListPage.test.tsx` |
| FR-013 / FR-016 / US4-4..6 / SC-006: falha mostra a mensagem com "Try again" e os filtros; "Try again" repete a mesma consulta (mesma página e filtros); mudar filtro ou página sai do erro sem "Try again" | Componente (MSW) | `src/features/list/ui/ListPage.test.tsx` |
| FR-020 / FR-014 / US4-7: ao acionar "Next page" com sucesso, o botão continua em `document.activeElement` durante o carregamento (tabela e paginação seguem montadas) e depois da resposta; ao chegar na última página por "Next page" (e na primeira por "Previous page"), o botão, agora com `aria-disabled`, mantém o foco | Componente (MSW) | `src/features/list/ui/ListPage.test.tsx` |
| FR-020 / US4-7: falha ao acionar "Next page" move o foco para "Try again" (o botão desmontado não deixa o foco no `body`) | Componente (MSW) | `src/features/list/ui/ListPage.test.tsx` |
| Edge (consulta antiga / troca rápida): uma resposta atrasada de página anterior não sobrescreve a tabela da página mais recente | Componente (MSW) | `src/features/list/ui/ListPage.test.tsx` |
| Edge (voltar pelo menu): a partir de `/list?page=2&winner=true`, o link "List" abre a página 1 sem filtros | Componente | `src/app/App.test.tsx` |
| FR-018: conteúdo da API só como texto | Componente (já provado no teste do `DataTable`, 002; sem teste novo) | `src/shared/ui/DataTable/DataTable.test.tsx` |
| Impacto na 001: o app abre `/list` com o título "List movies" e a consulta mockada | Componente | `src/app/App.test.tsx` (ajuste, ver "Impactos") |
| FR-011 / US3-1..3 / SC-005 / Art. II: filtros e página na URL, recarregar e botão voltar restauram controles e tabela em navegador real | E2E | `e2e/list.spec.ts` — "list URL: filters and page survive reload and back (router + history + query)" |
| FR-003 / FR-008 / SC-003 / SC-004: digitar o ano e escolher "Yes" envia à API `page=0&size=15&year=...&winner=true` na requisição real do navegador (paginação, filtros e cliente HTTP juntos) | E2E | `e2e/list.spec.ts` — "list request: year and winner filters reach the API as query params (UI + http client + query key)" |
| FR-019 / SC-008 / US5-1 / US5-2: título, filtros no cabeçalho, 15 linhas e paginação visíveis em 1440x900 e em 768x1280 sem rolagem horizontal; título longo sem espaços não estoura a tabela (CSS real) | E2E | `e2e/list.spec.ts` — "real CSS layout: filters in the header, full pagination and no horizontal scroll at 768 and 1440" |
| FR-021: textos em inglês | Revisão de código (sem teste dedicado) | n/a |
| SC-001: primeira página em até 2 s | Verificação manual (`quickstart.md`) | n/a |
| SC-009 / US5-3 (foco visível, teclado, axe) | Parcial: papéis e rótulos nos testes de componente; foco visível e axe do navegador na verificação manual (`quickstart.md`). Sem dependência nova (axe-core está fora da stack) | n/a |

Cada critério aparece em um único nível. O E2E não repete estados da lista, validação do ano nem
formatação (provados nos testes de componente); só o que exige navegador real. Os dois E2E de
URL/requisição não se sobrepõem: o primeiro prova a restauração pela URL e pelo histórico; o
segundo, o que sai do navegador para a API.

## Project Structure

### Documentation (this feature)

```text
specs/003-movies-list/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── movies-api.md
│   └── ui-components.md
├── checklists/requirements.md
└── tasks.md             # /speckit-tasks (não criado aqui)
```

### Source Code (repository root)

```text
src/
├── app/App.test.tsx                      # ajustado (heading "List movies" + handlers da Lista)
├── features/list/
│   ├── api/
│   │   ├── moviesApi.ts                  # fetchMovies: httpClient.get('', { params }) + mapper
│   │   ├── moviesKeys.ts                 # moviesKeys.list(query)
│   │   └── useMovies.ts                  # useQuery + keepPreviousData
│   ├── model/
│   │   ├── movies.types.ts               # Movie, MoviesPage, MoviesQuery
│   │   ├── mappers.ts                    # mapMoviesPage (+ mappers.test.ts)
│   │   ├── moviesQuery.ts                # PAGE_SIZE, MAX_PAGE, parseMoviesQuery, toSearchParams, toApiParams (+ test)
│   │   ├── yearFilter.ts                 # classifyYearInput (+ yearFilter.test.ts)
│   │   └── yearFilter.types.ts           # resultado de classifyYearInput
│   ├── testing/
│   │   ├── fixtures.ts                   # 40 filmes + respondToMoviesQuery (também usado pelo E2E)
│   │   └── handlers.ts                   # listHandlers: emula filtro, página e erros da API real
│   └── ui/
│       ├── ListPage.tsx                  # (+ ListPage.test.tsx, ListPage.module.css)
│       ├── useListParams.ts              # URL <-> MoviesQuery
│       ├── YearFilter.tsx                # (+ YearFilter.module.css; sem teste próprio: coberto pela página)
│       └── WinnerFilter.tsx              # (sem teste próprio: coberto pela página)
└── shared/
    ├── api/guards.ts                     # + expectBoolean (+ guards.test.ts)
    ├── lib/year.ts                       # parseYear, movido do Dashboard (+ year.test.ts)
    ├── styles/tokens.css                 # + --color-table-stripe-bg, --color-pagination-disabled, --opacity-busy
    └── ui/
        ├── DataTable/                    # + columns[].headerControl, statusRow (opcionais; sem prop de variação)
        ├── Panel/                        # passa a compor StatusMessage
        ├── StatusMessage/{StatusMessage.tsx, StatusMessage.types.ts, StatusMessage.module.css, StatusMessage.test.tsx}
        └── Pagination/{Pagination.tsx, Pagination.types.ts, pageWindow.ts, pageWindow.test.ts, Pagination.module.css, Pagination.test.tsx}
e2e/
├── list.spec.ts
├── shell-navigation.spec.ts              # ajustado (mockListApi, heading "List movies")
└── support/mockApi.ts                    # + mockListApi (page.route com as fixtures da Lista)
```

**Structure Decision**: mesma SPA das features anteriores. A Lista ganha `api/`, `model/` e `ui/`;
o que é genérico (paginação, mensagens de estado, `parseYear`) sobe para `shared/`, com dois
usos (Panel e Lista) ou o Dashboard como segundo consumidor (Art. X). `YearFilter` e `WinnerFilter`
não têm teste próprio: o comportamento é da página e provado ali (Art. VI).

### Layout

`ListPage` renderiza `<h1>List movies</h1>` e, abaixo, um cartão branco com a tabela de largura
total (envolvida por um wrapper da feature, `ListPage.module.css`, que aplica as listras e centraliza os cabeçalhos),  `YearFilter` e `WinnerFilter` dentro dos `th`,
e a paginação centralizada logo abaixo da tabela, como no anexo 2. Em 768 px a área de conteúdo tem
cerca de 544 px: as quatro colunas cabem (ID e Winner? estreitos, Year e Title flexíveis), a janela
de 5 páginas mais 4 botões de salto cabe em uma linha, e o `title` longo quebra por
`overflow-wrap: anywhere` (já no `DataTable`). Sem breakpoint novo.

### Impactos em arquivos existentes

- `src/features/list/ui/ListPage.tsx`: deixa de ser só `<h1>List</h1>`; o título vira "List movies".
- `src/app/App.test.tsx`: os testes que abrem `/list` esperam o heading "List movies" e usam
  `server.use(...listHandlers)` (o `setup.ts` falha requisição sem handler).
- `e2e/shell-navigation.spec.ts`: os testes que abrem `/list` esperam "List movies" e passam a
  chamar `mockListApi(page)`; a regex de heading deixa de ser exata.
- `src/features/dashboard/**`: imports de `parseYear` passam para `shared/lib/year`;
  `features/dashboard/model/year.ts` fica só com `YEAR_PARAM`; teste de `parseYear` movido.
- `src/shared/ui/Panel/*`: refatorado para usar `StatusMessage` (comportamento igual; `Panel.test`
  enxuto, asserções de estado movidas).
- `src/shared/ui/DataTable/*`: `columns[].headerControl` e `statusRow`, ambos opcionais; o Dashboard não passa nenhum dos dois e não muda (seus testes seguem verdes, sem teste novo).
- `src/shared/styles/tokens.css`: 2 tokens novos.
- `docs/api-divergences.md`: seção da Lista. `README.md`: seção da Lista e dos parâmetros de URL.
  `CLAUDE.md` não muda (nenhum script novo).

## Decisões de plan que a spec deixou abertas

- **Tamanho da janela de páginas**: 5 números (R5).
- **Estados dentro da tabela**: `StatusMessage` extraído do `Panel` + `statusRow` no `DataTable` (R4).
- **Listras e cabeçalhos centralizados**: composição na feature (wrapper com CSS Modules), não prop do `DataTable` (R9, revisão do James).
- **Histórico**: cada mudança de página ou filtro faz `push`; esvaziar o ano também (voltar restaura).
- **Foco no erro**: efeito que foca "Try again" só se o foco caiu no `body` (R6).
- **Parâmetro de URL**: `page` (base 1), `year`, `winner=true|false`; `MAX_PAGE = 1_000_000`.
- **Mensagens** (inglês): erro "Could not load this data."; vazio "No movies found."; carregando
  "Loading…"; validação "Enter a 4-digit year."; rótulos "Filter by year" e "Filter by winner";
  `caption` da tabela "Movies"; `aria-label` da navegação "Pagination".
- **Ordem de implementação sugerida** (para `/speckit-tasks`): (1) **refatoração do `DataTable`**
  (`columns[].headerControl` e `statusRow`; tarefa e commit próprios, antes de qualquer tarefa da Lista;
  testes novos só para essas duas props e os testes do `DataTable` e do Dashboard verdes); (2) mover
  `parseYear`; (3) `expectBoolean`; (4) extrair `StatusMessage`; (5) `getPageWindow` e `Pagination`;
  (6) modelo da Lista (tipos, mapper, query de URL, ano); (7) API, fixtures e handlers; (8)
  `useListParams` e `ListPage` com leitura e tabela; (9) paginação; (10) filtros; (11) estados e foco;
  (12) estilos e layout (listras e centralização no wrapper da Lista); (13) ajustes da 001; (14) E2E;
  (15) README e docs.

## Complexity Tracking

Sem violações. Nenhuma justificativa necessária.
