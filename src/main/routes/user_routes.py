from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session


from src.main.validators.user_register_validator import UserRegisterValidator,UserResponse,UserUpdateValidator
from src.main.server import server
from src.main.models.models import UserDB

users_routes = APIRouter(tags=["Usuario"])

# [C]REATE - Criar e salvar novo usuário
@users_routes.post("/users", status_code=status.HTTP_201_CREATED, response_model=UserResponse)
def create_user(body: UserRegisterValidator, db: Session = Depends(server.get_db)):
    # 1. Verifica se o e-mail já existe no banco
    existing_user = db.query(UserDB).filter(UserDB.email == body.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="E-mail já cadastrado.")
    
    # 2. Cria a instância do modelo do banco usando os dados validados pelo Pydantic
    new_user = UserDB(**body.model_dump())
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
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
def update_user(user_id: str, user_atualizado: UserUpdateValidator, db: Session = Depends(server.get_db)):
    user_db = db.query(UserDB).filter(UserDB.id == user_id).first()
    if user_db is None:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")
    if user_atualizado.nome is not None:
        user_db.nome = user_atualizado.nome
        
    if user_atualizado.email is not None:
        user_db.email = user_atualizado.email
        
    if user_atualizado.username is not None:
        user_db.username = user_atualizado.username
        
    if user_atualizado.cargo is not None:
        user_db.cargo = user_atualizado.cargo
        
    if user_atualizado.tipo_perfil is not None:
        user_db.tipo_perfil = user_atualizado.tipo_perfil
        
    if user_atualizado.cargo_id is not None:
        user_db.cargo_id = user_atualizado.cargo_id
        
    if user_atualizado.setor_id is not None:
        user_db.setor_id = user_atualizado.setor_id
        
    if user_atualizado.gestor_id is not None:
        user_db.gestor_id = user_atualizado.gestor_id
    
    try:
        db.commit()
        db.refresh(user_db)
    except Exception as e:
        db.rollback() # Desfaz a operação em caso de erro no banco
        raise HTTPException(status_code=500, detail=f"Erro ao guardar: {str(e)}")

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