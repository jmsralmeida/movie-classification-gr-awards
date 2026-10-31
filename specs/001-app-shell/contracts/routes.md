# Contrato: rotas e navegação

| Caminho | Conteúdo | Observação |
|---------|----------|------------|
| `/` | redireciona (replace) para `/dashboard` | |
| `/dashboard` | `DashboardPage`: `<h1>Dashboard</h1>` | link "Dashboard" com `aria-current="page"` |
| `/list` | `ListPage`: `<h1>List</h1>` | link "List" com `aria-current="page"` |
| qualquer outro | `NotFoundPage`: `<h1>Page not found</h1>` + link "Go to Dashboard" | dentro do shell; nenhum link do menu atual |

Regiões do shell: `header` (banner, texto "Outsera Razzies"), `nav` (`aria-label="Main"`), `main`.
Matching sem diferenciar maiúsculas e barra final (padrão do roteador).
