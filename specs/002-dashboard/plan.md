# Implementation Plan: Dashboard

**Branch**: `002-dashboard` | **Date**: 2026-10-31 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-dashboard/spec.md`

## Summary

Preencher a view Dashboard com quatro painéis (anos com mais de um vencedor, top 3 estúdios,
intervalos de produtores, vencedores por ano), cada um lendo seu endpoint agregado pelo
`httpClient` da feature 001, passando por um mapper em `model/` e sendo exibido por dois
componentes compartilhados novos: `Panel` (cartão com título e os estados carregando, vazio,
erro com "Try again" e sucesso) e `DataTable<T>` (tabela tipada por definição de colunas). O
ano buscado vive em `?year=` (React Router); o campo é não controlado e recebe `key` do ano da
URL, então voltar/avançar restaura o campo sem `useEffect`. Nenhuma dependência nova.

## Technical Context

**Language/Version**: TypeScript 5.9 (strict), Node >= 22

**Primary Dependencies**: React 19, React Router 8 (`useSearchParams`), TanStack Query 5.
Nenhuma dependência nova.

**Storage**: N/A (server state só no TanStack Query; o ano buscado na URL)

**Testing**: Vitest + Testing Library + MSW (unitário e componente); Playwright (3 jornadas E2E)

**Target Platform**: Navegadores modernos, desktop e tablet (>= 768x1280)

**Project Type**: SPA web (Vite)

**Performance Goals**: 3 consultas em paralelo ao abrir; a de busca só roda com ano válido (SC-001)

**Constraints**: Sem rolagem horizontal em 768x1280 e 1440x900; UI em inglês; conteúdo da API só
como texto; sem estilos inline nem valores mágicos (tokens)

**Scale/Scope**: 4 painéis, 2 componentes compartilhados, 4 endpoints, 1 parâmetro de URL

Nenhum item `NEEDS CLARIFICATION` pendente (ver `research.md`).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Artigo | Tema | PASS/FAIL | Evidência / justificativa |
|--------|------|-----------|---------------------------|
| I | Estrutura (`features/<name>/{api,model,ui}`, `shared/`) | PASS | `features/dashboard/` ganha `api/`, `model/` e `ui/`, o que quita o desvio aprovado na 001. `testing/` (fixtures e handlers MSW) é pasta extra, fora do bundle de produção. `Panel` e `DataTable` em `shared/ui`. Nenhuma feature importa outra; `app/` só compõe. |
| II | Dados (TanStack Query, filtros/página na URL) | PASS | 4 `useQuery` com chaves em `dashboardKeys`; nenhum store nem cache paralelo. O ano buscado fica em `?year=`; o rascunho do campo é não controlado. |
| III | Contrato HTTP (cliente tipado, mapper, OpenAPI) | PASS | `httpClient.get` devolve `unknown`; cada endpoint tem mapper em `model/` que valida o formato (falha vira `ApiError('parse')` → erro do painel). Divergência PDF × OpenAPI e erro 400 real registrados em `research.md` (R7); a repetição está em "Divergências" abaixo. |
| IV | Estados da UI (carregando, vazio, erro, sucesso) | PASS | `Panel` implementa os quatro estados e a ação "Try again" (`refetch` só do painel); o painel de busca mantém o formulário visível em qualquer estado (slot `controls`). |
| V | Tipagem (strict, sem `any`, tipos em arquivos próprios) | PASS | `dashboard.types.ts`, `Panel.types.ts`, `DataTable.types.ts`; respostas `unknown` + guards em `shared/api/guards.ts`; sem `any`. |
| VI | Estratégia de testes (pirâmide sem redundância) | PASS | Matriz abaixo: cada critério em um nível; 3 E2E com risco declarado no título. |
| VII | Acessibilidade e layout (768x1280, UI em inglês) | PASS | `section` com `aria-labelledby`, `h2` por painel, `caption` e `th scope="col"` nas tabelas, campo com rótulo, botão "Search" com nome acessível, `role="status"`/`role="alert"`, foco visível herdado; uma coluna abaixo de 64rem. |
| VIII | Uso de IA (specify → plan → tasks, registro em `docs/ai/`) | PASS | Specify, clarify e plan feitos; tasks revisadas pelo James antes de implementar; registro via `ai-interaction-log`. |
| IX | Composição, renderização e segurança | PASS | Cada painel busca seus próprios dados (props de no máximo 2 níveis); estado derivado no render (ano da URL, status do painel); sem `useEffect`, `memo` nem `dangerouslySetInnerHTML`; `key` por id/nome/ano. |
| X | Componentização e reutilização | PASS | `Panel` e `DataTable<T>` apresentacionais, genéricos, sem conhecer a feature, cada um com teste próprio; CSS Modules + tokens novos em `tokens.css`; utilitário global `.visually-hidden` (não é componente). `guards.ts` é compartilhado porque os 4 mappers (e a Lista depois) o usam. |

Restrições de tecnologia: PASS. Dependências fora da stack aprovada: nenhuma. Considerado e
recusado: zod/valibot para validar respostas (ver `research.md` R3) e biblioteca de ícones
(o ícone da lupa é um SVG inline).

### Divergências API real × OpenAPI (Art. III)

Verificadas em 2026-10-31 contra `https://challenge.outsera.tech/api/movies`:

