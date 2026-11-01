# Revisão da feature 003-movies-list

Revisor: agente `code-reviewer` (diff da branch contra `main`). Veredito: aprovar com ressalvas, sem defeito de severidade alta. Lint, typecheck, 279 testes e `format:check` passaram na revisão; E2E e build não foram rodados pelo revisor (a T023 já os tinha rodado).

| # | Severidade | Achado | Destino |
| --- | --- | --- | --- |
| M1 | Média | Foco do teclado se perde ao acionar "Try again": o botão é desmontado durante o retry e o efeito de foco só roda ao entrar em erro (`ListPage.tsx`; FR-020, US4-7, Art. VII) | Aceito. Corrigido em `4761239` (botão montado com `aria-disabled` durante o retry; testes de foco no sucesso e na nova falha) |
| M2 | Média | Após falha ao trocar de página a `Pagination` some e a US4-6 não é alcançável pela página; o teste "leaves the error by changing a filter or the page" só trocava o filtro | Aceito. Corrigido em `77ef519` (paginação sempre visível no erro, com o último `totalPages` conhecido; teste dividido e ampliado) |
| M3 | Média | Retry que falha com dados em cache mostra erro e paginação antiga juntos, sem feedback durante o retry | Aceito, resolvido junto com M2 em `77ef519` (regra única + `aria-busy` no `tbody` durante o retry + teste do caso com cache) |
| B1 | Baixa | Texto da T010 e `contracts/ui-components.md` contradizem o teste: "Last" só fica sem destino com `page === totalPages` | Aceito. Docs corrigidos em `f7a612c`; o código da `Pagination` não mudou |
| B2 | Baixa | `aria-busy` e o esmaecimento cobriam também os filtros | Aceito. Corrigido em `f20ff88` (prop `busy` no `DataTable`, só no `tbody`) |
| B3 | Baixa | `white-space: nowrap` atingia a célula `colSpan` da linha de status | Aceito. Corrigido em `40c74d2` (restrito a `td:not([colspan])`; screenshots idênticos em 768 e 1440). Token `--filter-select-min-width` mantido |
| B4 | Baixa | Teste da T018 usava `setTimeout(r, 0)` e podia dar falso verde | Aceito. Corrigido em `70cacee` (espera o estado da query e confere que os ids 16 a 30 nunca aparecem) |

Observações do implementador:

- O efeito de foco da T019 foi removido: com a `Pagination` montada no erro, o foco não cai no `body`. É consequência de M2+M3, mais do que o pedido literal. O teste virou "o foco permanece em Next page quando a página falha".
- B4: a troca de página cancela a query anterior, então não há estado `success` para esperar; o teste espera `idle`, ausência de dado e ausência dos ids 16 a 30. É mais fraco do que o desejado, porque não há como observar no cliente a entrega de uma resposta abortada.
- Limitação conhecida: se um filtro novo falha sem dado, o total de páginas exibido vem do filtro anterior (o mais recente em cache). Documentado em `research.md` (R6).
- Uma query que já falhou, ao ser remontada e recarregada, mostra o painel de erro com o botão ocupado em vez de "Loading…".

Estado final após as correções: lint, typecheck, 285 testes, `format:check`, build e 20 E2E (768 e 1440) passam.

Pendências de processo: T025 (conferência manual do `quickstart.md` com a API real, visual contra o anexo, SC-001, axe e foco por teclado), que é do James.
