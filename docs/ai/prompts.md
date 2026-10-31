# Log de prompts

Gerado automaticamente pelo hook `.claude/hooks/log-prompt.mjs`.

### 2026-10-31 20:01 UTC · sessão 30056c5f

> listar subagentes e skills desde projeto

### 2026-10-31 20:32 UTC · sessão 30056c5f

> /speckit-constitution Projeto: Outsera - Lista de indicados e vencedores da
> categoria Pior Filme do Golden Raspberry Awards, SPA React + TypeScript que consome https://challenge.outsera.tech/api/movies e consulta a documentacao disponivel no swagger https://challenge.outsera.tech/swagger-ui/index.html. Requisitos em docs/requirements/challenge.md. Crie uma constitution curta (10 artigos), verificavel versao 1.0.0, com sync impact report no topo:
> 
> I. Estrutura: features em src/features/<name>/ com api/, model/, ui/; compartilhado em src/shared/.
> II. Dados: server state somente via TanStack Query; filtros e pagina da URL (search params); sem cache paralelo nem store global sem justificativa.
> III. Contrato HTTP: cliente tipado; payload cru passa por mapper em model/ antes da UI; OpenAPI é a referência do contrato em docs/requirements/openapi.json.
> IV. Estados da UI: toda tela ou painel assincrono trata carregando, vazio, erro e sucesso.
> V. Tipagem: Typescript strict, sem any; interface para entidades, type para unions, arquivos separados para typagens para evitar poluicao de tipos e arquivos grandes e complexos.
> VI. Testes: cada funcionalidade tem teste de comportamento (Vitest + Testing Library); API mockada com MSW; lint, typeckeck e testes verdes antes de cada commit.
> VII. Acessibilidade e layout: HTML semantico, labels, teclado, foco visivel; funciona a partir de 768x1280; textos da UI em ingles conforme os anexos.
> VIII. Uso de IA; toda feature assa por secify, lan e tasks antes do código; prompts, sessões e decisões registrados em docs/ai/; nenhum codigo gerado entra sem revisao humana. Inclua Definition of Done e governanca de emendas. Garanta que o plan-temlate tenha um Constitution Check com PASS/FAIL por artigo.
> IX. Composicao, renderizacao e seguranca:
> - Props atravessam no maximo 2 niveis; alem disso, usar composicao (children/slots) ou um hook da feature. Context so para estado realmente global (ex.: tema), nunca para dados do servidor.
> - Estado derivado é calculado no render, nao guardado em useState nem sincronizado com useEffect. SEm useEffect para buscar dados (TanStack Query faz isso).
> - memo/useMemo/useCallback só com motivo registrado (custo medido no Profiler ou referencia estavel para filho memoizado).
> - Listas usam key estável (id), nunca o indice.
> - Conteudo da API é renderizado so como texto; dangerouslySetInnerHTML é proibido; nenhum segredo em variaveis VITE_ (sao publicas). Verificacao: ESLint com react-hooks (rules-of-hooks, exhaustive-deps), react/no-danger, react/no-array-index-key e jsx-a11y; o restante, no code review.
> X. Componentizacao e reutilizacao:
> - Componentes compartilhados ficam em src/shared/ui/ e sao apresentacionais: recebem dados por props, nao buscam dados e nao conhecem nenhuma feature.
> - Extrair para shared/ui quando o mesmo padrao aparece em 2 lugares; nao criar abstracao para uso unico
> - Componentes genericos sao tipados (ex.: DataTable<T> com definicao de colunas), sem props booleanas para cada variacao
> - Estados assincronos (carregando, vazio, erro) sao tratados por um componente comum de painel nao reimplementados em cada tela.
> - Estilos com CSS Modules e tokens (cores, espacamentos) em src/shared/styles; sem estilos inline nem valores magicos
> - Cada componente de share/ui tem teste proprio. Verificacao: code review e Constitution Check do plan
> 
> Escrever o constitution, corrigir possiveis erros de portugues

### 2026-10-31 20:47 UTC · sessão 30056c5f

