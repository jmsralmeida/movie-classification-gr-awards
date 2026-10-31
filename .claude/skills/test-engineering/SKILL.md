---
name: test-engineering
description: Definir estratégia de testes orientada a risco e implementar testes confiáveis com Vitest, Testing Library e MSW. Usar ao criar ou corrigir testes unitários e de componentes, montar mocks da API, avaliar cobertura ou investigar testes instáveis.
---

# Engenharia de testes

Adaptada do meu hub pessoal de skills para este projeto (Vitest + Testing Library + MSW).

## Instruções

1. Ler os critérios de aceite da spec e a tarefa atual. Cada critério precisa de
   pelo menos um teste ou de uma justificativa escrita.
2. Escolher o nível mais barato que prova o comportamento:
   - mappers e utilitários: teste unitário puro;
   - hooks de dados: teste com MSW e `QueryClient` isolado por teste;
   - componentes e páginas: Testing Library, consultando por papel e texto
     acessível (`getByRole`, `getByLabelText`), nunca por classe CSS.
3. Para cada tela ou painel, cobrir: sucesso, vazio, erro e carregando. Para a
   lista: troca de página, filtro por ano, filtro por vencedor e combinação deles,
   e o reflexo na URL.
4. Handlers MSW em `src/test/` (ou pasta definida no plan), com fixtures pequenas
   no formato do OpenAPI. Requisições não tratadas devem falhar o teste.
5. Testes determinísticos: sem `setTimeout` fixo, usar `findBy*`/`waitFor`;
   `QueryClient` com `retry: false` nos testes; estado isolado entre testes.
6. Quando corrigir bug, escrever primeiro o teste que falha.
7. Nunca desabilitar teste, relaxar asserção ou aumentar timeout para obter verde.

## Gate antes de concluir

- `npm run lint && npm run typecheck && npm test` sem erros.
- Cobertura revisada por risco (não só percentual) com `npm run test:coverage`.
- Informar o que os testes provam e o que ficou só manual.

## Saída

Lista de riscos cobertos, testes criados ou alterados, comandos e resultados, lacunas.
