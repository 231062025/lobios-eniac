insert into setores (nome) values
  ('Recursos Humanos'),
  ('Tecnologia'),
  ('Administrativo');

insert into cargos (nome, setor_id, nivel) values
  ('Analista de RH',   (select id from setores where nome = 'Recursos Humanos'), 'pleno'),
  ('Gerente ADM',      (select id from setores where nome = 'Administrativo'),   'senior'),
  ('Desenvolvedor',    (select id from setores where nome = 'Tecnologia'),       'junior');
