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

class Cargo(Base):
    __tablename__ = "cargos"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nome = Column(Text, nullable=False)
    setor_id = Column(UUID(as_uuid=True), ForeignKey("setores.id"), nullable=False)
    nivel = Column(Text)  # junior, pleno, senior

class UserDB(Base):
    __tablename__ = "usuarios"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nome = Column(Text, nullable=False)
    email = Column(Text, unique=True, nullable=False)
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

from sqlalchemy import Column, String, Date, DateTime, Numeric, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
import uuid

class Avaliacao(Base):
    __tablename__ = "avaliacoes"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    usuario_id = Column(UUID(as_uuid=True), nullable=False)
    avaliador_id = Column(UUID(as_uuid=True), nullable=False)
    metodo = Column(Text)
    periodo = Column(Text)
    pontuacao = Column(Numeric)
    comentarios = Column(Text)
    criado_em = Column(DateTime)

class Feedback(Base):
    __tablename__ = "feedbacks"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    usuario_id = Column(UUID(as_uuid=True), nullable=False)
    autor_id = Column(UUID(as_uuid=True), nullable=False)
    tipo = Column(Text)
    texto = Column(Text)
    data = Column(DateTime)

class PlanoCarreira(Base):
    __tablename__ = "plano_carreira"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    usuario_id = Column(UUID(as_uuid=True), nullable=False)
    cargo_objetivo_id = Column(UUID(as_uuid=True), nullable=True)
    previsao = Column(Date)
    requisitos = Column(Text)

class CriteriosAvaliacao(Base):
    __tablename__ = "criterios_avaliacao"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    cargo_id = Column(UUID(as_uuid=True), nullable=True)
    metodo = Column(Text, nullable=False)
    peso = Column(Numeric, default=1)
    descricao = Column(Text)
    criado_em = Column(DateTime)
