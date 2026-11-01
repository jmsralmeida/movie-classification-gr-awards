# Research: Movies List

Sem `NEEDS CLARIFICATION` aberto. Decisões técnicas e a verificação do contrato.

## R1. Paginação e filtros no servidor
- **Decisão**: um `useQuery` com chave `['list', 'movies', { page, year, winner }]` e
  `placeholderData: keepPreviousData`. O `queryFn` chama `httpClient.get('', { params })` com
  `page` (base 0), `size` (15), e `year`/`winner` só quando existem (o `httpClient` já omite
  `undefined`). O mapper devolve só o que a tela usa: `movies` e `totalPages`.
- **Racional**: Art. II (server state só no TanStack Query) e FR-003/FR-008. A chave contém todos
  os parâmetros, então o resultado exibido sempre corresponde ao estado atual (Edge "troca rápida").
  `keepPreviousData` mantém a lista anterior visível durante a troca (FR-014, US4-2).
- **Alternativas**: `useInfiniteQuery` (o desafio pede páginas numeradas, não rolagem infinita);
  baixar tudo e paginar no cliente (proibido por FR-003; 206 filmes hoje, mas a API é a fonte).

## R2. Estado na URL
- **Decisão**: `?page=2&year=1999&winner=true`, lido com `useSearchParams`. Funções puras em
  `model/moviesQuery.ts`: `parseMoviesQuery(searchParams)` e `toSearchParams(query)`. O estado
  padrão (página 1, sem filtros) gera URL sem parâmetros. `page` é base 1 e só aceita inteiro
  positivo até `MAX_PAGE = 1_000_000` (acima disso a API, que usa int32, falharia: valor inválido =
  padrão). `winner` só aceita `true` ou `false`. Ano passa por `parseYear`. Cada mudança faz `push`
  (voltar restaura, US3); mudar filtro monta a URL nova sem `page` (volta à página 1, FR-010).
- **Racional**: Art. II e FR-011/FR-012. Parâmetros iguais aos da API reduzem tradução. A
  consulta nunca recebe valor inválido, porque a API real responde 500 para `page<0` e `size<1`
  (R7).
- **Alternativas**: `replace` ao filtrar (voltar não restauraria o filtro anterior); `page` base 0
  na URL (o usuário veria `page=0` com a página 1 destacada); guardar a página em `useState`
  (viola Art. II e IX).

## R3. Campo de ano
- **Decisão**: `<input type="text" inputmode="numeric">` com rascunho em `useState`, ressincronizado
  com a URL no render (mesmo padrão já usado em `WinnersSearchForm`; sem `useEffect` nem `key`, o
  que mantém o foco). `classifyYearInput(draft)` (puro, `model/yearFilter.ts`) devolve
  `empty | partial | valid | invalid`. A cada `onChange`: `valid` e `empty` atualizam a URL (se o
  ano mudou); `partial` (1 a 3 dígitos) não faz nada; `invalid` (letras, decimal, sinal, 5 dígitos
  ou mais) mostra a mensagem "Enter a 4-digit year." ligada ao campo (`aria-invalid`,
  `aria-describedby`, `role="alert"`), derivada do rascunho no render. Sem debounce (clarify:
  completar 4 dígitos já é o gatilho).
- **Racional**: FR-009, US2-7/US2-8. O rascunho é estado de UI legítimo (diferente da URL
  enquanto o usuário digita), não estado derivado. O `type="number"` esconderia o texto inválido.
- **Alternativas**: debounce (consulta com valor parcial, desnecessário); campo não controlado com
  `key` (perde o foco ao filtrar, ver 002).

## R4. Estados dentro da tabela (e não em um `Panel`)
- **Contexto**: o anexo 2 põe os filtros dentro do cabeçalho das colunas, e FR-013 exige que eles
  continuem visíveis em todos os estados. O `Panel` da 002 troca o conteúdo inteiro e mostra
  `controls` fora da tabela.
- **Decisão**: extrair de `Panel` o componente `StatusMessage` (`shared/ui/StatusMessage`, só a
  mensagem de carregando/erro com "Try again"/vazio). `Panel` passa a compor `StatusMessage` (sem
  mudar comportamento). `DataTable` ganha duas props opcionais, sem prop de variação: `columns[].headerControl` (nó
  renderizado dentro do `th`, abaixo do texto) e `statusRow` (linha única com `colSpan` que
  substitui as linhas de dados). A Lista renderiza sempre a tabela com cabeçalho e filtros, e põe o
  `StatusMessage` em `statusRow` quando o estado não é `success`. A decisão do estado continua em
  `getPanelStatus`.
