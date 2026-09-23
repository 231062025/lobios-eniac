-- ========================================================
-- Banco 1 — Núcleo de RH (Supabase / PostgreSQL)
-- Plataforma de Gestão de Carreira — Lobios
-- ========================================================

-- Ativa a geração automática de UUIDs
create extension if not exists "pgcrypto";

-- SETORES
create table setores (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  responsavel_id uuid  -- FK para usuarios, criada mais abaixo (referência circular)
);

-- CARGOS
create table cargos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  setor_id uuid references setores(id),
  nivel text
);

-- USUARIOS
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

-- Agora que USUARIOS existe, cria a FK pendente em SETORES
alter table setores
  add constraint fk_setor_responsavel foreign key (responsavel_id) references usuarios(id);

-- METAS
create table metas (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references usuarios(id),
  titulo text not null,
  descricao text,
  prazo date,
  status text default 'em_andamento'
);

-- AVALIACOES DE DESEMPENHO
create table avaliacoes (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references usuarios(id),
  avaliador_id uuid not null references usuarios(id),
  metodo text,        -- ex: 'horas', 'chamados', 'projetos'
  periodo text,        -- ex: '2026-T1'
  pontuacao numeric,
  comentarios text,
  criado_em timestamp default now()
);

-- FEEDBACKS
create table feedbacks (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references usuarios(id),
  autor_id uuid not null references usuarios(id),
  tipo text,           -- ex: 'elogio', 'melhoria'
  texto text,
  data timestamp default now()
);

-- PLANO DE CARREIRA
create table plano_carreira (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references usuarios(id),
  cargo_objetivo_id uuid references cargos(id),
  previsao date,
  requisitos text
);

-- FÉRIAS
create table ferias (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references usuarios(id),
  data_inicio date not null,
  data_fim date not null,
  status text default 'solicitado',  -- solicitado, aprovado, negado
  aprovador_id uuid references usuarios(id),
  criado_em timestamp default now()
);
