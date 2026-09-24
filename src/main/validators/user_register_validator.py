from pydantic import BaseModel, Field, EmailStr, ConfigDict
from uuid import UUID
from typing import Optional,Literal

class UserRegisterValidator(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    nome: str = Field(..., min_length=2)
    email: EmailStr
    
class UserUpdateValidator(BaseModel):
    username: Optional[str] = None
    nome: Optional[str] = None
    email: Optional[EmailStr] = None
    cargo: Optional[str] = None
    id: Optional[UUID] = None
    tipo_perfil: Optional[Literal["colaborador", "gestor", "rh"]] = None
    cargo_id: Optional[str] = None
    setor_id: Optional[str] = None
    gestor_id: Optional[str] = None
    data_admissao: Optional[str] = None
    criado_em: Optional[str] = None
    
class UserResponse(BaseModel):
    id: UUID                   
    nome: str
    email: str
    
    model_config = ConfigDict(from_attributes=True)