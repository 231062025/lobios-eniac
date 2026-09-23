-- ========================================================
-- Seed — Setores e Cargos de teste
-- Plataforma de Gestão de Carreira — Lobios
-- ========================================================
-- Rode isso ANTES de criar os usuários de teste no Authentication,
-- já que cargos e setores não dependem do Auth.

insert into setores (nome) values
  ('Recursos Humanos'),
  ('Tecnologia'),
  ('Administrativo');

insert into cargos (nome, setor_id, nivel) values
  ('Analista de RH',   (select id from setores where nome = 'Recursos Humanos'), 'pleno'),
  ('Gerente ADM',      (select id from setores where nome = 'Administrativo'),   'senior'),
  ('Desenvolvedor',    (select id from setores where nome = 'Tecnologia'),       'junior');

-- ========================================================
-- Depois de criar os usuários de teste pelo painel de
-- Authentication (passo 2), volte aqui e rode os UPDATEs
-- abaixo, trocando os e-mails pelos que você usou:
-- ========================================================

-- update usuarios
--   set cargo_id = (select id from cargos where nome = 'Analista de RH'),
--       setor_id = (select id from setores where nome = 'Recursos Humanos')
--   where email = 'ana.rh@teste.com';

-- update usuarios
--   set cargo_id = (select id from cargos where nome = 'Gerente ADM'),
--       setor_id = (select id from setores where nome = 'Administrativo')
--   where email = 'gestor@teste.com';

-- update usuarios
--   set cargo_id = (select id from cargos where nome = 'Desenvolvedor'),
--       setor_id = (select id from setores where nome = 'Tecnologia'),
--       gestor_id = (select id from usuarios where email = 'gestor@teste.com')
--   where email = 'colaborador@teste.com';
