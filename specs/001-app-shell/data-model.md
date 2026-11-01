# Data Model: App Shell

Sem dados de domínio (filmes entram nas próximas features). Entidades do shell:

| Entidade | Campos | Regras |
|----------|--------|--------|
| `NavItem` | `to: string` (caminho), `label: string` | Lista fixa e ordenada: `Dashboard` (`/dashboard`), `List` (`/list`); fonte única em `src/app/navigation.ts` |
| `ApiConfig` | `baseUrl: string` | Vem de `VITE_API_BASE_URL` ou do padrão; sem barra final |
| `ApiError` (classe) | `kind: 'http' \| 'network' \| 'parse'`, `status?: number`, `message`, `cause?` | `status` só existe em `kind: 'http'`; `parse` = corpo 2xx que não é JSON |
| `QueryParams` | `Record<string, string \| number \| boolean \| undefined>` | `undefined` é omitido da URL |

Transições de estado: não há (rota atual é derivada da URL, Art. IX).
