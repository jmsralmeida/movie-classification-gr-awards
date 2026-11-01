# Quickstart: validar a Lista de filmes

Pré-requisitos: Node >= 22, `npm ci`, features 001 e 002 na branch.

1. **Automático**: `npm run lint && npm run typecheck && npm test`.
2. **E2E**: `npx playwright install chromium` (uma vez) e `npm run test:e2e` (1440x900 e 768x1280; API mockada).
3. **Manual** (`npm run dev`, abrir `http://localhost:5173/list`, API real):
   - título "List movies" e tabela com ID, Year, Title e Winner?; 15 linhas na página 1, começando
     por "Can't Stop the Music" (Winner? = Yes) e "Cruising" (No) (SC-001: em até 2 s);
   - paginação: "Next page" mostra os 15 seguintes e a URL passa a ter `?page=2`; "Last page" vai para
     a página 14 (206 filmes); "First page" e "Previous page" ficam indisponíveis (`aria-disabled`) na página 1;
     com o teclado, acionar "Next page" (Enter) até a última página mantém o foco no botão, e a
     tabela não pisca (a lista anterior fica esmaecida até a resposta);
   - digitar `1980` em "Filter by year" mostra só filmes de 1980, sem botão; digitar `19` não muda a
     lista; digitar `abc` mostra "Enter a 4-digit year." sem requisição (aba Network); apagar o campo
     remove o filtro;
   - escolher "Yes" mostra só vencedores; combinar com `1980` mostra 1 filme; voltar o seletor a "Yes/No"
     remove o filtro; qualquer filtro volta à página 1 (a URL perde `page`);
   - `1800` mostra "No movies found." e nenhuma paginação;
   - copiar a URL (ex.: `/list?page=2&year=1982&winner=false`), abrir em outra aba e conferir o mesmo estado;
     o botão voltar do navegador restaura página e filtros anteriores;
   - `/list?page=abc&year=99&winner=maybe` abre a página 1 sem filtros; na aba Network, nenhuma
     requisição leva esses valores; `/list?page=99` mostra o vazio com a paginação para voltar;
   - **Erro**: no DevTools, bloquear a URL `api/movies` e acionar "Next page"; aparece "Could not load
     this data." com "Try again" e a paginação continua visível, com o foco em "Next page"; desbloquear e acionar o botão recupera a
     mesma página e os mesmos filtros;
   - **Lentidão**: com throttling "Slow 3G", ao trocar de página a lista anterior fica esmaecida até a
     nova chegar; na primeira abertura aparece "Loading…" com os filtros visíveis;
   - Tab percorre o campo de ano, o seletor, os botões da paginação e "Try again" com foco visível;
     redimensionar para 768x1280 mantém as quatro colunas e a paginação em uma linha, sem rolagem horizontal;
   - acessibilidade: rodar o axe do navegador (extensão) e conferir 0 violações (SC-009).
4. **Contrato**: [movies-api](./contracts/movies-api.md), [ui-components](./contracts/ui-components.md),
   [data-model](./data-model.md).
