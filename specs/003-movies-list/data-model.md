# Data Model: Movies List

Tipos em `src/features/list/model/movies.types.ts` (Art. V). O payload cru (`unknown`) passa por um
mapper em `model/mappers.ts` antes de chegar à UI (Art. III). Referência:
`docs/requirements/openapi.json` (`PageMovieResponse`, `MovieResponse`).

## Entidades

| Tipo | Campos | Origem | Observações |
|------|--------|--------|-------------|
| `Movie` | `id: number`, `year: number`, `title: string`, `winner: boolean` | `content[]` de `GET /api/movies` | `studios` e `producers` existem na API e são ignorados. Chave de linha: `id`. Texto sempre exibido como texto. |
| `MoviesPage` | `movies: Movie[]`, `totalPages: number` | resposta paginada | Só o que a tela usa. `totalPages` pode ser `0` (resultado vazio); com `page` além do total, `movies` é vazio e `totalPages` continua > 0. |
| `WinnerFilter` | `boolean \| undefined` | `?winner=` da URL | `true` = Yes, `false` = No, `undefined` = Yes/No (sem filtro). |
| `MoviesQuery` | `page: number` (base 1), `year?: string`, `winner?: boolean` | `?page=&year=&winner=` | Derivado da URL no render; é a chave da query. Padrão: `{ page: 1 }`. |

## Regras de validação

- `mapMoviesPage(raw)`: exige objeto com `content` (lista) e `totalPages` (número); cada item exige
  `id` (número), `year` (número), `title` (string) e `winner` (booleano). Qualquer desvio lança
  `ApiError('parse', 'Unexpected response shape')` e a lista mostra o estado de erro (FR-017).
  Campos extras são ignorados. Nova guarda `expectBoolean` em `shared/api/guards.ts`.
- `parseMoviesQuery(searchParams)`:
  - `page`: `^[1-9]\d*$`, valor numérico `<= MAX_PAGE (1_000_000)`; senão `1`.
  - `year`: `parseYear` (4 dígitos após `trim`); senão `undefined`.
  - `winner`: exatamente `true` ou `false`; senão `undefined`.
- `toSearchParams(query)`: omite `page` quando `1`, `year` quando `undefined` e `winner` quando
  `undefined`; estado padrão = URL sem parâmetros.
- `toApiParams(query)`: `{ page: page - 1, size: PAGE_SIZE (15), year, winner }`; os `undefined` não
  são enviados.
- `classifyYearInput(draft)` (campo de ano): após `trim`, `''` → `empty`; `^\d{4}$` → `valid` (com o
  ano); `^\d{1,3}$` → `partial`; qualquer outro valor → `invalid`.

## Estados da lista (derivados no render)

`getPanelStatus({ isError, isPending }, isEmpty)` (o mesmo da 002):

| Situação | Estado | O que a tela mostra |
|----------|--------|---------------------|
| Primeira consulta em andamento | `loading` | cabeçalho com filtros + linha "Loading…" (`role="status"`); sem paginação |
| Consulta com a lista anterior em mãos (`isPlaceholderData`) | `success` | lista anterior, `aria-busy="true"` no `tbody` e linhas esmaecidas; paginação ativa |
| Falha (rede, 4xx/5xx, formato) | `error` | cabeçalho com filtros + "Could not load this data." e "Try again"; sem paginação |
| `movies` vazio | `empty` | cabeçalho com filtros + "No movies found."; paginação só se `totalPages > 0` |
| Com filmes | `success` | linhas + paginação |

## Transições de URL

| Ação do usuário | Resultado em `?page&year&winner` |
|-----------------|----------------------------------|
| Troca de página para `n` | `page=n` (omitido se `n = 1`); filtros mantidos |
| Ano completo de 4 dígitos | `year=AAAA`, `page` removido |
| Campo de ano esvaziado | `year` removido, `page` removido |
| Seletor em Yes / No | `winner=true` / `winner=false`, `page` removido |
| Seletor em Yes/No | `winner` removido, `page` removido |
| Voltar / avançar do navegador | URL anterior/seguinte; controles e tabela acompanham |
