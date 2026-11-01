# Outsera Razzies

SPA em React + TypeScript que lista indicados e vencedores da categoria Pior Filme do
Golden Raspberry Awards (`https://challenge.outsera.tech/api/movies`).

- Requisitos: [`docs/requirements/challenge.md`](docs/requirements/challenge.md)
- Regras do projeto: [`.specify/memory/constitution.md`](.specify/memory/constitution.md)
- Ferramentas e justificativas: [`docs/tooling.md`](docs/tooling.md)
- Registro de uso de IA: [`docs/ai/README.md`](docs/ai/README.md)

## Configuração

Requer Node 22 ou superior.

```bash
npm install
cp .env.example .env
```

A URL da API vem de `VITE_API_BASE_URL`. O `.env.example` já traz o valor padrão:

```text
VITE_API_BASE_URL=https://challenge.outsera.tech/api/movies
```

Variáveis `VITE_*` vão para o bundle do navegador. Não coloque segredo nelas. Se a variável não
estiver definida, o app usa o valor padrão acima.

## Rotas

| Rota           | Tela                                        |
| -------------- | ------------------------------------------- |
| `/`            | Redireciona para `/dashboard`               |
| `/dashboard`   | Dashboard (placeholder nesta entrega)       |
| `/list`        | Lista de filmes (placeholder nesta entrega) |
| qualquer outra | Página "não encontrada"                     |

## Comandos

```bash
npm run dev            # servidor local (http://localhost:5173)
npm run build          # tsc -b + build de produção
npm run lint           # ESLint
npm run typecheck      # tsc
npm test               # Vitest
npm run test:coverage  # cobertura
npm run test:e2e       # Playwright (1440x900 e 768x1280)
npm run format         # Prettier
npm run format:check   # confere o formato sem alterar
```

Na primeira execução do E2E, instale o navegador: `npx playwright install chromium`.
