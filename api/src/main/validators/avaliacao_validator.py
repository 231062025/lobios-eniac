from pydantic import BaseModel
from typing import Optional
from uuid import UUID

class AvaliacaoValidator(BaseModel):
    usuario_id: UUID
    avaliador_id: UUID
    metodo: Optional[str] = None
    periodo: Optional[str] = None
    pontuacao: Optional[float] = None
    comentarios: Optional[str] = None

class AvaliacaoUpdateValidator(BaseModel):
    metodo: Optional[str] = None
    periodo: Optional[str] = None
    pontuacao: Optional[float] = None
    comentarios: Optional[str] = None
