import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CrudApi } from './crud-api';
import {
  Avaliacao, AvaliacaoAtualizar, AvaliacaoCriar, Cargo, CargoAtualizar, CargoCriar,
  Criterio, CriterioAtualizar, CriterioCriar, Feedback, FeedbackAtualizar, FeedbackCriar,
  Ferias, FeriasAtualizar, FeriasCriar, Meta, MetaAtualizar, MetaCriar,
  PlanoCarreira, PlanoCarreiraAtualizar, PlanoCarreiraCriar, Setor, SetorAtualizar, SetorCriar,
  Usuario, UsuarioAtualizar, UsuarioCriar, Uuid,
} from './api.models';

/** Um service por tag do Swagger. Uso: inject(SetoresApi).listar() */

@Injectable({ providedIn: 'root' })
export class UsuariosApi extends CrudApi<Usuario, UsuarioCriar, UsuarioAtualizar> {
  protected readonly recurso = 'users';
}

@Injectable({ providedIn: 'root' })
export class SetoresApi extends CrudApi<Setor, SetorCriar, SetorAtualizar> {
  protected readonly recurso = 'setores';
}

@Injectable({ providedIn: 'root' })
export class CargosApi extends CrudApi<Cargo, CargoCriar, CargoAtualizar> {
  protected readonly recurso = 'cargos';
}

@Injectable({ providedIn: 'root' })
export class MetasApi extends CrudApi<Meta, MetaCriar, MetaAtualizar> {
  protected readonly recurso = 'metas';
}

@Injectable({ providedIn: 'root' })
export class FeriasApi extends CrudApi<Ferias, FeriasCriar, FeriasAtualizar> {
  protected readonly recurso = 'ferias';

  /** PUT /ferias/{id}/aprovar?status_novo=...&aprovador_id=...  (sem body) */
  decidir(id: Uuid, status: 'aprovado' | 'negado', aprovadorId: Uuid): Observable<Ferias> {
    return this.http.put<Ferias>(`${this.base}/ferias/${id}/aprovar`, null, {
      params: this.params({ status_novo: status, aprovador_id: aprovadorId }),
    });
  }
}

@Injectable({ providedIn: 'root' })
export class AvaliacoesApi extends CrudApi<Avaliacao, AvaliacaoCriar, AvaliacaoAtualizar> {
  protected readonly recurso = 'avaliacoes';
}

@Injectable({ providedIn: 'root' })
export class FeedbacksApi extends CrudApi<Feedback, FeedbackCriar, FeedbackAtualizar> {
  protected readonly recurso = 'feedbacks';
}

@Injectable({ providedIn: 'root' })
export class PlanosCarreiraApi extends CrudApi<PlanoCarreira, PlanoCarreiraCriar, PlanoCarreiraAtualizar> {
  protected readonly recurso = 'plano-carreira';
}

@Injectable({ providedIn: 'root' })
export class CriteriosApi extends CrudApi<Criterio, CriterioCriar, CriterioAtualizar> {
  protected readonly recurso = 'criterios-avaliacao';
}