- `winnersByYear` devolve **lista** de filmes (igual ao OpenAPI); o PDF mostrava um objeto. Vale o OpenAPI.
- Ano sem prêmio devolve `200 []`; ano não numérico ou ausente devolve `400` com corpo
  `{detail, instance, status:400, title}` (`status` numérico; o OpenAPI diz enum de string, já registrado na 001).
  O Dashboard só consulta com ano de 4 dígitos e usa só o status HTTP.
- Os outros três endpoints coincidem com o OpenAPI. `studiosWithWinCount` devolve os 28 estúdios já em ordem decrescente de vitórias.

### Matriz de testes (Art. VI)

| Critério de aceite | Nível (unitário / componente / E2E) | Arquivo |
|--------------------|-------------------------------------|---------|
| FR-003 / FR-015 / SC-005: mappers devolvem os valores da API sem alterar contagens, ordem nem anos; formato inesperado (campo ausente, tipo errado, não-lista) lança `ApiError` `parse` | Unitário | `src/features/dashboard/model/mappers.test.ts` |
| FR-005 / US1-2: no máximo 3 estúdios, na ordem da API; menos de 3 mostra os que existirem | Unitário | `src/features/dashboard/model/mappers.test.ts` (`selectTopStudios`) |
| FR-008 / FR-010 / Edge: ano válido = 4 dígitos após `trim`; letras, decimal, negativo, vazio, 3 e 5 dígitos e `?year=abc` viram "sem ano" | Unitário | `src/features/dashboard/model/year.test.ts` |
| Guards de formato (`isRecord`, `expectArray`, `expectString`, `expectNumber`) | Unitário | `src/shared/api/guards.test.ts` |
| FR-011 / FR-012 / FR-013 / FR-014 / US3: `Panel` mostra título sempre; carregando com `role="status"`; vazio com a mensagem recebida; erro com `role="alert"` e "Try again" que chama `onRetry`; sucesso mostra `children`; `controls` aparece em todos os estados | Componente | `src/shared/ui/Panel/Panel.test.tsx` |
| `getPanelStatus` (erro tem prioridade; sem dado = carregando; lista vazia = vazio) | Unitário | `src/shared/ui/Panel/panelStatus.test.ts` |
| FR-018 / Art. X: `DataTable` com `caption`, `th scope="col"`, uma linha por item com `key` estável, `emptyMessage` quando sem linhas, células só como texto (conteúdo com `<b>` aparece literal) | Componente | `src/shared/ui/DataTable/DataTable.test.tsx` |
| FR-001 / FR-004 / US1-1: painel de anos com título e colunas "Year" e "Win Count", uma linha por ano | Componente (MSW) | `src/features/dashboard/ui/YearsPanel.test.tsx` |
| FR-005 / US1-2: painel de estúdios com colunas "Name" e "Win Count", só os 3 primeiros da lista completa da API | Componente (MSW) | `src/features/dashboard/ui/StudiosPanel.test.tsx` |
| FR-006 / US1-3 / US1-4: tabelas "Maximum" e "Minimum" com 4 colunas; empates listados; só uma tabela vazia mostra a mensagem dela e o painel segue em sucesso; ambas vazias = estado de vazio do painel | Componente (MSW) | `src/features/dashboard/ui/ProducersPanel.test.tsx` |
| FR-007 / FR-009 / US2-1: antes de buscar, campo "Search by year", botão "Search", tabela só com cabeçalho e instrução, e nenhuma chamada a `winnersByYear` | Componente (MSW) | `src/features/dashboard/ui/WinnersByYearPanel.test.tsx` |
| US2-2 / US2-3 / FR-007: buscar por clique e por Enter chama `winnersByYear?year=` e lista todos os vencedores (Id, Year, Title) | Componente (MSW) | `src/features/dashboard/ui/WinnersByYearPanel.test.tsx` |
| US2-4 / US2-5 / FR-010: nova busca troca a tabela e o `?year=`; renderizar com `?year=` preenche o campo e a tabela; `?year=abc` = sem busca | Componente (MSW + `MemoryRouter`) | `src/features/dashboard/ui/WinnersByYearPanel.test.tsx` |
| US2-6 / FR-008: campo vazio ou inválido mostra mensagem ligada ao campo (`aria-invalid`, `aria-describedby`), sem requisição; digitar de novo e buscar válido limpa a mensagem | Componente (MSW) | `src/features/dashboard/ui/WinnersByYearPanel.test.tsx` |
| Edge: ano sem vencedores (`200 []`) mostra o vazio "No winners found for 1800", diferente do estado inicial | Componente (MSW) | `src/features/dashboard/ui/WinnersByYearPanel.test.tsx` |
| US3-5: erro na busca mantém campo e ano digitado, e "Try again" repete a mesma consulta | Componente (MSW) | `src/features/dashboard/ui/WinnersByYearPanel.test.tsx` |
| FR-011 / US3-1..4 / SC-003 / SC-004: com um endpoint lento, vazio ou falhando (um por vez, nos 4 painéis), só aquele painel muda de estado; "Try again" refaz só a requisição dele e os outros não são pedidos de novo | Componente (MSW) | `src/features/dashboard/ui/DashboardPage.test.tsx` |
| FR-016 / Edge: título e nomes com `<img onerror>` ou `&amp;` aparecem como texto literal | Componente (MSW) | `src/features/dashboard/ui/StudiosPanel.test.tsx` |
| Impacto na 001: o app abre o Dashboard na raiz com as quatro respostas mockadas | Componente | `src/app/App.test.tsx` (ajuste, ver "Impactos") |
| US2-5 / FR-010 / Art. II: URL com `?year=`, recarregar e botão voltar restauram a busca em navegador real | E2E | `e2e/dashboard.spec.ts` — "year search: URL, reload and back restore the table (router + history + query)" |
| US4-1 / US4-2 / FR-017 / SC-006: duas colunas em 1440x900, uma coluna e sem rolagem horizontal em 768x1280, quatro painéis visíveis (CSS real) | E2E | `e2e/dashboard.spec.ts` — "real CSS layout: two columns at 1440, one column without horizontal scroll at 768" |
| US4-3 / FR-018 / SC-007: Tab chega ao campo e ao botão com anel de foco visível (CSS real) | E2E | `e2e/dashboard.spec.ts` — "real CSS: the search field and button show a focus ring when reached with Tab" |
| FR-019: textos em inglês | Revisão de código (sem teste dedicado) | n/a |
| SC-001: dados em até 2 s | Verificação manual (`quickstart.md`) | n/a |
| SC-007: nenhuma violação automática de acessibilidade | Parcial: consultas por papel e rótulo nos testes de componente; verificação manual com o leitor de tela/axe do navegador (`quickstart.md`). Sem dependência nova (axe-core está fora da stack) | n/a |

