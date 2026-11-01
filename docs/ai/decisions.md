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
