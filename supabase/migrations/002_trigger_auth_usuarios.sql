-- ========================================================
-- Trigger: sincroniza auth.users (Supabase Auth) com public.usuarios
-- Plataforma de Gestão de Carreira — Lobios
-- ========================================================
-- Rode este script UMA VEZ no SQL Editor do Supabase.
-- Depois disso, toda vez que alguém se cadastrar (signUp),
-- uma linha correspondente é criada automaticamente em usuarios,
-- com o MESMO id do auth.users — o que faz as políticas de RLS
-- (auth.uid() = usuarios.id) funcionarem.

-- 1. Remove o UUID aleatório e passa a exigir que o id
--    de usuarios seja o mesmo do auth.users
alter table usuarios
  alter column id drop default;

alter table usuarios
  add constraint usuarios_id_fkey
  foreign key (id) references auth.users(id) on delete cascade;

-- 2. Torna nome e tipo_perfil opcionais no instante da criação,
--    já que no cadastro inicial nem sempre esses dados estão prontos
--    (o RH pode completar depois via update)
alter table usuarios alter column nome drop not null;
alter table usuarios alter column tipo_perfil drop not null;

-- 3. Função que roda toda vez que um novo usuário se cadastra
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.usuarios (id, nome, email, tipo_perfil)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nome', new.email),
    new.email,
    coalesce(new.raw_user_meta_data->>'tipo_perfil', 'colaborador')
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- 4. Liga a função ao evento de criação de usuário no Auth
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
