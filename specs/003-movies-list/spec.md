# Feature Specification: Movies List

**Feature Branch**: `003-movies-list`

**Created**: 2026-10-31

**Status**: Draft

**Input**: User description: "Lista de filmes conforme docs/requirements/challenge.md e anexo-2-movies-list.png: tabela com ID, Year, Title e Winner?; paginação no servidor (page, size); filtro por ano e por vencedor (Yes/No/todos) enviados como query params para a API; filtros e página refletidos na URL; estados de carregando, vazio e erro."

## Clarifications

### Session 2026-10-31

- Q: Quando o filtro de ano deve consultar a API: ao completar 4 dígitos, só com Enter, ou também ao sair do campo? → A: Ao completar 4 dígitos (e ao esvaziar o campo, que remove o filtro); sem Enter, sem botão e sem blur.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Percorrer a lista de filmes paginada (Priority: P1)

Quem abre a view "List" vê o título "List movies" e uma tabela com as colunas "ID",
"Year", "Title" e "Winner?", com 15 filmes por página, na ordem devolvida pela API. A
coluna "Winner?" mostra "Yes" ou "No". Abaixo da tabela há a paginação, como no anexo 2:
primeira página, anterior, números de página, próxima e última, com a página atual
destacada. Trocar de página mostra os 15 filmes seguintes (ou anteriores) sem recarregar
o aplicativo.

**Why this priority**: É o núcleo da view e o que o desafio pede primeiro ("paginação").
Sozinha já entrega uma lista navegável de todos os filmes.

**Independent Test**: Abrir a view "List" com a API respondendo, conferir a primeira
página e navegar por próxima, anterior, primeira, última e por um número de página.

**Acceptance Scenarios**:

1. **Given** a API com mais de 15 filmes, **When** o usuário abre a view "List", **Then**
   a tabela mostra 15 linhas da primeira página, com "ID", "Year", "Title" e "Winner?"
   preenchidos, e a página 1 aparece como atual na paginação.
2. **Given** a primeira página, **When** o usuário aciona "next page", **Then** a tabela
   passa a mostrar os filmes da segunda página e a página 2 fica destacada.
3. **Given** uma página intermediária, **When** o usuário aciona "previous page", "first
   page" ou "last page", **Then** a tabela mostra a página correspondente.
4. **Given** a paginação exibida, **When** o usuário aciona um número de página, **Then**
   essa página é carregada e destacada.
5. **Given** a primeira página, **Then** os controles "first page" e "previous page" ficam
   desabilitados; na última página, ficam desabilitados "next page" e "last page".
6. **Given** um filme vencedor e um indicado que não venceu, **When** a página é exibida,
   **Then** a coluna "Winner?" mostra "Yes" para o primeiro e "No" para o segundo.
7. **Given** muitas páginas, **When** a paginação é exibida, **Then** ela mostra apenas
   uma janela curta de números ao redor da página atual, sem estourar a largura da tela.

---

### User Story 2 - Filtrar por ano e por vencedor (Priority: P1)

No cabeçalho da coluna "Year" há o campo "Filter by year" e, no da coluna "Winner?",
um seletor com as opções "Yes/No" (todos, valor inicial), "Yes" e "No". O usuário digita
um ano de quatro dígitos para ver só os filmes daquele ano, escolhe "Yes" para ver só os
vencedores ou "No" para ver só os que não venceram, e pode combinar os dois filtros. A
filtragem é feita pela API (os filtros viajam como parâmetros da consulta), de modo que a
contagem de páginas reflete o resultado filtrado. Mudar qualquer filtro volta para a
página 1. Apagar o ano ou voltar o seletor para "Yes/No" remove o filtro correspondente.

**Why this priority**: É o segundo requisito funcional da view no desafio. Depende da
tabela da Story 1, mas é independente da URL compartilhável e dos estados de erro.

**Independent Test**: Com a lista aberta, digitar um ano com filmes, depois escolher
"Yes", e conferir que a tabela e a paginação mostram só o resultado combinado; limpar os
dois filtros e conferir o retorno à lista completa.

**Acceptance Scenarios**:

1. **Given** a lista sem filtros, **When** o usuário digita um ano de quatro dígitos em
   "Filter by year", **Then** a tabela mostra somente filmes daquele ano, a partir da
   página 1.
