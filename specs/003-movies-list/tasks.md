---

description: "Task list for Movies List"
---

# Tasks: Movies List

**Input**: Design documents from `/specs/003-movies-list/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/ (todos presentes); features 001 (shell) e 002 (dashboard) na branch

**Tests**: Obrigatórios (Constitution Art. VI e Definition of Done). Cada tarefa leva o teste do nível definido na matriz do `plan.md`, no mesmo commit.

**Organization**: Agrupadas por user story. Uma tarefa = um commit (Conventional Commits, texto em inglês), com `npm run lint && npm run typecheck && npm test` verdes antes do commit (e `npm run format:check`; use `npm run format` se falhar).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência pendente). Mesmo assim, o commit é um por tarefa.
- **[Story]**: US1 a US5, conforme `spec.md`.

## Convenções para todas as tarefas

- Caminhos relativos à raiz do repo; estrutura conforme `plan.md` (Project Structure) e contratos em `contracts/`.
- `strict`, sem `any`; tipos em `*.types.ts`; `erasableSyntaxOnly` está ligado em `tsconfig.app.json`, então classes **não** usam parameter properties.
- Textos da UI em inglês, exatamente os de `contracts/ui-components.md` e do `plan.md` ("Mensagens"); estilos só com CSS Modules e tokens (sem inline nem valores mágicos); `useEffect` só no foco da T019; sem `memo`/`useMemo`/`useCallback`, sem `dangerouslySetInnerHTML`; `key` estável, nunca índice.
- Conteúdo da API só como texto. Resposta fora do formato: mapper lança `ApiError('parse', 'Unexpected response shape')` (`src/shared/api/apiError.ts`).
- Constantes nomeadas (sem número mágico): `PAGE_SIZE = 15`, `MAX_PAGE = 1_000_000` (`moviesQuery.ts`) e `WINDOW_SIZE = 5` (`Pagination`).
- Testes: Testing Library por papel/texto acessível (controles da tabela pelos papéis `textbox` e `combobox`, não pelo nome do `columnheader`); MSW para HTTP (`server.use(...listHandlers)` de `src/features/list/testing/handlers.ts`); `renderWithProviders` de `src/test/render.tsx` (aceita `route`, ex.: `/list?page=2`).
- Cada critério é provado em um único nível (matriz do `plan.md`); não repita no E2E nem no teste de página o que um teste mais baixo já prova.
- Não implementar nada fora da tarefa em curso. Se uma tarefa parecer exigir dependência nova ou contrariar a constitution, parar e perguntar.

---

## Phase 1: Setup (refatorações compartilhadas)

**Purpose**: ajustes em `shared/` e no Dashboard que a Lista usa; cada um em commit próprio, com o Dashboard e os testes existentes verdes. **T001 vem antes de qualquer tarefa da Lista.**

- [X] T001 Refatorar `DataTable` (`src/shared/ui/DataTable/`) com duas props **opcionais**, sem prop de variação (decisão revisada, `research.md` R9): em `DataTable.types.ts`, `Column<T>` ganha `headerControl?: ReactNode` e `DataTableProps<T>` ganha `statusRow?: ReactNode`. Em `DataTable.tsx`, o `th` de cada coluna renderiza `header` e, se existir, o `headerControl` daquela coluna dentro de um `<div>` abaixo do texto (classe `headerControl` em `DataTable.module.css`, `margin-top: var(--space-2)` e `font-weight: 400`, sem valores mágicos); com `statusRow`, o `<tbody>` renderiza **uma única** `<tr><td colSpan={columns.length}>{statusRow}</td></tr>` no lugar das linhas de dados e de `emptyMessage`, mantendo o `<thead>` e os controles. Sem as props, a saída é idêntica à atual. Estender `DataTable.test.tsx` (componente) **só** com: `headerControl` renderiza o nó dentro do `columnheader` da coluna certa e das outras colunas não (consultar `within(columnheader)` e o papel do controle); `statusRow` mostra uma linha com `colSpan` igual ao número de colunas no lugar das linhas e de `emptyMessage` e o cabeçalho continua com o `headerControl` visível. Não repetir os testes existentes. Confirmar que `src/shared/ui/DataTable/DataTable.test.tsx` (casos antigos) e os testes do Dashboard seguem verdes sem alteração. Commit: `refactor(shared): add optional header controls and a status row to DataTable`.
- [X] T002 [P] Mover `parseYear` para `src/shared/lib/year.ts` (`research.md` R10): criar `src/shared/lib/year.ts` com `parseYear(raw: string | null | undefined): string | undefined` exatamente como hoje (nulo/indefinido → `undefined`; `trim`; aceita só `^\d{4}$`, sem a flag `u`); mover o teste para `src/shared/lib/year.test.ts` (mesmos casos: aceita `'2018'` e `' 2018 '`; `undefined` para `null`, `undefined`, `''`, `'   '`, `'abc'`, `'20a8'`, `'2018.5'`, `'-2018'`, `'201'`, `'20180'`, `'+2018'` e `'２０１８'`). Em `src/features/dashboard/model/year.ts` manter só `export const YEAR_PARAM = 'year'` (apagar `parseYear` e o regex) e trocar os imports de `parseYear` em `WinnersByYearPanel.tsx` e `WinnersSearchForm.tsx` para `../../../shared/lib/year`; apagar `src/features/dashboard/model/year.test.ts`. Sem teste novo (teste movido, não duplicado). Commit: `refactor(shared): move parseYear to shared/lib`.
- [X] T003 [P] Acrescentar `expectBoolean(value: unknown): boolean` em `src/shared/api/guards.ts` (aceita só `true`/`false`; senão lança `new ApiError('parse', 'Unexpected response shape')`, como os outros `expect*`). Estender `src/shared/api/guards.test.ts` (unitário): aceita `true` e `false`; rejeita `1`, `0`, `'true'`, `null` e `undefined` com `ApiError` de `kind` `'parse'`. Commit: `feat(shared): add expectBoolean guard`.
- [X] T004 [P] Extrair `StatusMessage` de `Panel` (`research.md` R4): criar `src/shared/ui/StatusMessage/` com `StatusMessage.types.ts` (`StatusMessageProps = { status: 'loading' | 'error' | 'empty'; emptyMessage: string; onRetry: () => void; retryRef?: Ref<HTMLButtonElement> }`), `StatusMessage.tsx` (`loading` = "Loading…" em `role="status"`; `error` = "Could not load this data." em `role="alert"` + `<button type="button" ref={retryRef}>Try again</button>` que chama `onRetry`; `empty` = `emptyMessage` como texto) e `StatusMessage.module.css` (mover de `Panel.module.css` as classes `.error` e `.button`, com os mesmos tokens). `Panel.tsx` passa a renderizar `<StatusMessage>` para `loading`, `error` e `empty` e continua renderizando `children` em `success`; textos e comportamento **iguais aos da 002**. Testes: `StatusMessage.test.tsx` (componente) recebe as asserções de estado hoje em `Panel.test.tsx` (`status` "Loading…"; `alert` com "Try again" e `onRetry` chamado uma vez; vazio mostra a mensagem recebida; `retryRef` aponta para o botão); `Panel.test.tsx` fica só com título (`heading` nível 2), `controls` nos 4 estados, `children` só em `success` e a delegação (um estado de erro mostra o botão "Try again"); remover de `Panel.test.tsx` o que passou para o `StatusMessage` (Art. VI). Os testes do Dashboard seguem verdes. Commit: `refactor(shared): extract StatusMessage from Panel`.

**Checkpoint**: refatorações prontas; Dashboard inalterado e verde

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: tipos, mappers, regras de URL e do campo de ano, camada de API e dados de teste que todas as stories usam

**⚠️ CRITICAL**: nenhuma user story começa antes de T005 a T008

- [X] T005 Criar `src/features/list/model/movies.types.ts` (`interface Movie { id: number; year: number; title: string; winner: boolean }`, `interface MoviesPage { movies: Movie[]; totalPages: number }`, `interface MoviesQuery { page: number; year?: string; winner?: boolean }`) e `src/features/list/model/mappers.ts` com `mapMoviesPage(raw: unknown): MoviesPage`: exige objeto com `content` (lista) e `totalPages` (número); cada item exige `id` (número), `year` (número), `title` (string) e `winner` (booleano, via `expectBoolean`); campos extras (`studios`, `producers`, `totalElements`, `number`...) são ignorados; ordem e valores preservados. Usar só os guards de `shared/api/guards.ts`. Teste `src/features/list/model/mappers.test.ts` (unitário): valores idênticos aos do corpo de entrada (ordem, `winner`, `totalPages`); `content` vazio aceito; formato inesperado (não objeto, `content` não-lista, `totalPages` ausente ou string, item sem `winner` booleano, `winner` como `'true'`, item `null`) lança `ApiError` com `kind` `'parse'` e mensagem `Unexpected response shape`. Depende de T003. Commit: `feat(list): map movies page response`.
- [ ] T006 Criar `src/features/list/model/moviesQuery.ts` (`PAGE_SIZE = 15`, `MAX_PAGE = 1_000_000`, `PAGE_PARAM = 'page'`, `YEAR_PARAM = 'year'`, `WINNER_PARAM = 'winner'`) com: `parseMoviesQuery(searchParams: URLSearchParams): MoviesQuery` — `page`: `^[1-9]\d*$` e valor numérico `<= MAX_PAGE`, senão `1`; `year`: `parseYear` de `shared/lib/year`, senão `undefined`; `winner`: exatamente `true` ou `false`, senão `undefined`; `toSearchParams(query: MoviesQuery): URLSearchParams` — omite `page` quando `1`, `year` quando `undefined` e `winner` quando `undefined` (estado padrão = URL sem parâmetros); `toApiParams(query: MoviesQuery): QueryParams` — `{ page: page - 1, size: PAGE_SIZE, year, winner }` com os `undefined` omitidos (tipo `QueryParams` de `shared/api/httpClient.types.ts`). Teste `moviesQuery.test.ts` (unitário): `page` válida (`'1'`, `'2'`, `'1000000'`); `page` `'0'`, `'-1'`, `'1.5'`, `'abc'`, `''`, `'1000001'`, `'01'` vira `1`; `year` `'1999'` aceito e `'99'`, `'abc'`, `'19999'` ignorados; `winner` `'true'`/`'false'` aceitos e `'maybe'`, `'TRUE'`, `''` ignorados; URL sem parâmetros = `{ page: 1 }`; `toSearchParams` omite os padrões (URL padrão sem parâmetros); estes testes provam também, no nível mais baixo, que nenhum valor inválido chega à API (FR-012, SC-007); `toApiParams` envia `page` em base 0 (`page: 1` → `0`), `size: 15` e só os filtros presentes. Depende de T002 e T005. Commit: `feat(list): parse and serialize the list query from the URL`.
- [ ] T007 [P] Criar `src/features/list/model/yearFilter.ts` com `classifyYearInput(draft: string): { kind: 'empty' } | { kind: 'partial' } | { kind: 'valid'; year: string } | { kind: 'invalid' }`: após `trim`, `''` → `empty`; `^\d{4}$` → `valid` (usando `parseYear`); `^\d{1,3}$` → `partial`; qualquer outro valor → `invalid`. Tipos do resultado em `src/features/list/model/yearFilter.types.ts`. Teste `yearFilter.test.ts` (unitário): `''` e `'   '` → `empty`; `'1'`, `'19'`, `'199'` → `partial`; `'1999'` e `' 1999 '` → `valid` com `year: '1999'`; `'abc'`, `'19a9'`, `'19.9'`, `'-199'`, `'19999'`, `'+1999'` e `'１９９９'` → `invalid`. Depende de T002. Commit: `feat(list): classify the year filter input`.
- [ ] T008 Criar a camada de API e os dados de teste: `src/features/list/api/moviesKeys.ts` (`moviesKeys.list(query)` = `['list', 'movies', { page: query.page, year: query.year, winner: query.winner }]`), `src/features/list/api/moviesApi.ts` (`fetchMovies(query: MoviesQuery, signal?: AbortSignal): Promise<MoviesPage>` = `mapMoviesPage(await httpClient.get('', { params: toApiParams(query), signal }))`), `src/features/list/api/useMovies.ts` (`useMovies(query)` = `useQuery({ queryKey: moviesKeys.list(query), queryFn: ({ signal }) => fetchMovies(query, signal), placeholderData: keepPreviousData })`); `src/features/list/testing/fixtures.ts` (**só dado e funções puras, sem nenhum import**, para compilar também no projeto node do e2e): 40 filmes — 1980: 10 (ids 1 a 10), 1981: 20 (ids 11 a 30), 1982: 10 (ids 31 a 40); o primeiro de cada ano (ids 1, 11, 31) é vencedor, os demais não; ids 1 a 15 com os títulos do anexo 2 (1 Can't Stop the Music, 2 Cruising, 3 The Formula, 4 Friday the 13th, 5 The Nude Bomb, 6 The Jazz Singer, 7 Raise the Titanic, 8 Saturn 3, 9 Windows, 10 Xanadu, 11 Mommie Dearest, 12 Endless Love, 13 Heaven's Gate, 14 The Legend of the Lone Ranger, 15 Tarzan, the Ape Man), os demais com títulos gerados ("Movie 16"...); cada filme com `studios` e `producers` como na API; `buildMoviesPageResponse(movies, page, size)` (página Spring: `content`, `totalElements`, `totalPages`, `number`, `size`, `numberOfElements`, `first`, `last`, `empty`) e `respondToMoviesQuery(searchParams: URLSearchParams): { status: number; body: unknown }` que emula a API real: `page` ou `size` inválido (`page < 0`, `size < 1` ou não numérico) → `500` com `{ status: '500 INTERNAL_SERVER_ERROR', timestamp, message }`; `year` não numérico → `400` com `{ detail, instance, status: 400, title }`; senão filtra por `year` e `winner` (quando presentes), fatia por `page`/`size` (página além do total → `content: []`) e devolve a página; `src/features/list/testing/handlers.ts` com `listHandlers: RequestHandler[]` (MSW, `http.get(apiBaseUrl, ...)` chamando `respondToMoviesQuery` e `HttpResponse.json(body, { status })`). Sem teste próprio (a emulação é exercida pelos testes de T011 em diante; `fixtures.ts` sem imports é provado por `npm run typecheck` em T011, que a importa no e2e); rodar `npm run typecheck`. Depende de T005 e T006. Commit: `feat(list): add movies API layer, fixtures and MSW handlers`.

**Checkpoint**: modelo, API e dados de teste prontos; as stories podem começar

---

## Phase 3: User Story 1 - Percorrer a lista de filmes paginada (Priority: P1) 🎯 MVP

**Goal**: a view "List" mostra a tabela com 15 filmes por página e a paginação navega pelo servidor.

**Independent Test**: abrir `/list` com a API respondendo; conferir a primeira página e navegar por próxima, anterior, primeira, última e número de página.

- [ ] T009 [P] [US1] Criar `src/shared/ui/Pagination/pageWindow.ts` com `WINDOW_SIZE = 5` e `getPageWindow(page: number, totalPages: number, size: number = WINDOW_SIZE): number[]`: até `size` números consecutivos centrados em `page`, deslocados para caber em `[1, totalPages]`; com `page` fora do intervalo devolve a janela final (os últimos `size` números); `totalPages < size` devolve `1..totalPages`. Teste `pageWindow.test.ts` (unitário): `(1, 14)` → `[1,2,3,4,5]`; `(7, 14)` → `[5,6,7,8,9]`; `(14, 14)` → `[10,11,12,13,14]`; `(2, 14)` → `[1,2,3,4,5]`; `(1, 3)` → `[1,2,3]`; `(1, 1)` → `[1]`; `(99, 14)` → `[10,11,12,13,14]`. Commit: `feat(shared): add page window calculation`.
- [ ] T010 [US1] Criar `Pagination` em `src/shared/ui/Pagination/`: `Pagination.types.ts` (`PaginationProps = { page: number; totalPages: number; onPageChange: (page: number) => void }`), `Pagination.tsx` (`<nav aria-label="Pagination">` com `<ul>` de `<li><button type="button">` nesta ordem: "First page" (glifo `«`), "Previous page" (`‹`), números da janela de `getPageWindow` (nome acessível "Page N", texto visível `N`, `aria-current="page"` só no que for igual a `page`), "Next page" (`›`), "Last page" (`»`); os glifos com `aria-hidden` e o nome em `aria-label`; destinos: First = 1, Last = `totalPages`, Previous = `min(page - 1, totalPages)`, Next = `page + 1`; **sem destino** (First/Previous com `page <= 1`, Next/Last com `page >= totalPages`) recebem `aria-disabled="true"` — **nunca** o atributo `disabled` — continuam focáveis e o clique **não** chama `onPageChange`; `key` = número da página), `Pagination.module.css` (lista horizontal centralizada com `flex` e `flex-wrap: wrap`, botões com tokens `--color-border`, `--color-surface`, `--color-text`; página atual com `--color-button-bg`/`--color-button-text`; `[aria-disabled="true"]` com `--color-pagination-disabled` e `cursor: not-allowed`). Acrescentar o token `--color-pagination-disabled: #6c757d` em `src/shared/styles/tokens.css`. Apresentacional: sem buscar dados nem conhecer feature. Teste `Pagination.test.tsx` (componente): `navigation` "Pagination" com os botões "First page", "Previous page", "Page N", "Next page", "Last page" na ordem; `aria-current="page"` só na atual; na página 1, First/Previous com `aria-disabled="true"` e Next/Last sem; na última, o inverso; clicar em botão sem destino não chama `onPageChange`, e ele recebe foco por `user.tab()`; cada botão com destino chama `onPageChange` com o valor certo (First → 1, Previous → `page - 1`, "Page 3" → 3, Next → `page + 1`, Last → `totalPages`), o que prova o SC-002 (primeira, última, anterior, próxima e qualquer número da janela em uma ação); página além do total (`page 99`, `totalPages 14`): nenhuma `aria-current`, "Previous page" chama com `14`, "First page" com `1`, "Last page" com `14` e Next fica `aria-disabled`; `totalPages 1` deixa os quatro botões de salto sem destino. Depende de T009. Commit: `feat(shared): add Pagination`.
- [ ] T011 [US1] Criar a leitura da Lista e ajustar o shell: `src/features/list/ui/useListParams.ts` (`useListParams()` usa `useSearchParams`, calcula `query = parseMoviesQuery(searchParams)` no render e devolve `{ query, setPage }`, em que `setPage(page)` faz `setSearchParams(toSearchParams({ ...query, page }))` — `push`), `src/features/list/ui/ListPage.tsx` (substitui `<h1>List</h1>`: `<h1>List movies</h1>` e, abaixo, `<DataTable caption="Movies" columns rows={query.data?.movies ?? []} getRowKey={(movie) => movie.id}>` com colunas `ID` (`movie.id`), `Year` (`movie.year`), `Title` (`movie.title`) e `Winner?` (`movie.winner ? 'Yes' : 'No'`), dados de `useMovies(query)`; os estados de carregando/vazio/erro entram na T018/T019) e `ListPage.module.css` mínimo (cartão: fundo `--color-surface`, borda `--color-border`, `padding: var(--space-4)`). Ajustes da 001: em `src/app/App.test.tsx` os testes que abrem `/list` esperam `heading` nível 1 "List movies" e registram `server.use(...listHandlers)`; em `e2e/support/mockApi.ts` acrescentar `mockListApi(page: Page)` (`page.route(/\/api\/movies(\?.*)?$/, ...)` respondendo `respondToMoviesQuery(url.searchParams)` de `../../src/features/list/testing/fixtures.ts`, **import com extensão**, como em `mockDashboardApi`); em `e2e/shell-navigation.spec.ts` os testes que abrem `/list` chamam `mockListApi(page)` e esperam o heading "List movies". Teste `src/features/list/ui/ListPage.test.tsx` (componente + MSW, `renderWithProviders(<ListPage />, { route: '/list' })`): `heading` nível 1 "List movies"; tabela "Movies" com `columnheader` ID, Year, Title e Winner?; 15 linhas da página 1 em ordem (ids 1 a 15), "Can't Stop the Music" com `Yes` e "Cruising" com `No`; a requisição levou `page=0` e `size=15` e **não** levou `year` nem `winner`. Depende de T001 e T008. Commit: `feat(list): show the first page of movies`.
- [ ] T012 [US1] Ligar a paginação: em `useListParams` o `setPage` já existe; em `ListPage.tsx` renderizar `<Pagination page={query.page} totalPages={data.totalPages} onPageChange={setPage} />` abaixo da tabela **somente** quando `data` existe e `data.totalPages > 0` (a regra de vazio/erro entra na T018/T019). Estender `ListPage.test.tsx` (componente + MSW + `userEvent`): "Next page" mostra os ids 16 a 30, "Page 2" fica com `aria-current` e a requisição seguinte leva `page=1`; "Previous page", "First page", "Last page" (ids 31 a 40, "Page 3" atual) e "Page 3" a partir da página 1 trocam a tabela e enviam o `page` certo (`0`, `0`, `2`, `2`); as bordas com `aria-disabled` são provadas só em T010. **Foco** (FR-020, US4-7): com o teclado, acionar "Next page" com sucesso mantém o botão em `document.activeElement` durante o carregamento (handler com atraso: a tabela anterior e a paginação seguem montadas) e depois da resposta; ao chegar na última página por "Next page" (e na primeira por "Previous page"), o botão, agora com `aria-disabled`, continua focado. Depende de T010 e T011. Commit: `feat(list): paginate the movies list on the server`.

