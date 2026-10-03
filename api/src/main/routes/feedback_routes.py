from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict
from sqlalchemy.orm import Session
from uuid import UUID

from src.main.validators.feedback_validator import FeedbackValidator, FeedbackUpdateValidator
from src.main.server import server
from src.main.models.models import Feedback

feedbacks_routes = APIRouter(tags=["Feedback"])

class FeedbackResponse(BaseModel):
    id: UUID
    usuario_id: UUID
    autor_id: UUID
    tipo: str | None = None
    texto: str | None = None
    model_config = ConfigDict(from_attributes=True)

@feedbacks_routes.post("/feedbacks", status_code=status.HTTP_201_CREATED, response_model=FeedbackResponse)
def create_feedback(body: FeedbackValidator, db: Session = Depends(server.get_db)):
    novo = Feedback(**body.model_dump())
    db.add(novo)
    db.commit()
    db.refresh(novo)
    return novo

@feedbacks_routes.get("/feedbacks/", response_model=List[FeedbackResponse])
def read_feedbacks(usuario_id: Optional[UUID] = None, skip: int = 0, limit: int = 50, db: Session = Depends(server.get_db)):
    query = db.query(Feedback)
    if usuario_id:
        query = query.filter(Feedback.usuario_id == usuario_id)
    return query.offset(skip).limit(limit).all()

@feedbacks_routes.get("/feedbacks/{feedback_id}", response_model=FeedbackResponse)
def read_feedback(feedback_id: str, db: Session = Depends(server.get_db)):
    item = db.query(Feedback).filter(Feedback.id == feedback_id).first()
    if item is None:
        raise HTTPException(status_code=404, detail="Feedback não encontrado.")
    return item

@feedbacks_routes.put("/feedbacks/{feedback_id}", response_model=FeedbackResponse)
def update_feedback(feedback_id: str, body: FeedbackUpdateValidator, db: Session = Depends(server.get_db)):
    item = db.query(Feedback).filter(Feedback.id == feedback_id).first()
    if item is None:
        raise HTTPException(status_code=404, detail="Feedback não encontrado.")
    for campo, valor in body.model_dump(exclude_unset=True).items():
        setattr(item, campo, valor)
    db.commit()
    db.refresh(item)
    return item

@feedbacks_routes.delete("/feedbacks/{feedback_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_feedback(feedback_id: str, db: Session = Depends(server.get_db)):
    item = db.query(Feedback).filter(Feedback.id == feedback_id).first()
    if item is None:
        raise HTTPException(status_code=404, detail="Feedback não encontrado.")
    db.delete(item)
    db.commit()
    return None
