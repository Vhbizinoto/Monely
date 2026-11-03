# Monely — Front-end

SPA em **React + Vite + Tailwind CSS + React Router**, consumindo uma API REST.

## Como rodar

```bash
cd frontend
npm install
npm run dev
```

O `npm run dev` sobe junto:

- **web** → http://localhost:5173 (o app)
- **api** → http://localhost:3001 (API REST fake com json-server, até o backend ficar pronto)

Login de teste: `vitor@fiap.com.br` / `123456`

| Script              | O que faz                                     |
| ------------------- | --------------------------------------------- |
| `npm run dev`       | API fake + front juntos                       |
| `npm run web`       | só o front                                    |
| `npm run api`       | só a API fake                                 |
| `npm run api:reset` | restaura os dados de exemplo e sobe a API     |
| `npm run build`     | build de produção em `dist/`                  |

## Estrutura

```
src/
├── components/
│   ├── layout/      AppLayout, Sidebar, PageHeader, UserMenu
│   ├── ui/          Button, Input/Select, Card, StatCard, ConfirmDialog, ProgressBar...
│   ├── dashboard/   ResumoMes (gráfico de gastos por categoria)
│   └── transacoes/  TransacaoItem
├── contexts/        AuthContext (sessão/login), ToastContext (notificações)
├── hooks/           useFetch, useForm, useEntityForm, useRemocao
├── pages/           uma pasta por entidade (lista + formulário)
├── routes/          PrivateRoute / PublicOnlyRoute
├── services/        api.js (axios) + um service por recurso da API
├── constants/       categorias e tipos de conta
└── utils/           formatação (moeda, datas) e cálculos financeiros
```

## Rotas

| Rota                                   | Página                                  |
| -------------------------------------- | --------------------------------------- |
| `/login`, `/cadastro`                  | Autenticação                            |
| `/`                                    | Dashboard                               |
| `/transacoes`, `/nova`, `/:id/editar`  | CRUD de transações (entradas e saídas)  |
| `/contas`, `/nova`, `/:id/editar`      | CRUD de contas                          |
| `/metas`, `/nova`, `/:id/editar`       | CRUD de metas                           |
| `/orcamentos`, `/novo`, `/:id/editar`  | CRUD de orçamentos por categoria/mês    |
| `/relatorios`                          | Relatórios                              |
| `/configuracoes`                       | Perfil, senha e exclusão de conta       |
| qualquer outra                         | Página 404 personalizada                |

## Contrato da API (o que o backend precisa implementar)

Todas as rotas, exceto `/auth/*`, exigem o header `Authorization: Bearer <token>`.
O backend descobre o usuário pelo token, e cada usuário só acessa os próprios registros.

| Método | Endpoint          | Corpo / resposta                                             |
| ------ | ----------------- | ------------------------------------------------------------ |
| POST   | `/auth/login`     | `{ email, senha }` → `{ token, usuario }`                    |
| POST   | `/auth/register`  | `{ nome, email, senha }` → `{ token, usuario }`              |
| GET    | `/usuarios/me`    | → `usuario`                                                  |
| PUT    | `/usuarios/me`    | `{ nome?, email?, senhaAtual?, novaSenha? }` → `usuario`     |
| DELETE | `/usuarios/me`    | remove o usuário e todos os dados dele                       |
| GET    | `/{recurso}`      | lista os registros do usuário                                |
| GET    | `/{recurso}/{id}` | um registro                                                  |
| POST   | `/{recurso}`      | cria                                                         |
| PUT    | `/{recurso}/{id}` | atualiza                                                     |
| DELETE | `/{recurso}/{id}` | remove                                                       |

Recursos: `transacoes`, `contas`, `metas`, `orcamentos`. Os campos estão em `mock-server/db.seed.json`.
Erros devem responder `{ "message": "..." }`, que o front mostra ao usuário.

Para apontar para o backend real, edite `VITE_API_URL` no arquivo `.env`.