**Checkpoint**: US1 funcional e testável sozinha (`npm run dev` mostra a lista paginada com a API real)

---

## Phase 4: User Story 2 - Filtrar por ano e por vencedor (Priority: P1)

**Goal**: filtros por ano e por vencedor no cabeçalho das colunas, enviados à API, combináveis, voltando à página 1.

**Independent Test**: digitar um ano com filmes, escolher "Yes" e conferir que tabela e paginação mostram só o resultado combinado; limpar os dois e voltar à lista completa.

- [ ] T013 [US2] Filtro de vencedor: em `useListParams.ts` acrescentar `setWinner(winner: boolean | undefined)` = `setSearchParams(toSearchParams({ ...query, page: 1, winner }))`; criar `src/features/list/ui/WinnerFilter.tsx` (`<select>` com `<label>` "Filter by winner" `.visually-hidden`, opções `Yes/No` (valor `''`, sem filtro), `Yes` (`'true'`) e `No` (`'false'`), valor **derivado** de `query.winner`, `onChange` chama `setWinner`; usa `useListParams` em vez de props) e plugá-lo na coluna `Winner?` de `ListPage.tsx` via `headerControl`. Estender `ListPage.test.tsx` (componente + MSW + `userEvent`): o `combobox` "Filter by winner" tem as 3 opções com "Yes/No" selecionada; escolher "Yes" mostra só vencedores (todas as linhas com `Yes`, 3 linhas) e a requisição levou `winner=true`; escolher "No" mostra só os que não venceram (`winner=false`, 15 linhas na página 1, paginação com 3 páginas); **estando na página 3**, mudar o filtro volta à página 1 (a requisição seguinte leva `page=0`); voltar a "Yes/No" remove `winner` da requisição. Depende de T012. Commit: `feat(list): filter movies by winner`.
- [ ] T014 [US2] Filtro de ano: em `useListParams.ts` acrescentar `setYear(year: string | undefined)` = `setSearchParams(toSearchParams({ ...query, page: 1, year }))`; criar `src/features/list/ui/YearFilter.tsx` e `YearFilter.module.css`: `<input type="text" inputMode="numeric" placeholder="Filter by year">` com `<label>` "Filter by year" `.visually-hidden`, rascunho em `useState` ressincronizado com o ano da URL **no render** (mesmo padrão de `WinnersSearchForm`: guardar o último ano visto e, se `query.year` mudou, `setDraft(query.year ?? '')`; sem `useEffect` nem `key`, para manter o foco); a cada `onChange`: `classifyYearInput(valor)` → `valid` com ano diferente do da URL chama `setYear(year)`; `empty` com ano na URL chama `setYear(undefined)`; `partial` não faz nada (sem mensagem; a lista anterior permanece); `invalid` mostra "Enter a 4-digit year." num `<p id role="alert">` ligado ao campo por `aria-describedby` com `aria-invalid="true"`, **derivada do rascunho no render** (sem estado de erro), sem alterar a URL; usa `useListParams`. Plugá-lo na coluna `Year` via `headerControl`. Estender `ListPage.test.tsx` (componente + MSW + `userEvent`): digitar `1980` mostra só filmes de 1980 (10 filmes) e a requisição levou `year=1980` e `page=0`, sem botão; combinar com "Yes" mostra 1 filme (`year=1980&winner=true`) e todas as linhas satisfazem aos filtros; combinar `1981` + "No" mostra 15 linhas e 2 páginas (19 filmes); esvaziar o campo remove `year` da requisição seguinte; digitar `19` (1 a 3 dígitos) **não** faz requisição nova, não mostra mensagem e a lista anterior permanece; digitar `abc` e `19999` mostra "Enter a 4-digit year." com `aria-invalid` e `aria-describedby` no campo, sem requisição com esse valor; ao digitar o 4º dígito o foco continua no campo; ano com espaços (`' 1980 '`) é aceito; o reset para a página 1 ao mudar filtro é provado só em T013 (é o mesmo hook). Depende de T007 e T013. Commit: `feat(list): filter movies by year`.
- [ ] T015 [US2] Criar `e2e/list.spec.ts` com o teste `'list request: year and winner filters reach the API as query params (UI + http client + query key)'`: `mockListApi(page)` mais um `page.on('request')` que guarda as URLs de `api/movies`; abrir `/list`, digitar `1981` em `getByRole('textbox', { name: 'Filter by year' })`, escolher "Yes" em `getByRole('combobox', { name: 'Filter by winner' })` e conferir (com `expect.poll`, sem `waitForTimeout`) que a última requisição levou `page=0`, `size=15`, `year=1981` e `winner=true`, e que a tabela mostra a linha do filme vencedor de 1981 ("Mommie Dearest"). Só localizadores por papel e texto acessível. É o único lugar que prova o que sai do navegador para a API; não repete validação do ano nem estados (já provados em T013/T014). Depende de T014. Commit: `test(e2e): cover the list filters reaching the API`.

