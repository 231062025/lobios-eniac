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
    username: str
    nome: str
    email: EmailStr
    cargo: str
    id: UUID
    tipo_perfil: str
    cargo_id: UUID
    setor_id: str
    gestor_id: str
    data_admissao:str
    criado_em: str
    
    model_config = ConfigDict(from_attributes=True)
    
class UserLoginValidator(BaseModel):
    email: EmailStr
    senha: str