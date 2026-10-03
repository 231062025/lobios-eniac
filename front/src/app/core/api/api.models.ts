/**
 * Tipos gerados a partir de https://lobios-api.onrender.com/openapi.json
 * Se o Jackson mudar algum schema, atualize aqui.
 */
export type Uuid = string;
/** Datas trafegam como texto 'AAAA-MM-DD' (é o que o <input type="date"> já produz). */
export type DataIso = string;

export type Perfil = 'colaborador' | 'gestor' | 'rh';
export type StatusFerias = 'solicitado' | 'aprovado' | 'negado';
export type StatusMeta = 'em_andamento' | 'concluida' | 'atrasada';
export type TipoFeedback = 'elogio' | 'melhoria';

// ---------- Usuário ----------
export interface Usuario {
  id: Uuid;
  nome: string;
  email: string;
  // Os campos abaixo AINDA NÃO vêm no GET da API (UserResponse só tem id, nome, email).
  // Ficam opcionais para o front já funcionar quando o Jackson incluir.
  tipo_perfil?: Perfil | null;
  cargo_id?: Uuid | null;
  setor_id?: Uuid | null;
  gestor_id?: Uuid | null;
  data_admissao?: DataIso | null;
}
export interface UsuarioCriar { nome: string; email: string; senha?: string | null; }
export interface UsuarioAtualizar {
  nome?: string | null;
  email?: string | null;
  tipo_perfil?: Perfil | null;
  cargo_id?: Uuid | null;
  setor_id?: Uuid | null;
  gestor_id?: Uuid | null;
  data_admissao?: DataIso | null;
}

// ---------- Setor ----------
export interface Setor { id: Uuid; nome: string; responsavel_id?: Uuid | null; }
export interface SetorCriar { nome: string; responsavel_id?: Uuid | null; }
export type SetorAtualizar = Partial<SetorCriar>;

// ---------- Cargo ----------
export interface Cargo { id: Uuid; nome: string; setor_id?: Uuid | null; nivel?: string | null; }
export interface CargoCriar { nome: string; setor_id?: Uuid | null; nivel?: string | null; }
export type CargoAtualizar = Partial<CargoCriar>;

// ---------- Meta ----------
export interface Meta {
  id: Uuid; usuario_id: Uuid; titulo: string;
  descricao?: string | null; prazo?: DataIso | null; status?: StatusMeta | string | null;
}
export interface MetaCriar {
  usuario_id: Uuid; titulo: string;
  descricao?: string | null; prazo?: DataIso | null; status?: StatusMeta | null;
}
export type MetaAtualizar = Partial<Omit<MetaCriar, 'usuario_id'>>;

// ---------- Férias ----------
export interface Ferias {
  id: Uuid; usuario_id: Uuid; data_inicio: DataIso; data_fim: DataIso;
  status?: StatusFerias | string | null; aprovador_id?: Uuid | null;
}
export interface FeriasCriar {
  usuario_id: Uuid; data_inicio: DataIso; data_fim: DataIso;
  status?: StatusFerias | null; aprovador_id?: Uuid | null;
}
export type FeriasAtualizar = Partial<Omit<FeriasCriar, 'usuario_id'>>;

// ---------- Avaliação ----------
export interface Avaliacao {
  id: Uuid; usuario_id: Uuid; avaliador_id: Uuid;
  metodo?: string | null; periodo?: string | null; pontuacao?: number | null; comentarios?: string | null;
}
export interface AvaliacaoCriar {
  usuario_id: Uuid; avaliador_id: Uuid;
  metodo?: string | null; periodo?: string | null; pontuacao?: number | null; comentarios?: string | null;
}
export type AvaliacaoAtualizar = Partial<Omit<AvaliacaoCriar, 'usuario_id' | 'avaliador_id'>>;

// ---------- Feedback ----------
export interface Feedback { id: Uuid; usuario_id: Uuid; autor_id: Uuid; tipo?: TipoFeedback | string | null; texto?: string | null; }
export interface FeedbackCriar { usuario_id: Uuid; autor_id: Uuid; tipo?: TipoFeedback | null; texto?: string | null; }
export type FeedbackAtualizar = Partial<Pick<FeedbackCriar, 'tipo' | 'texto'>>;

// ---------- Plano de carreira ----------
export interface PlanoCarreira {
  id: Uuid; usuario_id: Uuid; cargo_objetivo_id?: Uuid | null; previsao?: DataIso | null; requisitos?: string | null;
}
export interface PlanoCarreiraCriar {
  usuario_id: Uuid; cargo_objetivo_id?: Uuid | null; previsao?: DataIso | null; requisitos?: string | null;
}
export type PlanoCarreiraAtualizar = Partial<Omit<PlanoCarreiraCriar, 'usuario_id'>>;

// ---------- Critério de avaliação ----------
export interface Criterio { id: Uuid; cargo_id?: Uuid | null; metodo: string; peso?: number | null; descricao?: string | null; }
export interface CriterioCriar { cargo_id?: Uuid | null; metodo: string; peso?: number | null; descricao?: string | null; }
export type CriterioAtualizar = Partial<CriterioCriar>;

/** Métodos de avaliação pedidos pela Aline (varia conforme a atividade). */
export const METODOS_AVALIACAO = [
  { valor: 'horas', label: 'Horas trabalhadas' },
  { valor: 'chamados', label: 'Chamados resolvidos' },
  { valor: 'projetos', label: 'Projetos entregues' },
  { valor: 'competencias', label: 'Competências comportamentais' },
] as const;

export const LABEL_PERFIL: Record<Perfil, string> = {
  colaborador: 'Colaborador', gestor: 'Gestor', rh: 'RH',
};