**Checkpoint**: US1 e US2 funcionam; a lista já é paginada e filtrável

---

## Phase 5: User Story 3 - Compartilhar e restaurar a lista pela URL (Priority: P2)

**Goal**: página e filtros restaurados a partir da URL, parâmetros inválidos ignorados, voltar/avançar coerente.

**Independent Test**: aplicar filtros e trocar de página, copiar a URL, abri-la em outra aba e conferir o mesmo resultado; usar voltar e avançar.

- [ ] T016 [US3] Estender `ListPage.test.tsx` (componente + MSW + `MemoryRouter`) e `src/app/App.test.tsx` com a restauração pela URL e a saída pelo menu: renderizar `ListPage` com `route` `/list?page=2&year=1981&winner=false` preenche o campo "Filter by year" com `1981`, o seletor com "No", destaca "Page 2" e mostra 4 linhas (19 filmes, página 2); em `App.test.tsx`, a partir de `/list?page=2&winner=true`, clicar no link "List" do menu abre a página 1 sem filtros (campo vazio, seletor "Yes/No", "Page 1" atual) (edge "voltar pelo menu"). As regras de parâmetros inválidos (página, ano e vencedor) são provadas só em T006 e a página além do total só em T018; voltar/avançar do navegador só no E2E T017 (Art. VI). Corrigir `useListParams`/`ListPage` só se os testes revelarem defeito. Depende de T014. Commit: `test(list): cover restoring the list from the URL and leaving it through the menu`.
- [ ] T017 [US3] Em `e2e/list.spec.ts` acrescentar o teste `'list URL: filters and page survive reload and back (router + history + query)'` (`mockListApi(page)`): abrir `/list`, escolher "Yes/No" → "No" no seletor, acionar "Next page" e conferir `toHaveURL(/page=2/)`, `winner=false` e a linha esperada da página 2; `page.reload()` e conferir controles (campo, seletor, "Page 2" com `aria-current="page"`) e tabela; digitar `1981` no campo e conferir a URL com `year=1981` e **sem** `page`; `page.goBack()` restaura a URL anterior, o campo vazio e a tabela da página 2 sem filtro de ano; `page.goForward()` reaplica o ano. Sem `waitForTimeout`; só papel e texto acessível. É o único lugar que prova voltar/avançar e recarregar; não repete a requisição com parâmetros (T015) nem a abertura direta da URL (T016). Depende de T015 e T016. Commit: `test(e2e): cover list URL, reload and history`.

