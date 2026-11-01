# Research: Dashboard

Sem `NEEDS CLARIFICATION` aberto. Decisões técnicas e a verificação do contrato.

## R1. Estados assíncronos por painel
- **Decisão**: componente `Panel` em `shared/ui` com `status: 'loading' | 'error' | 'empty' | 'success'`, `title`, `emptyMessage`, `onRetry`, `controls` (slot sempre visível) e `children` (conteúdo de sucesso). `getPanelStatus({ isError, isPending }, isEmpty)` converte o resultado do `useQuery` no status.
- **Racional**: Art. IV e X pedem um componente comum e sem props booleanas por variação; o slot `controls` mantém o formulário de busca visível em carregando/erro/vazio (US3-5) sem criar um segundo componente.
- **Alternativas**: `Suspense` + `ErrorBoundary` por painel (erro de renderização, não de consulta; exigiria `react-error-boundary` ou classe própria, e o "Try again" ficaria mais indireto); repetir o `switch` em cada painel (viola Art. X).

## R2. Tabela
- **Decisão**: `DataTable<T>` com `columns: { id, header, render(row) }[]`, `rows`, `getRowKey`, `caption` e `emptyMessage`. O `caption` fica oculto visualmente (`.visually-hidden`) e dá nome acessível à tabela.
- **Racional**: 5 tabelas no Dashboard e mais uma na Lista; `render` devolve `ReactNode` mas as colunas deste feature devolvem só texto (Art. IX).
- **Alternativas**: uma tabela por painel (duplicação); biblioteca de tabela como TanStack Table (fora da stack, sem ordenação nem paginação nesta feature).

## R3. Validação do formato das respostas
- **Decisão**: guards manuais em `src/shared/api/guards.ts` (`isRecord`, `expectArray`, `expectString`, `expectNumber`) lançando `ApiError('parse', 'Unexpected response shape')`; cada mapper em `model/mappers.ts` compõe os guards e devolve os tipos do domínio.
- **Racional**: respostas pequenas e estáveis; evita dependência. O erro vira o estado de erro do painel (FR-015).
- **Alternativas**: zod/valibot (dependência fora da stack, ~13 kB gzip no zod, para 4 formatos simples); `as` direto no JSON (viola Art. III/V).
- **Custo conhecido**: resposta malformada passa pela política de retry (1 tentativa extra) antes de mostrar o erro.

## R4. Ano buscado na URL
- **Decisão**: `useSearchParams` com a chave `year`. `parseYear(raw)` (`^\d{4}$` após `trim`) é usado no submit e ao ler a URL; valor inválido na URL = "sem busca". Cada busca válida faz `push`.
- **Racional**: Art. II (filtro na URL) e US2-5 (link compartilhável, voltar). O ano da busca é derivado no render, sem estado duplicado.
- **Alternativas**: `useState` + sincronização com a URL (viola Art. IX); `replace` em vez de `push` (voltar não restauraria o ano anterior).

## R5. Campo de busca
- **Decisão**: `<form>` com `<input type="text" inputmode="numeric" name="year">` não controlado, `key` = ano da URL, rótulo "Search by year" (oculto visualmente, com `placeholder` igual como no anexo) e botão `type="submit"` com `aria-label="Search"` e lupa em SVG inline. Mensagem de validação em `<p id>` ligada por `aria-describedby` e `aria-invalid`.
- **Racional**: Enter envia o formulário sem código extra; `type="number"` não permite validar letras (devolve vazio) e mostra setas que o anexo mostra, mas não valem a perda de validação; sem `useEffect` para sincronizar o campo com a URL (Art. IX).
- **Alternativas**: campo controlado + `useEffect` (proibido); biblioteca de ícones (dependência por um ícone).

## R6. Consulta da busca
- **Decisão**: `useWinnersByYear(year?: string)` com `enabled: year !== undefined` e chave `['dashboard', 'winnersByYear', year]`. Sem ano, o painel não depende do status da query (mostra a instrução); com ano, o status vem de `getPanelStatus`.
- **Racional**: `enabled: false` deixa a query `pending`, que seria confundida com carregamento; por isso o painel decide pelo ano antes de olhar a query.
- **Alternativas**: `skipToken` (equivalente; `enabled` é mais legível aqui).

## R7. Contrato real × OpenAPI (Art. III)
Verificado em 2026-10-31 contra `https://challenge.outsera.tech/api/movies`:
- `yearsWithMultipleWinners` → `{"years":[{"winnerCount":2,"year":1986},...]}`: igual ao OpenAPI.
- `studiosWithWinCount` → `{"studios":[{"name","winCount"}]}` com os 28 estúdios, em ordem decrescente de `winCount`. O corte para 3 é apresentação (`selectTopStudios`).
- `maxMinWinIntervalForProducers` → `{"min":[...],"max":[...]}` com `producer`, `interval`, `previousWin`, `followingWin`: igual ao OpenAPI.
- `winnersByYear?year=2018` → **lista** de filmes (o PDF mostrava um objeto; vale o OpenAPI); `year=1800` → `200 []`; `year=abc` ou ausente → `400` com `{detail,instance,status:400,title}` (a divergência do campo `status` já está na 001, R6).
- Os campos `studios` e `producers` de cada filme existem, mas o painel só usa `id`, `year` e `title`.

## R8. Estilo e tokens
- **Decisão**: CSS Modules por componente; tokens novos em `tokens.css` (superfície branca do cartão, borda, fundo do cabeçalho da tabela, cor de erro, cor do botão e tamanhos de título de painel e de tabela); `.visually-hidden` em `global.css`.
- **Racional**: Art. X (tokens, sem valores mágicos). A cor do botão de busca do anexo é azul (`#0d6efd`, igual ao `--color-link`).
- **Alternativas**: um componente `VisuallyHidden` (dois usos e nenhuma lógica; uma classe global basta).

## R9. Dados de teste
- **Decisão**: `features/dashboard/testing/fixtures.ts` com dados derivados do OpenAPI e dos valores reais do anexo 1 (1986/1990/2015, Columbia/Paramount/Warner, Matthew Vaughn, Joel Silver); `handlers.ts` com os handlers MSW. O E2E importa as mesmas fixtures em `e2e/support/mockApi.ts` (`page.route`).
- **Racional**: uma única fonte de dados para componente e E2E; o Playwright transpila TypeScript sozinho, e as fixtures não usam alias.
- **Alternativas**: fixtures duplicadas no E2E (divergem com o tempo); API real nos testes (flaky e proibido pelo setup).
