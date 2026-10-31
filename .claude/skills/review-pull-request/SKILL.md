---
name: review-pull-request
description: Revisar um diff, branch ou pull request com foco em defeitos, regressões, aderência à constitution e à spec, segurança e cobertura de testes. Usar antes de abrir ou mergear um PR, ou quando pedirem code review.
---

# Revisar pull request

Adaptada do meu hub pessoal de skills.

## Instruções

1. Ler a spec, o plan e as tasks da feature, e a constitution. Entender o objetivo
   declarado da mudança.
2. Delimitar base e head (`git diff main...HEAD`). Não revisar arquivos fora do
   diff sem explicar por quê.
3. Ler o código ao redor das alterações para validar contratos, chamadas e efeitos.
4. Procurar, nesta ordem: defeitos reproduzíveis, desvios da constitution (artigo
   por artigo), critérios de aceite sem teste, estados de UI ausentes, problemas
   de acessibilidade, dependências sem justificativa, segredos.
5. Rodar `npm run lint && npm run typecheck && npm test`.
6. Não apontar estilo que o Prettier ou o ESLint já resolvem.

## Formato dos achados

Um item por problema, ordenados por severidade:

```text
[Alta|Média|Baixa] Título objetivo — arquivo:linha
Impacto: o que falha e para quem.
Evidência: condição ou fluxo que demonstra o problema.
Correção esperada: o resultado necessário.
```

Não atribuir severidade alta a uma possibilidade sem caminho plausível de falha.
Se não houver defeito concreto, dizer isso claramente.

## Registro

Ao final, anexar em `docs/ai/reviews/<feature>.md` os achados e, depois da
decisão do James, quais foram aceitos e quais recusados (com motivo).
