# Ferramentas além da stack da constitution

A constitution exige justificativa para dependências fora da stack aprovada. Como ainda não há
`plan.md`, o registro fica aqui. Todas são dependências de desenvolvimento (custo de bundle: 0).

| Pacote | Problema que resolve | Alternativa considerada |
| --- | --- | --- |
| `eslint-plugin-react` | Art. IX exige `react/no-danger` e `react/no-array-index-key` | Revisão manual (mais frágil) |
| `eslint-plugin-jsx-a11y` | Art. IX e VII exigem acessibilidade verificada | Revisão manual |
| `eslint-config-prettier` | Evita conflito entre regras de estilo do ESLint e o Prettier | Nenhuma limpa |
| `@vitest/coverage-v8` | Provider de cobertura do `test:coverage` | `istanbul` (mais lento) |
| `@testing-library/dom` | Peer dependency obrigatória do `@testing-library/react` | - |

## ESLint na 9.x

`eslint-plugin-react@7.37.5` e `eslint-plugin-jsx-a11y@6.10.2` declaram peer `eslint` até a 9.
Para manter os plugins que o Art. IX cita, o ESLint e o `@eslint/js` ficam na 9.x. Reavaliar
quando os dois plugins publicarem suporte à 10.

## Auditoria

`npm audit` aponta `minimatch` (moderado) dentro do próprio ESLint, só em dev, sem chegar ao bundle.

## Playwright

Config em `playwright.config.ts` com dois projetos: `desktop-1440` (1440x900) e `tablet-768`
(768x1280), conforme o Art. VII. O `webServer` sobe o `npm run dev` na porta 5173; localmente
reaproveita um servidor já aberto. As jornadas ficam em `e2e/` e bloqueiam só o host real da API,
sem depender da rede. `test:e2e` roda `playwright test` (sem `--pass-with-no-tests`, pois já há
jornada). No CI, o job instala o navegador com `npx playwright install --with-deps chromium` e
roda `npm run test:e2e` depois do build. Localmente, na primeira vez, rode
`npx playwright install chromium`.
