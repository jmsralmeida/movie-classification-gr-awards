# Contrato: componentes e rota do Dashboard

## Rota

`/dashboard` (já existe na 001). `?year=YYYY` opcional; valor inválido = sem busca. Sem outras rotas.

## `Panel` (`src/shared/ui/Panel`)

```ts
// Panel.types.ts
type PanelStatus = 'loading' | 'error' | 'empty' | 'success'

interface PanelProps {
  title: string
  status: PanelStatus
  emptyMessage: string
  onRetry: () => void
  controls?: ReactNode   // sempre visível (ex.: formulário de busca)
  children: ReactNode    // conteúdo de sucesso
}

// panelStatus.ts
getPanelStatus(query: { isError: boolean; isPending: boolean }, isEmpty: boolean): PanelStatus
```

Comportamento:
- `<section aria-labelledby>` com `<h2>` do `title`, sempre renderizado.
- `loading`: texto "Loading…" em `role="status"`.
- `error`: "Could not load this data." em `role="alert"` e botão "Try again" que chama `onRetry`.
- `empty`: `emptyMessage` como texto.
- `success`: `children`.
- `controls` aparece abaixo do título em todos os estados.
- Não busca dados e não conhece feature (Art. X).

## `DataTable<T>` (`src/shared/ui/DataTable`)

```ts
interface Column<T> { id: string; header: string; render: (row: T) => ReactNode }

interface DataTableProps<T> {
  caption: string                 // nome acessível; oculto visualmente
  columns: Column<T>[]
  rows: T[]
  getRowKey: (row: T) => string | number
  emptyMessage?: string           // linha única com colSpan quando rows = []
}
```

Comportamento:
- `<table>` com `<caption class="visually-hidden">`, `<th scope="col">` e uma `<tr>` por item (`key` = `getRowKey`).
- Sem linhas: cabeçalho e, se houver `emptyMessage`, uma linha com a mensagem.
- Células recebem `ReactNode`; os painéis do Dashboard passam só texto.

## Painéis da feature (`src/features/dashboard/ui`)

| Componente | Título (h2) | Tabelas (caption → colunas) | Vazio | Fonte |
|------------|-------------|------------------------------|-------|-------|
| `YearsPanel` | List years with multiple winners | "Years with multiple winners" → Year, Win Count | No years with multiple winners. | `useYearsWithMultipleWinners` |
| `StudiosPanel` | Top 3 studios with winners | "Top 3 studios by wins" → Name, Win Count | No studios found. | `useTopStudios` |
| `ProducersPanel` | Producers with longest and shortest interval between wins | h3 "Maximum" e h3 "Minimum", cada um com "Maximum interval"/"Minimum interval" → Producer, Interval, Previous Year, Following Year | No producers with multiple wins. (painel); "No producers." (tabela vazia isolada) | `useProducerIntervals` |
| `WinnersByYearPanel` | List movie winners by year | "Winners of the selected year" → Id, Year, Title | No winners found for {year}. | `useWinnersByYear(parseYear(?year))` |

`WinnersByYearPanel`:
- Formulário (`WinnersSearchForm`) em `controls`: campo "Search by year" (placeholder igual), botão "Search" (`aria-label`), mensagem "Enter a 4-digit year." ligada ao campo quando inválido.
- Sem ano na URL: `status: 'success'`, tabela sem linhas com `emptyMessage` "Enter a year (e.g. 2018) to see its winners." e nenhuma requisição.
- Submit válido: `setSearchParams({ year })` (push). Submit inválido: só a mensagem.
- `key` do formulário = ano da URL (restaura o campo em voltar/avançar sem `useEffect`).

## `DashboardPage`

`<h1>Dashboard</h1>` e duas colunas: esquerda (`YearsPanel`, `ProducersPanel`), direita
(`StudiosPanel`, `WinnersByYearPanel`). Abaixo de 64rem: uma coluna na ordem anos, produtores,
estúdios, busca.
