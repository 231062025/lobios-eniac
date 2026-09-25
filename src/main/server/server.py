from fastapi import FastAPI
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from fastapi.middleware.cors import CORSMiddleware

# 1. Inicializa o FastAPI
app = FastAPI(title="API RH - Empresa", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# ==========================================
# CONFIGURAÇÃO DO BANCO DE DADOS (Supabase / PostgreSQL)
# ==========================================
SQLALCHEMY_DATABASE_URL= "postgresql://postgres.ocdyqvuufmgkcnbtopbn:lobios2026eniac@aws-0-us-east-1.pooler.supabase.com:6543/postgres"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base declarativa para os Models que você vai criar em outro arquivo
Base = declarative_base()

# Função de dependência para injetar a sessão nas rotas e garantir o fechamento
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

from src.main.routes.user_routes import users_routes

app.include_router(users_routes)
from src.main.routes.cargo_routes import cargos_routes
app.include_router(cargos_routes)
