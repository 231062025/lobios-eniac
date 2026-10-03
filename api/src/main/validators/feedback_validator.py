from pydantic import BaseModel
from typing import Optional, Literal
from uuid import UUID

class FeedbackValidator(BaseModel):
    usuario_id: UUID
    autor_id: UUID
    tipo: Optional[Literal["elogio", "melhoria"]] = None
    texto: Optional[str] = None

class FeedbackUpdateValidator(BaseModel):
    tipo: Optional[Literal["elogio", "melhoria"]] = None
    texto: Optional[str] = None