2. **Given** a lista sem filtros, **When** o usuário escolhe "Yes" em "Winner?", **Then**
   só aparecem vencedores; ao escolher "No", só aparecem os que não venceram.
3. **Given** os dois filtros aplicados, **When** a tabela é exibida, **Then** todas as
   linhas satisfazem ao ano e ao valor de "Winner?" escolhidos.
4. **Given** o usuário na página 3 da lista, **When** ele muda qualquer filtro, **Then** a
   lista volta para a página 1 do novo resultado.
5. **Given** um filtro de ano aplicado, **When** o usuário apaga o campo, **Then** o
   filtro de ano é removido e a lista volta a incluir todos os anos.
6. **Given** um filtro de vencedor aplicado, **When** o usuário volta o seletor para
   "Yes/No", **Then** o filtro de vencedor é removido.
7. **Given** o campo "Filter by year" com 1 a 3 dígitos digitados, **When** o usuário
   ainda está digitando, **Then** nenhuma consulta nova é feita e a lista anterior
   permanece; só um ano completo de quatro dígitos (ou o campo vazio) altera o resultado.
8. **Given** texto que não é um ano válido (letras, decimais, negativo, mais de quatro
   dígitos), **When** digitado no campo, **Then** o usuário vê uma mensagem de validação
   ligada ao campo e nenhuma consulta é feita com esse valor.

---

### User Story 3 - Compartilhar e restaurar a lista pela URL (Priority: P2)

A página atual e os filtros ficam na URL. Quem copia o endereço e o abre em outra aba vê a
mesma página com os mesmos filtros; o botão voltar do navegador retorna ao estado anterior
(página ou filtro anteriores) e o avançar o reaplica. Os controles (campo de ano, seletor,
página destacada) sempre refletem o que está na URL, inclusive ao abrir o link direto.

**Why this priority**: É exigência da constituição (Art. II) e valoriza o uso real da
lista, mas só faz sentido depois que paginação e filtros existem.

**Independent Test**: Aplicar filtros e trocar de página, copiar a URL, abri-la em outra
aba e conferir o mesmo resultado; usar voltar e avançar e conferir que os controles e a
tabela acompanham.

**Acceptance Scenarios**:

1. **Given** a lista na página 2 com ano e vencedor filtrados, **When** o usuário abre a
   mesma URL em uma nova aba, **Then** o campo de ano, o seletor, a página destacada e a
   tabela mostram exatamente esse estado.
2. **Given** o usuário que mudou de página duas vezes, **When** usa o botão voltar do
   navegador, **Then** retorna à página anterior, com tabela e paginação coerentes.
3. **Given** o usuário que aplicou um filtro, **When** usa voltar, **Then** o filtro
   anterior (ou nenhum) é restaurado nos controles e na tabela.
4. **Given** a view "List" aberta sem parâmetros, **Then** ela mostra a página 1 sem
   filtros; o estado padrão não exige parâmetros na URL.
5. **Given** uma URL com parâmetros inválidos (página não numérica, zero ou negativa,
   ano que não tem quatro dígitos, vencedor diferente de sim/não), **When** a view é
   aberta, **Then** cada parâmetro inválido é ignorado e substituído pelo valor padrão;
   a view abre normalmente e nenhuma consulta é feita com o valor inválido.
6. **Given** um link para uma página além do total de páginas do resultado, **When** é
   aberto, **Then** o usuário vê o estado de vazio com a paginação ainda utilizável para
   voltar a páginas válidas.

---

### User Story 4 - Carregando, vazio e erro (Priority: P2)

A tabela e a paginação tratam os quatro estados. Enquanto a consulta aguarda a API, o
usuário vê um indicador de carregamento acessível e mantém o título e os filtros
visíveis. Se não houver filmes para o filtro escolhido, a mensagem de vazio ocupa o lugar
das linhas. Se a consulta falha, a mensagem de erro traz a ação "Try again", que repete a
mesma consulta. Os filtros continuam disponíveis em todos os estados, para o usuário
poder corrigir um filtro sem recarregar a página.

**Why this priority**: É requisito explícito da constituição (Art. IV) e do pedido, mas
só tem sentido depois da tabela existir.

**Independent Test**: Simular resposta lenta, resposta sem filmes e falha da API, um de
cada vez, e conferir o que aparece no lugar da tabela e se os filtros seguem utilizáveis.

**Acceptance Scenarios**:

