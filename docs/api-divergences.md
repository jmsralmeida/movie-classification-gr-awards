# Divergências entre a API real e o OpenAPI

Verificadas em 2026-10-31 contra `https://challenge.outsera.tech/api/movies` (feature 002,
Dashboard). Quando há diferença, vale o OpenAPI (`docs/requirements/openapi.json`) e o app valida
o formato de cada resposta antes de usá-la.

- **`winnersByYear`**: devolve uma **lista** de filmes, igual ao OpenAPI. O PDF do desafio
  mostrava um objeto. O mapper rejeita qualquer resposta que não seja lista.
- **Ano sem prêmio**: `200 []`. O painel mostra "No winners found for {year}.".
- **Ano inválido ou ausente**: `400` com corpo `{detail, instance, status, title}`, em que
  `status` é numérico (o OpenAPI diz enum de string, já registrado na feature 001). O Dashboard só
  consulta com ano de 4 dígitos e usa apenas o status HTTP.
- **Demais endpoints** (`yearsWithMultipleWinners`, `studiosWithWinCount`,
  `maxMinWinIntervalForProducers`): coincidem com o OpenAPI. `studiosWithWinCount` devolve os 28
  estúdios já em ordem decrescente de vitórias; o app só corta os 3 primeiros.
