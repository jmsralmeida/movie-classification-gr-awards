# Desafio Outsera: Front-End

Transcrição do PDF "Avaliação Outsera - Front-End". Fonte de verdade dos requisitos.
Em caso de divergência entre este arquivo e a API real, o contrato OpenAPI prevalece
e a divergência é registrada na spec (`/speckit-clarify`).

## 1. Especificação

Interface para leitura da lista de indicados e vencedores da categoria **Pior Filme**
do Golden Raspberry Awards. Duas views:

- Dashboard
- Lista de todos os filmes

A página deve ter um menu com links para as views.

- API: https://challenge.outsera.tech/api/movies
- OpenAPI: https://challenge.outsera.tech/v3/api-docs
- Swagger UI: https://challenge.outsera.tech/swagger-ui/index.html

Criar testes unitários e um README com instruções para rodar o projeto.

## 2. Requisitos funcionais

1. **Dashboard** (layout no [anexo 1](anexo-1-dashboard.png)), 4 painéis:
   - tabela com os anos que tiveram mais de um vencedor;
   - tabela com os três estúdios com mais vitórias;
   - tabelas com os produtores com maior e menor intervalo entre vitórias;
   - tabela com os vencedores de um ano selecionado por um campo de busca.
2. **Lista de filmes** (layout no [anexo 2](anexo-2-movies-list.png)): paginação e dois filtros:
   - por ano;
   - por vencedor.
3. Testes unitários de todas as funcionalidades.

## 3. Requisitos não funcionais

1. Responsividade mínima 768x1280.
2. Qualidade de código (legibilidade, lógica, indentação).
3. Boas práticas de implementação.
4. Documentação.
5. Código-fonte em repositório git.

## 4. LLMs, agentes e skills

1. O uso de ferramentas de IA é obrigatório e será avaliado.
2. O repositório deve conter um registro de interações com o agente (logs, lista de
   prompts/skills utilizadas ou histórico de interações).
3. Qualidade e desempenho do código são avaliados como numa revisão de código tradicional.

## 5. Formato da API (resumo do PDF)

| Recurso | Endpoint | Resposta |
| --- | --- | --- |
| Filmes paginados | `GET /api/movies?page=0&size=15&winner=true&year=2018` | página Spring (`content[]`, `totalElements`, `totalPages`, `number`, `size`, `first`, `last`...) com itens `{ id, year, title, studios[], producers[], winner }` |
| Anos com mais de um vencedor | `GET /api/movies/yearsWithMultipleWinners` | `{ years: [{ year, winnerCount }] }` |
| Estúdios por vitórias | `GET /api/movies/studiosWithWinCount` | `{ studios: [{ name, winCount }] }` |
| Intervalo de prêmios | `GET /api/movies/maxMinWinIntervalForProducers` | `{ min: [{ producer, interval, previousWin, followingWin }], max: [...] }` |
| Vencedores por ano | `GET /api/movies/winnersByYear?year=2018` | PDF mostra um objeto filme; **confirmar no OpenAPI se é lista** |

Os caminhos exatos dos endpoints auxiliares devem ser confirmados no OpenAPI antes do plano.

## Observações dos anexos

- Textos da UI em inglês ("List years with multiple winners", "Top 3 studios with winners",
  "Producers with longest and shortest interval between wins", "List movie winners by year",
  "List movies").
- Menu lateral com "Dashboard" e "List"; cabeçalho no topo.
- Lista: colunas ID, Year (com input "Filter by year"), Title, Winner? (select Yes/No);
  paginação com primeira, anterior, páginas, próxima, última.
