# ========================================================
# SUBSTITUIR em src/main/validators/user_register_validator.py
# ========================================================
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from uuid import UUID
from typing import Optional, Literal
from datetime import date

class UserRegisterValidator(BaseModel):
    nome: str = Field(..., min_length=2)
    email: EmailStr
    # Opcional: se vier preenchida, cria a conta já pronta (sem convite por e-mail).
    # Se ficar vazia, manda convite normal (fluxo real de cadastro pelo RH).
    senha: Optional[str] = Field(None, min_length=6)

class UserUpdateValidator(BaseModel):
    nome: Optional[str] = None
    email: Optional[EmailStr] = None
    tipo_perfil: Optional[Literal["colaborador", "gestor", "rh"]] = None
    cargo_id: Optional[UUID] = None
    setor_id: Optional[UUID] = None
    gestor_id: Optional[UUID] = None
    data_admissao: Optional[date] = None

class UserResponse(BaseModel):
    id: UUID
    nome: str
    email: str

    model_config = ConfigDict(from_attributes=True)
