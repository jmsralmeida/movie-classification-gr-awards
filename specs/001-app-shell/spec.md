# Feature Specification: App Shell

**Feature Branch**: `001-app-shell`

**Created**: 2026-10-31

**Status**: Draft

**Input**: User description: "App shell: layout com cabeçalho e menu lateral com links "Dashboard" e "List", rotas para as duas views (páginas vazias por enquanto), cliente HTTP tipado para https://challenge.outsera.tech/api/movies com o host configurável por variável de ambiente pública, QueryClient configurado e página de rota não encontrada. Layout conforme docs/requirements/anexo-1-dashboard.png. Responsivo a partir de 768x1280."

## Clarifications

### Session 2026-10-31

- Q: Qual texto o cabeçalho deve mostrar como título do app? → A: "Outsera Razzies" (nome do projeto)
- Q: Quando a API devolve um corpo com formato diferente do esperado, o cliente só confere JSON válido ou confere os campos de cada endpoint? → A: O cliente só garante JSON válido; a conferência dos campos fica no mapper de cada feature
- Q: Cabeçalho e menu ficam fixos quando o conteúdo é mais alto que a janela? → A: Sim, o cabeçalho fica fixo no topo e o menu lateral permanece visível abaixo dele; só a área de conteúdo rola (análise de 2026-10-31)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Navegar entre as views pelo menu lateral (Priority: P1)

Quem abre o app vê um cabeçalho escuro no topo com o título do app e, à esquerda, um menu
lateral com os links "Dashboard" e "List". Ao ativar um link, a área de conteúdo à direita
mostra a view correspondente (por enquanto, uma página vazia identificada pelo título),
sem recarregar o app inteiro. O link da view atual fica visualmente destacado.

**Why this priority**: É o esqueleto sobre o qual o Dashboard e a Lista serão construídos
e entrega a navegação exigida pelo desafio ("a página deve ter um menu com links para as views").

**Independent Test**: Abrir o app, ativar "List" e depois "Dashboard" (por clique e por
teclado) e verificar que o conteúdo, a URL e o link destacado mudam a cada troca.

**Acceptance Scenarios**:

1. **Given** o app aberto na raiz, **When** o usuário carrega a página, **Then** vê o
   cabeçalho, o menu lateral com "Dashboard" e "List" e a view Dashboard como padrão.
2. **Given** a view Dashboard ativa, **When** o usuário ativa o link "List", **Then** a área
   de conteúdo mostra a view List, a URL reflete a view e "List" aparece como link atual.
3. **Given** a view List ativa, **When** o usuário usa o botão voltar do navegador, **Then**
   volta para a view Dashboard.
4. **Given** qualquer view, **When** o usuário navega só pelo teclado (Tab/Enter), **Then**
   alcança e aciona os dois links, com indicação de foco visível.
5. **Given** a URL direta de uma das views, **When** o usuário abre o link em uma nova aba,
   **Then** a view correta é exibida com o menu já marcando o link atual.

---

### User Story 2 - Layout fiel ao anexo e responsivo (Priority: P2)

O shell reproduz a estrutura do anexo 1: barra de cabeçalho escura em largura total, menu
lateral claro à esquerda com os dois links em texto simples e área de conteúdo à direita
sobre fundo neutro. O layout permanece utilizável a partir de 768x1280, sem rolagem
horizontal, e também em telas largas (ex.: 1440x900).

**Why this priority**: Layout e responsividade mínima são requisitos do desafio, mas só
fazem sentido depois que a navegação existe.

**Independent Test**: Abrir o app em 768x1280 e em 1440x900 e conferir que cabeçalho, menu e
conteúdo aparecem completos, sem sobreposição e sem rolagem horizontal.

**Acceptance Scenarios**:

1. **Given** viewport de 768x1280, **When** o app é exibido, **Then** cabeçalho, menu lateral e
   área de conteúdo estão visíveis, sem cortes e sem rolagem horizontal.
2. **Given** viewport de 1440x900, **When** o app é exibido, **Then** o menu mantém largura
   estreita e a área de conteúdo ocupa o espaço restante.
3. **Given** conteúdo mais alto que a janela, **When** o usuário rola, **Then** o cabeçalho
   permanece fixo no topo, o menu lateral continua visível e só o conteúdo se move, sem quebrar o layout.

---

### User Story 3 - Rota inexistente mostra página "não encontrado" (Priority: P3)