1. **Given** a consulta em andamento, **When** a tabela ainda não tem dados, **Then**
   aparece um indicador de carregamento anunciado a tecnologias assistivas, e o título e
   os filtros permanecem visíveis.
2. **Given** a troca de página ou de filtro com a página anterior já exibida, **When** a
   nova consulta está em andamento, **Then** o usuário continua vendo a lista anterior
   marcada como em atualização, sem a tabela piscar para vazia.
3. **Given** uma combinação de filtros sem filmes (ex.: ano sem indicados), **When** a
   resposta chega, **Then** a mensagem "No movies found." aparece no lugar das linhas, sem
   tabela de linhas em branco e sem paginação de páginas inexistentes.
4. **Given** a falha da API (rede ou erro do servidor), **When** a lista é exibida,
   **Then** aparece uma mensagem de erro compreensível, sem detalhes técnicos crus, com o
   botão "Try again", e o título e os filtros continuam visíveis.
5. **Given** o estado de erro, **When** o usuário aciona "Try again" e a API responde,
   **Then** a mesma consulta (mesma página e mesmos filtros) é repetida e a tabela
   passa a mostrar os dados.
6. **Given** o estado de erro, **When** o usuário altera um filtro ou a página, **Then**
   uma nova consulta é feita sem precisar acionar "Try again".
7. **Given** o foco do teclado na paginação ou nos filtros, **When** a lista muda de
   estado, **Then** o foco não é perdido (o controle acionado continua focável).

---

### User Story 5 - Lista fiel ao anexo e responsiva (Priority: P3)

A view segue o anexo 2: título "List movies", tabela de largura total em cartão com
cabeçalhos centralizados, os controles de filtro dentro do cabeçalho das colunas "Year"
e "Winner?", linhas com listras sutis e a paginação centralizada abaixo da tabela. A
partir de 768x1280 o conteúdo permanece legível, sem rolagem horizontal da página; em
1440x900 a tabela ocupa a área principal ao lado do menu.

**Why this priority**: Layout e responsividade são requisitos do desafio, mas só fazem
sentido depois que a lista funciona.

**Independent Test**: Abrir a lista em 768x1280 e em 1440x900 e conferir que título,
filtros, as 15 linhas e a paginação aparecem completos, sem sobreposição e sem rolagem
horizontal da página.

**Acceptance Scenarios**:

1. **Given** a janela em 1440x900, **When** a lista é exibida, **Then** título, tabela e
   paginação seguem a disposição do anexo 2.
2. **Given** a janela em 768x1280, **When** a lista é exibida, **Then** todas as colunas,
   os dois filtros e a paginação são utilizáveis, sem rolagem horizontal da página e sem
   texto cortado.
3. **Given** qualquer largura suportada, **When** o usuário navega só pelo teclado,
   **Then** alcança o campo de ano, o seletor, cada controle de paginação e o botão "Try
   again" (quando houver), com foco visível.

---

### Edge Cases

- Ano sem nenhum indicado (ex.: 1800): resposta sem filmes, estado de vazio.
- Ano com espaços nas pontas: os espaços são ignorados. Ano com letras, decimais,
  negativo ou fora de quatro dígitos: validação, sem consulta.
- URL com `page` além do total de páginas: a API responde sem registros; a view mostra o
  estado de vazio com a paginação para voltar (US3, cenário 6).
- URL com `page` negativa ou zero, não numérica, ou tamanho inválido: tratada como padrão
  (a API real rejeita esses valores com erro 500, por isso o app nunca os envia).
- Combinação de filtros que deixa uma única página: a paginação mostra uma página só,
  com todos os controles de navegação desabilitados.
- Resultado com exatamente 15 filmes ou múltiplo de 15: a última página existe e está
  cheia; não aparece uma página vazia extra.
- Mudança de filtro enquanto uma consulta anterior ainda não terminou: o resultado
  exibido sempre corresponde ao estado atual dos filtros, nunca a uma consulta antiga.
- Troca rápida de páginas: o resultado exibido corresponde sempre à última página pedida.
- Títulos com caracteres especiais ou texto longo: exibidos como texto puro, quebrando
  linha sem estourar a tabela.
- Filme sem estúdios ou produtores: não afeta a lista, que não mostra esses campos.
- Resposta da API com formato inesperado: tratada como erro da lista, nunca renderizada
  parcialmente.
