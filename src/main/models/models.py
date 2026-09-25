import uuid
from sqlalchemy import Column, String, Date, DateTime, Numeric, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from src.main.server.server import Base  # Correto!  # Importa a Base declarativa do seu server.py

class Setor(Base):
    __tablename__ = "setores"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nome = Column(Text, nullable=False)
    responsavel_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id"), nullable=True)

class Cargos(Base):
    __tablename__ = "cargos"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    cargo = Column(Text, nullable=False)
    setor_id = Column(UUID(as_uuid=True), ForeignKey("setores.id"), nullable=False)
    nivel = Column(Text)  # junior, pleno, senior

class UserDB(Base):
    __tablename__ = "usuarios"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nome = Column(Text, nullable=False)
    email = Column(Text, unique=True, nullable=False)
    senha = Column(Text, nullable=False)
    tipo_perfil = Column(Text)  # colaborador, gestor, rh
    cargo_id = Column(UUID(as_uuid=True), ForeignKey("cargos.id"), nullable=True)
    setor_id = Column(UUID(as_uuid=True), ForeignKey("setores.id"), nullable=True)
    gestor_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id"), nullable=True)
    data_admissao = Column(Date)
    criado_em = Column(DateTime)

class Meta(Base):
    __tablename__ = "metas"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    usuario_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id"), nullable=False)
    titulo = Column(Text, nullable=False)
    descricao = Column(Text)
    prazo = Column(Date)
    status = Column(Text)  # em_andamento, concluida, atrasada

class Ferias(Base):
    __tablename__ = "ferias"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    usuario_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id"), nullable=False)
    data_inicio = Column(Date)
    data_fim = Column(Date)
    status = Column(Text)  # solicitado, aprovado, negado
    aprovador_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id"), nullable=True)