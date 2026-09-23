create extension if not exists "pgcrypto";

create table setores (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  responsavel_id uuid 
);

create table cargos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  setor_id uuid references setores(id),
  nivel text
);

create table usuarios (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  email text unique not null,
  tipo_perfil text not null check (tipo_perfil in ('colaborador', 'gestor', 'rh')),
  cargo_id uuid references cargos(id),
  setor_id uuid references setores(id),
  gestor_id uuid references usuarios(id),
  data_admissao date,
  criado_em timestamp default now()
);

alter table setores
  add constraint fk_setor_responsavel foreign key (responsavel_id) references usuarios(id);

create table metas (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references usuarios(id),
  titulo text not null,
  descricao text,
  prazo date,
  status text default 'em_andamento'
);

create table avaliacoes (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references usuarios(id),
  avaliador_id uuid not null references usuarios(id),
  metodo text,        
  periodo text,      
  pontuacao numeric,
  comentarios text,
  criado_em timestamp default now()
);

create table feedbacks (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references usuarios(id),
  autor_id uuid not null references usuarios(id),
  tipo text,           
  texto text,
  data timestamp default now()
);

create table plano_carreira (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references usuarios(id),
  cargo_objetivo_id uuid references cargos(id),
  previsao date,
  requisitos text
);

create table ferias (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references usuarios(id),
  data_inicio date not null,
  data_fim date not null,
  status text default 'solicitado', 
  aprovador_id uuid references usuarios(id),
  criado_em timestamp default now()
);
