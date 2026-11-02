# Contrato: consulta de filmes da Lista

Base: `apiBaseUrl` (`https://challenge.outsera.tech/api/movies` por padrão). A Lista chama a própria
base (caminho vazio) via `httpClient.get('', { params, signal })`. Referência:
`docs/requirements/openapi.json` (`find`). Verificado na API real em 2026-10-31 (`research.md` R7).

| Consulta | Parâmetros | Resposta 200 (`unknown` → mapper) | Erros |
|----------|------------|-----------------------------------|-------|
| `GET ?page={n}&size=15[&year=AAAA][&winner=true\|false]` | `page` base 0 (= página da URL - 1), `size` fixo 15; `year` e `winner` só quando há filtro | `{ content: [{ id, year, title, studios[], producers[], winner }], totalPages, totalElements, number, size, ... }` → `MoviesPage` | rede, 4xx, 5xx, formato → estado de erro da lista |

Regras:
- O app nunca envia `page < 0`, `size < 1` nem `year` fora de `^\d{4}$` (a API real responde 500
  para os dois primeiros e 400 para o ano, com corpos de formato diferente; só o status importa).
- Filtros e paginação são da API: o cliente não filtra, não reordena e não corta a lista.
- `page` além do total devolve `200` com `content: []`; é estado de vazio, não erro.
- Cada combinação (`page`, `year`, `winner`) é uma consulta distinta; trocar qualquer valor não
  reaproveita a resposta anterior, exceto como placeholder visual enquanto carrega.
- "Try again" repete a consulta com os mesmos parâmetros (`refetch`).

## Fetcher, chave e hook (`features/list/api`)

```ts
// moviesApi.ts
fetchMovies(query: MoviesQuery, signal?: AbortSignal): Promise<MoviesPage>

// moviesKeys.ts
moviesKeys.list(query: MoviesQuery) // ['list', 'movies', { page, year, winner }]

// useMovies.ts
useMovies(query: MoviesQuery) // useQuery + placeholderData: keepPreviousData
```

## Fixtures e handlers (`features/list/testing`)

- `fixtures.ts` (só dado e funções puras, sem imports): 40 filmes (1980: 10; 1981: 20; 1982: 10; o
  primeiro de cada ano vencedor), `buildMoviesPageResponse(movies, page, size)` que monta a página
  Spring e `respondToMoviesQuery(searchParams)` que emula a API: filtra por `year`/`winner`, fatia por
  `page`/`size`, responde `500` para `page < 0` ou `size < 1` e `400` para `year` não numérico.
- `handlers.ts`: `listHandlers` (MSW) chama `respondToMoviesQuery` para a rota base.
  Testes de lentidão, vazio e falha usam `server.use(...)` por cima.
