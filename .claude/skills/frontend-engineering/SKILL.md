---
name: frontend-engineering
description: Projetar, implementar ou revisar telas e componentes React com foco em fluxo do usuário, estados de carregamento/vazio/erro/sucesso, acessibilidade, responsividade (mínimo 768x1280), contratos de dados, performance e testes. Usar ao implementar tarefas de UI do tasks.md ou revisar componentes.
---

# Engenharia frontend

Adaptada do meu hub pessoal de skills para este projeto (React + TypeScript + TanStack Query).

## Instruções

1. Ler a spec, o plan e a tarefa atual em `specs/<feature>/`, e os artigos da
   constitution que a tarefa toca. Ler componentes, hooks e testes existentes antes
   de criar algo novo.
2. Separar estrutura, dados, estado e estilo:
   - dados do servidor via hook de TanStack Query na pasta `api/` da feature;
   - payload cru da API passa por um mapper em `model/` antes de chegar à UI;
   - filtros e página ficam na URL (search params), não em estado global;
   - componentes de `ui/` recebem só o que exibem.
3. Modelar os estados de cada tela ou painel assíncrono: carregando, vazio, erro
   (com ação de tentar de novo quando fizer sentido) e sucesso.
4. Acessibilidade: HTML semântico (`table`, `th scope`, `caption` ou título
   associado, `nav`, `main`), labels em inputs e selects, foco visível, navegação
   por teclado, contraste.
5. Responsividade: validar em 768x1280 e em desktop. Tabelas largas não podem
   quebrar o layout.
6. Performance: evitar re-render desnecessário, não buscar dados que a API já
   entrega agregados, não memoizar sem motivo medido ou óbvio.
7. Escrever testes de comportamento junto com o componente (ver skill
   `test-engineering`).
8. Revisar o próprio diff: estados esquecidos, textos divergentes dos anexos,
   dependências novas sem justificativa.

## Saída

Arquivos alterados, estados cobertos, decisões de UI, comandos executados
(`lint`, `typecheck`, `test`) e limitações. Sinalizar decisões de produto que o
frontend não resolve sozinho.

## Limites

- Não tratar mock como contrato: o OpenAPI é a referência.
- Não reduzir tarefa de UX a cosmética.
- Não adicionar biblioteca de UI ou estado sem justificativa no `plan.md`.
