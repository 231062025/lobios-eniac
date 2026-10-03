# Lobios — front em Angular integrado à API

Angular 20 (componentes standalone, signals, `@if`/`@for`) consumindo a API FastAPI
em `https://lobios-api.onrender.com` (Swagger em `/docs`).

## Rodar

```bash
npm install
npm start          # http://localhost:4200
```

## Login

Edite `src/environments/environment.ts`:

- **`supabaseAnonKey` preenchida** → login real pelo Supabase Auth (e-mail + senha).
  O perfil (`tipo_perfil`) é lido da tabela `usuarios`.
- **`supabaseAnonKey` vazia** → **modo demonstração**: entra com o e-mail de um usuário
  que já existe na API e escolhe o perfil na tela. A senha não é conferida.

A anon key é pública por definição (quem protege os dados é a RLS). Nunca coloque a
`service_role` key no front.

## Senha e primeiro acesso

1. O RH cadastra a pessoa em **Colaboradores** com uma senha provisória (`POST /users`).
2. No primeiro login, o front vê que o usuário ainda não tem `senha_definida: true` nos metadados
   do Supabase Auth e manda para `/primeiro-acesso`. Nenhuma outra tela abre antes disso.
3. A pessoa digita a senha provisória e cria a dela. O front confere a senha atual
   (`signInWithPassword`) e grava a nova com `supabase.auth.updateUser`, marcando `senha_definida`.
4. Depois disso, a senha pode ser trocada a qualquer momento em **Meus dados**.

A senha nunca passa pela API nem fica na tabela `usuarios`: ela é do Supabase Auth.
Usuários que já existiam também passam pelo primeiro acesso uma vez.

## Telas e endpoints

| Perfil | Tela | Rota | Endpoints usados |
|---|---|---|---|
| Colaborador | Painel | `/funcionario` | GET metas, férias, feedbacks, plano-carreira |
| | Minhas metas | `/funcionario/metas` | GET /metas/?usuario_id, PUT /metas/{id} |
| | Férias | `/funcionario/ferias` | GET/POST/DELETE /ferias |
| | Avaliações e feedbacks | `/funcionario/desempenho` | GET /avaliacoes/, GET /feedbacks/ |
| | Plano de carreira | `/funcionario/carreira` | GET /plano-carreira/, GET /criterios-avaliacao/ |
| | Treinamentos | `/funcionario/treinamentos` | GET /avaliacoes/ + Firestore 🔥 |
| | Registro de ponto | `/funcionario/ponto` | Firestore 🔥 |
| Gestor | Equipe e desempenho | `/gestor` | GET avaliações, metas, férias |
| | Aprovações de férias | `/gestor/aprovacoes` | PUT /ferias/{id}/aprovar |
| | Avaliações | `/gestor/avaliacoes` | CRUD /avaliacoes |
| | Feedbacks | `/gestor/feedbacks` | GET/POST/DELETE /feedbacks |
| | Metas da equipe | `/gestor/metas` | CRUD /metas |
| | Organograma | `/gestor/organograma` | GET setores, cargos, users |
| RH | Setores e cargos | `/rh` | CRUD /setores e /cargos |
| | Colaboradores | `/rh/colaboradores` | POST /users + PUT /users/{id}, DELETE |
| | Critérios de avaliação | `/rh/criterios` | CRUD /criterios-avaliacao |
| | Planos de carreira | `/rh/carreiras` | CRUD /plano-carreira |
| | Férias da empresa | `/rh/ferias` | GET /ferias/, PUT aprovar |
| | Matriz de treinamentos | `/rh/treinamentos` | Firestore 🔥 |
| Todos | Meus dados | `/<perfil>/meus-dados` | PUT /users/{id} |

🔥 = Firestore (projeto `lobios-eniac`). No modo demonstração (sem anon key) esses dados
ficam no `localStorage`, para a apresentação funcionar mesmo sem login real.

## Firebase

Coleções usadas (ver `src/app/core/dados/`):

| Coleção | Campos |
|---|---|
| `treinamentos` | titulo, carga_horaria, categoria, cargo_relacionado_id, video_url |
| `progresso_treinamentos` | usuario_id, treinamento_id, progresso (0–100), status, data_conclusao |
| `matriz_treinamentos` | metodo, nota_minima, treinamento_ids[] |
| `ponto` | usuario_id, tipo, data_hora, observacao, documento_id, documento_nome |
| `documentos` | usuario_id, nome_arquivo, tipo_arquivo, tamanho_bytes, origem, criado_em, arquivo_url |

Fluxo de login: Supabase → `POST /auth/firebase-token` (API) → `signInWithCustomToken`.
O UID no Firebase é o mesmo UUID do Supabase, e o perfil vai no token (`request.auth.token.perfil`).

As regras de segurança estão em `firestore.rules`: copie para Firestore Database > Regras > Publicar.

O SDK do Firebase é carregado só depois do login (import dinâmico), para não pesar na primeira abertura.
Os arquivos anexados no ponto ainda não são enviados (o Firebase Storage exige o plano Blaze):
fica registrado só o nome, o tipo e o tamanho, com `arquivo_url = null`.

## Estrutura

```
src/app/
├── app.routes.ts              rotas, menus e guards
├── core/
│   ├── api/
│   │   ├── api.models.ts      tipos gerados do openapi.json
│   │   ├── crud-api.ts        base GET/POST/PUT/DELETE (envia só campos preenchidos)
│   │   ├── services.ts        UsuariosApi, SetoresApi, CargosApi, MetasApi, FeriasApi...
│   │   └── erro-api.ts        transforma 422 em mensagem legível
│   ├── auth.service.ts        Supabase Auth ou modo demonstração
│   ├── auth.interceptor.ts    envia o token do Supabase para a API
│   ├── cadastros.service.ts   cache de usuários/setores/cargos (UUID -> nome)
│   ├── notificacao.service.ts avisos de sucesso/erro
│   ├── firebase.ts            ponte Supabase → Firebase (carregado sob demanda)
│   └── dados/                 ponto e treinamentos (Firestore ou navegador)
├── layout/                    menu lateral + router-outlet
├── shared/                    carregando, notificações, status, pipe dataBr
└── pages/                     login, funcionario/*, gestor/*, rh/*, meus-dados
```

## Pendências na API (para o back-end)

1. **`GET /users` devolver `tipo_perfil`, `cargo_id`, `setor_id`, `gestor_id`, `data_admissao`.**
   Hoje o `UserResponse` só tem `id`, `nome`, `email`. Sem isso a lista do RH mostra "—"
   e a equipe do gestor mostra todos os usuários. O front já filtra quando os campos vierem.
2. **CORS**: liberar o domínio da Vercel (e `http://localhost:4200`) no `CORSMiddleware`.
4. Confirmar que o `POST /users` cria o usuário também no **Supabase Auth** (com `auth.admin.create_user`), senão a pessoa não consegue logar.
5. (Futuro) validar o token do Supabase no header `Authorization` — o front já envia.

## Deploy na Vercel

O `vercel.json` aponta para `dist/lobios-angular/browser` e redireciona todas as rotas
para `index.html` (sem isso, F5 em `/gestor` dá 404).