Cada critério aparece em um único nível. O E2E não repete estados de painel, validação nem
formatação (já provados nos testes de componente), só o que exige navegador real.

## Project Structure

### Documentation (this feature)

```text
specs/002-dashboard/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── dashboard-api.md
│   └── ui-components.md
├── checklists/requirements.md
└── tasks.md             # /speckit-tasks (não criado aqui)
```

### Source Code (repository root)

```text
src/
├── app/App.test.tsx                      # ajustado (handlers do Dashboard)
├── features/dashboard/
│   ├── api/
│   │   ├── dashboardApi.ts               # 4 fetchers: httpClient.get + mapper
│   │   ├── dashboardKeys.ts              # chaves de query
│   │   └── useDashboardQueries.ts        # useYearsWithMultipleWinners, useTopStudios, useProducerIntervals, useWinnersByYear
│   ├── model/
│   │   ├── dashboard.types.ts            # YearWinCount, StudioWinCount, ProducerInterval, ProducerIntervals, WinningMovie
│   │   ├── mappers.ts                    # 4 mappers + selectTopStudios (+ mappers.test.ts)
│   │   └── year.ts                       # parseYear, YEAR_PARAM (+ year.test.ts)
│   ├── testing/
│   │   ├── fixtures.ts                   # dados derivados do OpenAPI e da API real (também usados pelo E2E)
│   │   └── handlers.ts                   # handlers MSW dos 4 endpoints
│   └── ui/
│       ├── DashboardPage.tsx             # <h1> + grade de duas colunas (+ DashboardPage.test.tsx, .module.css)
│       ├── YearsPanel.tsx                # (+ .test.tsx)
│       ├── StudiosPanel.tsx              # (+ .test.tsx)
│       ├── ProducersPanel.tsx            # (+ .test.tsx)
│       ├── WinnersByYearPanel.tsx        # painel + ano da URL + query (+ .test.tsx)
│       ├── WinnersSearchForm.tsx         # campo, botão, validação (sem teste próprio: coberto pelo painel)
│       └── *.module.css
└── shared/
    ├── api/
    │   ├── guards.ts                     # isRecord, expectArray, expectString, expectNumber (+ guards.test.ts)
    │   └── apiError.ts                   # (inalterado; mappers lançam ApiError('parse', ...))
    ├── styles/
    │   ├── tokens.css                    # + cor de superfície, borda, cabeçalho de tabela, erro, botão, tamanhos
    │   └── global.css                    # + utilitário .visually-hidden
    └── ui/
        ├── Panel/{Panel.tsx, Panel.types.ts, panelStatus.ts, panelStatus.test.ts, Panel.module.css, Panel.test.tsx}
        └── DataTable/{DataTable.tsx, DataTable.types.ts, DataTable.module.css, DataTable.test.tsx}
e2e/
├── dashboard.spec.ts
└── support/mockApi.ts                    # page.route com as fixtures de features/dashboard/testing
```

