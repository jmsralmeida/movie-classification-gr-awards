---
name: focused-bug-resolution
description: Diagnosticar e corrigir um bug ou regressão concreta com o menor patch causal e um teste que prova a correção. Usar quando houver um defeito observado ou reproduzível, sem transformar a correção em refatoração ou feature.
---

# Correção focada de bugs

Adaptada do meu hub pessoal de skills.

## Instruções

1. Registrar esperado, observado e passos de reprodução. Ler só o código, os
   testes e os contratos próximos ao sintoma.
2. Reproduzir antes de editar. Formular poucas hipóteses e eliminá-las com
   evidência. Separar sintoma, gatilho e causa raiz.
3. Escrever o teste de regressão no Vitest e mostrar que ele falha pelo motivo
   esperado.
4. Aplicar o menor patch que remova a causa. Cada linha alterada deve ser
   necessária à causa ou ao teste. Refatorações e melhorias ficam para outra tarefa.
5. Rodar o teste novo e depois `npm run lint && npm run typecheck && npm test`.
6. Revisar o diff com a skill `review-pull-request`.

## Saída

Causa confirmada, patch, teste que falhava e agora passa, comandos e resultados.
Usar `CORRIGIDO E VALIDADO` só com a prova executada; sem ela, `BLOQUEADO` e o motivo.
Registrar o bug e a causa em `docs/ai/decisions.md` se a IA tiver introduzido o defeito.

## Limites

- Não mascarar sintoma, relaxar asserção ou desabilitar teste.
- Não inventar comportamento esperado: em dúvida, consultar a spec ou perguntar.
