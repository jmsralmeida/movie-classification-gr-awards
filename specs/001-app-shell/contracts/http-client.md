# Contrato: cliente HTTP (`src/shared/api`)

```ts
// httpClient.types.ts
type QueryParams = Record<string, string | number | boolean | undefined>
interface RequestOptions { params?: QueryParams; signal?: AbortSignal }
interface HttpClient { get(path: string, options?: RequestOptions): Promise<unknown> }

// httpClient.ts
createHttpClient(baseUrl: string): HttpClient
httpClient: HttpClient            // createHttpClient(apiBaseUrl)

// config.ts
resolveApiBaseUrl(raw: string | undefined): string   // vazio/undefined → padrão; remove "/" finais
apiBaseUrl: string
```

Comportamento:
- URL final = `baseUrl` + `path` (`path` vazio ou iniciando em `/`) + `?` + parâmetros (sem `undefined`); nunca `//`.
- 2xx com JSON → devolve o corpo (`unknown`). 2xx sem JSON válido → `ApiError{kind:'parse'}`.
- Status fora de 2xx → `ApiError{kind:'http', status}`. Falha do `fetch` → `ApiError{kind:'network'}`.
- `AbortError` do `signal` não é convertido: propaga como veio (para o TanStack Query cancelar).
- Não valida campos; cada feature usa seu mapper (Art. III).
- Referência de endpoints: `docs/requirements/openapi.json`.
