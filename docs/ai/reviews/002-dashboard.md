# Revisão da feature 002-dashboard

Revisor: agente `code-reviewer` (diff da branch contra `main`). Veredito: aprovar com ressalvas, sem defeito de severidade alta. Lint, typecheck e 167 testes passaram na revisão; `format:check`, build e E2E não foram rodados pelo revisor (a T020 já os tinha rodado).

| # | Severidade | Achado | Destino |
| --- | --- | --- | --- |
| 1 | Média | Foco do teclado se perde após busca válida (`key={year ?? ''}` remonta o formulário em `WinnersByYearPanel.tsx` e `WinnersSearchForm.tsx`; FR-018, SC-007, Art. VII) | Aceito. Corrigido em `e2c15b3` (campo controlado, sem `key`, com ressincronização no render, sem `useEffect`) |
| 2 | Média | Mensagem de validação do ano não é anunciada por leitor de tela | Aceito. Corrigido em `6465f7f` (`role="alert"`) |
| 3 | Baixa | `YearsPanel.test.tsx` fixa o caminho `/api/movies/...`, redundante com o MSW | Aceito. Corrigido em `3059a9a` (asserção removida) |
| 4 | Baixa | `docs/api-divergences.md` criado fora das tasks e duplica o conteúdo do plan | Recusado pelo James: o arquivo fica como elucidação das divergências da API. Citado no `plan.md` como fonte detalhada em `a8218a2` |
| 5 | Baixa | Matriz do plan sem linhas de foco e anúncio de erro; Art. VII marcado PASS sem evidência | Aceito. Corrigido em `6a7ce99` |

Observações do implementador: o teste novo de foco não foi rodado contra o código antigo, então não se confirmou que ele falharia com o `key`. O E2E só foi rodado após o commit do achado 1.

Pendências de processo: T022 (conferência manual do `quickstart.md` com a API real, visual contra o anexo 1, SC-001/SC-007, throttling e axe), que é do James.
