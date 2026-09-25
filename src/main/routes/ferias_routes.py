from typing import List, Optional, Literal
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict
from sqlalchemy.orm import Session
from uuid import UUID
from datetime import date

from src.main.validators.ferias_validator import FeriasValidator, FeriasUpdateValidator
from src.main.server import server
from src.main.models.models import Ferias

ferias_routes = APIRouter(tags=["Ferias"])

class FeriasResponse(BaseModel):
    id: UUID
    usuario_id: UUID
    data_inicio: date
    data_fim: date
    status: str | None = None
    aprovador_id: UUID | None = None
    model_config = ConfigDict(from_attributes=True)

@ferias_routes.post("/ferias", status_code=status.HTTP_201_CREATED, response_model=FeriasResponse)
def create_ferias(body: FeriasValidator, db: Session = Depends(server.get_db)):
    novo = Ferias(**body.model_dump())
    db.add(novo)
    db.commit()
    db.refresh(novo)
    return novo

@ferias_routes.get("/ferias/", response_model=List[FeriasResponse])
def read_ferias(usuario_id: Optional[UUID] = None, skip: int = 0, limit: int = 50, db: Session = Depends(server.get_db)):
    query = db.query(Ferias)
    if usuario_id:
        query = query.filter(Ferias.usuario_id == usuario_id)
    return query.offset(skip).limit(limit).all()

@ferias_routes.get("/ferias/{ferias_id}", response_model=FeriasResponse)
def read_ferias_by_id(ferias_id: str, db: Session = Depends(server.get_db)):
    item = db.query(Ferias).filter(Ferias.id == ferias_id).first()
    if item is None:
        raise HTTPException(status_code=404, detail="Solicitação de férias não encontrada.")
    return item

# Atualização geral (qualquer campo)
@ferias_routes.put("/ferias/{ferias_id}", response_model=FeriasResponse)
def update_ferias(ferias_id: str, body: FeriasUpdateValidator, db: Session = Depends(server.get_db)):
    item = db.query(Ferias).filter(Ferias.id == ferias_id).first()
    if item is None:
        raise HTTPException(status_code=404, detail="Solicitação de férias não encontrada.")
    for campo, valor in body.model_dump(exclude_unset=True).items():
        setattr(item, campo, valor)
    db.commit()
    db.refresh(item)
    return item

# Atalho específico para aprovar/negar (mais direto de usar no Front)
@ferias_routes.put("/ferias/{ferias_id}/aprovar", response_model=FeriasResponse)
def aprovar_ferias(ferias_id: str, status_novo: Literal["aprovado", "negado"], aprovador_id: UUID, db: Session = Depends(server.get_db)):
    item = db.query(Ferias).filter(Ferias.id == ferias_id).first()
    if item is None:
        raise HTTPException(status_code=404, detail="Solicitação de férias não encontrada.")
    item.status = status_novo
    item.aprovador_id = aprovador_id
    db.commit()
    db.refresh(item)
    return item

@ferias_routes.delete("/ferias/{ferias_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_ferias(ferias_id: str, db: Session = Depends(server.get_db)):
    item = db.query(Ferias).filter(Ferias.id == ferias_id).first()
    if item is None:
        raise HTTPException(status_code=404, detail="Solicitação de férias não encontrada.")
    db.delete(item)
    db.commit()
    return None
