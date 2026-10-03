import { HttpErrorResponse } from '@angular/common/http';

const CAMPOS: Record<string, string> = {
  nome: 'Nome', email: 'E-mail', senha: 'Senha', setor_id: 'Setor', cargo_id: 'Cargo',
  responsavel_id: 'Responsável', usuario_id: 'Colaborador', data_inicio: 'Data de início',
  data_fim: 'Data de fim', titulo: 'Título', prazo: 'Prazo', status: 'Status', pontuacao: 'Pontuação',
  metodo: 'Método', tipo: 'Tipo', tipo_perfil: 'Perfil', gestor_id: 'Gestor',
  cargo_objetivo_id: 'Cargo objetivo', previsao: 'Previsão', data_admissao: 'Data de admissão',
};

/**
 * Transforma a resposta de erro da API em uma frase legível.
 * Ex.: o 422 { detail: [{ loc: ['body','setor_id'], msg: 'Input should be a valid UUID' }] }
 *      vira "Setor: Input should be a valid UUID".
 */
export function mensagemDeErro(erro: unknown): string {
  if (!(erro instanceof HttpErrorResponse)) {
    return erro instanceof Error ? erro.message : 'Erro inesperado.';
  }
  if (erro.status === 0) {
    return 'Não foi possível falar com a API. Ela pode estar acordando (até 1 min no Render) ou o CORS não libera este endereço.';
  }
  const detalhe = erro.error?.detail;
  if (Array.isArray(detalhe)) {
    return detalhe
      .map((d: { loc?: (string | number)[]; msg?: string }) => {
        const campo = String(d.loc?.at(-1) ?? '');
        return `${CAMPOS[campo] ?? campo}: ${d.msg}`;
      })
      .join(' | ');
  }
  if (typeof detalhe === 'string') return detalhe;
  if (erro.status === 404) return 'Registro não encontrado.';
  if (erro.status >= 500) return `A API respondeu com erro interno (${erro.status}). Veja os logs no Render.`;
  return `Erro ${erro.status}: ${erro.statusText}`;
}
