# Research: App Shell

Sem `NEEDS CLARIFICATION` aberto. Decisões técnicas e a verificação do contrato.

## R1. Roteamento e link atual
- **Decisão**: `Routes` com `/` → `<Navigate to="/dashboard" replace />`, `/dashboard`, `/list`, `*`; menu com `NavLink`, que já aplica `aria-current="page"`.
- **Racional**: comportamento padrão cobre FR-004 sem código próprio; matching sem diferenciar maiúsculas e barra final cobre o edge case.
- **Alternativas**: roteador de dados (`createBrowserRouter`): sem necessidade (sem loaders); manter `BrowserRouter` já existente.

## R2. Layout
- **Decisão**: CSS Grid (linhas: cabeçalho + resto; colunas: menu de largura fixa + conteúdo), CSS Modules e tokens em `src/shared/styles/tokens.css`. Sem menu hambúrguer: 768 px comporta o menu fixo. Cabeçalho fixo no topo (`position: sticky`) e menu lateral `sticky` logo abaixo; só o conteúdo rola.
- **Racional**: reproduz o anexo 1; menos estado e menos código.
- **Alternativas**: menu recolhível abaixo de 1024 px: fora do escopo da spec.

## R3. Cliente HTTP
- **Decisão**: `createHttpClient(baseUrl)` retorna `{ get(path, { params, signal }) }` sobre `fetch`, com saída `Promise<unknown>`; `ApiError` com `kind` (`http` | `network` | `parse`) e `status` opcional. O cliente padrão usa `apiBaseUrl`.
- **Racional**: `fetch` nativo evita dependência (axios custaria bundle); fábrica com `baseUrl` torna o teste de override trivial, sem manipular `import.meta.env`; `signal` permite cancelamento pelo TanStack Query.
- **Alternativas**: axios/ky (dependência fora da stack, sem ganho); validar campos no cliente (rejeitado na clarificação 2).

## R4. Configuração de ambiente
- **Decisão**: `VITE_API_BASE_URL`; vazio ou ausente cai no padrão `https://challenge.outsera.tech/api/movies`; `resolveApiBaseUrl(raw)` remove barras finais. `.env.example` versionado, `.env*` locais já ignorados via `*.local`; `.env` não é versionado.
- **Racional**: Art. IX (nada secreto em `VITE_*`; a URL é pública).

## R5. QueryClient
- **Decisão**: `createQueryClient()` com `staleTime` de 5 min (dados estáticos de premiação), `refetchOnWindowFocus: false`, retry de até 1 vez e nunca em `ApiError` 4xx; `queryClient` singleton usado em `providers.tsx`. Os testes usam o cliente próprio de `src/test/render.tsx`.
- **Racional**: dados quase imutáveis; erro 4xx não melhora com nova tentativa.
- **Alternativas**: defaults do TanStack (3 retries, refetch no foco): ruído e requisições inúteis.

## R6. Contrato real × OpenAPI (Art. III)
Verificado em 2026-10-31 contra `https://challenge.outsera.tech/api/movies`:
- `GET /api/movies?page=0&size=1` → 200 `application/json`.
- `GET /api/movies/winnersByYear?year=2018` → **lista** de filmes, igual ao OpenAPI (o PDF do desafio mostrava um objeto; vale o OpenAPI).
- Erro 400 real: `{"detail","instance","status":400,"title":"Bad Request"}` (`status` numérico). O OpenAPI (`ApiErrorResponse.status`) o descreve como enum de string (`"400 BAD_REQUEST"`). **Divergência**: o cliente não depende do corpo de erro (usa só o status HTTP) e, se ler `detail`/`title`, trata como `unknown`. Mapper de erro, se existir, fica nas features.
- A base da URL termina em `/api/movies`; os endpoints auxiliares são relativos a ela.
