---

description: "Task list for App Shell"
---

# Tasks: App Shell

**Input**: Design documents from `/specs/001-app-shell/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/ (todos presentes)

**Tests**: Obrigatórios (Constitution Art. VI e Definition of Done). Cada tarefa leva o teste do nível definido na matriz do `plan.md`, no mesmo commit.

**Organization**: Agrupadas por user story. Uma tarefa = um commit (Conventional Commits, texto em inglês), com `npm run lint && npm run typecheck && npm test` verdes antes do commit.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência pendente). Mesmo assim, o commit é um por tarefa.
- **[Story]**: US1 a US4, conforme `spec.md`.

## Convenções para todas as tarefas

- Caminhos relativos à raiz do repo; estrutura conforme `plan.md` (Project Structure).
- `strict`, sem `any`; tipos em `*.types.ts`; `erasableSyntaxOnly` está ligado em `tsconfig.app.json`, então classes **não** usam parameter properties (declare os campos explicitamente).
- Textos da UI em inglês; estilos só com CSS Modules e tokens (sem inline nem valores mágicos); sem `useEffect` de dados, sem `memo`, sem `dangerouslySetInnerHTML`.
- Testes: Testing Library por papel/texto acessível; MSW para HTTP; `renderWithProviders` de `src/test/render.tsx`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: base visual compartilhada, necessária antes de qualquer estilo

- [X] T001 Criar `src/shared/styles/tokens.css` (custom properties: cor do cabeçalho escuro, fundo claro do menu, fundo cinza da área de conteúdo, cor do link atual, cor do texto, cor/offset do foco, largura do menu, altura do cabeçalho, espaçamentos; valores estimados do anexo 1) e `src/shared/styles/global.css` (reset mínimo, `box-sizing`, fonte do sistema, `:focus-visible` com contorno visível, `body` sem margem), e importar os dois em `src/main.tsx`. Sem teste (só CSS); verificar com `npm run dev` e `npm run build`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: fonte única de caminhos/itens e título do documento

**⚠️ CRITICAL**: US1 e US3 dependem de T002

- [X] T002 Criar `src/app/navigation.ts` exportando `paths` (`dashboard: '/dashboard'`, `list: '/list'`) e `navItems: NavItem[]` na ordem `Dashboard`, `List` (labels exatamente "Dashboard" e "List"); `NavItem` é `interface { to: string; label: string }` em `src/shared/ui/NavMenu/NavMenu.types.ts` (criar o arquivo aqui). Sem teste próprio (coberto por `App.test.tsx` em T007).
- [X] T003 [P] Alterar o `<title>` de `index.html` para "Outsera Razzies".

**Checkpoint**: base pronta para as user stories

---

## Phase 3: User Story 1 - Navegar entre as views pelo menu lateral (Priority: P1) 🎯 MVP

**Goal**: cabeçalho + menu lateral com "Dashboard" e "List"; trocar de view sem recarregar; link atual marcado; `/` leva ao Dashboard. Sem estilo ainda (US2), mas com HTML semântico.

**Independent Test**: `renderWithProviders(<App />)`: raiz mostra o `<h1>` "Dashboard"; clicar em "List" mostra o `<h1>` "List" e `aria-current="page"` no link "List".

- [X] T004 [P] [US1] Implementar `NavMenu` em `src/shared/ui/NavMenu/NavMenu.tsx` (props: `items: NavItem[]`, `label: string`; renderiza `<nav aria-label={label}>` com `<ul>` de `NavLink`, `key` = `to`) e teste `src/shared/ui/NavMenu/NavMenu.test.tsx` (componente): links por papel/nome na ordem recebida; `aria-current="page"` só no link da rota atual (usar `MemoryRouter` com `route`); nenhum `aria-current` em rota fora da lista, inclusive subcaminho (`/list/xyz`). Cada `NavLink` recebe `end`, para o link só ser atual na rota exata. Apresentacional: sem conhecer feature.
- [X] T005 [P] [US1] Implementar `AppShell` em `src/shared/ui/AppShell/AppShell.tsx` (props: `title: string`, `nav: ReactNode`, `children: ReactNode`; renderiza `<header>` com o `title` em texto simples, não `<h1>`, a navegação e `<main>` com `children`) e teste `src/shared/ui/AppShell/AppShell.test.tsx` (componente): `banner` contém o título, `navigation` e `main` presentes, `children` dentro de `main`.
- [ ] T006 [P] [US1] Criar `src/features/dashboard/ui/DashboardPage.tsx` (`<h1>Dashboard</h1>`, nada mais) e `src/features/list/ui/ListPage.tsx` (`<h1>List</h1>`). Sem teste próprio: cobertos por `App.test.tsx` (T007).
- [ ] T007 [US1] Reescrever `src/app/App.tsx`: `AppShell` (`title="Outsera Razzies"`, `nav={<NavMenu items={navItems} label="Main" />}`) envolvendo `Routes` com `/` → `<Navigate to={paths.dashboard} replace />`, `paths.dashboard` → `DashboardPage`, `paths.list` → `ListPage`. Criar `src/app/App.test.tsx` (componente): `banner` com o texto "Outsera Razzies"; os links do `navigation` são exatamente "Dashboard" e "List", nessa ordem; raiz mostra "Dashboard"; clicar em "List" troca para o `<h1>` "List"; `/List` e `/list/` abrem a List. Remover de `src/test/smoke.test.tsx` o teste "renders the app shell" (mantém os dois testes de MSW; sem teste duplicado, Art. VI).

**Checkpoint**: US1 funcional e testável sozinha (MVP)

---

## Phase 4: User Story 2 - Layout fiel ao anexo e responsivo (Priority: P2)

**Goal**: aparência do anexo 1, utilizável de 768x1280 a 1440x900, foco visível e sem rolagem horizontal.

**Independent Test**: `npm run test:e2e` nos dois viewports, mais comparação visual manual com `docs/requirements/anexo-1-dashboard.png`.

- [ ] T008 [P] [US2] Estilizar `AppShell` com `src/shared/ui/AppShell/AppShell.module.css` (grid: cabeçalho escuro em largura total; abaixo, coluna do menu com a largura do token e área de conteúdo com fundo neutro; `min-height: 100vh`; sem `overflow-x`; cabeçalho fixo no topo com `position: sticky`, menu lateral `sticky` logo abaixo dele, e só a área de conteúdo rola; incluir o espaçamento do conteúdo e do `h1` via tokens, sem estilo global novo) e aplicar as classes em `AppShell.tsx`. Só tokens (T001). Os testes de T005 continuam passando; sem teste novo (CSS é provado no E2E, T010).
- [ ] T009 [P] [US2] Estilizar `NavMenu` com `src/shared/ui/NavMenu/NavMenu.module.css` (links em texto simples, sem marcador de lista; cor do link atual via `NavLink` `className` com `isActive`; foco visível) e aplicar em `NavMenu.tsx`. Sem teste novo (T004 continua verde; aparência no E2E).
- [ ] T010 [US2] Configurar o E2E: em `playwright.config.ts` trocar o projeto único por dois (`desktop-1440` com viewport 1440x900 e `tablet-768` com viewport 768x1280) e criar `e2e/shell-navigation.spec.ts` com 4 testes cujo título declara o risco de integração: (a) botão voltar do navegador e URL aberta direto mostram a view e o link atual corretos; (b) Tab/Enter percorrem os links e o foco é visível (contorno diferente de `none`); (c) sem rolagem horizontal (`scrollWidth <= clientWidth`) e cabeçalho, menu e conteúdo visíveis; com um espaçador alto injetado em `main` via `page.evaluate`, após rolar a página o cabeçalho continua no topo da viewport e o menu continua visível; (d) com `page.route('**/api/**', route => route.abort())` o shell ainda carrega e navega. Localizar por papel e texto; proibido `waitForTimeout`. Não repetir o que `App.test.tsx` já prova (texto, `aria-current`, redirect).
- [ ] T011 [US2] Conferência visual: com `npm run dev`, abrir em 1440x900 e 768x1280, comparar com `docs/requirements/anexo-1-dashboard.png` e anotar no commit/PR eventuais diferenças aceitas. Sem arquivo novo; ajustar tokens/CSS se necessário (commit `style:` só se houver mudança).

**Checkpoint**: US1 e US2 completas

---

## Phase 5: User Story 3 - Rota inexistente mostra "não encontrado" (Priority: P3)

**Goal**: URL desconhecida mostra página dentro do shell, com saída para o Dashboard.

**Independent Test**: abrir `/qualquer-coisa` e ver "Page not found" com o shell e o link "Go to Dashboard".

- [ ] T012 [US3] Criar `src/app/NotFoundPage.tsx` (`<h1>Page not found</h1>`, um parágrafo curto em inglês e `<Link to={paths.dashboard}>Go to Dashboard</Link>`), adicionar `<Route path="*" element={<NotFoundPage />} />` em `src/app/App.tsx` e estender `src/app/App.test.tsx` (componente): URL inexistente mostra o `h1` e o shell (`banner`, `navigation`); clicar em "Go to Dashboard" mostra o `h1` "Dashboard". (O "nenhum `aria-current`" já é provado em T004; não repetir.)

**Checkpoint**: US1 a US3 completas

---

## Phase 6: User Story 4 - Base de acesso à API pronta (Priority: P3)

**Goal**: cliente HTTP tipado com URL-base de ambiente, `ApiError` e `QueryClient` único. Independente das US1 a US3 (não depende de T002).

**Independent Test**: `npm test` roda `config.test.ts`, `httpClient.test.ts`, `queryClient.test.ts` e `providers.test.tsx` sem rede real.

- [ ] T013 [P] [US4] Criar `src/shared/api/config.ts` com `resolveApiBaseUrl(raw: string | undefined): string` (vazio, só espaços ou `undefined` → `https://challenge.outsera.tech/api/movies`; remove todas as `/` finais) e `export const apiBaseUrl = resolveApiBaseUrl(import.meta.env.VITE_API_BASE_URL)`; criar `src/vite-env.d.ts` com `/// <reference types="vite/client" />` e `interface ImportMetaEnv { readonly VITE_API_BASE_URL?: string }`; criar `.env.example` com `VITE_API_BASE_URL=https://challenge.outsera.tech/api/movies` e um comentário em português de que a variável é pública (sem segredo). Teste unitário `src/shared/api/config.test.ts`: padrão, valor customizado, barra final removida, string vazia.
- [ ] T014 [US4] Criar o cliente HTTP: `src/shared/api/apiError.ts` (`class ApiError extends Error` com campos explícitos `kind: ApiErrorKind` e `status?: number`; **`status` só existe quando `kind` é `'http'`**), `src/shared/api/httpClient.types.ts` (`ApiErrorKind = 'http' | 'network' | 'parse'`; `QueryParams = Record<string, string | number | boolean | undefined>` (**`undefined` é omitido da URL**); `RequestOptions`; `HttpClient`) e `src/shared/api/httpClient.ts` (`createHttpClient(baseUrl)` e `httpClient = createHttpClient(apiBaseUrl)`), seguindo `contracts/http-client.md`: URL = `baseUrl` + `path` (vazio ou iniciando em `/`) + parâmetros, nunca `//`; 2xx com JSON devolve `unknown`; 2xx sem JSON válido → `ApiError{kind:'parse'}`; status fora de 2xx → `ApiError{kind:'http', status}`; falha do `fetch` → `ApiError{kind:'network'}`; `AbortError` propaga sem conversão; não valida campos. Teste unitário (MSW) `src/shared/api/httpClient.test.ts`: URL com e sem base customizada e com barra final; parâmetros com `undefined` omitido; sucesso devolve o corpo; 400 e 500 viram `kind:'http'` com `status`; `HttpResponse.error()` vira `kind:'network'`; corpo 200 não-JSON vira `kind:'parse'`; abort propaga. Depende de T013.
- [ ] T015 [P] [US4] Criar `src/shared/api/queryClient.ts` com `createQueryClient()` (`staleTime` 5 min, `refetchOnWindowFocus: false`, `retry`: até 1 repetição e nunca para `ApiError` com `kind:'http'` e `status` 4xx) e `export const queryClient = createQueryClient()`. Teste unitário `src/shared/api/queryClient.test.ts`: lê os defaults e chama a função `retry` com `ApiError` 404 (não repete), `ApiError` 500 na primeira falha (repete) e na segunda (não repete), e erro de rede (repete uma vez). Depende de T014 só pelo tipo `ApiError`.
- [ ] T016 [US4] Em `src/app/providers.tsx`, remover o `new QueryClient()` local e usar o `queryClient` de `src/shared/api/queryClient.ts`. Criar `src/app/providers.test.tsx` (componente): um componente-filho com `useQueryClient()` dentro de `Providers` recebe a mesma instância exportada por `queryClient.ts`. Depende de T015.

