import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Feedback, Ferias, Meta, PlanoCarreira } from '../../../core/api/api.models';
import { FeedbacksApi, FeriasApi, MetasApi, PlanosCarreiraApi } from '../../../core/api/services';
import { AuthService } from '../../../core/auth.service';
import { CadastrosService } from '../../../core/cadastros.service';
import { hojeIso } from '../../../core/datas';
import { NotificacaoService } from '../../../core/notificacao.service';
import { Carregando } from '../../../shared/carregando/carregando';
import { DataBrPipe } from '../../../shared/pipes/data-br.pipe';
import { StatusBadge } from '../../../shared/status/status-badge';
import { BarraProgresso } from '../../../shared/barra-progresso/barra-progresso';

@Component({
  selector: 'app-painel-colaborador',
  imports: [RouterLink, Carregando, DataBrPipe, StatusBadge, BarraProgresso],
  templateUrl: './painel.html',
})
export class PainelColaborador {
  private readonly auth = inject(AuthService);
  private readonly notificacao = inject(NotificacaoService);
  readonly cadastros = inject(CadastrosService);
  private readonly metasApi = inject(MetasApi);
  private readonly feriasApi = inject(FeriasApi);
  private readonly feedbacksApi = inject(FeedbacksApi);
  private readonly planosApi = inject(PlanosCarreiraApi);

  readonly usuario = this.auth.usuario;
  readonly carregando = signal(true);
  readonly metas = signal<Meta[]>([]);
  readonly ferias = signal<Ferias[]>([]);
  readonly feedbacks = signal<Feedback[]>([]);
  readonly plano = signal<PlanoCarreira | null>(null);

  readonly metasAbertas = computed(() => this.metas().filter(m => m.status !== 'concluida'));
  readonly percentualMetas = computed(() => {
    const total = this.metas().length;
    return total ? Math.round((this.metas().filter(m => m.status === 'concluida').length / total) * 100) : 0;
  });
  readonly proximasFerias = computed(() =>
    this.ferias()
      .filter(f => f.status !== 'negado' && f.data_fim >= hojeIso())
      .sort((a, b) => a.data_inicio.localeCompare(b.data_inicio))[0],
  );
  readonly ultimoFeedback = computed(() => this.feedbacks().at(-1));

  constructor() {
    const id = this.usuario()!.id;
    forkJoin({
      metas: this.metasApi.listar({ usuario_id: id }),
      ferias: this.feriasApi.listar({ usuario_id: id }),
      feedbacks: this.feedbacksApi.listar({ usuario_id: id }),
      planos: this.planosApi.listar({ usuario_id: id }),
    }).subscribe({
      next: r => {
        this.metas.set(r.metas);
        this.ferias.set(r.ferias);
        this.feedbacks.set(r.feedbacks);
        this.plano.set(r.planos[0] ?? null);
        this.carregando.set(false);
      },
      error: e => { this.carregando.set(false); this.notificacao.erro(e); },
    });
  }
}
