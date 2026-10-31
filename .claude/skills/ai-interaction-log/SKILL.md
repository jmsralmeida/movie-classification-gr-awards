---
name: ai-interaction-log
description: Registrar o uso de IA no repositório para o avaliador. Usar ao final de cada fase do Spec Kit, depois de um code review, ou quando o James corrigir ou rejeitar uma proposta do agente.
---

# Registro de interações com IA

O desafio exige um registro de interações com o agente. Os hooks já gravam os
prompts (`docs/ai/prompts.md`) e as sessões (`docs/ai/sessions/`). Esta skill
cuida da parte que precisa de julgamento: o resumo e as decisões.

## Ao final de uma fase do Spec Kit

Adicionar uma linha na tabela "Linha do tempo" de `docs/ai/README.md`:

`| data | feature | fase | comando/skill | artefato gerado | o que o James revisou ou mudou |`

- Fase: constitution, specify, clarify, plan, tasks, analyze, implement, review.
- Artefato: caminho do arquivo (ex.: `specs/002-dashboard/plan.md`) ou commit.
- Ser factual e curto. Não inventar revisão que não aconteceu: se não souber,
  perguntar ao James.

## Quando o James corrigir ou rejeitar algo

Adicionar uma entrada em `docs/ai/decisions.md`:

```markdown
### AAAA-MM-DD — título curto
- Proposta da IA: ...
- Decisão: ...
- Motivo: ...
- Onde: arquivo, commit ou PR
```

## Depois de um code review

Garantir que `docs/ai/reviews/<feature>.md` lista os achados e o destino de cada um
(aceito, recusado com motivo, adiado).

## Regras

- Nunca gravar segredos, tokens, caminhos pessoais sensíveis ou dados pessoais.
- Não reescrever entradas antigas; só acrescentar.
- Não editar `docs/ai/prompts.md` à mão, exceto para remover algo sensível.
