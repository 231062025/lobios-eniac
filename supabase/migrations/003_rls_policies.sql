alter table usuarios enable row level security;
alter table cargos enable row level security;
alter table setores enable row level security;
alter table metas enable row level security;
alter table avaliacoes enable row level security;
alter table feedbacks enable row level security;
alter table plano_carreira enable row level security;
alter table ferias enable row level security;

create policy "cargos_select_todos" on cargos
  for select using (auth.role() = 'authenticated');

create policy "setores_select_todos" on setores
  for select using (auth.role() = 'authenticated');

create policy "usuarios_select_own" on usuarios
  for select using (auth.uid() = id);

create policy "usuarios_select_rh" on usuarios
  for select using (
    exists (select 1 from usuarios u where u.id = auth.uid() and u.tipo_perfil = 'rh')
  );

create policy "usuarios_select_gestor_equipe" on usuarios
  for select using (gestor_id = auth.uid());

create policy "usuarios_update_own" on usuarios
  for update using (auth.uid() = id);

create or replace function is_rh()
returns boolean as $$
  select exists (
    select 1 from usuarios u where u.id = auth.uid() and u.tipo_perfil = 'rh'
  );
$$ language sql stable security definer;

create policy "metas_select_own" on metas
  for select using (usuario_id = auth.uid());
create policy "metas_select_rh" on metas
  for select using (is_rh());
create policy "metas_select_gestor" on metas
  for select using (
    exists (select 1 from usuarios u where u.id = metas.usuario_id and u.gestor_id = auth.uid())
  );
create policy "metas_insert_own" on metas
  for insert with check (usuario_id = auth.uid());
create policy "metas_update_own" on metas
  for update using (usuario_id = auth.uid());

create policy "avaliacoes_select_own" on avaliacoes
  for select using (usuario_id = auth.uid() or avaliador_id = auth.uid());
create policy "avaliacoes_select_rh" on avaliacoes
  for select using (is_rh());
create policy "avaliacoes_insert_avaliador" on avaliacoes
  for insert with check (avaliador_id = auth.uid());

create policy "feedbacks_select_own" on feedbacks
  for select using (usuario_id = auth.uid() or autor_id = auth.uid());
create policy "feedbacks_select_rh" on feedbacks
  for select using (is_rh());
create policy "feedbacks_insert_autor" on feedbacks
  for insert with check (autor_id = auth.uid());

create policy "plano_carreira_select_own" on plano_carreira
  for select using (usuario_id = auth.uid());
create policy "plano_carreira_select_rh" on plano_carreira
  for select using (is_rh());
create policy "plano_carreira_select_gestor" on plano_carreira
  for select using (
    exists (select 1 from usuarios u where u.id = plano_carreira.usuario_id and u.gestor_id = auth.uid())
  );

create policy "ferias_select_own" on ferias
  for select using (usuario_id = auth.uid());
create policy "ferias_select_rh" on ferias
  for select using (is_rh());
create policy "ferias_select_gestor" on ferias
  for select using (
    exists (select 1 from usuarios u where u.id = ferias.usuario_id and u.gestor_id = auth.uid())
  );
create policy "ferias_insert_own" on ferias
  for insert with check (usuario_id = auth.uid());
create policy "ferias_update_aprovador" on ferias
  for update using (aprovador_id = auth.uid() or is_rh());
