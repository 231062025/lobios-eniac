# Banco de Dados — Lobios

Todos os scripts SQL usados no SQL Editor do Supabase até agora, organizados na ordem em que foram aplicados no banco real. Se precisar recriar o banco do zero, rode os arquivos de `migrations/` nessa ordem numérica.

## supabase/migrations/

| Arquivo | O que faz |
|---|---|
| `001_schema_inicial.sql` | Cria as 8 tabelas principais (usuarios, cargos, setores, metas, avaliacoes, feedbacks, plano_carreira, ferias) |
| `002_trigger_auth_usuarios.sql` | Liga a tabela `usuarios` ao Supabase Auth — cria a linha automaticamente quando alguém se cadastra |
| `003_rls_policies.sql` | Ativa Row Level Security e cria as políticas de acesso por perfil (colaborador/gestor/rh) |
| `004_melhorias_indices_criterios.sql` | Políticas de RLS que faltavam, tabela `criterios_avaliacao`, índices de performance, `tipo_perfil` como ENUM, e a constraint que impede alguém ser o próprio gestor |

## supabase/seed.sql

Dados de teste (setores e cargos fictícios) — não é migration, é só pra popular um ambiente novo com algo pra testar.

## firebase/firestore.rules

Regras de segurança do Firestore (Banco 2) — cole isso na aba "Regras" do Firestore Database no console do Firebase.

## Como recriar o banco do zero (se precisar)

1. Rode os arquivos de `supabase/migrations/` em ordem, um de cada vez, no SQL Editor do Supabase.
2. Rode `supabase/seed.sql` se quiser dados de teste.
3. Cole `firebase/firestore.rules` nas regras do Firestore.