- **Racional**: Art. IV e X (um só componente para as mensagens, sem reimplementar) com o layout
  do anexo e FR-013. `statusRow` é opcional e genérica (qualquer tabela pode usá-la).
- **Alternativas**: usar `Panel` com os filtros em `controls` acima da tabela (foge do anexo e de
  FR-007, que põe os filtros nas colunas); reimplementar as mensagens na Lista (viola Art. X);
  tabela que some e reaparece (os filtros sumiriam).

## R5. Paginação
- **Decisão**: `Pagination` em `shared/ui/Pagination`, apresentacional e genérica
  (`page`, `totalPages`, `onPageChange`, base 1). `<nav aria-label="Pagination">` com lista de
  botões: "First page", "Previous page", números ("Page 3", texto visível `3`, `aria-current="page"`
  na atual), "Next page", "Last page"; glifos `«` `‹` `›` `»` com nome acessível. Janela de 5
  números (`WINDOW_SIZE`), calculada por `getPageWindow` (puro, testado). Destinos: primeira = 1,
  última = `totalPages`, anterior = `min(page - 1, totalPages)`, próxima = `page + 1`. Sem destino
  (marcados com `aria-disabled="true"`, não com `disabled`): primeira/anterior com `page <= 1`;
  próxima/última com `page >= totalPages`. Esses botões continuam focáveis e o clique neles não chama
  `onPageChange`; o estilo vem do seletor `[aria-disabled="true"]` (`--color-pagination-disabled`). Página atual fora do
  intervalo (URL além do total): nenhuma é destacada, e "Previous"/"First"/"Last" levam de volta.
  A Lista só renderiza a paginação com `totalPages > 0`.
- **Racional (foco)**: ao chegar na última página por "Next page" (ou na primeira por "Previous"), o
  botão acionado passaria a `disabled` enquanto está focado, e navegadores podem tirar o foco dele
  (FR-020). Com `aria-disabled` o foco fica e o leitor de tela ainda anuncia o botão como
  indisponível. Durante o carregamento, a `Pagination` não desmonta (R1: `keepPreviousData` mantém a
  lista e o total anteriores), então o foco também fica.
- **Racional**: FR-005/FR-006/FR-015. Botões e não links: o clique atualiza a URL por `setSearchParams`
  e o teste fica mais simples; a URL continua compartilhável. A janela de 5 cabe em 768x1280 (área
  útil de cerca de 544 px).
- **Alternativas**: links `<a href="?page=n">` (equivalente; mais código de montagem de URL);
  reticências com salto para primeira/última (o anexo não mostra; `First`/`Last` já cobrem).

## R6. Foco após falha na troca de página
- **Contexto**: ao acionar "Next page", se a nova consulta falha, não há `data` (o
  `keepPreviousData` só vale enquanto está pendente): a paginação some e o botão focado é
  desmontado, o que levaria o foco ao `body` (FR-020, US4-7).
- **Decisão (revisada após o code review)**: sem efeito. No erro a `Pagination` continua montada com o
  último `totalPages` que o cache tem (`useLastKnownTotalPages`, lido do `QueryCache` no render, sem
  estado espelho), então o botão focado não desmonta. "Try again" também não desmonta na nova
  tentativa: a falha sem dado volta a `pending`, e `ListPage` mantém o erro (`errorUpdatedAt > 0`),
  com `aria-disabled` no botão (`retrying` do `StatusMessage`) e `aria-busy` no `tbody`.
- **Racional**: o efeito de foco original ficou sem caso real e saiu. Limitação: depois de mudar de
  filtro e falhar sem dado para o filtro novo, o total vem do filtro anterior.
- **Alternativas**: manter a paginação montada com o último `totalPages` (exigiria guardar estado
  do servidor fora do TanStack Query, proibido por Art. II); aceitar a perda de foco (viola FR-020).

## R7. Contrato real × OpenAPI (Art. III)
Verificado em 2026-10-31 contra `https://challenge.outsera.tech/api/movies`:
- `GET ?page=0&size=15` → página Spring (`content[]`, `totalElements: 206`, `totalPages: 14`,
  `number`, `size`, `first`, `last`, `empty`...), igual ao OpenAPI. Itens `{ id, year, title,
  studios[], producers[], winner }`. A lista usa só `id`, `year`, `title`, `winner`.