**Checkpoint**: US3 provada em componente e em navegador real

---

## Phase 6: User Story 4 - Carregando, vazio e erro (Priority: P2)

**Goal**: a tabela trata os quatro estados com os filtros sempre visíveis; "Try again" repete a mesma consulta; o foco não se perde.

**Independent Test**: simular resposta lenta, sem filmes e falha da API, um de cada vez, e conferir o que aparece no lugar das linhas e se os filtros seguem utilizáveis.

- [ ] T018 [US4] Estados de carregando e vazio em `ListPage.tsx`: calcular `status = getPanelStatus(query, query.data?.movies.length === 0)` (`getPanelStatus` de `shared/ui/Panel/panelStatus`); quando `status !== 'success'`, passar ao `DataTable` `statusRow={<StatusMessage status={status} emptyMessage="No movies found." onRetry={() => void query.refetch()} />}` (o `error` é tratado na T019, mas o `StatusMessage` já cobre o tipo); renderizar a `Pagination` quando `data !== undefined && data.totalPages > 0` (inclui o vazio por página além do total, que mantém `totalPages > 0`; sem paginação quando `totalPages` é `0` ou não há `data`); envolver **só a `DataTable`** num `<div className={styles.frame} aria-busy={query.isPlaceholderData}>` (a `Pagination` fica fora, para não marcar como ocupada a região onde está o foco) e esmaecer a tabela durante `isPlaceholderData` (classe em `ListPage.module.css`, `opacity` por token novo `--opacity-busy: 0.6` em `tokens.css`). Estender `ListPage.test.tsx` (componente + MSW): **carregando** (handler com `delay('infinite')`): `status` "Loading…" no lugar das linhas, `heading` "List movies" e os dois filtros visíveis, sem paginação; **lista anterior mantida**: com a página 1 exibida, "Next page" com a resposta atrasada mantém as linhas da página 1 com `aria-busy="true"` na tabela e a paginação montada, sem `status` "Loading…"; **vazio**: `?year=1800` (e uma combinação sem filmes) mostra "No movies found." no lugar das linhas, os filtros visíveis e **nenhuma** `navigation` "Pagination"; **página além do total** (US3-6): `?page=99` mostra "No movies found." **com** a paginação, nenhuma página atual, e "Previous page" leva a `?page=3` com 10 filmes; **resposta antiga lenta** (edges de consulta antiga e troca rápida): com a página 2 respondendo devagar e, antes de ela chegar, a navegação para a página 3 respondida rápido, a tabela mostra os ids 31 a 40 e a resposta atrasada, ao chegar, não os sobrescreve (a chave da consulta é a do estado atual). Depende de T004 e T012. Commit: `feat(list): show loading and empty states inside the table`.
- [ ] T019 [US4] Erro, "Try again" e foco em `ListPage.tsx`: com `status === 'error'` o `StatusMessage` mostra "Could not load this data." e "Try again" (já pela T018); criar `const retryRef = useRef<HTMLButtonElement>(null)` passado ao `StatusMessage` (`retryRef`) e **um único `useEffect`** com dependência `[status]` que, ao entrar em `error`, foca `retryRef.current` somente se `document.activeElement === document.body` (R6; o efeito não busca dados). Estender `ListPage.test.tsx` (componente + MSW + `userEvent`): a API devolvendo `500` mostra `alert` "Could not load this data." e "Try again", com título e filtros visíveis e sem paginação (a mensagem não mostra detalhes técnicos); trocar o handler para sucesso e acionar "Try again" repete a **mesma** consulta (`page` e filtros iguais na segunda requisição, ex.: `?page=2&winner=true`) e mostra a tabela; no estado de erro, mudar um filtro ou a página faz nova consulta sem "Try again"; **foco**: com a página 1 exibida e o teclado em "Next page", uma falha na consulta seguinte move o foco para "Try again" (`toHaveFocus`) em vez de deixá-lo no `body` (o foco no campo de ano é provado só em T014). Depende de T018. Commit: `feat(list): show the error state with retry and keep keyboard focus`.