Quando o usuário acessa um endereço que não corresponde a nenhuma view, o app mostra uma
página de "não encontrado" dentro do mesmo shell, com um link para voltar ao Dashboard.

**Why this priority**: Evita tela em branco em links errados; não bloqueia as demais features.

**Independent Test**: Abrir uma URL inexistente e verificar a mensagem, o shell visível e que
o link de retorno leva ao Dashboard.

**Acceptance Scenarios**:

1. **Given** uma URL que não existe, **When** o usuário a abre, **Then** vê a mensagem de
   página não encontrada, com cabeçalho e menu ainda presentes.
2. **Given** a página não encontrada, **When** o usuário ativa o link de retorno, **Then** vai
   para o Dashboard.
3. **Given** a página não encontrada, **Then** nenhum link do menu aparece como "atual".

---

### User Story 4 - Base de acesso aos dados da API pronta para as features (Priority: P3)

Para que o Dashboard e a Lista possam ser construídos em seguida, o app já oferece um
cliente de acesso à API de filmes, com entrada tipada, cujo endereço-base vem de configuração do
ambiente (com o endereço oficial do desafio como padrão), e uma configuração global de
cache e repetição de consultas compartilhada por todas as views. Esta entrega não exibe
dados na tela.

**Why this priority**: É infraestrutura sem valor visível ao usuário final, mas é pré-requisito
das próximas features; por isso fica atrás da navegação e do layout.

**Independent Test**: Testes automatizados chamam o cliente contra uma API simulada e
verificam o endereço usado, a conversão de resposta de sucesso e o tratamento de falha;
outro teste verifica que as views dentro do app têm acesso à configuração de consultas.

**Acceptance Scenarios**:

1. **Given** nenhuma configuração de endereço definida, **When** o cliente faz uma requisição,
   **Then** ela vai para `https://challenge.outsera.tech/api/movies`.
2. **Given** um endereço-base definido na configuração do ambiente, **When** o cliente faz uma
   requisição, **Then** ela usa esse endereço.
3. **Given** a API responde com sucesso, **When** o cliente recebe o corpo, **Then** o
   chamador obtém o corpo JSON como valor não tipado, pronto para o mapper da feature validar e converter.
4. **Given** a API responde com status de erro ou a rede falha, **When** o cliente é chamado,
   **Then** o chamador recebe um erro identificável, distinguível de sucesso, com o status quando houver.
5. **Given** o app montado, **When** uma view pede dados, **Then** a consulta usa a configuração
   global compartilhada (uma única instância para todo o app).

---

### Edge Cases

- URL com barra final ou diferença de maiúsculas (ex.: `/list/`, `/List`): trata-se como
  rota existente ou como não encontrada? Ver FR-007 (decisão registrada em Assumptions).
- Endereço-base configurado com barra final: o cliente não deve gerar `//` na URL final.
- A API fora do ar ou lenta: o shell e a navegação continuam funcionando, porque as views
  vazias desta entrega não dependem da API.
- Rota raiz (`/`): redireciona para o Dashboard em vez de mostrar página vazia.
- Texto do título "Outsera Razzies" e dos links não pode quebrar o layout em 768 px de largura.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O app MUST exibir, em todas as telas (inclusive "não encontrado"), um cabeçalho
  em largura total com o título "Outsera Razzies" e um menu lateral à esquerda, conforme o anexo 1.
- **FR-002**: O menu lateral MUST conter exatamente os links "Dashboard" e "List", nesta ordem,
  em inglês.
- **FR-003**: Ativar um link do menu MUST trocar apenas a área de conteúdo, mantendo
  cabeçalho e menu, e atualizar a URL.
- **FR-004**: O link da view atual MUST ser identificável visualmente e para tecnologias
  assistivas (indicação de página atual).
- **FR-005**: A view Dashboard MUST ser acessível em um endereço próprio e ser a view padrão
  na rota raiz; a view List MUST ter endereço próprio. Ambas exibem, por enquanto, apenas o
  título da view em uma página vazia.
- **FR-006**: Cada view MUST ter um título de página (cabeçalho de nível 1) que a identifica.
- **FR-007**: Endereços que não correspondem a nenhuma view MUST exibir a página "não
  encontrado", dentro do shell, com link para o Dashboard.
- **FR-008**: O layout MUST ser utilizável de 768x1280 até 1440x900, sem rolagem horizontal
  da página.
- **FR-009**: O shell MUST usar HTML semântico (regiões de cabeçalho, navegação e conteúdo
  principal), ter operação completa por teclado e foco visível.