> Ajuste o rascunho da constitution antes de eu ratificar a versao. 
> 
> 1) Substitua o Artigo VI por:
> VI. Estrategia de testes (piramide sem redundancia)
> - Cada comportamento é testado no nivel mais baixo que consegue prova-lo, e so nele. 
> - Unitario (Vitest): mappers, utilitarios, regras de dados, hooks.
> - Componente (Vitest + Testing Library + MSW): estados de carregando/vazio/erro/sucesso, interacao de filtros e paginacao, acessibilidade (papeis e labels)
> - E2E (Playwright) so jornandas que dependem de navegador real e de varias partes juntas: navegacao pelo menu, URL compartilhave (abrir link com filtros e pagina, voltar do navegador), busca por ano ponta a ponta, layout 768x1280 e 1440x900.
> - E2E nao repete o que o unitario ou componente ja provam (formatacao, estados de painel, validacoes). Cada teste E2E declara no titulo o risco de integracao que cobre.
> - E2E usa API mockada com fixtures derivadas do OpenAPI; sem waitForTimeout; localizacao por papel e texto acessivel.
> - Toto plan.md tem uma matriz "Criterio de aceite -> nivel de teste -> arquivo". e o code review recusa teste duplicado entre niveis.
> Verificacao: npm test e npm run test:e2e no CI.
> 
> 2) Adicione uma sessao "Restricoes de tecnologia" (nao e artigo) com a stack aprovada, sem versoes: React, typescript strict, Vite, React Router, Tanstack Query, CSS Modules, Vitest, Testing Library, MSW, Playwright, EsLint, Prettier. Regra: qualquer deendencia fora dessa lista precisa de justificativa no plan.md (problema, alternativas, custo de bundle). Versoes ficam no package.json, nao na constitution.

### 2026-10-31 20:53 UTC · sessão 30056c5f

> sim, atualize o plan-template e o CLAUDE.md

### 2026-10-31 20:57 UTC · sessão 30056c5f

> Use a skill /ai-interaction-log registre a fase constitution na linha do tempo e, em decisions.md as decisoes qual tomei: TypeScript fixado em 5.9 (incompativel com typescript-eslint, para agilizar o bootstrap, em teste sem impacto), artigos IX (composicao/renderizacao/seguranca) e X (componentizacao) adicionados or mim, estrateia de testes em piramide com Playwright so para jornadas e OpenAPI salvo em docs/requirements/openapi.json

### 2026-10-31 21:05 UTC · sessão ca3d5e77

> Leia a constitution e o CLAUDE.md. Configure a fundacao do projeto, sem nenhuma feature ainda:
> 
> - Dependencias:  react-router, @tanstack/react-query, vitest, @testing-library/react, @testing-library/user-event, @testing-library/jest-dom, jsdom, msw, prettier (e o que mais for necessário, justificando)
> - TypeScript strict; ESLint com regras para React hooks e sem any;
> - Scripts: dev, build, lint, typecheck, test, test:coverage, format;
> - Setup de testes com MSW (servidor em src/test/) e um teste de fumaca;
> Github Actions rodando lint, typecheck, test e build em push e PR;
> - remova o boilerplate do Vite. Antes de instalar, me mostre a lista de dependencias e o motivo de cada uma. Rode tudo no final e atualize a sessao de comandos do CLAUDE.md e constitution se necessario.
> 
> Me da uma lista do arquivos alterados, configuracoes geradas, pra eu poder agrupar os commits de forma a facilitar a leitura e o code review.

### 2026-10-31 21:14 UTC · sessão ca3d5e77

> Decisoes.
> 
> - Pode incluir o setup inicial do playwright, deixe configuracoes mais densas para quando for utilizado
> - Pode remover o pacote somente usado no boilerplate do vite. 
> 
> Pode seguir com a instalacao dos pacotes para a fundacao tecnica do projeto.

### 2026-10-31 22:04 UTC · sessão 0d5df681

> /speckit-specify App: shell: layout com cabeçalho e menu lateral com links "Dashboard" e "List", rotas para as duas views (paginas vazias por enquanto), cliente HTTP tipado para https://challenge.outsera.tech/api/movies pode adicionar o host em .env usando a estrutura public do vite, QueryClient configurado e pagina de rota nao encontrado. Layout conforme docs/requirements/anexo-1-dashboard.png. Responsivo a partir de 768x1280.

### 2026-10-31 22:45 UTC · sessão 0d5df681

> /speckit-clarify

### 2026-10-31 22:56 UTC · sessão 0d5df681

> /speckit-plan

### 2026-10-31 23:13 UTC · sessão 0d5df681

> /speckit-tasks

### 2026-10-31 23:21 UTC · sessão 0d5df681

> /speckit-analyze

### 2026-10-31 23:32 UTC · sessão 0d5df681

> - Aprovar o desvio ja que nessa tarefa nao estamos implementando ainda as chamadas de api.
> - E1 -> Remover o smoke test nessa parte
> - E2 -> Afirmar os dois links na ordem do app real
> - I1 ->  Em T004, passar end no NavLink e testar um subcaminho
> (/list/xyz)
> - A2 -> Mexer somente em T008 e remover o T010. 
> - E3 Cabecalho fixo

### 2026-10-31 23:37 UTC · sessão 0d5df681

> /ai-interaction-log Use a sill para registrar a specificacao dessa feature da fase de specify ate as tasks e analyze