- Usuário que sai da view "List" e volta pelo menu: a lista reabre na página 1, sem
  filtros, porque o link do menu aponta para a view sem parâmetros.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A view "List" MUST exibir o título "List movies" e uma tabela com as colunas
  "ID", "Year", "Title" e "Winner?", nessa ordem, com um filme por linha.
- **FR-002**: A coluna "Winner?" MUST mostrar "Yes" para filmes vencedores e "No" para os
  demais.
- **FR-003**: A lista MUST ser paginada no servidor: cada página MUST ser obtida da API
  com número de página e tamanho de página, e o app MUST NOT baixar a lista completa para
  paginar no cliente.
- **FR-004**: O tamanho de página MUST ser 15 filmes, como no anexo 2.
- **FR-005**: A paginação MUST oferecer "first page", "previous page", números de página,
  "next page" e "last page", com nomes acessíveis; a página atual MUST ser destacada e
  sinalizada a tecnologias assistivas; os controles que não têm destino MUST ficar
  desabilitados.
- **FR-006**: A paginação MUST exibir no máximo uma janela curta de números de página ao
  redor da página atual, de modo a não estourar a largura em 768x1280.
- **FR-007**: A coluna "Year" MUST conter o campo "Filter by year" (com rótulo acessível)
  e a coluna "Winner?" MUST conter um seletor com rótulo acessível e as opções "Yes/No"
  (sem filtro, valor inicial), "Yes" e "No".
- **FR-008**: O filtro de ano e o filtro de vencedor MUST ser enviados à API como
  parâmetros da consulta, juntamente com a página e o tamanho; o cliente MUST NOT
  filtrar nem reordenar os filmes recebidos. Os filtros MUST ser combináveis. Um filtro
  sem valor MUST NOT ser enviado.
- **FR-009**: O filtro de ano MUST consultar a API automaticamente assim que o valor for um
  ano válido de quatro dígitos, e MUST remover o filtro assim que o campo ficar vazio; Enter,
  botão e perda de foco MUST NOT ser necessários para aplicar o filtro. O filtro de ano MUST
  validar o valor (apenas inteiros de quatro dígitos,
  após remover espaços nas pontas) antes de consultar a API. Enquanto o valor digitado não
  for válido nem vazio, nenhuma consulta nova MUST ser feita e uma mensagem de validação
  MUST ficar ligada ao campo, exceto durante a digitação de 1 a 3 dígitos, em que a lista
  anterior permanece sem mensagem de erro.
- **FR-010**: Qualquer mudança de filtro MUST levar a lista de volta à página 1.
- **FR-011**: A página atual, o filtro de ano e o filtro de vencedor MUST viver na URL.
  Abrir a URL, recarregar ou usar voltar/avançar MUST restaurar controles, página
  destacada e tabela. O estado padrão (página 1, sem filtros) MUST NOT exigir parâmetros.
- **FR-012**: Cada parâmetro inválido da URL (página, ano ou vencedor) MUST ser ignorado
  e substituído pelo valor padrão, e o app MUST NOT enviar à API um valor que ele mesmo
  considera inválido.
- **FR-013**: A lista MUST tratar os quatro estados: carregando, vazio, erro e sucesso.
  Título e filtros MUST permanecer visíveis e utilizáveis em todos os estados.
- **FR-014**: O estado de carregamento MUST ser anunciado a tecnologias assistivas. Ao
  trocar de página ou de filtro, a lista anterior MUST permanecer visível, sinalizada como
  em atualização, até a nova resposta chegar.
- **FR-015**: O estado de vazio MUST mostrar a mensagem "No movies found." no lugar das
  linhas, sem paginação de páginas inexistentes, exceto quando a página pedida na URL
  está além do total (a paginação MUST permitir voltar).
- **FR-016**: O estado de erro MUST mostrar uma mensagem compreensível, sem detalhes
  técnicos crus da API, e a ação "Try again", que MUST repetir a mesma consulta (mesma
  página e mesmos filtros).
- **FR-017**: Uma resposta fora do formato esperado MUST ser tratada como erro da lista,
  nunca renderizada parcialmente.
- **FR-018**: Todo conteúdo vindo da API MUST ser exibido como texto puro.
- **FR-019**: O layout MUST seguir o anexo 2 (título, tabela de largura total com filtros
  no cabeçalho, listras sutis, paginação centralizada) e MUST ser utilizável a partir de
  768x1280, sem rolagem horizontal da página.
