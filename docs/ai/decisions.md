# Decisões sobre propostas da IA

Momentos em que corrigi, rejeitei ou ajustei o que o agente propôs. Uma entrada por
decisão, mais recente no final.

<!-- Modelo:
### AAAA-MM-DD — título curto
- Proposta da IA: ...
- Decisão: ...
- Motivo: ...
- Onde: arquivo, commit ou PR
-->

### 2026-10-31 — TypeScript fixado em 5.9
- Proposta da IA: não houve; decisão minha durante o bootstrap.
- Decisão: fixar o TypeScript na 5.9.
- Motivo: a versão mais nova é incompatível com o typescript-eslint; fixar agiliza o bootstrap e, nos testes, não teve impacto.
- Onde: `package.json`

### 2026-10-31 — Artigos IX e X adicionados por mim
- Proposta da IA: o rascunho do agente tinha 8 artigos.
- Decisão: acrescentei o IX (composição, renderização e segurança) e o X (componentização e reutilização), com verificação por ESLint e code review.
- Motivo: tornar verificáveis as regras de props, estado derivado, hooks de memoização, `key`, XSS, estilos e reuso de `shared/ui`.
- Onde: `.specify/memory/constitution.md`

### 2026-10-31 — Estratégia de testes em pirâmide com Playwright só para jornadas
- Proposta da IA: o Artigo VI exigia teste de comportamento com Vitest + Testing Library + MSW, sem separar níveis.
- Decisão: substituí o VI por uma pirâmide sem redundância (unitário, componente e E2E). O Playwright cobre só jornadas que dependem de navegador real, e cada teste E2E declara o risco de integração.
- Motivo: evitar teste duplicado entre níveis e manter a suíte E2E pequena e estável.
- Onde: `.specify/memory/constitution.md` (Art. VI), `.specify/templates/plan-template.md` (matriz de testes)

### 2026-10-31 — OpenAPI salvo em `docs/requirements/openapi.json`
- Proposta da IA: não houve; decisão minha.
- Decisão: guardar o OpenAPI da API no repositório, em `docs/requirements/openapi.json`, como referência do contrato.
- Motivo: ter uma fonte versionada e offline para o cliente tipado, os mappers e as fixtures de teste.
- Onde: `docs/requirements/openapi.json`, Art. III da constitution

### 2026-10-31 — Playwright incluído na fundação
- Proposta da IA: deixar o Playwright para a primeira feature com jornada E2E, como diz o CLAUDE.md.
- Decisão: instalar o Playwright já na fundação, com configuração mínima; as configurações densas (viewports, fixtures, mocks) ficam para quando houver teste E2E.
- Motivo: ter o `test:e2e` e a pasta `e2e/` prontos, sem antecipar configuração sem uso.
- Onde: `playwright.config.ts`, `package.json`, `CLAUDE.md` (seção Comandos)

### 2026-10-31 - Fundação num commit único por ser setup inicial
- App shell com providers criado nela.
- A spec 001 cobre somente o layout, menu e rota
### 2026-10-31 — Ajustes após o /speckit-analyze da spec 001
- Proposta da IA: plan com Art. I marcado PASS (features só com `ui/`); smoke test mantido "ou removido"; `NavLink` sem `end`; tarefa T010 de espaçamento solta; rolagem do layout sem definição.
- Decisão: aprovar o desvio do Art. I (sem chamadas de API nesta entrega, registrado em Complexity Tracking); remover o teste do shell do smoke test e afirmar título e links na ordem em `App.test.tsx`; `end` no `NavLink` com teste de `/list/xyz`; espaçamento dentro de T008 (T010 removida); cabeçalho fixo no topo e menu visível, só o conteúdo rola.
- Motivo: evitar pastas vazias, fechar lacunas de cobertura (FR-001, FR-002) e tornar o cenário de rolagem verificável.
- Onde: `specs/001-app-shell/spec.md`, `plan.md`, `research.md`, `tasks.md`

### 2026-10-31 — Título do cabeçalho no clarify da spec 001
- Proposta da IA: "Frontend React Test" (anexo 1 trocando Angular por React).
- Decisão: usar "Outsera Razzies", o nome do projeto.
- Motivo: o texto do anexo é só referência visual; o nome do projeto é mais adequado.
- Onde: `specs/001-app-shell/spec.md` (Clarifications, FR-001)

### 2026-10-31 — Glob do E2E offline na T010
- Proposta da IA: na T010, bloquear a API no teste (d) com `page.route('**/api/**', ...)`, como o texto da tarefa.
- Decisão: restringir a glob a `**/challenge.outsera.tech/**` e ajustar o texto da T010 em `tasks.md`, em commit `test(e2e):` separado antes da T016.
- Motivo: depois da T016 o app importa `src/shared/api/queryClient.ts`, e o Vite dev serve o módulo nesse caminho; a glob antiga abortava o próprio app e derrubava o teste nos dois viewports.
- Onde: `e2e/shell-navigation.spec.ts`, `specs/001-app-shell/tasks.md`, commit `50176eb`

### 2026-10-31 — Achados da revisão T020 tratados e adiados
- Proposta da IA: o `code-reviewer` apontou 6 achados (2 médios, 4 baixos).
- Decisão: tratar a duplicação de testes entre níveis, os títulos do E2E sem o risco de integração e o link atual distinguido só por cor; adiar a normalização do `path` no cliente HTTP e o `h1` estilizado dentro do `AppShell`.
- Motivo: os três primeiros violam o Art. VI ou o WCAG 1.4.1; os adiados não afetam a entrega atual (a feature seguinte usa caminhos literais).
- Onde: `docs/ai/reviews/001-app-shell.md`

