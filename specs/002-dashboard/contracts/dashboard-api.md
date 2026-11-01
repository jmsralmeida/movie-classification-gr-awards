# Contrato: endpoints consumidos pelo Dashboard

Base: `apiBaseUrl` (`https://challenge.outsera.tech/api/movies` por padrão). Caminhos relativos a
ela, via `httpClient.get`. Referência: `docs/requirements/openapi.json`. Verificado na API real em
2026-10-31 (ver `research.md` R7).

| Painel | Chamada | Resposta 200 (`unknown` → mapper) | Erros |
|--------|---------|-----------------------------------|-------|
| Anos | `GET /yearsWithMultipleWinners` | `{ years: [{ year: int, winnerCount: int }] }` → `YearWinCount[]` | rede, 5xx, formato → erro do painel |
| Estúdios | `GET /studiosWithWinCount` | `{ studios: [{ name: string, winCount: int }] }` → `StudioWinCount[]`, depois `selectTopStudios(.., 3)` | idem |
| Produtores | `GET /maxMinWinIntervalForProducers` | `{ min: [ProducerInterval], max: [ProducerInterval] }` → `ProducerIntervals` | idem |
| Busca | `GET /winnersByYear?year=YYYY` | `[ { id, year, title, studios[], producers[], winner } ]` → `WinningMovie[]` | `400` (ano inválido; nunca enviado pelo app), rede, 5xx, formato |

Regras:
- As três consultas automáticas disparam ao montar o Dashboard, em paralelo e independentes.
- `winnersByYear` só é chamada com ano de 4 dígitos (`parseYear`); sem ano, nenhuma requisição.
- Nenhuma contagem, ordenação ou intervalo é recalculado no cliente; o único corte é o top 3 de estúdios.
- Sem `page`/`size`: nenhum destes endpoints é paginado.
- Falha em uma chamada afeta só o painel dela; "Try again" refaz só essa chamada.

## Fetchers e hooks (`features/dashboard/api`)

```ts
// dashboardApi.ts
fetchYearsWithMultipleWinners(signal?: AbortSignal): Promise<YearWinCount[]>
fetchStudios(signal?: AbortSignal): Promise<StudioWinCount[]>          // lista completa
fetchProducerIntervals(signal?: AbortSignal): Promise<ProducerIntervals>
fetchWinnersByYear(year: string, signal?: AbortSignal): Promise<WinningMovie[]>

// useDashboardQueries.ts (todos devolvem UseQueryResult)
useYearsWithMultipleWinners()
useTopStudios()                          // select: selectTopStudios(list, 3)
useProducerIntervals()
useWinnersByYear(year: string | undefined)   // enabled: year !== undefined
```

## Fixtures e handlers (`features/dashboard/testing`)

- `fixtures.ts` exporta os corpos crus (`yearsResponse`, `studiosResponse` com mais de 3 estúdios,
  `intervalsResponse`, `winnersByYear2018Response`) derivados do OpenAPI e da API real.
- `handlers.ts` exporta `dashboardHandlers` (MSW, URL base de `apiBaseUrl`). Testes que precisam de
  lentidão, vazio ou falha usam `server.use(...)` por cima.
