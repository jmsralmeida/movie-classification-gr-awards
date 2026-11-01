# Feature Specification: Dashboard

**Feature Branch**: `002-dashboard`

**Created**: 2026-10-31

**Status**: Draft

**Input**: User description: "Dashboard com 4 painéis conforme docs/requirements/challenge.md e anexo-1-dashboard.png: (1) anos com mais de um vencedor, (2) top 3 estúdios com mais vitórias, (3) produtores com maior e menor intervalo entre vitórias, (4) vencedores de um ano escolhido em um campo de busca. Usar os endpoints agregados da API, não calcular no cliente. Cada painel com estados de carregando, vazio e erro independentes."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ver os rankings e recordes dos prêmios (Priority: P1)

Quem abre o Dashboard vê, sem fazer nada, três painéis com os números já consolidados:
"List years with multiple winners" (anos com mais de um vencedor e a quantidade de
vencedores de cada um), "Top 3 studios with winners" (os três estúdios com mais vitórias e
o total de cada um) e "Producers with longest and shortest interval between wins" (duas
tabelas, "Maximum" e "Minimum", com produtor, intervalo, ano da vitória anterior e ano da
vitória seguinte).

**Why this priority**: São os três painéis que respondem às perguntas centrais do desafio
e não dependem de nenhuma ação do usuário. Sozinhos já entregam um Dashboard útil.

**Independent Test**: Abrir o Dashboard com a API respondendo e conferir que cada um dos
três painéis mostra o título e as colunas do anexo 1, com os valores devolvidos pela API.

**Acceptance Scenarios**:

1. **Given** a API com anos de múltiplos vencedores, **When** o usuário abre o Dashboard,
   **Then** o painel "List years with multiple winners" mostra uma linha por ano com as
   colunas "Year" e "Win Count".
2. **Given** a API com estúdios e suas vitórias, **When** o usuário abre o Dashboard,
   **Then** o painel "Top 3 studios with winners" mostra no máximo três linhas, do estúdio
   com mais vitórias para o com menos, com as colunas "Name" e "Win Count".
3. **Given** a API com intervalos de prêmios, **When** o usuário abre o Dashboard, **Then**
   o painel de produtores mostra a tabela "Maximum" e a tabela "Minimum", cada uma com as
   colunas "Producer", "Interval", "Previous Year" e "Following Year".
4. **Given** mais de um produtor empatado no maior (ou no menor) intervalo, **When** o
   painel é exibido, **Then** todos os empatados aparecem na tabela correspondente.
5. **Given** os três painéis carregados, **When** o usuário os compara com a API, **Then**
   nenhum valor foi recalculado ou reordenado de forma que contradiga a resposta da API.

---

### User Story 2 - Consultar os vencedores de um ano (Priority: P2)

No painel "List movie winners by year", o usuário digita um ano em um campo de busca
("Search by year") e aciona o botão de busca (ou Enter). A tabela abaixo passa a listar os
filmes vencedores daquele ano, com as colunas "Id", "Year" e "Title". Antes da primeira
busca, a tabela fica sem linhas, como no anexo 1. O ano pesquisado fica na URL, de modo que
o link compartilhado e o botão voltar do navegador reproduzem a mesma consulta.

**Why this priority**: É o único painel interativo. Depende de uma ação do usuário e é
independente dos outros três, por isso vem depois deles.

**Independent Test**: Digitar um ano com vencedores, acionar a busca e conferir a tabela;
repetir com um ano sem vencedores e conferir a mensagem de vazio; abrir a URL resultante em
outra aba e conferir que a mesma tabela aparece.

**Acceptance Scenarios**:

1. **Given** o Dashboard recém-aberto, **When** o usuário ainda não buscou nenhum ano,
   **Then** o painel mostra o campo de busca, o botão e a tabela com cabeçalho e uma
   instrução curta para informar um ano, sem chamar a API de vencedores por ano.
2. **Given** o campo de busca, **When** o usuário digita um ano com vencedores e aciona a
   busca por clique ou por Enter, **Then** a tabela lista cada vencedor daquele ano com
   "Id", "Year" e "Title".
