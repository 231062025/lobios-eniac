from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict
from sqlalchemy.orm import Session
from uuid import UUID

from src.main.validators.criterio_validator import CriterioValidator, CriterioUpdateValidator
from src.main.server import server
from src.main.models.models import CriteriosAvaliacao

criterios_routes = APIRouter(tags=["CriteriosAvaliacao"])

class CriterioResponse(BaseModel):
    id: UUID
    cargo_id: UUID | None = None
    metodo: str
    peso: float | None = None
    descricao: str | None = None
    model_config = ConfigDict(from_attributes=True)

@criterios_routes.post("/criterios-avaliacao", status_code=status.HTTP_201_CREATED, response_model=CriterioResponse)
def create_criterio(body: CriterioValidator, db: Session = Depends(server.get_db)):
    novo = CriteriosAvaliacao(**body.model_dump())
    db.add(novo)
    db.commit()
    db.refresh(novo)
    return novo

@criterios_routes.get("/criterios-avaliacao/", response_model=List[CriterioResponse])
def read_criterios(cargo_id: Optional[UUID] = None, skip: int = 0, limit: int = 50, db: Session = Depends(server.get_db)):
    query = db.query(CriteriosAvaliacao)
    if cargo_id:
        query = query.filter(CriteriosAvaliacao.cargo_id == cargo_id)
    return query.offset(skip).limit(limit).all()

@criterios_routes.get("/criterios-avaliacao/{criterio_id}", response_model=CriterioResponse)
def read_criterio(criterio_id: str, db: Session = Depends(server.get_db)):
    item = db.query(CriteriosAvaliacao).filter(CriteriosAvaliacao.id == criterio_id).first()
    if item is None:
        raise HTTPException(status_code=404, detail="Critério não encontrado.")
    return item

@criterios_routes.put("/criterios-avaliacao/{criterio_id}", response_model=CriterioResponse)
def update_criterio(criterio_id: str, body: CriterioUpdateValidator, db: Session = Depends(server.get_db)):
    item = db.query(CriteriosAvaliacao).filter(CriteriosAvaliacao.id == criterio_id).first()
    if item is None:
        raise HTTPException(status_code=404, detail="Critério não encontrado.")
    for campo, valor in body.model_dump(exclude_unset=True).items():
        setattr(item, campo, valor)
    db.commit()
    db.refresh(item)
    return item

@criterios_routes.delete("/criterios-avaliacao/{criterio_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_criterio(criterio_id: str, db: Session = Depends(server.get_db)):
    item = db.query(CriteriosAvaliacao).filter(CriteriosAvaliacao.id == criterio_id).first()
    if item is None:
        raise HTTPException(status_code=404, detail="Critério não encontrado.")
    db.delete(item)
    db.commit()
    return None
