# Outsera Razzies Constitution

SPA React + TypeScript que lista indicados e vencedores da categoria Pior Filme do Golden
Raspberry Awards, consumindo `https://challenge.outsera.tech/api/movies`. Requisitos em
`docs/requirements/challenge.md`. Esta constituição prevalece sobre qualquer outro documento.

## Core Principles

### I. Estrutura
- Cada feature MUST ficar em `src/features/<name>/` com as pastas `api/`, `model/` e `ui/`.
- Código compartilhado MUST ficar em `src/shared/`.
- Uma feature MUST NOT importar de outra feature; o que for comum sobe para `src/shared/`.

### II. Dados
- Server state MUST ser gerenciado somente pelo TanStack Query.
- Filtros e página atual MUST viver na URL (search params).
- Cache paralelo e store global MUST NOT ser criados sem justificativa registrada no `plan.md`.

### III. Contrato HTTP
- O cliente HTTP MUST ser tipado.
- O payload cru MUST passar por um mapper em `model/` antes de chegar à UI.
- A referência do contrato é `docs/requirements/openapi.json`; divergência entre a API real e
  o OpenAPI MUST ser registrada no `plan.md`.

### IV. Estados da UI
Toda tela ou painel assíncrono MUST tratar os quatro estados: carregando, vazio, erro e sucesso.
O erro MUST oferecer ação de nova tentativa quando a operação for repetível.

### V. Tipagem
- TypeScript em modo `strict`; `any` explícito MUST NOT ser usado (preferir `unknown` + validação).
- `interface` para entidades; `type` para unions e aliases.
- Tipos MUST ficar em arquivos próprios (`*.types.ts`), para evitar arquivos grandes e poluídos.

### VI. Estratégia de testes (pirâmide sem redundância)
- Cada comportamento MUST ser testado no nível mais baixo que consegue prová-lo, e só nele.
- **Unitário (Vitest)**: mappers, utilitários, regras de dados e hooks.
- **Componente (Vitest + Testing Library + MSW)**: estados de carregando/vazio/erro/sucesso,
  interação de filtros e paginação, acessibilidade (papéis e labels).
- **E2E (Playwright)**: só jornadas que dependem de navegador real e de várias partes juntas:
  navegação pelo menu, URL compartilhável (abrir link com filtros e página, voltar do navegador),
  busca por ano ponta a ponta, layout 768x1280 e 1440x900.
- E2E MUST NOT repetir o que o unitário ou o componente já provam (formatação, estados de painel,
  validações). Cada teste E2E MUST declarar no título o risco de integração que cobre.
- E2E usa API mockada com fixtures derivadas do OpenAPI; `waitForTimeout` é proibido;
  a localização de elementos é por papel e texto acessível.
- Todo `plan.md` MUST conter uma matriz "Critério de aceite → nível de teste → arquivo", e o code
  review MUST recusar teste duplicado entre níveis.
- Verificação: `npm test` e `npm run test:e2e` no CI.

### VII. Acessibilidade e layout
- HTML semântico, `label` em todo controle, operação completa por teclado e foco visível.
- A interface MUST funcionar a partir de 768x1280.
- Textos da UI MUST estar em inglês, conforme os anexos.

### VIII. Uso de IA
- Toda feature MUST passar por specify, plan e tasks antes de qualquer código.
- Prompts, sessões e decisões MUST ser registrados em `docs/ai/`, sem segredos nem dados pessoais.
- Nenhum código gerado por IA entra sem revisão humana.

### IX. Composição, renderização e segurança
- Props atravessam no máximo 2 níveis; além disso, usar composição (`children`/slots) ou um hook
  da feature. Context só para estado realmente global (ex.: tema), nunca para dados do servidor.
- Estado derivado MUST ser calculado no render, não guardado em `useState` nem sincronizado com
  `useEffect`. `useEffect` MUST NOT buscar dados (o TanStack Query faz isso).
- `memo`/`useMemo`/`useCallback` só com motivo registrado: custo medido no Profiler ou
  referência estável para filho memoizado.
- Listas MUST usar `key` estável (id), nunca o índice.
- Conteúdo da API MUST ser renderizado só como texto; `dangerouslySetInnerHTML` é proibido.
- Nenhum segredo em variáveis `VITE_*` (são públicas).
- Verificação: ESLint com `react-hooks` (`rules-of-hooks`, `exhaustive-deps`), `react/no-danger`,
  `react/no-array-index-key` e `jsx-a11y`; o restante, no code review.

### X. Componentização e reutilização
- Componentes compartilhados ficam em `src/shared/ui/` e são apresentacionais: recebem dados por
  props, não buscam dados e não conhecem nenhuma feature.
- Extrair para `shared/ui` quando o mesmo padrão aparece em 2 lugares; não criar abstração para
  uso único.
- Componentes genéricos são tipados (ex.: `DataTable<T>` com definição de colunas), sem props
  booleanas para cada variação.
- Estados assíncronos (carregando, vazio, erro) são tratados por um componente comum de painel,
  não reimplementados em cada tela.
- Estilos com CSS Modules e tokens (cores, espaçamentos) em `src/shared/styles`; sem estilos
  inline nem valores mágicos.
- Cada componente de `shared/ui` MUST ter teste próprio.
- Verificação: code review e Constitution Check do plan.

## Restrições de tecnologia

Stack aprovada (versões ficam no `package.json`, não nesta constitution): React, TypeScript
(strict), Vite, React Router, TanStack Query, CSS Modules, Vitest, Testing Library, MSW,
Playwright, ESLint e Prettier.

Qualquer dependência fora dessa lista MUST ter justificativa no `plan.md`, com o problema que
resolve, as alternativas consideradas e o custo de bundle.

## Definition of Done

Uma tarefa está pronta somente quando:
1. Há teste no nível correto (Art. VI) e `npm run lint`, `npm run typecheck` e `npm test` passam
   antes do commit; `npm run test:e2e` passa no CI.
2. Os quatro estados da UI estão tratados e verificados (Art. IV).
3. Acessibilidade e layout a partir de 768x1280 foram conferidos (Art. VII).
4. O código foi revisado por um humano e o registro em `docs/ai/` está atualizado (Art. VIII).
5. O commit segue Conventional Commits, com uma tarefa por commit.

## Governance

- **Precedência**: esta constituição prevalece sobre `CLAUDE.md`, spec, plan, tasks e demais
  documentos. Em conflito, parar e perguntar; nenhum requisito é inventado.
- **Constitution Check**: todo `plan.md` MUST conter um Constitution Check com PASS/FAIL para cada
  artigo (I–X). Um FAIL só segue com justificativa na tabela de Complexity Tracking e aprovação
  do James.
- **Emendas**: proposta por escrito com motivo e impacto, aprovada pelo James, aplicada via
  `/speckit-constitution`, com Sync Impact Report e revisão dos templates dependentes.
- **Versionamento (SemVer)**: MAJOR para remoção ou redefinição incompatível de artigo; MINOR
  para novo artigo ou expansão relevante; PATCH para esclarecimentos e correções de redação.
- **Conformidade**: todo PR e code review MUST verificar os artigos; desvios são registrados em
  `docs/ai/decisions.md` quando decorrerem de correção humana a uma proposta da IA.

**Version**: 1.0.0 | **Ratified**: 2026-10-31 | **Last Amended**: 2026-10-31
