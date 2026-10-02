import os
import json

import firebase_admin
from firebase_admin import auth as fb_auth, credentials
from fastapi import APIRouter, Header, HTTPException

from src.main.server.supabase_admin import supabase_admin

# Inicializa o Firebase uma única vez (evita erro quando o servidor recarrega)
if not firebase_admin._apps:
    firebase_admin.initialize_app(
        credentials.Certificate(json.loads(os.environ["FIREBASE_SERVICE_ACCOUNT"]))
    )

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/firebase-token")
def firebase_token(authorization: str = Header(...)):
    """Recebe o token do Supabase e devolve um custom token do Firebase."""
    jwt = authorization.removeprefix("Bearer ").strip()

    # 1) Confere com o Supabase se a sessão é válida
    try:
        resposta = supabase_admin.auth.get_user(jwt)
    except Exception:
        raise HTTPException(status_code=401, detail="Sessão do Supabase inválida")
    if not resposta or not resposta.user:
        raise HTTPException(status_code=401, detail="Sessão do Supabase inválida")
    uid = resposta.user.id

    # 2) Busca o perfil na tabela usuarios
    linhas = supabase_admin.table("usuarios").select("tipo_perfil").eq("id", uid).execute().data
    perfil = linhas[0]["tipo_perfil"] if linhas else "colaborador"

    token = fb_auth.create_custom_token(uid, {"perfil": perfil})
    return {"token": token.decode()}
