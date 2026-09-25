from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict
from sqlalchemy.orm import Session
from uuid import UUID
from datetime import date

from src.main.validators.plano_carreira_validator import PlanoCarreiraValidator, PlanoCarreiraUpdateValidator
from src.main.server import server
from src.main.models.models import PlanoCarreira

plano_carreira_routes = APIRouter(tags=["PlanoCarreira"])

class PlanoCarreiraResponse(BaseModel):
    id: UUID
    usuario_id: UUID
    cargo_objetivo_id: UUID | None = None
    previsao: date | None = None
    requisitos: str | None = None
    model_config = ConfigDict(from_attributes=True)

@plano_carreira_routes.post("/plano-carreira", status_code=status.HTTP_201_CREATED, response_model=PlanoCarreiraResponse)
def create_plano(body: PlanoCarreiraValidator, db: Session = Depends(server.get_db)):
    novo = PlanoCarreira(**body.model_dump())
    db.add(novo)
    db.commit()
    db.refresh(novo)
    return novo

@plano_carreira_routes.get("/plano-carreira/", response_model=List[PlanoCarreiraResponse])
def read_planos(usuario_id: Optional[UUID] = None, skip: int = 0, limit: int = 50, db: Session = Depends(server.get_db)):
    query = db.query(PlanoCarreira)
    if usuario_id:
        query = query.filter(PlanoCarreira.usuario_id == usuario_id)
    return query.offset(skip).limit(limit).all()

@plano_carreira_routes.get("/plano-carreira/{plano_id}", response_model=PlanoCarreiraResponse)
def read_plano(plano_id: str, db: Session = Depends(server.get_db)):
    item = db.query(PlanoCarreira).filter(PlanoCarreira.id == plano_id).first()
    if item is None:
        raise HTTPException(status_code=404, detail="Plano de carreira não encontrado.")
    return item

@plano_carreira_routes.put("/plano-carreira/{plano_id}", response_model=PlanoCarreiraResponse)
def update_plano(plano_id: str, body: PlanoCarreiraUpdateValidator, db: Session = Depends(server.get_db)):
    item = db.query(PlanoCarreira).filter(PlanoCarreira.id == plano_id).first()
    if item is None:
        raise HTTPException(status_code=404, detail="Plano de carreira não encontrado.")
    for campo, valor in body.model_dump(exclude_unset=True).items():
        setattr(item, campo, valor)
    db.commit()
    db.refresh(item)
    return item

@plano_carreira_routes.delete("/plano-carreira/{plano_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_plano(plano_id: str, db: Session = Depends(server.get_db)):
    item = db.query(PlanoCarreira).filter(PlanoCarreira.id == plano_id).first()
    if item is None:
        raise HTTPException(status_code=404, detail="Plano de carreira não encontrado.")
    db.delete(item)
    db.commit()
    return None
