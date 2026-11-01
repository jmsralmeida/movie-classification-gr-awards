# Revisão da feature 001-app-shell

Revisor: agente `code-reviewer` (diff da branch contra `main`). Veredito: aprovar com ressalvas, sem defeito reproduzível. Lint, typecheck, 35 testes, format:check e 8 testes E2E passaram na revisão.

| # | Severidade | Achado | Destino |
| --- | --- | --- | --- |
| 1 | Média | `aria-current` e títulos repetidos no E2E (`e2e/shell-navigation.spec.ts`), já provados no componente | Aceito. Corrigido em `236953c` |
| 2 | Média | `aria-current` repetido em `src/app/App.test.tsx`; a fonte única é `NavMenu.test.tsx` | Aceito. Corrigido em `236953c` |
| 3 | Baixa | Títulos dos testes E2E 2, 3 e 4 sem o risco de integração | Aceito. Corrigido em `fc5e812` (teste 3 não foi separado) |
| 4 | Baixa | `path` do cliente HTTP não é normalizado (`get('items')`, `get('//x')`) | Adiado. A feature seguinte só usa caminhos literais; revisitar ao criar a primeira chamada |
| 5 | Baixa | Link atual do menu distinguido só por cor (WCAG 1.4.1) | Aceito. Negrito via `--font-weight-current` em `1bdfae1`; o contraste do cinza fica para a T011 |
| 6 | Baixa | `.content h1` dentro do `AppShell` acopla o shell ao conteúdo (Art. X) | Adiado. Desvio pequeno com páginas só de `h1`; tratar quando as features definirem seus títulos |

Pendências de processo: T011 (conferência visual manual contra o anexo 1 a 1440x900 e 768x1280).
