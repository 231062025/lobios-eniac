from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict
from sqlalchemy.orm import Session
from uuid import UUID

from src.main.validators.avaliacao_validator import AvaliacaoValidator, AvaliacaoUpdateValidator
from src.main.server import server
from src.main.models.models import Avaliacao

avaliacoes_routes = APIRouter(tags=["Avaliacao"])

class AvaliacaoResponse(BaseModel):
    id: UUID
    usuario_id: UUID
    avaliador_id: UUID
    metodo: str | None = None
    periodo: str | None = None
    pontuacao: float | None = None
    comentarios: str | None = None
    model_config = ConfigDict(from_attributes=True)

@avaliacoes_routes.post("/avaliacoes", status_code=status.HTTP_201_CREATED, response_model=AvaliacaoResponse)
def create_avaliacao(body: AvaliacaoValidator, db: Session = Depends(server.get_db)):
    nova = Avaliacao(**body.model_dump())
    db.add(nova)
    db.commit()
    db.refresh(nova)
    return nova

@avaliacoes_routes.get("/avaliacoes/", response_model=List[AvaliacaoResponse])
def read_avaliacoes(usuario_id: Optional[UUID] = None, skip: int = 0, limit: int = 50, db: Session = Depends(server.get_db)):
    query = db.query(Avaliacao)
    if usuario_id:
        query = query.filter(Avaliacao.usuario_id == usuario_id)
    return query.offset(skip).limit(limit).all()

@avaliacoes_routes.get("/avaliacoes/{avaliacao_id}", response_model=AvaliacaoResponse)
def read_avaliacao(avaliacao_id: str, db: Session = Depends(server.get_db)):
    item = db.query(Avaliacao).filter(Avaliacao.id == avaliacao_id).first()
    if item is None:
        raise HTTPException(status_code=404, detail="Avaliação não encontrada.")
    return item

@avaliacoes_routes.put("/avaliacoes/{avaliacao_id}", response_model=AvaliacaoResponse)
def update_avaliacao(avaliacao_id: str, body: AvaliacaoUpdateValidator, db: Session = Depends(server.get_db)):
    item = db.query(Avaliacao).filter(Avaliacao.id == avaliacao_id).first()
    if item is None:
        raise HTTPException(status_code=404, detail="Avaliação não encontrada.")
    for campo, valor in body.model_dump(exclude_unset=True).items():
        setattr(item, campo, valor)
    db.commit()
    db.refresh(item)
    return item

@avaliacoes_routes.delete("/avaliacoes/{avaliacao_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_avaliacao(avaliacao_id: str, db: Session = Depends(server.get_db)):
    item = db.query(Avaliacao).filter(Avaliacao.id == avaliacao_id).first()
    if item is None:
        raise HTTPException(status_code=404, detail="Avaliação não encontrada.")
    db.delete(item)
    db.commit()
    return None
