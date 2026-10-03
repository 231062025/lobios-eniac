from pydantic import BaseModel
from typing import Optional
from uuid import UUID

class CriterioValidator(BaseModel):
    cargo_id: Optional[UUID] = None
    metodo: str
    peso: Optional[float] = 1
    descricao: Optional[str] = None

class CriterioUpdateValidator(BaseModel):
    cargo_id: Optional[UUID] = None
    metodo: Optional[str] = None
    peso: Optional[float] = None
    descricao: Optional[str] = None
