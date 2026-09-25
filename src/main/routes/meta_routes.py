from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict
from sqlalchemy.orm import Session
from uuid import UUID
from datetime import date

from src.main.validators.meta_validator import MetaValidator, MetaUpdateValidator
from src.main.server import server
from src.main.models.models import Meta

metas_routes = APIRouter(tags=["Meta"])

class MetaResponse(BaseModel):
    id: UUID
    usuario_id: UUID
    titulo: str
    descricao: str | None = None
    prazo: date | None = None
    status: str | None = None
    model_config = ConfigDict(from_attributes=True)

@metas_routes.post("/metas", status_code=status.HTTP_201_CREATED, response_model=MetaResponse)
def create_meta(body: MetaValidator, db: Session = Depends(server.get_db)):
    nova = Meta(**body.model_dump())
    db.add(nova)
    db.commit()
    db.refresh(nova)
    return nova

@metas_routes.get("/metas/", response_model=List[MetaResponse])
def read_metas(usuario_id: Optional[UUID] = None, skip: int = 0, limit: int = 50, db: Session = Depends(server.get_db)):
    query = db.query(Meta)
    if usuario_id:
        query = query.filter(Meta.usuario_id == usuario_id)
    return query.offset(skip).limit(limit).all()

@metas_routes.get("/metas/{meta_id}", response_model=MetaResponse)
def read_meta(meta_id: str, db: Session = Depends(server.get_db)):
    meta = db.query(Meta).filter(Meta.id == meta_id).first()
    if meta is None:
        raise HTTPException(status_code=404, detail="Meta não encontrada.")
    return meta

@metas_routes.put("/metas/{meta_id}", response_model=MetaResponse)
def update_meta(meta_id: str, body: MetaUpdateValidator, db: Session = Depends(server.get_db)):
    meta = db.query(Meta).filter(Meta.id == meta_id).first()
    if meta is None:
        raise HTTPException(status_code=404, detail="Meta não encontrada.")
    for campo, valor in body.model_dump(exclude_unset=True).items():
        setattr(meta, campo, valor)
    db.commit()
    db.refresh(meta)
    return meta

@metas_routes.delete("/metas/{meta_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_meta(meta_id: str, db: Session = Depends(server.get_db)):
    meta = db.query(Meta).filter(Meta.id == meta_id).first()
    if meta is None:
        raise HTTPException(status_code=404, detail="Meta não encontrada.")
    db.delete(meta)
    db.commit()
    return None
