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
