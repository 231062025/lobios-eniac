-- ========================================================
-- Melhorias no Banco 1 (Supabase) — Plataforma de Gestão de Carreira
-- Rode tudo de uma vez no SQL Editor. Script seguro para rodar
-- mais de uma vez (usa "drop if exists" / "if not exists" onde dá).
-- ========================================================

-- ========================================================
-- 1. POLÍTICAS DE RLS QUE FALTAVAM
-- ========================================================

-- CARGOS e SETORES — faltava a permissão de escrita para o RH
drop policy if exists "cargos_insert_rh" on cargos;
create policy "cargos_insert_rh" on cargos
  for insert with check (is_rh());

drop policy if exists "cargos_update_rh" on cargos;
create policy "cargos_update_rh" on cargos
  for update using (is_rh());

drop policy if exists "setores_insert_rh" on setores;
create policy "setores_insert_rh" on setores
  for insert with check (is_rh());

drop policy if exists "setores_update_rh" on setores;
create policy "setores_update_rh" on setores
  for update using (is_rh());

-- USUARIOS — faltava o RH poder editar QUALQUER usuário
-- (hoje só existe "usuarios_update_own", que só libera o próprio)
drop policy if exists "usuarios_update_rh" on usuarios;
create policy "usuarios_update_rh" on usuarios
  for update using (is_rh());

-- METAS — faltava RH e gestor poderem corrigir/atualizar metas de outros
drop policy if exists "metas_update_rh" on metas;
create policy "metas_update_rh" on metas
  for update using (is_rh());

drop policy if exists "metas_update_gestor" on metas;
create policy "metas_update_gestor" on metas
  for update using (
    exists (select 1 from usuarios u where u.id = metas.usuario_id and u.gestor_id = auth.uid())
  );

-- AVALIACOES — faltava permissão de update (ex: corrigir uma nota lançada)
drop policy if exists "avaliacoes_update_avaliador" on avaliacoes;
create policy "avaliacoes_update_avaliador" on avaliacoes
  for update using (avaliador_id = auth.uid() or is_rh());

-- FEEDBACKS e PLANO_CARREIRA — faltava insert explícito além do select
drop policy if exists "plano_carreira_insert_own" on plano_carreira;
create policy "plano_carreira_insert_own" on plano_carreira
  for insert with check (usuario_id = auth.uid() or is_rh());

drop policy if exists "plano_carreira_update_rh" on plano_carreira;
create policy "plano_carreira_update_rh" on plano_carreira
  for update using (is_rh());


-- ========================================================
-- 2. NOVA TABELA: criterios_avaliacao
-- (critérios de avaliação configuráveis por cargo, como pede o desafio)
-- ========================================================
create table if not exists criterios_avaliacao (
  id uuid primary key default gen_random_uuid(),
  cargo_id uuid references cargos(id),
  metodo text not null,       -- ex: 'horas', 'chamados', 'projetos'
  peso numeric default 1,
  descricao text,
  criado_em timestamp default now()
);

alter table criterios_avaliacao enable row level security;

drop policy if exists "criterios_select_todos" on criterios_avaliacao;
create policy "criterios_select_todos" on criterios_avaliacao
  for select using (auth.role() = 'authenticated');

drop policy if exists "criterios_insert_rh" on criterios_avaliacao;
create policy "criterios_insert_rh" on criterios_avaliacao
  for insert with check (is_rh());

drop policy if exists "criterios_update_rh" on criterios_avaliacao;
create policy "criterios_update_rh" on criterios_avaliacao
  for update using (is_rh());


-- ========================================================
-- 3. ÍNDICES NAS CHAVES ESTRANGEIRAS
-- (o Postgres não indexa FK automaticamente)
-- ========================================================
create index if not exists idx_usuarios_gestor_id on usuarios(gestor_id);
create index if not exists idx_usuarios_cargo_id on usuarios(cargo_id);
create index if not exists idx_usuarios_setor_id on usuarios(setor_id);

create index if not exists idx_metas_usuario_id on metas(usuario_id);

create index if not exists idx_avaliacoes_usuario_id on avaliacoes(usuario_id);
create index if not exists idx_avaliacoes_avaliador_id on avaliacoes(avaliador_id);

create index if not exists idx_feedbacks_usuario_id on feedbacks(usuario_id);
create index if not exists idx_feedbacks_autor_id on feedbacks(autor_id);

create index if not exists idx_plano_carreira_usuario_id on plano_carreira(usuario_id);

create index if not exists idx_ferias_usuario_id on ferias(usuario_id);
create index if not exists idx_ferias_aprovador_id on ferias(aprovador_id);

create index if not exists idx_criterios_cargo_id on criterios_avaliacao(cargo_id);


-- ========================================================
-- 4. tipo_perfil: de "text + check" para ENUM nativo
-- (mesmo comportamento, mais rígido e autodocumentado)
-- ========================================================
do $$
begin
  create type tipo_perfil_enum as enum ('colaborador', 'gestor', 'rh');
exception when duplicate_object then null;
end $$;

-- Remove a constraint de check antiga (acha o nome dela dinamicamente,
-- caso não seja exatamente "usuarios_tipo_perfil_check")
do $$
declare
  nome_constraint text;
begin
  select con.conname into nome_constraint
  from pg_constraint con
  join pg_class rel on rel.oid = con.conrelid
  where rel.relname = 'usuarios'
    and con.contype = 'c'
    and pg_get_constraintdef(con.oid) like '%tipo_perfil%';

  if nome_constraint is not null then
    execute format('alter table usuarios drop constraint %I', nome_constraint);
  end if;
end $$;

alter table usuarios
  alter column tipo_perfil type tipo_perfil_enum using tipo_perfil::tipo_perfil_enum;


-- ========================================================
-- 5. Impede que alguém seja o próprio gestor
-- ========================================================
alter table usuarios drop constraint if exists chk_usuarios_nao_e_proprio_gestor;
alter table usuarios
  add constraint chk_usuarios_nao_e_proprio_gestor
  check (gestor_id is null or gestor_id <> id);