3. **Given** um ano com mais de um vencedor, **When** a busca é feita, **Then** todos os
   vencedores aparecem, um por linha.
4. **Given** uma busca já feita, **When** o usuário digita outro ano e busca de novo,
   **Then** a tabela é substituída pelos vencedores do novo ano e a URL passa a refletir o
   novo ano.
5. **Given** uma URL do Dashboard com um ano, **When** o usuário a abre em uma nova aba ou
   usa o botão voltar, **Then** o campo mostra esse ano e a tabela exibe seus vencedores.
6. **Given** o campo vazio ou com texto que não é um ano válido, **When** o usuário aciona
   a busca, **Then** nenhuma consulta é feita e o usuário vê uma mensagem de validação
   associada ao campo.

---

### User Story 3 - Cada painel falha e se recupera sozinho (Priority: P2)

Os quatro painéis buscam seus dados de forma independente. Enquanto um painel carrega, os
outros mostram o que já têm. Se a consulta de um painel falha, só ele mostra uma mensagem de
erro com a ação "Try again"; os demais continuam exibindo seus dados. Se a API responde sem
registros, o painel mostra uma mensagem de vazio no lugar das linhas.

**Why this priority**: É requisito explícito da constituição (Art. IV) e do pedido, mas só
tem sentido depois que os painéis existem.

**Independent Test**: Simular lentidão, resposta vazia e falha em um painel de cada vez e
conferir que apenas aquele painel muda de estado, mantendo título e estrutura.

**Acceptance Scenarios**:

1. **Given** o Dashboard abrindo, **When** um painel ainda aguarda a API, **Then** esse
   painel mostra um indicador de carregamento acessível, mantendo seu título, e os outros
   painéis exibem seus dados assim que chegam.
2. **Given** a API que responde com lista vazia para um painel, **When** ele é exibido,
   **Then** mostra uma mensagem de vazio própria (sem tabela de linhas em branco).
3. **Given** a falha de um painel (rede ou erro do servidor), **When** ele é exibido,
   **Then** mostra uma mensagem de erro com o botão "Try again", e os outros três painéis
   não são afetados.
4. **Given** um painel em erro, **When** o usuário aciona "Try again" e a API responde,
   **Then** só esse painel volta a carregar e passa a exibir os dados.
5. **Given** a busca por ano que falha, **When** o painel mostra o erro, **Then** o campo
   de busca e o ano digitado continuam disponíveis e "Try again" repete a mesma consulta.

---

### User Story 4 - Dashboard fiel ao anexo e responsivo (Priority: P3)

Os painéis seguem a disposição do anexo 1: cartões brancos com título, em duas colunas
(anos e produtores à esquerda; estúdios e busca por ano à direita), com tabelas de
cabeçalho em negrito. A partir de 768x1280 o conteúdo permanece legível, sem rolagem
horizontal da página, e em telas largas (ex.: 1440x900) mantém as duas colunas.

**Why this priority**: Layout e responsividade são requisitos do desafio, mas só fazem
sentido depois que os painéis funcionam.

**Independent Test**: Abrir o Dashboard em 768x1280 e em 1440x900 e conferir que os quatro
painéis aparecem completos, sem sobreposição e sem rolagem horizontal da página.

**Acceptance Scenarios**:

1. **Given** a janela em 1440x900, **When** o Dashboard é exibido, **Then** os quatro painéis
   ficam em duas colunas, na ordem visual do anexo 1.
2. **Given** a janela em 768x1280, **When** o Dashboard é exibido, **Then** todos os painéis
   são utilizáveis, sem rolagem horizontal da página e sem texto cortado.
3. **Given** qualquer largura suportada, **When** o usuário navega só pelo teclado,
   **Then** alcança o campo de busca, o botão e os botões "Try again", com foco visível.

---

### Edge Cases

- A API de vencedores por ano devolve uma lista vazia para um ano válido (ex.: ano sem
  prêmio): o painel mostra a mensagem de vazio, diferente do estado "ainda não buscou".
