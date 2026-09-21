from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import ConfigDict
from sqlalchemy.orm import Session
import uuid

from src.main.validators.user_register_validator import UserRegisterValidator
from src.main.server import server
from src.main.models.models import UserDB

users_routes = APIRouter(tags=["Usuario"])

# Pydantic Response Model (Herda do validador e adiciona o id como string/uuid)
class UserResponse(UserRegisterValidator):
    id: str  # O Supabase usa UUID, que tratamos como string no Pydantic/JSON
    model_config = ConfigDict(from_attributes=True)

# [C]REATE - Criar e salvar novo usuário
@users_routes.post("/users", status_code=status.HTTP_201_CREATED, response_model=UserResponse)
def create_user(body: UserRegisterValidator, db: Session = Depends(server.get_db)):
    # 1. Verifica se o e-mail já existe no banco
    existing_user = db.query(UserDB).filter(UserDB.email == body.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="E-mail já cadastrado.")
    
    # 2. Cria a instância do modelo do banco usando os dados validados pelo Pydantic
    new_user = UserDB(**body.model_dump())
    
    # 3. Salva no banco de dados do Supabase
    db.add(new_user)
    db.commit()
    db.refresh(new_user)  # Atualiza a variável com o ID gerado pelo banco
    
    return new_user

# [R]EAD - Listar usuários com paginação
@users_routes.get("/users/", response_model=List[UserResponse])
def read_users(skip: int = 0, limit: int = 10, db: Session = Depends(server.get_db)):
    users = db.query(UserDB).offset(skip).limit(limit).all()
    return users

# [R]EAD - Buscar um usuário específico por ID (Ajustado para str/uuid)
@users_routes.get("/users/{user_id}", response_model=UserResponse)
def read_user(user_id: str, db: Session = Depends(server.get_db)):
    user = db.query(UserDB).filter(UserDB.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")
    return user

# [U]PDATE - Atualizar um usuário
@users_routes.put("/users/{user_id}", response_model=UserResponse)
def update_user(user_id: str, user_atualizado: UserRegisterValidator, db: Session = Depends(server.get_db)):
    user_db = db.query(UserDB).filter(UserDB.id == user_id).first()
    if user_db is None:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")
    
    # Atualiza os campos conforme seu model
    UserDB.email = user_atualizado.email
    
    db.commit()
    db.refresh(UserDB)
    return user_db

# [D]ELETE - Deletar um usuário (Corrigido o status__code para status_code)
@users_routes.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: str, db: Session = Depends(server.get_db)):
    UserDB = db.query(UserDB).filter(UserDB.id == user_id).first()
    if UserDB is None:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")
    
    db.delete(UserDB)
    db.commit()
    return None