**Checkpoint**: US4 provada; a tabela nunca some e os filtros continuam utilizáveis

---

## Phase 7: User Story 5 - Lista fiel ao anexo e responsiva (Priority: P3)

**Goal**: título, tabela listrada com filtros no cabeçalho, paginação centralizada; utilizável em 768x1280 e 1440x900 sem rolagem horizontal.

**Independent Test**: abrir a lista em 768x1280 e em 1440x900 e conferir título, filtros, 15 linhas e paginação completos, sem rolagem horizontal.

- [ ] T020 [US5] Layout em `src/features/list/ui/ListPage.module.css` (e o que mais for preciso em `YearFilter.module.css` e no módulo da `Pagination`), **por composição, sem prop nova no `DataTable`** (`research.md` R9): `.frame` (wrapper em torno da `DataTable`, o mesmo `div` do `aria-busy`) aplica `.frame tbody tr:nth-child(even) { background: var(--color-table-stripe-bg) }` e `.frame table th { text-align: center }` (seletor `table th` mais específico que o `.table th` do `DataTable.module.css`, para não depender da ordem de carga); título `h1` com `--font-size-title` como no Dashboard; cartão de largura total; paginação centralizada com `margin-top: var(--space-4)`; campo de ano e seletor com largura `100%` do `th`, `font: inherit`, borda `--color-border`, foco visível herdado (`:focus-visible` global). Acrescentar em `tokens.css` `--color-table-stripe-bg: #f2f2f2` (valor estimado do anexo 2). Os controles (campo, seletor, botões da paginação) usam `min-width: 0` para não estourarem em 768 px. Sem teste unitário (só CSS); provado em T021. Verificar a olho com `npm run dev` em 1440 e em 768 de largura contra `docs/requirements/anexo-2-movies-list.png`. Depende de T014 e T018. Commit: `style(list): match the movies list layout to the attachment`.
- [ ] T021 [US5] Em `e2e/list.spec.ts` acrescentar o teste `'real CSS layout: filters in the header, full pagination and no horizontal scroll at 768 and 1440'` (`mockListApi(page)`; roda nos dois projetos de viewport): `getByRole('heading', { level: 1, name: 'List movies' })` visível; o campo "Filter by year" e o seletor "Filter by winner" estão **dentro** de `getByRole('columnheader')` de Year e de Winner? (conferir por `boundingBox` do controle contido no do `th`); 15 linhas visíveis; a paginação com "First page", "Page 1" e "Last page" visível e em uma única linha (os botões têm o mesmo `y`); `documentElement.scrollWidth <= clientWidth`; em 768, sobrescrever a rota (`page.route` depois de `mockListApi`) com um título de 80 caracteres sem espaços e conferir que continua sem rolagem horizontal e que o `td` do título fica dentro da tabela (`boundingBox`). Só papel e texto acessível; sem `waitForTimeout`. Não repete estados nem validação. Depende de T015 e T020. Commit: `test(e2e): cover the real list layout at 768 and 1440`.

