import os
import json

import requests
import firebase_admin
from firebase_admin import auth as fb_auth, credentials
from fastapi import APIRouter, Header, HTTPException

# Inicializa o Firebase uma única vez (evita erro quando o servidor recarrega)
if not firebase_admin._apps:
    firebase_admin.initialize_app(
        credentials.Certificate(json.loads(os.environ["FIREBASE_SERVICE_ACCOUNT"]))
    )

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_ANON_KEY = os.environ["SUPABASE_ANON_KEY"]

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/firebase-token")
def firebase_token(authorization: str = Header(...)):
    """Recebe o token do Supabase e devolve um custom token do Firebase."""
    cabecalhos = {"Authorization": authorization, "apikey": SUPABASE_ANON_KEY}

    # 1) Confere com o próprio Supabase se a sessão é válida
    r = requests.get(f"{SUPABASE_URL}/auth/v1/user", headers=cabecalhos, timeout=10)
    if r.status_code != 200:
        raise HTTPException(status_code=401, detail="Sessão do Supabase inválida")
    uid = r.json()["id"]

    # 2) Busca o perfil na tabela usuarios (a RLS deixa cada um ler a própria linha)
    r = requests.get(
        f"{SUPABASE_URL}/rest/v1/usuarios",
        params={"id": f"eq.{uid}", "select": "tipo_perfil"},
        headers=cabecalhos,
        timeout=10,
    )
    linhas = r.json() if r.status_code == 200 else []
    perfil = linhas[0]["tipo_perfil"] if linhas else "colaborador"

    # 3) Gera o token do Firebase com o mesmo UID e o perfil
    token = fb_auth.create_custom_token(uid, {"perfil": perfil})
    return {"token": token.decode()}
