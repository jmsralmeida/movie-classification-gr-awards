# Quickstart: validar o App Shell

Pré-requisitos: Node >= 22, `npm ci`.

1. **Config**: copie `.env.example` para `.env` (opcional; sem ele vale a URL padrão).
2. **Automático**: `npm run lint && npm run typecheck && npm test`.
3. **E2E**: `npx playwright install chromium` (uma vez) e `npm run test:e2e` (viewports 1440x900 e 768x1280).
4. **Manual**: `npm run dev`, abrir `http://localhost:5173`:
   - `/` leva a `/dashboard`; clicar em "List" troca o conteúdo e o link atual;
   - voltar do navegador retorna ao Dashboard; `/List` abre a List;
   - `/qualquer-coisa` mostra "Page not found" com o shell e o link "Go to Dashboard";
   - Tab percorre os dois links com foco visível; redimensionar para 768x1280 não gera rolagem horizontal;
   - com `VITE_API_BASE_URL` alterado, o cliente passa a usar o novo endereço (ver `src/shared/api/config.test.ts`).
Contratos: [http-client](./contracts/http-client.md), [routes](./contracts/routes.md).