**Checkpoint**: as cinco stories entregues

---

## Phase 8: Polish & Cross-Cutting Concerns

- [ ] T022 [P] Documentar a Lista: seção em `README.md` (o que a view mostra, parâmetros `?page=&year=&winner=` e o que cada um faz, paginação e filtros no servidor, `PAGE_SIZE` 15, como rodar `npm run dev`/`npm test`/`npm run test:e2e`) e conferir que `docs/api-divergences.md` já descreve a Lista (feito no plan; acrescentar só o que a implementação revelar). `CLAUDE.md` não muda (nenhum script novo). Sem teste. Commit: `docs(list): document the list view, URL parameters and API behavior`.
- [ ] T023 Verificação completa: `npm run lint && npm run typecheck && npm test && npm run format:check && npm run build && npm run test:e2e` (Chromium instalado); corrigir o que falhar com a menor mudança causal, um commit por correção. Conferir a cobertura de `src/features/list` e `src/shared/ui` com `npm run test:coverage` e anotar lacunas, se houver. Sem commit se tudo passar.
- [ ] T024 Revisão: rodar o agente `code-reviewer` na branch `003-movies-list` contra `main` e salvar os achados e o destino de cada um (aceito, recusado com motivo, adiado) em `docs/ai/reviews/003-movies-list.md` via skill `ai-interaction-log`; tratar os achados que o James aceitar, um commit cada. Commit do registro: `docs(ai): log 003 review`.
- [ ] T025 **Pendente para o James**: percorrer o `quickstart.md` à mão com a API real: conferir o visual contra `docs/requirements/anexo-2-movies-list.png`, o tempo de carregamento (SC-001), o erro com bloqueio no DevTools (foco no "Try again"), a lentidão (lista esmaecida), o foco por teclado até a última página e o axe do navegador (SC-009). Registrar o resultado em `docs/ai/README.md` e, se corrigir alguma proposta da IA, em `docs/ai/decisions.md`. Sem commit de código.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (T001 a T004)**: sem dependência entre si, exceto que **T001 vem antes de qualquer tarefa da Lista** (T005 em diante). T002, T003 e T004 são independentes de T001 e entre si.
- **Foundational (T005 a T008)**: T005 depende de T003; T006 de T002 e T005; T007 de T002 (pode andar com T006); T008 de T005 e T006. **Bloqueia todas as stories.**
- **US1 (T009 a T012)**: T009 é independente (pode andar junto com a Foundational); T010 depende de T009; T011 de T001 e T008; T012 de T010 e T011.
- **US2 (T013 a T015)**: T013 depende de T012; T014 de T007 e T013; T015 de T014.
- **US3 (T016, T017)**: T016 depende de T014; T017 de T015 e T016.
- **US4 (T018, T019)**: T018 depende de T004 e T012; T019 de T018.
- **US5 (T020, T021)**: T020 depende de T014 e T018; T021 de T015 e T020.
- **Polish (T022 a T025)**: depois das stories; T023 antes de T024; T025 por último.

