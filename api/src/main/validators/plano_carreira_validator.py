from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import date

class PlanoCarreiraValidator(BaseModel):
    usuario_id: UUID
    cargo_objetivo_id: Optional[UUID] = None
    previsao: Optional[date] = None
    requisitos: Optional[str] = None

class PlanoCarreiraUpdateValidator(BaseModel):
    cargo_objetivo_id: Optional[UUID] = None
    previsao: Optional[date] = None
    requisitos: Optional[str] = None
