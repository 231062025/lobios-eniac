from pydantic import BaseModel
from typing import Optional, Literal
from uuid import UUID
from datetime import date

class FeriasValidator(BaseModel):
    usuario_id: UUID
    data_inicio: date
    data_fim: date
    status: Optional[Literal["solicitado", "aprovado", "negado"]] = "solicitado"
    aprovador_id: Optional[UUID] = None

class FeriasUpdateValidator(BaseModel):
    data_inicio: Optional[date] = None
    data_fim: Optional[date] = None
    status: Optional[Literal["solicitado", "aprovado", "negado"]] = None
    aprovador_id: Optional[UUID] = None
