from pydantic import BaseModel, Field, EmailStr, ConfigDict
from uuid import UUID
from typing import Optional,Literal

class UserRegisterValidator(BaseModel):
    nome: str = Field(..., min_length=2)
    email: EmailStr
    
class UserUpdateValidator(BaseModel):
    nome: Optional[str] = None
    email: Optional[EmailStr] = None
    tipo_perfil: Optional[Literal["colaborador", "gestor", "rh"]] = None
    cargo_id: Optional[str] = None
    setor_id: Optional[str] = None
    gestor_id: Optional[str] = None
    data_admissao: Optional[str] = None
    
class UserResponse(BaseModel):
    id: UUID                   
    nome: str
    email: str
    
    model_config = ConfigDict(from_attributes=True)
