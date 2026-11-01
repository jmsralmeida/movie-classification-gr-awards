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

| Rota           | Tela                                               |
| -------------- | -------------------------------------------------- |
| `/`            | Redireciona para `/dashboard`                      |
| `/dashboard`   | Dashboard (`?year=YYYY` opcional)                  |
| `/list`        | Lista de filmes (`?page=&year=&winner=` opcionais) |
| qualquer outra | Página "não encontrada"                            |

## Dashboard

A rota `/dashboard` mostra quatro painéis, cada um com seus estados de carregando, vazio, erro
(com "Try again") e sucesso. Falha ou lentidão em um painel não afeta os outros.

| Painel                                                    | Endpoint                         | O que mostra                                        |
| --------------------------------------------------------- | -------------------------------- | --------------------------------------------------- |
| List years with multiple winners                          | `/yearsWithMultipleWinners`      | Anos com mais de um vencedor e a contagem           |
| Top 3 studios with winners                                | `/studiosWithWinCount`           | Os 3 primeiros estúdios, na ordem que a API devolve |
| Producers with longest and shortest interval between wins | `/maxMinWinIntervalForProducers` | Tabelas "Maximum" e "Minimum", com empates          |
| List movie winners by year                                | `/winnersByYear?year=YYYY`       | Vencedores do ano buscado (só com ano de 4 dígitos) |

Todos os dados vêm de endpoints agregados; o app só corta o top 3 de estúdios, sem recalcular
contagens nem intervalos. O ano buscado fica na URL (`/dashboard?year=2018`): recarregar e usar
voltar/avançar do navegador restauram o campo e a tabela. Valor inválido em `?year=` é tratado
como "sem busca". Diferenças entre a API real e o OpenAPI estão em
[`docs/api-divergences.md`](docs/api-divergences.md).

Para rodar: `npm run dev` (app), `npm test` (unitário e componente, com MSW) e `npm run test:e2e`
(jornadas do Dashboard e da Lista em 1440x900 e 768x1280, com a API mockada).

## Lista de filmes

A rota `/list` mostra a tabela de filmes (ID, Year, Title, Winner?), 15 por página, com
paginação e filtros por ano e por vencedor no cabeçalho das colunas. Paginação e filtros são da
API: o app envia `page` (base 0), `size=15` (`PAGE_SIZE`) e só os filtros presentes, e não filtra
nem reordena nada no cliente. A tabela trata carregando, vazio ("No movies found."), erro (com
"Try again", que repete a mesma consulta) e sucesso, e os filtros ficam visíveis em todos os
estados. Ao trocar de página, a lista anterior fica esmaecida até a resposta chegar.

| Parâmetro | Valores                           | O que faz                                                     |
| --------- | --------------------------------- | ------------------------------------------------------------- |
| `page`    | inteiro de 1 a 1.000.000 (base 1) | Página atual; ausente = página 1                              |
| `year`    | 4 dígitos (ex.: `1981`)           | Filtra por ano; o filtro roda ao completar o 4º dígito        |
| `winner`  | `true` ou `false`                 | Só vencedores ou só quem não venceu; ausente = Yes/No (todos) |

Mudar qualquer filtro volta à página 1 (a URL fica sem `page`). Parâmetro inválido é ignorado,
então a API nunca recebe valor inválido. Recarregar a página e usar voltar/avançar do navegador
restauram controles e tabela. Diferenças entre a API real e o OpenAPI estão em
[`docs/api-divergences.md`](docs/api-divergences.md).

Para rodar: `npm run dev` (app), `npm test` (unitário e componente, com MSW) e `npm run test:e2e`.

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
