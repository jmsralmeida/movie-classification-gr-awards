import type { RequestHandler } from 'msw'

// Handlers padrão compartilhados. Cada feature adiciona os seus (fixtures derivadas do OpenAPI)
// ou usa `server.use(...)` dentro do teste.
export const handlers: RequestHandler[] = []