### User Story Dependencies

- **US1** é o MVP e não depende de nenhuma outra story.
- **US2** usa a tabela e o `useListParams` da US1.
- **US3** só prova a restauração pela URL de página e filtros já implementados (precisa de US1 e US2).
- **US4** acrescenta os estados à tabela da US1 (o caso "página além do total" da US3-6 é provado aqui, na T018).
- **US5** é estilo e E2E sobre a lista pronta.

### Parallel Opportunities

- T002, T003 e T004 em paralelo (arquivos diferentes), com T001.
- T006 e T007 em paralelo depois de T005 e T002; T009 em paralelo com a Foundational.
- T022 em paralelo com T020/T021.
- Mesmo em paralelo, o commit é um por tarefa.

### Parallel Example: Setup

```text
Em paralelo:
  T001  src/shared/ui/DataTable/*
  T002  src/shared/lib/year.ts (+ imports do Dashboard)
  T003  src/shared/api/guards.ts
  T004  src/shared/ui/StatusMessage/* e src/shared/ui/Panel/*
```

---

## Implementation Strategy

### MVP First (US1)

1. Setup (T001 a T004) → Foundational (T005 a T008) → T009 a T012.
2. **Parar e validar**: lista paginada com a API real e `npm test` verde.

### Incremental Delivery

1. + US2 (T013 a T015): filtros por vencedor e por ano, com o E2E dos parâmetros.
2. + US3 (T016, T017): URL restaurável e histórico.
3. + US4 (T018, T019): carregando, vazio, erro e foco.
4. + US5 (T020, T021): layout do anexo e responsividade.
5. Polish (T022 a T025): documentação, verificação, revisão e conferência manual do James.

## Notes

- 25 tarefas; T001 a T022 e T024 geram commits (T023 só se houver correção); T025 é do James.
- `YearFilter` e `WinnerFilter` não têm teste próprio (provados na página, Art. VI); `Pagination`, `StatusMessage` e as props novas do `DataTable` têm (Art. X).
- A T001 muda só o `DataTable` e seus testes; os testes do `DataTable` e do Dashboard precisam ficar verdes sem alteração dos casos antigos.
- Se um teste revelar defeito de tarefa anterior, a correção entra no commit da tarefa em curso apenas quando for o mesmo arquivo; senão, `fix:` separado.
- Nenhuma dependência nova; se uma tarefa parecer exigir uma, parar e registrar no `plan.md`.
