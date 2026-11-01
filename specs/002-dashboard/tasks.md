---

description: "Task list for Dashboard"
---

# Tasks: Dashboard

**Input**: Design documents from `/specs/002-dashboard/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/ (todos presentes); feature 001 (shell) na branch

**Tests**: Obrigatórios (Constitution Art. VI e Definition of Done). Cada tarefa leva o teste do nível definido na matriz do `plan.md`, no mesmo commit.

**Organization**: Agrupadas por user story. Uma tarefa = um commit (Conventional Commits, texto em inglês), com `npm run lint && npm run typecheck && npm test` verdes antes do commit (e `npm run format:check`; use `npm run format` se falhar).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência pendente). Mesmo assim, o commit é um por tarefa.
- **[Story]**: US1 a US4, conforme `spec.md`.

## Convenções para todas as tarefas

- Caminhos relativos à raiz do repo; estrutura conforme `plan.md` (Project Structure) e contratos em `contracts/`.
- `strict`, sem `any`; tipos em `*.types.ts`; `erasableSyntaxOnly` está ligado em `tsconfig.app.json`, então classes **não** usam parameter properties.
- Textos da UI em inglês, exatamente os de `contracts/ui-components.md` e do `plan.md` ("Mensagens"); estilos só com CSS Modules e tokens (sem inline nem valores mágicos); sem `useEffect`, sem `memo`/`useMemo`/`useCallback`, sem `dangerouslySetInnerHTML`; `key` estável, nunca índice.
- Conteúdo da API só como texto. Resposta fora do formato: mapper lança `ApiError('parse', 'Unexpected response shape')` (`src/shared/api/apiError.ts`).
- Testes: Testing Library por papel/texto acessível; MSW para HTTP (`server.use(...dashboardHandlers)` de `src/features/dashboard/testing/handlers.ts`); `renderWithProviders` de `src/test/render.tsx` (aceita `route`, ex.: `/dashboard?year=2018`).
- Cada critério é provado em um único nível (matriz do `plan.md`); não repita no E2E nem no teste de página o que um teste mais baixo já prova.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: tokens e utilitário de estilo exigidos pelos componentes novos

- [X] T001 Em `src/shared/styles/tokens.css` acrescentar (valores estimados do anexo 1): `--color-surface` (#ffffff), `--color-border` (#dee2e6), `--color-table-header-bg` (#f8f9fa), `--color-error` (#b02a37), `--color-button-bg` (#0d6efd), `--color-button-text` (#ffffff), `--font-size-panel-title` (1.125rem), `--font-size-subtitle` (1rem), `--font-size-table` (0.875rem). Em `src/shared/styles/global.css` acrescentar a classe utilitária `.visually-hidden` (clip/1px/overflow hidden, padrão de "só leitor de tela"). Sem teste (só CSS); verificar com `npm run build`. Commit: `style(shared): add panel and table tokens and visually-hidden utility`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: guards, componentes compartilhados, mappers, dados de teste e ajustes da 001 que todas as stories usam

**⚠️ CRITICAL**: nenhuma user story começa antes de T002 a T007

- [X] T002 [P] Criar `src/shared/api/guards.ts` exportando `isRecord(value: unknown): value is Record<string, unknown>` (objeto não nulo e não array), `expectRecord(value: unknown): Record<string, unknown>`, `expectArray(value: unknown): unknown[]`, `expectString(value: unknown): string` e `expectNumber(value: unknown): number` (só número finito); os quatro `expect*` lançam `new ApiError('parse', 'Unexpected response shape')` quando o tipo não confere. Teste unitário `src/shared/api/guards.test.ts`: aceita cada tipo correto; rejeita `null`, `undefined`, array no lugar de objeto, string no lugar de número, `NaN` e `Infinity`; o erro é `ApiError` com `kind` `'parse'`. Commit: `feat(shared): add response shape guards`.
- [X] T003 [P] Criar `Panel` em `src/shared/ui/Panel/`: `Panel.types.ts` (`PanelStatus = 'loading' | 'error' | 'empty' | 'success'`, `PanelProps` conforme `contracts/ui-components.md`), `panelStatus.ts` (`getPanelStatus({ isError, isPending }, isEmpty)`: 1º `isError` → `error`; 2º `isPending` → `loading`; 3º `isEmpty` → `empty`; senão `success`), `Panel.tsx` (`<section aria-labelledby>` com `<h2>` do `title` sempre renderizado; `controls` logo abaixo do título em todos os estados; `loading` = "Loading…" em `role="status"`; `error` = "Could not load this data." em `role="alert"` + `<button type="button">Try again</button>` que chama `onRetry`; `empty` = `emptyMessage` como texto; `success` = `children`; `id` do título via `useId`), `Panel.module.css` (cartão: fundo `--color-surface`, borda `--color-border`, espaçamentos e `--font-size-panel-title` dos tokens; botão com `--color-button-bg`/`--color-button-text`; foco visível herdado). Testes: `panelStatus.test.ts` (unitário: as 4 saídas e a prioridade do erro sobre `isPending` e `isEmpty`) e `Panel.test.tsx` (componente: título sempre presente com `heading` nível 2; `status` com "Loading"; `alert` com "Try again" e `onRetry` chamado uma vez ao clicar; vazio mostra a mensagem recebida; sucesso mostra `children`; `controls` visível nos 4 estados; `children` não aparece fora de `success`). Apresentacional: sem buscar dados nem conhecer feature. Commit: `feat(shared): add Panel with loading, empty, error and success states`.
- [X] T004 [P] Criar `DataTable<T>` em `src/shared/ui/DataTable/`: `DataTable.types.ts` (`Column<T>` = `{ id: string; header: string; render: (row: T) => ReactNode }` e `DataTableProps<T>` conforme `contracts/ui-components.md`), `DataTable.tsx` (`<table>` com `<caption className="visually-hidden">`, `<th scope="col">` por coluna, uma `<tr key={getRowKey(row)}>` por linha; `rows` vazio: só o cabeçalho e, se houver `emptyMessage`, uma única linha com `<td colSpan={columns.length}>`), `DataTable.module.css` (largura total, cabeçalho em negrito com `--color-table-header-bg`, bordas `--color-border`, `--font-size-table`, `overflow-wrap: anywhere` para texto longo). Teste `DataTable.test.tsx` (componente): `table` com nome vindo do `caption`; `columnheader` por coluna; uma linha por item na ordem recebida; `emptyMessage` aparece só sem linhas e ocupa todas as colunas; sem `emptyMessage` e sem linhas, não há linha de corpo; conteúdo `<b>x</b>` e `&amp;` aparece literal (texto, não HTML). Este é o **único** teste de FR-016 (texto da API só como texto): os painéis usam o `DataTable` e não o repetem (Art. VI). Commit: `feat(shared): add generic DataTable`.
- [X] T005 Criar `src/features/dashboard/model/dashboard.types.ts` (`interface YearWinCount { year: number; winnerCount: number }`, `StudioWinCount { name: string; winCount: number }`, `ProducerInterval { producer: string; interval: number; previousWin: number; followingWin: number }`, `ProducerIntervals { max: ProducerInterval[]; min: ProducerInterval[] }`, `WinningMovie { id: number; year: number; title: string }`), `src/features/dashboard/model/mappers.ts` com `mapYearsWithMultipleWinners(raw: unknown): YearWinCount[]` (lê `years[]`), `mapStudios(raw: unknown): StudioWinCount[]` (lê `studios[]`, lista completa) e `selectTopStudios(studios: StudioWinCount[], count: number): StudioWinCount[]` (primeiros `count` na ordem recebida, sem reordenar nem recalcular), e `src/features/dashboard/testing/fixtures.ts` com `yearsResponse` (1986, 1990, 2015, `winnerCount` 2), `studiosResponse` (cru; ao menos 5 estúdios em ordem decrescente: Columbia Pictures 6, Paramount Pictures 6, Warner Bros. 5, 20th Century Fox 4, MGM 3, como no anexo 1) e `emptyYearsResponse`/`emptyStudiosResponse`. Usar só os guards de T002; campos extras são ignorados. Teste `src/features/dashboard/model/mappers.test.ts` (unitário): valores idênticos aos da fixture (contagens, ordem, anos); `selectTopStudios` devolve 3 na ordem da API, devolve todos quando há menos de 3 e lista vazia quando vazia; formato inesperado (não objeto, `years` ausente, `year` string, item `null`, `winCount` ausente) lança `ApiError` com `kind` `'parse'` e mensagem `Unexpected response shape`. Depende de T002. Commit: `feat(dashboard): map years and studios responses`.
- [X] T006 Em `src/features/dashboard/model/mappers.ts` acrescentar `mapProducerIntervals(raw: unknown): ProducerIntervals` (lê `max[]` e `min[]`; cada item exige `producer` string e `interval`, `previousWin`, `followingWin` números; os dois grupos preservam todos os itens, inclusive empates, e podem ser `[]`) e `mapWinningMovies(raw: unknown): WinningMovie[]` (a resposta é uma **lista** de filmes; mantém só `id` number, `year` number e `title` string; `studios`, `producers` e `winner` são ignorados). Em `fixtures.ts` acrescentar `intervalsResponse` (max: Matthew Vaughn 13, 2002→2015; min: Joel Silver 1, 1990→1991), `intervalsWithTiesResponse` (2 produtores empatados em cada grupo), `intervalsOnlyMaxResponse` (`min: []`), `emptyIntervalsResponse` (`max: []`, `min: []`), `winnersByYear2018Response` (1 filme `Holmes & Watson`, id 197, com `studios`, `producers` e `winner` como na API), `winnersWithTiesResponse` (2 filmes do mesmo ano) e `emptyWinnersResponse` (`[]`). Estender `mappers.test.ts` (unitário): valores idênticos aos da fixture, empates preservados, `min`/`max` vazios aceitos, campos extras ignorados, não-lista em `mapWinningMovies` (objeto no lugar da lista, que era o formato do PDF) e item sem `title` lançam `ApiError` `'parse'`. Depende de T005. Commit: `feat(dashboard): map producer intervals and winners by year responses`.
- [X] T007 Criar `src/features/dashboard/testing/handlers.ts` exportando `dashboardHandlers: RequestHandler[]` (MSW; URLs montadas a partir de `apiBaseUrl` de `src/shared/api/config.ts`) para os 4 endpoints de `contracts/dashboard-api.md`, respondendo com as fixtures de T005/T006 (`winnersByYear?year=2018` devolve `winnersByYear2018Response`; outro ano devolve `[]`). Criar `e2e/support/mockApi.ts` exportando `mockDashboardApi(page: Page)` (`page.route('**/challenge.outsera.tech/api/movies/**', ...)` respondendo as mesmas fixtures por caminho e por `year`; importar **com extensão**: `from '../../src/features/dashboard/testing/fixtures.ts'`, pois o `e2e/` é compilado pelo `tsconfig.node.json` (`module: nodenext`, ESM, sem DOM) e import relativo sem extensão falha com TS2835; `allowImportingTsExtensions` já está ligado). `fixtures.ts` deve ser só dado cru, **sem nenhum import** de `src/` (nem de `dashboard.types.ts`), para compilar também no projeto node. Ajustar o que a 001 já testa para o Dashboard passar a fazer requisições: em `src/app/App.test.tsx` registrar `server.use(...dashboardHandlers)` num `beforeEach`; em `e2e/shell-navigation.spec.ts` chamar `mockDashboardApi(page)` no início dos 3 primeiros testes (o 4º, que bloqueia a API de propósito, não muda). Sem teste novo: os testes existentes de App e do shell continuam passando (`npm test`; `npm run test:e2e` se o Chromium estiver instalado); rodar também `npm run typecheck` para provar que o `e2e/` compila com o import das fixtures. Depende de T005 e T006. Commit: `test(dashboard): add MSW handlers and mocked API for e2e`.

**Checkpoint**: componentes, mappers e dados de teste prontos; as stories podem começar

---

## Phase 3: User Story 1 - Ver os rankings e recordes dos prêmios (Priority: P1) 🎯 MVP

**Goal**: os três painéis automáticos (anos, estúdios, produtores) mostram os dados da API, nas duas colunas do anexo 1 (ainda sem o breakpoint; US4 refina o layout).

**Independent Test**: abrir `/dashboard` com a API respondendo; cada painel mostra título e colunas do anexo 1 com os valores da API.

- [X] T008 [US1] Criar a fatia do painel de anos: `src/features/dashboard/api/dashboardKeys.ts` (objeto `dashboardKeys` com `yearsWithMultipleWinners: ['dashboard', 'years-with-multiple-winners']` e, já declarados para as próximas tarefas, `studios: ['dashboard', 'studios-with-win-count']`, `producerIntervals: ['dashboard', 'producer-intervals']`, `winnersByYear: (year: string) => ['dashboard', 'winners-by-year', year]`), `src/features/dashboard/api/dashboardApi.ts` (`fetchYearsWithMultipleWinners(signal?)` = `httpClient.get('/yearsWithMultipleWinners', { signal })` + `mapYearsWithMultipleWinners`), `src/features/dashboard/api/useDashboardQueries.ts` (`useYearsWithMultipleWinners()` = `useQuery({ queryKey, queryFn: ({ signal }) => fetchYearsWithMultipleWinners(signal) })`), `src/features/dashboard/ui/YearsPanel.tsx` (título "List years with multiple winners"; `Panel` com `status = getPanelStatus(query, query.data?.length === 0)`, `emptyMessage` "No years with multiple winners.", `onRetry={() => void query.refetch()}`; `DataTable` com caption "Years with multiple winners", colunas "Year" e "Win Count", `getRowKey` = `year`), e `src/features/dashboard/ui/DashboardPage.tsx` (manter `<h1>Dashboard</h1>`; abaixo, `<div>` das duas colunas com classes `columns`, `column` em `DashboardPage.module.css`, empilhadas por enquanto; coluna esquerda recebe `YearsPanel`, a direita fica vazia até as próximas tarefas). Teste `src/features/dashboard/ui/YearsPanel.test.tsx` (componente + MSW): renderiza o painel com `dashboardHandlers`, aguarda as 3 linhas (1986, 1990, 2015) com `Win Count` 2, colunas "Year" e "Win Count", `heading` nível 2 com o título; confirma que a requisição foi a `/yearsWithMultipleWinners`. Depende de T003, T004, T006, T007. Commit: `feat(dashboard): add years with multiple winners panel`.
- [X] T009 [US1] Fatia do painel de estúdios: em `dashboardApi.ts` acrescentar `fetchStudios(signal?)` (`httpClient.get('/studiosWithWinCount', { signal })` + `mapStudios`, lista completa); em `useDashboardQueries.ts` acrescentar `useTopStudios()` com `select` apontando para uma função de módulo estável `selectTopThree = (studios) => selectTopStudios(studios, TOP_STUDIOS_COUNT)`, `TOP_STUDIOS_COUNT = 3` (constante nomeada); criar `src/features/dashboard/ui/StudiosPanel.tsx` (título "Top 3 studios with winners", `emptyMessage` "No studios found.", caption "Top 3 studios by wins", colunas "Name" e "Win Count", `getRowKey` = `name`) e renderizá-lo na coluna direita de `DashboardPage.tsx`. Teste `StudiosPanel.test.tsx` (componente + MSW): com a fixture de 5+ estúdios mostra exatamente 3 linhas na ordem da API (Columbia Pictures, Paramount Pictures, Warner Bros.) com as contagens corretas; com 2 estúdios mostra 2. Não testar texto literal aqui (já provado em T004). Depende de T008. Commit: `feat(dashboard): add top 3 studios panel`.
- [X] T010 [US1] Fatia do painel de produtores: em `dashboardApi.ts` acrescentar `fetchProducerIntervals(signal?)` (`/maxMinWinIntervalForProducers` + `mapProducerIntervals`); em `useDashboardQueries.ts` acrescentar `useProducerIntervals()`; criar `src/features/dashboard/ui/ProducersPanel.tsx` (título "Producers with longest and shortest interval between wins"; duas seções com `<h3>` "Maximum" e "Minimum", cada uma com `DataTable` — captions "Maximum interval" e "Minimum interval", colunas "Producer", "Interval", "Previous Year" e "Following Year", `getRowKey` = `` `${producer}-${previousWin}-${followingWin}` ``, `emptyMessage` "No producers." quando só aquele grupo vem vazio; o painel entra em `empty` ("No producers with multiple wins.") somente se `max` **e** `min` vierem vazios) e renderizá-lo na coluna esquerda abaixo de `YearsPanel`. Teste `ProducersPanel.test.tsx` (componente + MSW): Maximum mostra Matthew Vaughn 13, 2002, 2015 e Minimum mostra Joel Silver 1, 1990, 1991 com os 4 cabeçalhos; com empates todos os produtores aparecem em cada tabela; só `min` vazio mostra a tabela Maximum com dados e "No producers." na Minimum, painel em sucesso. O caso "os dois grupos vazios" (painel em `empty`, "No producers with multiple wins.") é provado só em T015(b) (Art. VI). Depende de T008. Commit: `feat(dashboard): add producers win interval panel`.

**Checkpoint**: US1 funcional e testável sozinha (`npm run dev` mostra três painéis com a API real)

---

## Phase 4: User Story 2 - Consultar os vencedores de um ano (Priority: P2)

**Goal**: painel "List movie winners by year" com busca por ano, validação e o ano na URL.

**Independent Test**: digitar um ano com vencedores e buscar mostra a tabela; um ano sem vencedores mostra a mensagem de vazio; abrir a URL com `?year=` reproduz a tabela.

- [X] T011 [P] [US2] Criar `src/features/dashboard/model/year.ts` exportando `YEAR_PARAM = 'year'` e `parseYear(raw: string | null | undefined): string | undefined`: `raw` nulo/indefinido → `undefined`; aplica `trim`; aceita **só `^\d{4}$`**; qualquer outro valor → `undefined`. Teste unitário `src/features/dashboard/model/year.test.ts`: aceita `'2018'` e `' 2018 '` (devolve `'2018'`); devolve `undefined` para `null`, `undefined`, `''`, `'   '`, `'abc'`, `'20a8'`, `'2018.5'`, `'-2018'`, `'201'`, `'20180'`, `'+2018'` e `'２０１８'`. Commit: `feat(dashboard): add year parsing`.
- [X] T012 [US2] Criar a leitura do painel de busca: em `dashboardApi.ts` acrescentar `fetchWinnersByYear(year: string, signal?)` (`httpClient.get('/winnersByYear', { params: { year }, signal })` + `mapWinningMovies`); em `useDashboardQueries.ts` acrescentar `useWinnersByYear(year: string | undefined)` (`enabled: year !== undefined`, `queryKey: dashboardKeys.winnersByYear(year ?? '')` só como chave; a função de busca nunca roda sem ano); criar `src/features/dashboard/ui/WinnersByYearPanel.tsx` (título "List movie winners by year"; lê `useSearchParams()` e calcula `const year = parseYear(searchParams.get(YEAR_PARAM))` no render; **sem ano**: `Panel` com `status="success"` e `DataTable` sem linhas com `emptyMessage` "Enter a year (e.g. 2018) to see its winners.", sem requisição; **com ano**: `status = getPanelStatus(query, query.data?.length === 0)`, `emptyMessage` `` `No winners found for ${year}.` ``, `DataTable` com caption "Winners of the selected year", colunas "Id", "Year" e "Title", `getRowKey` = `id`, `onRetry={() => void query.refetch()}`) e renderizá-lo na coluna direita abaixo de `StudiosPanel`. Teste `WinnersByYearPanel.test.tsx` (componente + MSW, `renderWithProviders(..., { route })`): sem `year` mostra a instrução e a tabela só com cabeçalho "Id", "Year", "Title", e **nenhuma** requisição a `winnersByYear` (handler que falha o teste se chamado); `?year=2018` mostra a linha 197, 2018, "Holmes & Watson" e a requisição levou `year=2018`; ano com 2 vencedores mostra as 2 linhas; `?year=abc` e `?year=` se comportam como sem busca. O vazio com ano ("No winners found for {year}.") é provado só em T015(b), não aqui (Art. VI). Depende de T008, T011. Commit: `feat(dashboard): add winners by year panel reading the year from the URL`.
- [X] T013 [US2] Criar `src/features/dashboard/ui/WinnersSearchForm.tsx` e ligá-lo ao painel pelo slot `controls`: `<form>` com `key={year ?? ''}` (ano da URL, passado por `WinnersByYearPanel`), `<label htmlFor>` "Search by year" com `.visually-hidden`, `<input type="text" inputMode="numeric" name="year" placeholder="Search by year" defaultValue={year ?? ''}>` **não controlado**, `<button type="submit" aria-label="Search">` com lupa em SVG inline `aria-hidden`; no submit (clique ou Enter) lê o valor por `FormData`, `parseYear`: válido → `setSearchParams({ [YEAR_PARAM]: parsed })` (push; se o ano já é o da URL, não faz nada) e limpa a mensagem; inválido → mostra "Enter a 4-digit year." num `<p id>` ligado ao campo por `aria-describedby` com `aria-invalid="true"`, sem alterar a URL e sem requisição (mensagem em `useState` local, que some quando o formulário remonta pelo `key`). Estilos em `WinnersSearchForm.module.css` com tokens (campo flexível + botão azul `--color-button-bg`). Estender `WinnersByYearPanel.test.tsx` (componente + MSW + `userEvent`): digitar `2018` e clicar em "Search" mostra a tabela; mesmo resultado com Enter; nova busca por outro ano troca a tabela; campo vazio e `abc` mostram "Enter a 4-digit year." ligada ao campo (`aria-invalid`, `aria-describedby`), sem requisição, e uma busca válida em seguida limpa a mensagem; ano com espaços (`' 2018 '`) é aceito; renderizar com `route` `?year=2018` preenche o campo com `2018`; **duplo clique rápido** em "Search" (`user.dblClick`) com `2018` gera uma única requisição a `winnersByYear?year=2018` (contador no handler), e buscar `2018` e depois `1990` mostra a tabela de 1990 (o último ano buscado). Voltar/avançar do navegador **não** é testado aqui: é provado só no E2E T014 em navegador real (Art. VI). Depende de T012. Commit: `feat(dashboard): add year search form with validation`.
- [X] T014 [US2] Criar `e2e/dashboard.spec.ts` com o teste `'year search: URL, reload and back restore the table (router + history + query)'`: `mockDashboardApi(page)`; abrir `/dashboard`; localizar o campo por `getByRole('textbox', { name: 'Search by year' })`, digitar `2018` e acionar `getByRole('button', { name: 'Search' })`; esperar a linha "Holmes & Watson" e `toHaveURL(/\?year=2018$/)`; `page.reload()` e conferir campo e tabela; buscar `1990` (fixture com vencedor) e `page.goBack()` volta ao campo `2018` e à tabela de 2018; abrir `/dashboard?year=2018` direto mostra a mesma tabela. Sem `waitForTimeout`; só localizadores por papel e texto acessível. É o único lugar que prova voltar/avançar restaurando campo e tabela; não repete validação nem estados (já provados em T013 e T015). Depende de T013. Commit: `test(e2e): cover year search through URL, reload and history`.

**Checkpoint**: US1 e US2 funcionam; os quatro painéis estão na tela

---

## Phase 5: User Story 3 - Cada painel falha e se recupera sozinho (Priority: P2)

**Goal**: provar, nos quatro painéis, que carregando, vazio e erro são independentes e que "Try again" refaz só a consulta do painel.

**Independent Test**: simular lentidão, resposta vazia e falha em um endpoint por vez e conferir que só aquele painel muda.

- [X] T015 [US3] Criar `src/features/dashboard/ui/DashboardPage.test.tsx` (componente + MSW, `renderWithProviders(<DashboardPage />, { route: '/dashboard?year=2018' })`), com `it.each` sobre os 4 painéis (título; endpoint; resposta vazia) e três cenários por painel, sempre via `server.use(...)` sobre `dashboardHandlers`: (a) **carregando**: o endpoint do painel fica pendente (`delay('infinite')`) e só aquele painel mostra `status` "Loading…" com o título visível, enquanto os outros três mostram seus dados; (b) **vazio**: o endpoint devolve a resposta vazia (para produtores, `max` e `min` vazios; para a busca, `[]` com `?year=2018`) e só aquele painel mostra a mensagem de vazio própria (as 4 mensagens do `plan.md`); este é o único teste do estado de vazio dos painéis; (c) **erro**: o endpoint devolve 500 e só aquele painel mostra `alert` "Could not load this data." com "Try again" (o `Panel` e o `Try again` do painel afetado, localizados dentro do `region` do título), os outros três seguem com dados; ao trocar o handler para sucesso e clicar em "Try again" daquele painel, só ele volta a carregar e passa a mostrar os dados, e um contador por endpoint prova que os outros três **não** foram pedidos de novo. Resposta malformada (ex.: `{}` em `yearsWithMultipleWinners`) vira erro só daquele painel (FR-015). Atenção: o `renderWithProviders` já usa `retry: false`. Depende de T010, T013. Commit: `test(dashboard): prove panels load, empty and fail independently`.
- [X] T016 [US3] Estender `WinnersByYearPanel.test.tsx` (componente + MSW + `userEvent`) com o erro da busca: `?year=2018` com `winnersByYear` devolvendo 500 mostra o `alert` no painel, o campo "Search by year" continua visível e com `2018`, e depois de trocar o handler para sucesso o clique em "Try again" repete a mesma consulta (`year=2018` na segunda requisição) e mostra a tabela, sem alterar a URL. Corrigir `WinnersByYearPanel.tsx` só se o teste revelar defeito. Depende de T013. Commit: `test(dashboard): cover search error keeps the field and retries the same year`.

**Checkpoint**: US3 provada nos quatro painéis

---

## Phase 6: User Story 4 - Dashboard fiel ao anexo e responsivo (Priority: P3)

**Goal**: duas colunas como no anexo 1 em telas largas, uma coluna e sem rolagem horizontal em 768x1280.

**Independent Test**: abrir o Dashboard em 1440x900 e em 768x1280 e conferir disposição e ausência de rolagem horizontal.

- [X] T017 [US4] Layout em `src/features/dashboard/ui/DashboardPage.module.css` (e o que mais for preciso nos módulos dos painéis/tabelas): `.columns` com `display: grid`, uma coluna e `gap: var(--space-5)`; `@media (min-width: 64rem)` duas colunas `repeat(2, minmax(0, 1fr))` com `align-items: start` (alturas independentes, como no anexo 1); `.column` com `display: flex; flex-direction: column; gap: var(--space-5)`; `min-width: 0` nos filhos para as tabelas não estourarem. Comentar no CSS que `64rem` é o breakpoint porque a área de conteúdo em 768 px (cerca de 544 px) não comporta duas tabelas de quatro colunas lado a lado, e que valor de `@media` não pode ser variável CSS (única exceção a "sem valores mágicos"). Ordem de empilhamento: anos, produtores, estúdios, busca (a ordem do DOM). Sem teste unitário (só CSS); provado em T018. Verificar a olho com `npm run dev` em 1440x900 e 768x1280 contra `docs/requirements/anexo-1-dashboard.png`. Commit: `style(dashboard): lay panels out in two columns with a single-column fallback`.
- [ ] T018 [US4] Em `e2e/dashboard.spec.ts` acrescentar dois testes (`mockDashboardApi(page)` em ambos): (1) `'real CSS layout: two columns at 1440, one column without horizontal scroll at 768'`: com os 4 painéis visíveis (`getByRole('region', { name: ... })` pelos títulos), no projeto `desktop-1440` (`test.info().project.name`) o painel de anos e o de estúdios têm o mesmo `y` de topo e `x` diferentes, e o de produtores fica abaixo do de anos; no `tablet-768` os quatro ficam empilhados (mesmo `x`, `y` crescente) e, nos dois, `documentElement.scrollWidth <= clientWidth`; no teste de 768, sobrescrever a rota de estúdios (`page.route` depois de `mockDashboardApi`) com um nome de 80 caracteres sem espaços e conferir que continua sem rolagem horizontal e que o texto fica dentro do cartão do painel (`boundingBox` do `td` ≤ o do painel) (edge case "texto longo"); (2) `'real CSS: the search field and button show a focus ring when reached with Tab'`: Tab até o campo "Search by year" e até o botão "Search" com `not.toHaveCSS('outline-style', 'none')`. Sem `waitForTimeout`. Depende de T014, T017. Commit: `test(e2e): cover dashboard layout and search focus ring in real CSS`.

**Checkpoint**: as quatro stories entregues

---

## Phase 7: Polish & Cross-Cutting Concerns

- [ ] T019 [P] Documentar o Dashboard: seção em `README.md` (o que cada painel mostra, endpoints agregados usados, `?year=` na URL, como rodar `npm run dev`/`npm test`/`npm run test:e2e`) e, em `docs/`, uma nota curta em português com as divergências API real × OpenAPI da `plan.md` (se já existir arquivo de contrato em `docs/`, acrescentar lá em vez de criar outro). Sem teste. Commit: `docs(dashboard): document panels, endpoints and the year URL parameter`.
- [ ] T020 Verificação completa: `npm run lint && npm run typecheck && npm test && npm run format:check && npm run build && npm run test:e2e` (Chromium instalado); corrigir o que falhar com a menor mudança causal, um commit por correção. Conferir a cobertura de `src/features/dashboard` e `src/shared/ui` com `npm run test:coverage` e anotar no registro de IA lacunas, se houver. Sem commit se tudo passar.
- [ ] T021 Revisão: rodar o agente `code-reviewer` na branch `002-dashboard` contra `main` e salvar os achados e o destino de cada um (aceito, recusado com motivo, adiado) em `docs/ai/reviews/002-dashboard.md` via skill `ai-interaction-log`; tratar os achados que o James aceitar, um commit cada. Commit do registro: `docs(ai): log 002 review`.
- [ ] T022 **Pendente para o James**: percorrer o `quickstart.md` à mão com a API real: conferir o visual contra `docs/requirements/anexo-1-dashboard.png`, o tempo de carregamento (SC-001), erro isolado e lentidão no DevTools, foco por teclado e o axe do navegador (SC-007). Registrar o resultado em `docs/ai/README.md` e em `docs/ai/decisions.md` se corrigir alguma proposta da IA. Sem commit de código.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (T001)**: sem dependência; T003 e T004 usam os tokens e a classe `.visually-hidden`.
- **Foundational (T002 a T007)**: depois de T001. T002, T003 e T004 são independentes entre si; T005 depende de T002; T006 de T005; T007 de T005 e T006. **Bloqueia todas as stories.**
- **US1 (T008 a T010)**: depois de Foundational. T008 cria `DashboardPage`; T009 e T010 dependem de T008 (mesmos arquivos `dashboardApi.ts`, `useDashboardQueries.ts` e `DashboardPage.tsx`).
- **US2 (T011 a T014)**: T011 é independente (pode andar junto com US1); T012 depende de T008 e T011; T013 de T012; T014 de T013.
- **US3 (T015, T016)**: T015 depende de T010 e T013 (precisa dos 4 painéis); T016 de T013.
- **US4 (T017, T018)**: T017 depende de T008 (estrutura de colunas) e fica melhor depois de T012; T018 depende de T014 e T017.
- **Polish (T019 a T022)**: depois das stories; T020 antes de T021; T022 por último.

### User Story Dependencies

- **US1** é o MVP e não depende de nenhuma outra story.
- **US2** não depende de US1 além do arquivo `DashboardPage.tsx` e dos módulos de API compartilhados.
- **US3** só prova comportamento dos painéis já feitos (precisa de US1 e US2).
- **US4** é estilo e E2E sobre os painéis prontos.

### Parallel Opportunities

- T002, T003, T004 em paralelo (arquivos diferentes), seguidos de T005 → T006 → T007.
- T011 em paralelo com T008 a T010.
- T019 em paralelo com T017/T018.
- Mesmo em paralelo, o commit é um por tarefa.

### Parallel Example: Foundational

```text
Em paralelo:
  T002  src/shared/api/guards.ts
  T003  src/shared/ui/Panel/*
  T004  src/shared/ui/DataTable/*
Depois, em sequência: T005 → T006 → T007
```

---

## Implementation Strategy

### MVP First (US1)

1. T001 → Foundational (T002 a T007) → T008 a T010.
2. **Parar e validar**: três painéis com a API real e `npm test` verde.

### Incremental Delivery

1. + US2 (T011 a T014): busca por ano com a URL.
2. + US3 (T015, T016): garantia de independência dos painéis.
3. + US4 (T017, T018): layout do anexo e responsividade.
4. Polish (T019 a T022): documentação, verificação, revisão e conferência manual do James.

## Notes

- 22 tarefas; T001 a T021 geram commits (T020 só se houver correção); T022 é do James.
- `WinnersSearchForm` não tem teste próprio (provado no painel, Art. VI); `DataTable` e `Panel` têm (Art. X).
- Se um teste revelar defeito de tarefa anterior, a correção entra no commit da tarefa em curso apenas quando for o mesmo arquivo; senão, `fix:` separado.
- Nenhuma dependência nova; se uma tarefa parecer exigir uma, parar e registrar no `plan.md`.