- Ano digitado com espaços nas pontas: os espaços são ignorados. Ano com letras, decimais,
  negativo ou fora de quatro dígitos: validação, sem consulta.
- URL com parâmetro de ano inválido (ex.: `?year=abc`): o Dashboard abre normalmente, trata
  o parâmetro como "sem busca" e os três painéis automáticos não são afetados.
- O painel de estúdios recebe menos de três estúdios: mostra os que existirem.
- O painel de estúdios recebe mais de três: mostra só os três primeiros na ordem da API.
- Painel de produtores com só uma das tabelas preenchida (ex.: "Maximum" com dados e
  "Minimum" vazio): o painel mostra a tabela com dados e a mensagem de vazio na outra; só
  se ambas vierem vazias o painel inteiro mostra o estado de vazio.
- Dois cliques rápidos em "Search" com o mesmo ano: uma única consulta lógica; o resultado
  exibido sempre corresponde ao último ano buscado.
- Nomes de produtores, estúdios e títulos com caracteres especiais ou texto longo: são
  exibidos como texto puro e quebram linha sem estourar o cartão.
- Resposta da API com formato inesperado em um painel: tratada como erro daquele painel.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O Dashboard MUST exibir quatro painéis, com os títulos em inglês "List years
  with multiple winners", "Top 3 studios with winners", "Producers with longest and shortest
  interval between wins" e "List movie winners by year".
- **FR-002**: Os painéis de anos, estúdios e produtores MUST iniciar suas consultas
  automaticamente ao abrir o Dashboard, sem ação do usuário.
- **FR-003**: Cada painel MUST obter seus dados do respectivo endpoint agregado da API
  (anos com múltiplos vencedores, estúdios com contagem de vitórias, intervalos de prêmios
  de produtores, vencedores por ano). O cliente MUST NOT recalcular contagens, rankings nem
  intervalos a partir da lista de filmes.
- **FR-004**: O painel de anos MUST mostrar, por linha, "Year" e "Win Count".
- **FR-005**: O painel de estúdios MUST mostrar no máximo três estúdios, na ordem devolvida
  pela API, com "Name" e "Win Count".
- **FR-006**: O painel de produtores MUST mostrar duas tabelas rotuladas "Maximum" e
  "Minimum", cada uma com "Producer", "Interval", "Previous Year" e "Following Year", e MUST
  listar todos os produtores que a API devolver em cada uma (inclusive empates).
- **FR-007**: O painel de busca MUST oferecer um campo rotulado "Search by year" e um botão
  de busca com nome acessível; a busca MUST poder ser acionada por clique e por Enter.
- **FR-008**: A busca por ano MUST validar o valor (apenas números inteiros de quatro
  dígitos, após remover espaços nas pontas) antes de consultar a API, e MUST mostrar a
  mensagem de erro de validação ligada ao campo quando inválido.
- **FR-009**: Os vencedores do ano buscado MUST aparecer em tabela com "Id", "Year" e
  "Title", uma linha por filme. Antes de qualquer busca, a tabela MUST ficar sem linhas e
  o painel MUST exibir uma instrução para informar um ano, sem consultar a API.
- **FR-010**: O ano buscado MUST ficar na URL; abrir a URL ou usar voltar/avançar do
  navegador MUST restaurar o campo e a tabela. Um valor inválido na URL MUST ser tratado
  como "sem busca".
- **FR-011**: Cada painel MUST tratar de forma independente os quatro estados: carregando,
  vazio, erro e sucesso. O estado de um painel MUST NOT alterar o de outro.
- **FR-012**: O estado de carregamento MUST ser anunciado a tecnologias assistivas e manter
  o título do painel visível.
- **FR-013**: O estado de erro MUST mostrar uma mensagem compreensível, sem detalhes
  técnicos crus da API, e a ação "Try again", que MUST repetir somente a consulta daquele
  painel.
