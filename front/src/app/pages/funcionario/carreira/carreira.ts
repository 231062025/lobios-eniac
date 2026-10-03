import { Component, computed, inject, signal } from '@angular/core';
import { Criterio, PlanoCarreira } from '../../../core/api/api.models';
import { CriteriosApi, PlanosCarreiraApi } from '../../../core/api/services';
import { AuthService } from '../../../core/auth.service';
import { CadastrosService } from '../../../core/cadastros.service';
import { diasAte } from '../../../core/datas';
import { NotificacaoService } from '../../../core/notificacao.service';
import { Carregando } from '../../../shared/carregando/carregando';
import { DataBrPipe } from '../../../shared/pipes/data-br.pipe';

@Component({
  selector: 'app-minha-carreira',
  imports: [Carregando, DataBrPipe],
  templateUrl: './carreira.html',
})
export class MinhaCarreira {
  private readonly auth = inject(AuthService);
  private readonly notificacao = inject(NotificacaoService);
  private readonly criteriosApi = inject(CriteriosApi);
  readonly cadastros = inject(CadastrosService);

  readonly planos = signal<PlanoCarreira[]>([]);
  readonly criterios = signal<Criterio[]>([]);
  readonly carregando = signal(true);
  readonly plano = computed(() => this.planos()[0] ?? null);
  readonly diasAte = diasAte;

  /** Requisitos guardados como texto, um por linha. */
  readonly requisitos = computed(() =>
    (this.plano()?.requisitos ?? '').split('\n').map(r => r.trim()).filter(Boolean),
  );

  constructor() {
    inject(PlanosCarreiraApi).listar({ usuario_id: this.auth.usuario()!.id }).subscribe({
      next: planos => {
        this.planos.set(planos);
        const cargo = planos[0]?.cargo_objetivo_id;
        if (!cargo) return this.carregando.set(false);
        // Critérios do cargo objetivo = como a pessoa será avaliada lá
        this.criteriosApi.listar({ cargo_id: cargo }).subscribe({
          next: c => { this.criterios.set(c); this.carregando.set(false); },
          error: () => this.carregando.set(false),
        });
      },
      error: e => { this.carregando.set(false); this.notificacao.erro(e); },
    });
  }
}