### 2026-10-31 — Correções do analyze da 002 (D1, I1, C1, C2)
- Proposta da IA: `tasks.md` e a matriz do `plan.md` repetiam o mesmo comportamento em níveis diferentes (texto literal em `DataTable` e `StudiosPanel`, estado de vazio em T010, T012 e T015, voltar/avançar em T013 e no E2E), o E2E importava as fixtures sem extensão e dois edge cases da spec (duplo clique, texto longo) não tinham teste.
- Decisão: aplicar D1, I1, C1 e C2 do relatório; cada comportamento fica em um só nível, o import usa `fixtures.ts` com extensão e sem imports, e entram o teste de duplo clique e o de nome longo no teste de 768. U1, A1 e I2 (baixos) ficaram sem mudança.
- Motivo: D1 violava o Art. VI; I1 quebraria o `tsc -b`, pois o `e2e/` é compilado pelo `tsconfig.node.json` (`nodenext`).
- Onde: `specs/002-dashboard/tasks.md`, `plan.md` (matriz de testes), `research.md` (R9)

### 2026-10-31 — Achados da revisão T021 da 002 e destino do api-divergences.md
- Proposta da IA: o `code-reviewer` apontou 5 achados (2 médios, 3 baixos), entre eles remover `docs/api-divergences.md`, que o implementador criou fora das tasks e que duplica o plan.
- Decisão: corrigir os achados 1, 2, 3 e 5 e manter `docs/api-divergences.md` como elucidação das divergências da API, citado no `plan.md` como fonte detalhada.
- Motivo: foco e anúncio de erro afetam a operação por teclado e leitor de tela (FR-018, SC-007, Art. VII); o arquivo ajuda o avaliador a entender as divergências entre a API real e o OpenAPI.
- Onde: `docs/ai/reviews/002-dashboard.md`; commits `e2c15b3`, `6465f7f`, `3059a9a`, `6a7ce99`, `a8218a2`

### 2026-10-31 — DataTable sem prop `variant` no plan da 003
- Proposta da IA: o `plan.md` da 003 estendia o `DataTable` compartilhado com `variant?: 'plain' | 'striped'` para obter as listras do anexo 2, além de `columns[].headerControl` e `statusRow`.
- Decisão: remover `variant`. Listras e cabeçalhos centralizados passam a ser composição na feature (wrapper com CSS Modules em `ListPage`); o `DataTable` ganha só `columns[].headerControl` e `statusRow`, opcionais, e o Dashboard não muda. A extensão do `DataTable` vira a primeira tarefa de refatoração, em commit próprio e antes de qualquer tarefa da Lista, com os testes do `DataTable` e do Dashboard verdes e testes novos só para as duas props.
- Motivo: a diferença é só visual, e o Art. X proíbe prop de variação por caso de uso em componente compartilhado.
- Onde: `specs/003-movies-list/plan.md` (estrutura, Constitution Check, ordem de implementação), `research.md` (R9), `contracts/ui-components.md`

### 2026-10-31 — Paginação com `aria-disabled` e teste de foco no sucesso (plan da 003)
- Proposta da IA: o `plan.md` da 003 desabilitava os botões sem destino da `Pagination` com o atributo `disabled` e só testava o foco no caminho de erro (R6) e nos filtros.
- Decisão: usar `aria-disabled="true"` nos botões sem destino (continuam focáveis e ignoram o clique) e acrescentar na matriz um teste de componente do foco ao acionar "Next page" com sucesso, inclusive ao chegar na última (ou primeira) página.
- Motivo: ao chegar na última página, "Next page" viraria `disabled` enquanto focado e o navegador poderia tirar o foco dele, contra o FR-020. A pergunta do James sobre o foco durante o carregamento revelou a lacuna.
- Onde: `specs/003-movies-list/plan.md` (matriz e Constitution Check, Art. VII), `research.md` (R5), `contracts/ui-components.md`, `quickstart.md`

### 2026-10-31 — Correções do analyze da 003 (D1, I1, I2, C1, C2 e baixos)
- Proposta da IA: `tasks.md` e a matriz do `plan.md` repetiam comportamentos em mais de um teste (bordas `aria-disabled`, reset para a página 1, foco no campo, parâmetros inválidos da URL, abrir a URL direto), o SC-002 ("qualquer página em no máximo duas ações") era falso com a janela de 5 números, o `aria-busy` tinha três definições de wrapper e dois edge cases da spec (resposta antiga lenta, voltar pelo menu) não tinham teste.
- Decisão: aplicar as cinco remoções de duplicata (cada comportamento em um único nível), reescrever o SC-002 como "primeira, última, anterior, próxima e qualquer número da janela em uma ação" (provado em T010), pôr o `aria-busy` só em volta da `DataTable` (a `Pagination` fica fora), acrescentar o teste de resposta antiga lenta (T018) e o de voltar pelo menu (`App.test`, T016), e ajustar os achados baixos (tamanho inválido no edge, `--opacity-busy` no plan, FR-018 na matriz, frase da T012).
- Motivo: a duplicata violava o Art. VI; o SC-002 não era verificável; `aria-busy` num contêiner com os botões focados pode fazer o leitor de tela ignorar a região (FR-020). O James escolheu reescrever o SC-002 em vez de mudar a `Pagination`.
- Onde: `specs/003-movies-list/spec.md` (SC-002, edge), `tasks.md` (T006, T010, T012, T014, T016 a T019), `plan.md` (matriz), `research.md` (R9), `contracts/ui-components.md`