- **FR-014**: O estado de vazio MUST mostrar uma mensagem específica do painel, em vez de
  uma tabela sem linhas, exceto antes da primeira busca no painel de busca (FR-009).
- **FR-015**: Uma resposta fora do formato esperado MUST ser tratada como erro do painel
  correspondente, nunca renderizada parcialmente.
- **FR-016**: Todo conteúdo vindo da API MUST ser exibido como texto puro.
- **FR-017**: O layout MUST seguir o anexo 1 (cartões em duas colunas, tabelas com
  cabeçalho em negrito) e MUST ser utilizável a partir de 768x1280, sem rolagem horizontal
  da página.
- **FR-018**: Todos os controles MUST ter rótulo, ser operáveis por teclado e mostrar foco
  visível; as tabelas MUST usar cabeçalhos semânticos e ter nome acessível.
- **FR-019**: Todos os textos da UI MUST estar em inglês.

### Key Entities *(include if feature involves data)*

- **Year with multiple winners**: um ano do prêmio e a quantidade de vencedores que ele teve
  (maior que um).
- **Studio win count**: nome de um estúdio e o total de vitórias.
- **Producer win interval**: produtor, intervalo em anos entre duas vitórias consecutivas,
  ano da vitória anterior e ano da vitória seguinte. Cada resposta traz dois grupos:
  menores e maiores intervalos.
- **Winning movie**: filme vencedor com identificador, ano e título (estúdios e produtores
  existem na API, mas não aparecem neste painel).
- **Searched year**: o ano informado pelo usuário, validado, que determina a consulta de
  vencedores e vive na URL.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Com a API respondendo, os três painéis automáticos mostram dados em até 2
  segundos após o Dashboard abrir, em conexão doméstica comum.
- **SC-002**: Um usuário encontra os vencedores de um ano em no máximo uma ação de busca
  (digitar o ano e acionar a busca), sem sair do Dashboard.
- **SC-003**: Em 100% dos testes de falha, apenas o painel afetado muda para o estado de
  erro, e os outros três continuam mostrando seus dados.
- **SC-004**: Em 100% dos cenários de erro, o usuário recupera o painel com um único acionamento
  de "Try again", sem recarregar a página.
- **SC-005**: Os valores exibidos nos quatro painéis são idênticos aos devolvidos pela API
  (nenhuma divergência de contagem, ordem ou ano), conferidos por comparação com dados de
  referência.
- **SC-006**: O Dashboard é totalmente utilizável nos tamanhos 768x1280 e 1440x900, sem
  rolagem horizontal da página e sem conteúdo cortado.
- **SC-007**: Todas as ações (buscar, tentar de novo) podem ser concluídas apenas pelo
  teclado, e nenhuma violação automática de acessibilidade é encontrada nas telas
  verificadas.

## Assumptions

- O shell da feature 001 (cabeçalho, menu lateral, rota do Dashboard, cliente HTTP e
  QueryClient) já existe; esta feature preenche a view Dashboard e não altera o shell.
- O contrato de referência é `docs/requirements/openapi.json`. Nele, o endpoint de vencedores
  por ano devolve uma **lista** de filmes (o PDF mostrava um só objeto); a spec segue o
  OpenAPI, conforme `challenge.md`.
- "Não calcular no cliente" não impede limitar a exibição aos três primeiros estúdios, pois
  a API devolve a lista completa já ordenada; o corte é apresentação, não cálculo.
- O botão de busca do anexo é um ícone; aqui ele recebe nome acessível "Search".
- O ano é validado só quanto ao formato (quatro dígitos); a existência de prêmio naquele ano
  é decidida pela API (lista vazia = estado de vazio).
- Anos com mais de um vencedor, estúdios e intervalos podem ser vazios em ambientes de teste;
  o painel mostra o estado de vazio nesses casos.
- O Dashboard não é atualizado em segundo plano; os dados são lidos ao abrir e ao tentar
  de novo.
- Fora do escopo: lista de filmes com paginação e filtros (feature seguinte), ordenação
  interativa das tabelas, gráficos e autenticação.