**Checkpoint**: todas as stories completas e independentes

---

## Phase 7: Polish & Cross-Cutting Concerns

- [ ] T017 [P] Atualizar `.github/workflows/ci.yml`: após `npm run build`, adicionar `npx playwright install --with-deps chromium` e `npm run test:e2e`; remover `--pass-with-no-tests` do script `test:e2e` em `package.json` (agora há E2E). Atualizar `docs/tooling.md` (seção Playwright) e a nota do `test:e2e` em `CLAUDE.md`. Depende de T010.
- [ ] T018 [P] Atualizar `README.md` (em português): como configurar `VITE_API_BASE_URL` (`.env.example`), rotas e comandos. Depende de T013.
- [ ] T019 Rodar `npm run format:check && npm run lint && npm run typecheck && npm test && npm run build && npm run test:e2e`; corrigir qualquer falha com commit próprio. Conferir manualmente os 4 estados da UI (N/A nesta entrega, ver Art. IV no plan), acessibilidade e 768x1280 (Art. VII).
- [ ] T020 Revisão: usar o agente `code-reviewer` (diff contra `main`) com foco na constitution e na matriz de testes (sem teste duplicado entre níveis); tratar os achados.
- [ ] T021 Registro de IA: usar a skill `ai-interaction-log` para resumir as fases specify, clarify, plan, tasks e implement em `docs/ai/README.md`; registrar em `docs/ai/decisions.md` qualquer proposta rejeitada ou corrigida pelo James. Sem segredos.

