from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict
from sqlalchemy.orm import Session
from uuid import UUID

from src.main.validators.setor_validator import SetorValidator, SetorUpdateValidator
from src.main.server import server
from src.main.models.models import Setor

setores_routes = APIRouter(tags=["Setor"])

class SetorResponse(BaseModel):
    id: UUID
    nome: str
    responsavel_id: UUID | None = None
    model_config = ConfigDict(from_attributes=True)

@setores_routes.post("/setores", status_code=status.HTTP_201_CREATED, response_model=SetorResponse)
def create_setor(body: SetorValidator, db: Session = Depends(server.get_db)):
    novo = Setor(**body.model_dump())
    db.add(novo)
    db.commit()
    db.refresh(novo)
    return novo

@setores_routes.get("/setores/", response_model=List[SetorResponse])
def read_setores(skip: int = 0, limit: int = 50, db: Session = Depends(server.get_db)):
    return db.query(Setor).offset(skip).limit(limit).all()

@setores_routes.get("/setores/{setor_id}", response_model=SetorResponse)
def read_setor(setor_id: str, db: Session = Depends(server.get_db)):
    setor = db.query(Setor).filter(Setor.id == setor_id).first()
    if setor is None:
        raise HTTPException(status_code=404, detail="Setor não encontrado.")
    return setor

@setores_routes.put("/setores/{setor_id}", response_model=SetorResponse)
def update_setor(setor_id: str, body: SetorUpdateValidator, db: Session = Depends(server.get_db)):
    setor = db.query(Setor).filter(Setor.id == setor_id).first()
    if setor is None:
        raise HTTPException(status_code=404, detail="Setor não encontrado.")
    for campo, valor in body.model_dump(exclude_unset=True).items():
        setattr(setor, campo, valor)
    db.commit()
    db.refresh(setor)
    return setor

@setores_routes.delete("/setores/{setor_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_setor(setor_id: str, db: Session = Depends(server.get_db)):
    setor = db.query(Setor).filter(Setor.id == setor_id).first()
    if setor is None:
        raise HTTPException(status_code=404, detail="Setor não encontrado.")
    db.delete(setor)
    db.commit()
    return None
