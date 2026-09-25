from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict
from sqlalchemy.orm import Session
from uuid import UUID

from src.main.validators.cargo_validator import CargoValidator, CargoUpdateValidator
from src.main.server import server
from src.main.models.models import Cargo

cargos_routes = APIRouter(tags=["Cargo"])

class CargoResponse(BaseModel):
    id: UUID
    nome: str
    setor_id: UUID | None = None
    nivel: str | None = None

    model_config = ConfigDict(from_attributes=True)

# [C]REATE - Criar um novo cargo
@cargos_routes.post("/cargos", status_code=status.HTTP_201_CREATED, response_model=CargoResponse)
def create_cargo(body: CargoValidator, db: Session = Depends(server.get_db)):
    novo_cargo = Cargo(**body.model_dump())
    db.add(novo_cargo)
    db.commit()
    db.refresh(novo_cargo)
    return novo_cargo

# [R]EAD - Listar todos os cargos
@cargos_routes.get("/cargos/", response_model=List[CargoResponse])
def read_cargos(skip: int = 0, limit: int = 50, db: Session = Depends(server.get_db)):
    cargos = db.query(Cargo).offset(skip).limit(limit).all()
    return cargos

# [R]EAD - Buscar um cargo específico por ID
@cargos_routes.get("/cargos/{cargo_id}", response_model=CargoResponse)
def read_cargo(cargo_id: str, db: Session = Depends(server.get_db)):
    cargo = db.query(Cargo).filter(Cargo.id == cargo_id).first()
    if cargo is None:
        raise HTTPException(status_code=404, detail="Cargo não encontrado.")
    return cargo

# [U]PDATE - Atualizar um cargo (só muda os campos enviados)
@cargos_routes.put("/cargos/{cargo_id}", response_model=CargoResponse)
def update_cargo(cargo_id: str, cargo_atualizado: CargoUpdateValidator, db: Session = Depends(server.get_db)):
    cargo_db = db.query(Cargo).filter(Cargo.id == cargo_id).first()
    if cargo_db is None:
        raise HTTPException(status_code=404, detail="Cargo não encontrado.")

    dados = cargo_atualizado.model_dump(exclude_unset=True)  # só os campos que vieram no corpo
    for campo, valor in dados.items():
        setattr(cargo_db, campo, valor)

    db.commit()
    db.refresh(cargo_db)
    return cargo_db

# [D]ELETE - Deletar um cargo
@cargos_routes.delete("/cargos/{cargo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_cargo(cargo_id: str, db: Session = Depends(server.get_db)):
    cargo_db = db.query(Cargo).filter(Cargo.id == cargo_id).first()
    if cargo_db is None:
        raise HTTPException(status_code=404, detail="Cargo não encontrado.")
    db.delete(cargo_db)
    db.commit()
    return None
