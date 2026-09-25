# ========================================================
# src/main/server/supabase_admin.py
# Cliente do Supabase com privilégio de admin, para operações
# que precisam do Auth (criar usuário, convidar por e-mail).
# NUNCA usar a service_role key fora do backend.
# ========================================================
import os
from supabase import create_client, Client

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

supabase_admin: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
