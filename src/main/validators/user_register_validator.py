from pydantic import BaseModel, Field, EmailStr

class UserRegisterValidator(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    nome: str = Field(..., min_length=2)
    email: EmailStr  # O Pydantic valida automaticamente se é um e-mail válido!