- **FR-020**: Todos os controles MUST ter rótulo, ser operáveis por teclado e mostrar foco
  visível; a tabela MUST usar cabeçalhos semânticos e ter nome acessível. Em mudanças de
  página ou de estado, o foco MUST NOT ser perdido.
- **FR-021**: Todos os textos da UI MUST estar em inglês.

### Key Entities *(include if feature involves data)*

- **Movie**: filme indicado ao prêmio, com identificador, ano, título e se venceu.
  (Estúdios e produtores existem na API, mas não aparecem nesta lista.)
- **Movies page**: um recorte da lista no servidor, com os filmes da página, o número da
  página atual, o tamanho da página, o total de filmes e o total de páginas; indica se é a
  primeira e se é a última página.
- **List query (page and filters)**: o estado que define a consulta: página atual, ano
  filtrado (opcional) e situação de vencedor (opcional: sim ou não). Vive na URL.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Com a API respondendo, a primeira página aparece em até 2 segundos após o
  usuário abrir a view "List", em conexão doméstica comum.
- **SC-002**: Um usuário chega a qualquer página da lista em no máximo duas ações a partir
  de qualquer outra (usando primeira/última ou o número de página).
- **SC-003**: Um usuário encontra os filmes de um ano com uma única ação (digitar o ano
  de quatro dígitos), sem precisar acionar um botão adicional.
- **SC-004**: Em 100% dos cenários de combinação de filtros testados, todas as linhas
  exibidas satisfazem aos filtros, e o total de páginas corresponde ao resultado filtrado.
- **SC-005**: Abrir uma URL copiada reproduz a mesma página, os mesmos filtros e a mesma
  tabela em 100% dos casos testados, inclusive após voltar/avançar no navegador.
- **SC-006**: Em 100% dos cenários de falha, o usuário recupera a lista com um único
  acionamento de "Try again", sem recarregar a página.
- **SC-007**: Em 100% dos cenários com valores inválidos na URL (página, ano, vencedor),
  a view abre normalmente com os valores padrão e nenhum valor inválido é enviado à API.
- **SC-008**: A lista é totalmente utilizável nos tamanhos 768x1280 e 1440x900, sem
  rolagem horizontal da página e sem conteúdo cortado.
- **SC-009**: Todas as ações (filtrar, paginar, tentar de novo) podem ser concluídas apenas
  pelo teclado, e nenhuma violação automática de acessibilidade é encontrada na tela
  verificada.

## Assumptions

- O shell da feature 001 (cabeçalho, menu lateral, rota "List", cliente HTTP e
  QueryClient) já existe, e a feature 002 já registrou componentes compartilhados de
  tabela e painel; esta feature preenche a view "List" e não altera o shell.
- O contrato de referência é `docs/requirements/openapi.json`. Nele, a consulta de filmes
  recebe `page` e `size` (obrigatórios, base zero) e `year` e `winner` (opcionais), e
  devolve uma página com `content`, `totalElements`, `totalPages`, `number` e `size`.
- Comportamento real da API verificado em 2026-10-31: `page` além do total devolve 200
  com `content` vazio; `year` não numérico devolve 400; `page` negativa e `size` zero
  devolvem 500 com corpo de formato diferente. Por isso o app normaliza página e tamanho
  antes de consultar. As divergências ficam registradas no `plan.md` e em
  `docs/api-divergences.md`.
- O tamanho de página é fixo em 15 (anexo 2) e não é selecionável pelo usuário nem fica
  na URL. A página aparece na URL em base 1, igual ao número mostrado na paginação.
- O seletor "Yes/No" do anexo é a opção "sem filtro", e não um filtro por si; escolher
  "Yes" ou "No" filtra, e voltar a "Yes/No" remove o filtro.
- O filtro de ano é aplicado ao digitar um ano completo (quatro dígitos), sem botão de
  busca, como no anexo 2. Não há atraso (debounce) a decidir: a consulta é disparada pela própria completude do valor.
- A ordem das linhas é a devolvida pela API; ordenação interativa por coluna não existe.
- Os dados da lista não são atualizados em segundo plano; são lidos ao abrir, ao mudar
  página ou filtro e ao tentar de novo.
- O campo de ano do cabeçalho vira o único ponto de entrada de filtro por ano da view;
  não há botão "Clear filters".
- Fora do escopo: ordenação, busca por título, escolha de tamanho de página, exibição de
  estúdios e produtores, detalhes de um filme, edição e autenticação.