**Structure Decision**: mesma SPA da 001. A feature ganha `api/`, `model/` e `ui/`; o que é
genérico (painel com estados, tabela tipada, guards de formato) sobe para `shared/` por ter 4
usos agora e a Lista como próximo consumidor (Art. X). `WinnersSearchForm` não tem teste próprio:
o comportamento é do painel e provado ali (Art. VI).

### Layout

`DashboardPage` renderiza `<h1>Dashboard</h1>` e duas colunas: esquerda (anos, produtores) e
direita (estúdios, busca por ano), como o anexo 1. Abaixo de `64rem` de largura da janela vira
uma coluna na ordem anos, produtores, estúdios, busca. Em 768 px a área de conteúdo tem cerca de
544 px, pequeno demais para duas tabelas de quatro colunas lado a lado, por isso uma coluna ali.
O valor do breakpoint não pode ser variável CSS, então fica comentado no módulo (única exceção a
"sem valores mágicos").

### Impactos em arquivos existentes

- `src/features/dashboard/ui/DashboardPage.tsx`: deixa de ser só o `<h1>`.
- `src/app/App.test.tsx`: o app agora faz 3 requisições ao abrir `/dashboard`; como o setup falha
  requisição sem handler, os testes que renderizam o Dashboard usam `server.use(...dashboardHandlers)`.
- `e2e/shell-navigation.spec.ts`: os 3 primeiros testes abrem `/dashboard` e passariam a bater na API
  real; passam a chamar `mockDashboardApi(page)` (o 4º, que bloqueia a API de propósito, não muda).
- `src/shared/styles/tokens.css` e `global.css`: tokens e utilitário novos (acima).
- `README.md`: seção do Dashboard e do `?year=`. `CLAUDE.md` não muda (nenhum script novo).

## Decisões de plan que a spec deixou abertas

- **Campo de ano**: `<input type="text" inputmode="numeric">`, não `type="number"`: o `number`
  devolve `""` para letras e esconde o texto inválido, impedindo a mensagem de validação (FR-008).
- **Rascunho do campo**: não controlado, com `key` = ano da URL; ler o valor no submit via `FormData`.
  Sem `useState` nem `useEffect` para sincronizar (Art. IX).
- **Busca em andamento**: o painel mostra "Loading" no lugar da tabela; o formulário permanece
  (slot `controls`). Os dados de uma busca anterior não ficam na tela.
- **Histórico**: cada busca válida faz `push` (voltar volta ao ano anterior, US2-5). Buscar o ano que
  já está na URL não faz nada.
- **Nova tentativa**: `refetch` da query do painel; resposta de formato inesperado também gera
  erro e a política de retry global (1 tentativa em erro não-4xx) vale para ela.
- **Mensagens** (inglês): erro "Could not load this data."; vazio por painel ("No years with multiple
  winners.", "No studios found.", "No producers with multiple wins.", "No winners found for {year}.");
  instrução inicial "Enter a year (e.g. 2018) to see its winners."; validação "Enter a 4-digit year.".

## Complexity Tracking

Sem violações. O desvio do Art. I aprovado na 001 é quitado por esta feature (`api/` e `model/` criadas).