- **FR-010**: O app MUST oferecer um cliente de acesso à API de filmes com parâmetros de entrada
  tipados (método, caminho, parâmetros de consulta) e a saída como valor não tipado, que cada feature valida
  e converte para os tipos do contrato OpenAPI do projeto.
- **FR-011**: O endereço-base do cliente MUST ser configurável por variável de ambiente
  pública do build, com `https://challenge.outsera.tech/api/movies` como valor padrão; o
  cliente MUST normalizar barras para não duplicá-las na URL final.
- **FR-012**: O cliente MUST sinalizar falhas (status HTTP não-2xx, falha de rede, corpo que
  não seja JSON válido) com um erro identificável e MUST NOT devolver um corpo que não seja JSON válido como se fosse dado. A conferência dos campos de cada resposta não é responsabilidade do cliente: o payload sai como valor não tipado e é validado pelo mapper de cada feature (Art. III).
- **FR-013**: O app MUST ter uma única configuração global de consultas e cache, compartilhada
  por todas as views, com política de repetição e de atualização de dados definida em um só lugar.
- **FR-014**: Todo texto de interface MUST estar em inglês; nenhum segredo é colocado na
  configuração de ambiente pública.

### Key Entities

- **View**: tela navegável do app (Dashboard, List), com nome de exibição, endereço e título de página.
- **Link de navegação**: item do menu que aponta para uma View e sabe se é o atual.
- **Configuração de API**: endereço-base da API de filmes, vindo do ambiente ou do padrão.
- **Erro de API**: falha identificável do cliente, com mensagem e status HTTP quando existir.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 100% dos testes de navegação, o usuário alcança as duas views e a página de
  "não encontrado" em no máximo 1 ação (clique ou Enter) a partir de qualquer tela.
- **SC-002**: Em 768x1280 e em 1440x900, 0 ocorrências de rolagem horizontal ou de elementos
  do shell cortados ou sobrepostos.
- **SC-003**: Toda a navegação do shell pode ser feita só com teclado, com foco sempre visível.
- **SC-004**: Uma URL de view aberta diretamente (nova aba ou recarga) mostra a view correta em
  100% dos casos, com o link correto marcado como atual.
- **SC-005**: Trocar o endereço da API exige alterar apenas a configuração de ambiente, sem
  mudar código-fonte.
- **SC-006**: Todo erro de requisição simulado (4xx, 5xx, falha de rede, corpo que não seja JSON) é
  distinguível de sucesso pelo chamador em 100% dos casos testados.
- **SC-007**: O shell completo carrega e permite navegar sem depender de resposta da API.

## Assumptions

- Escopo desta entrega: shell, rotas, página "não encontrado", cliente HTTP e configuração
  global de consultas. Fora do escopo: conteúdo do Dashboard e da Lista, funções de busca
  por endpoint específico, filtros e paginação, tema escuro/claro, menu recolhível.
- O título do cabeçalho é "Outsera Razzies" (o anexo 1 mostra "Frontend Angular Test" apenas como referência visual de posição e estilo).
- O layout é conforme o anexo 1: barra escura no topo, menu lateral claro com links em texto
  simples (azul no link atual, preto no outro) e conteúdo sobre fundo cinza claro. Não há menu
  hambúrguer: a largura mínima suportada (768 px) comporta o menu lateral fixo.
- Variável de ambiente pública do build (prefixo `VITE_`) guarda só a URL-base da API, que
  não é segredo (Art. IX). O arquivo `.env.example` documenta a variável; `.env` real não é versionado.
- O cliente HTTP cobre o contrato OpenAPI de `docs/requirements/openapi.json`. Nesta entrega
  ele expõe a infraestrutura de requisição e os tipos; funções por endpoint podem ser adicionadas
  nas features do Dashboard e da Lista. Divergências entre API real e OpenAPI são registradas no plan (Art. III).
- Rotas em minúsculas (`/dashboard`, `/list`); outras variações (maiúsculas, barra final
  tratada pelo roteador) seguem o comportamento padrão do roteador e são decididas no plan.
- Onde ficará o código (shell em `src/shared/` ou feature própria; cliente e QueryClient em
  `src/shared/`) é decidido no plan, respeitando o Art. I.
- Navegador moderno (últimas versões de Chrome, Firefox, Edge, Safari); sem requisito de suporte
  a telas menores que 768 px.
- Dependência: acesso à API pública `https://challenge.outsera.tech/api/movies` apenas nas
  features seguintes; testes desta entrega usam API simulada.
