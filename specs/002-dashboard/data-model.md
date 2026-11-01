# Data Model: Dashboard

Tipos em `src/features/dashboard/model/dashboard.types.ts` (Art. V). O payload cru (`unknown`) passa
por um mapper em `model/mappers.ts` antes de chegar à UI (Art. III). Referência:
`docs/requirements/openapi.json`.

## Entidades

| Tipo | Campos | Origem (endpoint → campo cru) | Observações |
|------|--------|-------------------------------|-------------|
| `YearWinCount` | `year: number`, `winnerCount: number` | `yearsWithMultipleWinners` → `years[]` | Ordem da API preservada; chave de linha: `year`. |
| `StudioWinCount` | `name: string`, `winCount: number` | `studiosWithWinCount` → `studios[]` | Lista completa e ordenada pela API; `selectTopStudios(list, 3)` corta na exibição; chave: `name`. |
| `ProducerInterval` | `producer: string`, `interval: number`, `previousWin: number`, `followingWin: number` | `maxMinWinIntervalForProducers` → `min[]` e `max[]` | Chave: `producer-previousWin-followingWin` (o mesmo produtor pode aparecer em dois intervalos empatados). |
| `ProducerIntervals` | `max: ProducerInterval[]`, `min: ProducerInterval[]` | idem | Os dois grupos podem ter vários itens (empates) e podem estar vazios. |
| `WinningMovie` | `id: number`, `year: number`, `title: string` | `winnersByYear` → lista de `MovieResponse` | Só os campos exibidos; `studios`, `producers` e `winner` são ignorados. Chave: `id`. |
| `SearchedYear` | `string` de 4 dígitos, ou `undefined` | `?year=` da URL | Derivado no render por `parseYear`; `undefined` = sem busca. |

## Regras de validação

- Cada mapper exige o objeto/lista esperado e os campos tipados acima; qualquer desvio lança
  `ApiError('parse', 'Unexpected response shape')` e o painel mostra o estado de erro (FR-015).
  Campos extras são ignorados.
- `parseYear(raw)`: `raw` nulo → `undefined`; `trim`; aceita só `^\d{4}$`; caso contrário `undefined`.
  Mesma função para o submit do formulário e para ler `?year=` (FR-008, FR-010).
- Texto da API nunca é interpretado como HTML (FR-016).

## Estados de cada painel (derivados no render)

`getPanelStatus({ isError, isPending }, isEmpty)`:

1. `isError` → `error` (ação "Try again" = `refetch`).
2. `isPending` → `loading`.
3. `isEmpty` → `empty`: anos, estúdios e vencedores com lista vazia; produtores só se `max` e `min` vazios.
4. Senão → `success`.

Painel de busca: sem ano na URL não há status de query; mostra `success` com a tabela sem linhas
e a instrução inicial (FR-009). Com ano, usa a regra acima.

## Chaves de query

`dashboardKeys.yearsWithMultipleWinners` = `['dashboard', 'years-with-multiple-winners']`,
`.studios` = `['dashboard', 'studios-with-win-count']`,
`.producerIntervals` = `['dashboard', 'producer-intervals']`,
`.winnersByYear(year)` = `['dashboard', 'winners-by-year', year]`.

## Transições

Sem máquina de estados própria. Ciclo de cada painel: `loading → success | empty | error`;
`error → loading` ao acionar "Try again". Busca: sem ano → (submit válido) ano na URL → `loading
→ ...`; trocar o ano troca a chave da query e volta a `loading` (ou `success` se já estiver em cache).
