# Contrato: componentes e rota da Lista

## Rota

`/list` (já existe na 001). Parâmetros opcionais: `page` (inteiro >= 1), `year` (4 dígitos),
`winner` (`true` | `false`). Parâmetro inválido é ignorado. O link "List" do menu aponta para
`/list` sem parâmetros. O `<h1>` passa de "List" para "List movies" (anexo 2).

## `Pagination` (novo, `src/shared/ui/Pagination`)

```ts
interface PaginationProps {
  page: number                       // atual, base 1 (pode estar além de totalPages)
  totalPages: number                 // >= 1
  onPageChange: (page: number) => void
}
// pageWindow.ts
getPageWindow(page: number, totalPages: number, size?: number): number[]  // size padrão 5
```

- `<nav aria-label="Pagination">` com `<ul>` de botões, nesta ordem: "First page", "Previous page",
  números ("Page N", texto visível `N`), "Next page", "Last page".
- A página atual tem `aria-current="page"`; se `page > totalPages`, nenhuma tem.
- Sem destino: First com `page <= 1`; Previous com `page <= 1`; Next com `page >= totalPages`; Last só
  com `page === totalPages` (além do total ainda leva de volta a uma página válida). Esses botões
  recebem `aria-disabled="true"` (nunca o atributo `disabled`), continuam focáveis e ignoram o clique
  (`onPageChange` não é chamado). Assim o foco não se perde ao chegar na primeira ou na última página.
- Destinos: First = 1; Last = `totalPages`; Previous = `min(page - 1, totalPages)`; Next = `page + 1`.
- `getPageWindow`: até `size` números consecutivos, centrados na página atual, deslocados para
  caber em `[1, totalPages]`; com `page` fora do intervalo, devolve a janela final.
- Não busca dados, não conhece a feature (Art. X).

## `StatusMessage` (novo, extraído de `Panel`, `src/shared/ui/StatusMessage`)

```ts
interface StatusMessageProps {
  status: 'loading' | 'error' | 'empty'
  emptyMessage: string
  onRetry: () => void
  retryRef?: Ref<HTMLButtonElement>
}
```

- `loading`: "Loading…" em `role="status"`. `error`: "Could not load this data." em `role="alert"`
  e botão "Try again" (`onRetry`, `retryRef`). `empty`: `emptyMessage` como texto.
- `Panel` passa a renderizar `StatusMessage` para `loading`, `error` e `empty`; comportamento e
  textos iguais aos da 002.

## `DataTable<T>` (alterado, `src/shared/ui/DataTable`)

```ts
interface Column<T> {
  id: string
  header: string
  render: (row: T) => ReactNode
  headerControl?: ReactNode      // NOVO: dentro do th, abaixo do texto (ex.: filtro)
}

interface DataTableProps<T> {
  // ...props existentes
  statusRow?: ReactNode          // NOVO: uma linha com colSpan no lugar das linhas de dados
}
```

- Com `statusRow`, as linhas de dados e `emptyMessage` não são renderizadas; o cabeçalho continua.
- `columns[].headerControl` fica dentro do `th` da própria coluna, abaixo do texto de `header`. O
  nome acessível do `th` pode incluir o valor do controle embutido; por isso os testes localizam os
  controles por papel (`textbox`, `combobox`), não pelo nome do `columnheader`.
- Aparência (listras, alinhamento dos cabeçalhos) **não** é prop: quem usa a tabela compõe com um
  wrapper e CSS próprio.
- As duas props são opcionais; sem elas, o Dashboard renderiza exatamente como antes.

## `ListPage` e filhos (`src/features/list/ui`)

| Componente | Responsabilidade |
|------------|------------------|
| `ListPage` | `<h1>List movies</h1>`; lê a query da URL (`useListParams`), chama `useMovies`, monta `DataTable` (caption "Movies") dentro de um wrapper de `ListPage.module.css` (listras e cabeçalhos centralizados) com `statusRow` quando o estado não é `success`, `aria-busy` num wrapper só da tabela durante `isPlaceholderData` (a `Pagination` fica fora), `Pagination` quando `totalPages > 0` e o foco no "Try again" (R6). |
| `useListParams` | `useSearchParams` → `{ query, setPage, setYear, setWinner }`; filtros montam a URL sem `page`. |
| `YearFilter` | Campo "Filter by year" (rótulo oculto, `placeholder` igual), rascunho local, validação derivada (R3). Lê e grava a URL pelo `useListParams`. |
| `WinnerFilter` | `<select>` com rótulo oculto "Filter by winner" e opções "Yes/No", "Yes", "No". Valor derivado da URL. |

Colunas: `ID` | `Year` (+ `YearFilter`) | `Title` | `Winner?` (+ `WinnerFilter`); `Winner?` renderiza
"Yes"/"No". Nomes acessíveis dos controles: textbox "Filter by year", combobox "Filter by winner".
Props atravessam no máximo 1 nível (Art. IX); os filtros usam o hook, não props encadeadas.
