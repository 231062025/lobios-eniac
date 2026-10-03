import { Perfil, Uuid } from './api/api.models';

export type { Perfil } from './api/api.models';

export interface UsuarioLogado {
  id: Uuid;          // o mesmo UUID do Supabase Auth / tabela usuarios
  nome: string;
  email: string;
  perfil: Perfil;
  demo?: boolean;    // true = entrou pelo modo demonstração (sem senha)
  /** true enquanto a pessoa ainda usa a senha provisória criada pelo RH. */
  precisaTrocarSenha?: boolean;
}

export interface ItemMenu {
  label: string;
  rota: string;      // relativa ao perfil, ex.: 'ferias' -> /funcionario/ferias
}
