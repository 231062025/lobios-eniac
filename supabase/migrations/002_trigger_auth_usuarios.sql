alter table usuarios
  alter column id drop default;

alter table usuarios
  add constraint usuarios_id_fkey
  foreign key (id) references auth.users(id) on delete cascade;

alter table usuarios alter column nome drop not null;
alter table usuarios alter column tipo_perfil drop not null;

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