---

## Dependencies & Execution Order

- **Phase 1 → Phase 2** → US1. T002 bloqueia T004 (tipo `NavItem`) e T007.
- **US1**: T004, T005, T006 em paralelo; T007 depois deles.
- **US2** depende de US1 (T008 e T009 alteram os componentes de T004/T005); T010 depende de T008 e T009; T011 depende de T010.
- **US3** depende de T007 (mesmo `App.tsx`/`App.test.tsx`).
- **US4** é independente de US1 a US3 (arquivos diferentes), exceto T016, que altera `providers.tsx` e roda `App` só indiretamente. Ordem interna: T013 → T014 → T015 → T016.
- **Polish**: T017 após T010; T018 após T013; T019 por último de código; T020 e T021 ao fim.

### Parallel Examples

```text
US1:  T004 [NavMenu]   T005 [AppShell]   T006 [Pages]     → depois T007 [App + rotas]
US2:  T008 [AppShell css]   T009 [NavMenu css]   → depois T010 [E2E] → T011 [visual]
US4:  T013 [config]  → T014 [httpClient] → T015 [queryClient] → T016 [providers]
Entre stories: US4 inteira pode andar em paralelo a US2/US3.
```

## Implementation Strategy

- **MVP**: Phases 1, 2 e 3 (US1): menu funcional e testado, mesmo sem estilo.
- **Incremental**: US2 (visual + E2E) → US3 (not found) → US4 (infra de dados). Parar e validar com o `quickstart.md` ao fim de cada fase.
- **Regras do fluxo** (CLAUDE.md): nada é implementado até o James revisar este `tasks.md`; uma tarefa por vez, um commit por tarefa, com teste junto.

## Cobertura da matriz de testes (plan.md → tarefas)

| Critério (plan) | Tarefa |
|-----------------|--------|
| Redirect `/`, troca de view, `/List`, `/list/` | T007 |
| Cabeçalho e links na ordem; `aria-current`; regiões semânticas | T004, T005 |
| Not found + link ao Dashboard | T012 |
| Voltar/URL direta, teclado e foco, sem rolagem horizontal, shell sem API | T010 |
| URL-base, normalização | T013, T014 |
| Sucesso, parâmetros, erros (`http`/`network`/`parse`) | T014 |
| QueryClient único e política de retry | T015, T016 |
| FR-014 (textos em inglês) | Revisão (T020) |
