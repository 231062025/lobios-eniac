from pydantic import BaseModel
from typing import Optional
from uuid import UUID

class CargoValidator(BaseModel):
    nome: str
    setor_id: Optional[UUID] = None
    nivel: Optional[str] = None

class CargoUpdateValidator(BaseModel):
    nome: Optional[str] = None
    setor_id: Optional[UUID] = None
    nivel: Optional[str] = None
