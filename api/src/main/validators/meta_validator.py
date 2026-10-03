from pydantic import BaseModel
from typing import Optional, Literal
from uuid import UUID
from datetime import date

class MetaValidator(BaseModel):
    usuario_id: UUID
    titulo: str
    descricao: Optional[str] = None
    prazo: Optional[date] = None
    status: Optional[Literal["em_andamento", "concluida", "atrasada"]] = "em_andamento"

class MetaUpdateValidator(BaseModel):
    titulo: Optional[str] = None
    descricao: Optional[str] = None
    prazo: Optional[date] = None
    status: Optional[Literal["em_andamento", "concluida", "atrasada"]] = None
