from pydantic import BaseModel
from typing import Optional
from uuid import UUID

class SetorValidator(BaseModel):
    nome: str
    responsavel_id: Optional[UUID] = None

class SetorUpdateValidator(BaseModel):
    nome: Optional[str] = None
    responsavel_id: Optional[UUID] = None