- `year` e `winner` são combináveis (`winner=false&year=1980` filtra os dois).
- `page=999` (além do total) → `200`, `content: []`, `last: true`, `totalPages` mantido.
- `year=1800` → `200`, `content: []`.
- `year=abc` → `400` com corpo `{detail, instance, status: 400, title}` (já registrado em 002).
- `page=-1` e `size=0` → `500` com corpo `{status: "500 INTERNAL_SERVER_ERROR", timestamp, message}`,
  formato diferente do `ApiErrorResponse` do OpenAPI. O app nunca envia esses valores (R2) e usa só
  o status HTTP.
- `size=500` é aceito; o app usa sempre 15.

## R8. Dados de teste
- **Decisão**: `features/list/testing/fixtures.ts` com um conjunto fixo de 40 filmes (1980: 10 filmes, ids 1 a 10;
  1981: 20, ids 11 a 30; 1982: 10, ids 31 a 40; o primeiro de cada ano é o vencedor; títulos reais do
  anexo 2 nos ids 1 a 15) e a função pura `respondToMoviesQuery(searchParams)`, que **emula a API**: filtra por `year`/`winner`, fatia por
  `page`/`size` e devolve a página no formato Spring; para `page < 0` ou `size < 1` devolve `500`, e
  para `year` não numérico, `400`, como a API real; `handlers.ts` (MSW) e o E2E chamam essa função. O E2E reaproveita as fixtures (R9 da 002: só
  dado cru e funções sem imports).
- **Racional**: os testes provam que o app envia os parâmetros certos e que as linhas satisfazem aos
  filtros (SC-004) sem listar respostas à mão; um valor inválido enviado pelo app quebra o teste.
- **Alternativas**: um handler por teste com respostas fixas (frágil, não prova o filtro); API real
  (proibida pelo `setup.ts`).

## R9. Estilo e tokens
- **Decisão (revisada em 2026-10-31)**: o `DataTable` **não** ganha prop de variação. As listras do
  anexo 2 e os cabeçalhos centralizados são composição na feature: `ListPage` envolve a tabela em um
  `<div>` com classe de `ListPage.module.css`, que aplica `tbody tr:nth-child(even)` (fundo
  `--color-table-stripe-bg`) e `th { text-align: center }` por seletor descendente. Para vencer o
  `.table th` do `DataTable.module.css` sem depender da ordem de carga, o seletor da Lista é mais
  específico (`.frame table th`). O `aria-busy` fica só no `tbody` (prop `busy` do `DataTable`); filtros no cabeçalho e a `Pagination` ficam fora. Tokens novos em `tokens.css`:
  `--color-table-stripe-bg`, `--color-pagination-disabled` e `--opacity-busy` (esmaecimento durante a troca de página); o botão da página atual usa
  `--color-button-bg`.
- **Racional**: a diferença é só visual, e Art. X proíbe prop de variação por caso de uso em
  componente compartilhado. O contrato do `DataTable` fica limitado a dois slots opcionais
  (`columns[].headerControl`, `statusRow`), que são estrutura, não aparência. Em 768 px o `th` com
  filtro tem largura suficiente: ID e Winner? estreitos, Year e Title flexíveis.
- **Alternativas**: `variant?: 'plain' | 'striped'` no `DataTable` (proposta inicial: viola o Art. X e
  amplia a API compartilhada para um uso); listras para todas as tabelas (muda o Dashboard sem
  pedido); estilizar por classe global (foge de CSS Modules).

## R10. `parseYear` sobe para `shared`
- **Decisão**: `parseYear` (e seu teste) sai de `features/dashboard/model/year.ts` para
  `src/shared/lib/year.ts`. `YEAR_PARAM` fica no Dashboard e a Lista define o seu. O Dashboard
  passa a importar do `shared`.
- **Racional**: Art. I proíbe a Lista de importar do Dashboard; Art. X manda extrair quando o
  padrão aparece em 2 lugares. É refatoração pura, feita em tarefa e commit próprios, antes da Lista.
- **Alternativas**: duplicar a função (divergência futura); Lista importar do Dashboard (viola Art. I).
