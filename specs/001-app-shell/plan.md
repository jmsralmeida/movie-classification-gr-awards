# Implementation Plan: App Shell

**Branch**: `001-app-shell` | **Date**: 2026-10-31 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-app-shell/spec.md`

## Summary

Entregar o esqueleto do app: layout (cabeçalho escuro "Outsera Razzies" + menu lateral
"Dashboard"/"List" + área de conteúdo) conforme o anexo 1, rotas `/dashboard` e `/list` com
páginas vazias (só o `<h1>`), redirecionamento de `/` para `/dashboard`, página "não encontrado"
dentro do shell, cliente HTTP tipado (`createHttpClient`) com URL-base vinda de `VITE_API_BASE_URL`
e uma configuração única do `QueryClient`. Nenhuma dependência nova. O código base (Vite, Router,
TanStack Query, MSW, Vitest, Playwright) já existe; esta feature substitui a casca vazia de
`src/app/App.tsx` e `src/app/providers.tsx`.

## Technical Context

**Language/Version**: TypeScript 5.9 (strict), Node >= 22

**Primary Dependencies**: React 19, React Router 8 (`NavLink` já marca `aria-current="page"`),
TanStack Query 5. Nenhuma dependência nova.

**Storage**: N/A (sem persistência; só server state via TanStack Query, sem consultas nesta entrega)

**Testing**: Vitest + Testing Library + MSW (unitário e componente); Playwright (1 jornada E2E)

**Target Platform**: Navegadores modernos, desktop e tablet (>= 768x1280)

**Project Type**: SPA web (Vite)

**Performance Goals**: Sem meta numérica; o shell não faz requisição de rede ao carregar (SC-007)

**Constraints**: Sem rolagem horizontal em 768x1280 e 1440x900; UI em inglês; sem segredo em `VITE_*`

**Scale/Scope**: 3 rotas (`/dashboard`, `/list`, `*`), 2 componentes compartilhados, 1 cliente HTTP

Nenhum item `NEEDS CLARIFICATION` pendente (ver `research.md`).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Artigo | Tema | PASS/FAIL | Evidência / justificativa |
|--------|------|-----------|---------------------------|
| I | Estrutura (`features/<name>/{api,model,ui}`, `shared/`) | FAIL (desvio aprovado pelo James em 2026-10-31, ver Complexity Tracking) | Views em `src/features/dashboard/ui` e `src/features/list/ui`, sem `api/` e `model/` (nascem com as chamadas de API das próximas features). Cliente, QueryClient, UI e tokens em `src/shared/`. `src/app/` só compõe. Nenhuma feature importa outra. |
| II | Dados (TanStack Query, filtros/página na URL) | PASS | Um `QueryClient` único em `src/shared/api/queryClient.ts`; sem store, sem cache paralelo. Filtros e página: fora do escopo (próximas features). |
| III | Contrato HTTP (cliente tipado, mapper, OpenAPI) | PASS | Cliente com entrada tipada e saída `unknown`; mapper fica em cada feature (spec, clarificação 2). Divergências API real × OpenAPI registradas em `research.md` (item R6). |
| IV | Estados da UI (carregando, vazio, erro, sucesso) | PASS | Não há painel assíncrono nesta entrega. As views vazias são estáticas; página "não encontrado" é o estado de erro de rota, com ação de saída. Os 4 estados entram com o painel comum das features seguintes. |
| V | Tipagem (strict, sem `any`, tipos em arquivos próprios) | PASS | Tipos em `*.types.ts`; corpo da resposta é `unknown`; sem `any`. |
| VI | Estratégia de testes (pirâmide sem redundância) | PASS | Matriz abaixo: cada critério em um único nível; 1 E2E com risco declarado. |
| VII | Acessibilidade e layout (768x1280, UI em inglês) | PASS | `header`/`nav`/`main`, `aria-label` na `nav`, `aria-current`, foco visível, sem menu recolhível; viewports verificados no E2E. |
| VIII | Uso de IA (specify → plan → tasks, registro em `docs/ai/`) | PASS | Specify e clarify feitos; plan agora; tasks revisadas pelo James antes de implementar. Registro via skill `ai-interaction-log`. |
| IX | Composição, renderização e segurança | PASS | Props com no máximo 2 níveis; `children` para o conteúdo; sem `useEffect` de dados, sem `memo`, sem `dangerouslySetInnerHTML`; só `VITE_API_BASE_URL` (URL pública, não é segredo). |
| X | Componentização e reutilização | PASS | `AppShell` e `NavMenu` em `shared/ui`, apresentacionais, genéricos (recebem título e itens por props) e com teste próprio. Estilos em CSS Modules + tokens em `src/shared/styles`. |

Restrições de tecnologia: PASS. Dependências fora da stack aprovada: nenhuma.

### Matriz de testes (Art. VI)

| Critério de aceite | Nível (unitário / componente / E2E) | Arquivo |
|--------------------|-------------------------------------|---------|
| US1-1 / FR-005: raiz mostra Dashboard (redirect `/` → `/dashboard`) | Componente | `src/app/App.test.tsx` |
| US1-2 / FR-003 / FR-006: clicar "List" troca o conteúdo e mostra o `<h1>` da view | Componente | `src/app/App.test.tsx` |
| FR-001 / FR-002: cabeçalho "Outsera Razzies" e links "Dashboard", "List" nesta ordem, no app real | Componente | `src/app/App.test.tsx` (o `AppShell.test.tsx` e o `NavMenu.test.tsx` provam só o comportamento genérico) |
| US1-5 / FR-004: link atual com `aria-current="page"` (e nenhum em rota desconhecida, US3-3) | Componente | `src/shared/ui/NavMenu/NavMenu.test.tsx` |
| FR-009: regiões semânticas (`banner`, `navigation`, `main`) | Componente | `src/shared/ui/AppShell/AppShell.test.tsx` |
| US3-1 / US3-2 / FR-007: URL inexistente mostra "não encontrado" no shell, com link para o Dashboard | Componente | `src/app/App.test.tsx` |
| Edge: `/List` e `/list/` resolvem a view List (comportamento padrão do roteador) | Componente | `src/app/App.test.tsx` |
| US1-3 / US1-5 / SC-004: voltar do navegador e URL aberta direto, em navegador real | E2E | `e2e/shell-navigation.spec.ts` |
| US1-4 / FR-009 / SC-003: Tab/Enter percorrem o menu e o foco é visível (CSS real) | E2E | `e2e/shell-navigation.spec.ts` |
| US2 / FR-008 / SC-002: sem rolagem horizontal e shell completo em 768x1280 e 1440x900 | E2E | `e2e/shell-navigation.spec.ts` |
| US2-3: com conteúdo alto, cabeçalho fixo no topo, menu visível e só o conteúdo rola | E2E | `e2e/shell-navigation.spec.ts` |
| US3-3: nenhum link atual em rota desconhecida, inclusive subcaminho (`/list/xyz`) | Componente | `src/shared/ui/NavMenu/NavMenu.test.tsx` |
| SC-007: shell navegável com a API bloqueada (nenhuma dependência de rede) | E2E | `e2e/shell-navigation.spec.ts` |
| US4-1 / US4-2 / FR-011: URL padrão, valor do ambiente, barras normalizadas | Unitário | `src/shared/api/config.test.ts` e `src/shared/api/httpClient.test.ts` |
| US4-3 / FR-010: sucesso devolve o corpo JSON como `unknown`; parâmetros de consulta montados (`undefined` omitido) | Unitário (MSW) | `src/shared/api/httpClient.test.ts` |
| US4-4 / FR-012 / SC-006: 4xx, 5xx, falha de rede, corpo não-JSON viram `ApiError` com `kind` e `status` | Unitário (MSW) | `src/shared/api/httpClient.test.ts` |
| US4-5 / FR-013: uma única configuração de consultas, usada pelo app; política de repetição (sem retry em 4xx) | Unitário | `src/shared/api/queryClient.test.ts` |
| US4-5: o `Providers` do app expõe o `QueryClient` global às views | Componente | `src/app/providers.test.tsx` |
| FR-014: textos em inglês | Revisão de código (sem teste dedicado) | n/a |

Cada critério aparece em um único nível. O E2E não repete texto, `aria-current` nem rotas
que o teste de componente já prova (só o que exige navegador real).

## Project Structure

### Documentation (this feature)

```text
specs/001-app-shell/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── http-client.md
│   └── routes.md
├── checklists/requirements.md
└── tasks.md             # /speckit-tasks (não criado aqui)
```

### Source Code (repository root)

```text
.env.example                       # VITE_API_BASE_URL (documentado; .env real fica fora do git)
src/
├── vite-env.d.ts                  # tipos do Vite + ImportMetaEnv (VITE_API_BASE_URL)
├── main.tsx
├── app/
│   ├── App.tsx                    # rotas + layout (substitui a casca vazia)
│   ├── App.test.tsx
│   ├── navigation.ts              # caminhos e itens do menu (única fonte)
│   ├── NotFoundPage.tsx
│   ├── providers.tsx              # QueryClientProvider (queryClient global) + BrowserRouter
│   └── providers.test.tsx
├── features/
│   ├── dashboard/ui/DashboardPage.tsx   # <h1>Dashboard</h1>, página vazia
│   └── list/ui/ListPage.tsx             # <h1>List</h1>, página vazia
├── shared/
│   ├── api/
│   │   ├── config.ts              # resolveApiBaseUrl + apiBaseUrl
│   │   ├── config.test.ts
│   │   ├── apiError.ts            # classe ApiError
│   │   ├── httpClient.ts          # createHttpClient + httpClient padrão
│   │   ├── httpClient.types.ts
│   │   ├── httpClient.test.ts
│   │   ├── queryClient.ts         # createQueryClient + queryClient global
│   │   └── queryClient.test.ts
│   ├── styles/
│   │   ├── tokens.css             # cores, espaçamentos, larguras
│   │   └── global.css             # reset mínimo, foco visível, fonte
│   └── ui/
│       ├── AppShell/{AppShell.tsx, AppShell.module.css, AppShell.test.tsx}
│       └── NavMenu/{NavMenu.tsx, NavMenu.types.ts, NavMenu.module.css, NavMenu.test.tsx}
└── test/                          # smoke.test.tsx é ajustado (ver abaixo)
e2e/shell-navigation.spec.ts
playwright.config.ts               # dois projetos: 1440x900 e 768x1280
.github/workflows/ci.yml           # passa a instalar o Chromium e rodar test:e2e
```

**Structure Decision**: SPA única (Vite) com `app/` (composição), `features/` (uma pasta por
view) e `shared/` (cliente, QueryClient, UI e tokens), conforme Art. I. O `AppShell` recebe
título, o menu e o conteúdo por `children`/props, sem conhecer feature nem rota (Art. X).

### Impactos em arquivos existentes

- `src/test/smoke.test.tsx`: o teste "renders the app shell" é removido (o título do cabeçalho não é um
  `<h1>`; `App.test.tsx` passa a afirmar o `banner` "Outsera Razzies"). Os outros dois testes (MSW) ficam.
- `src/test/render.tsx`: mantém QueryClient próprio por teste (sem retry); nenhuma mudança necessária.
- `index.html`: `<title>` passa a "Outsera Razzies".
- `README.md` e `CLAUDE.md`: documentar `VITE_API_BASE_URL` e atualizar a nota sobre `test:e2e`.

## Decisões de plan que a spec deixou abertas

- **`/List` e barra final**: usa o padrão do React Router (sem diferenciar maiúsculas nem barra
  final), então `/List` e `/list/` abrem a view List. Link canônico em minúsculas.
- **Local do código**: ver árvore acima (Art. I).
- **Valor da variável**: `VITE_API_BASE_URL` guarda a base completa `https://challenge.outsera.tech/api/movies`,
  como a spec define (FR-011). Os caminhos do cliente são relativos a ela (`""`, `/winnersByYear`...).

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Art. I: `features/dashboard` e `features/list` só com `ui/` (sem `api/` e `model/`) | Esta entrega não faz chamadas de API; não há cliente por endpoint nem payload para mapear. Aprovado pelo James em 2026-10-31. | Pastas vazias com `.gitkeep` seriam arquivos sem função; `api/` e `model/` são criadas pelas features do Dashboard e da Lista, quando houver código. |
