# Quickstart: validar o Dashboard

Pré-requisitos: Node >= 22, `npm ci`, feature 001 (shell) na branch.

1. **Automático**: `npm run lint && npm run typecheck && npm test`.
2. **E2E**: `npx playwright install chromium` (uma vez) e `npm run test:e2e` (1440x900 e 768x1280; API mockada).
3. **Manual** (`npm run dev`, abrir `http://localhost:5173/dashboard`, API real):
   - os painéis "List years with multiple winners", "Top 3 studios with winners" e "Producers with
     longest and shortest interval between wins" mostram dados (SC-001: em até 2 s);
   - o estúdio líder é Columbia Pictures e o painel de estúdios tem no máximo 3 linhas;
   - em "List movie winners by year", digitar `2018` e acionar "Search" (clique ou Enter) mostra
     "Holmes & Watson"; a URL passa a ter `?year=2018`; recarregar e voltar do navegador restauram a tabela;
   - digitar `abc` ou deixar vazio mostra "Enter a 4-digit year." sem requisição (aba Network);
   - `1800` mostra "No winners found for 1800.";
   - **Erro isolado**: no DevTools, bloquear `studiosWithWinCount` e recarregar; só o painel de
     estúdios mostra "Could not load this data." e "Try again"; desbloquear e acionar o botão recupera só ele;
   - **Lentidão**: com throttling "Slow 3G", cada painel mostra "Loading…" e aparece sozinho;
   - Tab percorre o campo, o botão e os "Try again" com foco visível; redimensionar para 768x1280 vira
     uma coluna sem rolagem horizontal;
   - acessibilidade: rodar o axe do navegador (extensão) e conferir 0 violações (SC-007).
4. **Contrato**: [dashboard-api](./contracts/dashboard-api.md), [ui-components](./contracts/ui-components.md),
   [data-model](./data-model.md).
