import { Component, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { Avaliacao, Feedback, METODOS_AVALIACAO } from '../../../core/api/api.models';
import { AvaliacoesApi, FeedbacksApi } from '../../../core/api/services';
import { AuthService } from '../../../core/auth.service';
import { CadastrosService } from '../../../core/cadastros.service';
import { NotificacaoService } from '../../../core/notificacao.service';
import { Carregando } from '../../../shared/carregando/carregando';
import { StatusBadge } from '../../../shared/status/status-badge';
import { BarraProgresso } from '../../../shared/barra-progresso/barra-progresso';

@Component({
  selector: 'app-meu-desempenho',
  imports: [Carregando, StatusBadge, BarraProgresso],
  templateUrl: './desempenho.html',
})
export class MeuDesempenho {
  private readonly auth = inject(AuthService);
  private readonly notificacao = inject(NotificacaoService);
  readonly cadastros = inject(CadastrosService);

  readonly avaliacoes = signal<Avaliacao[]>([]);
  readonly feedbacks = signal<Feedback[]>([]);
  readonly carregando = signal(true);

  constructor() {
    const id = this.auth.usuario()!.id;
    forkJoin({
      avaliacoes: inject(AvaliacoesApi).listar({ usuario_id: id }),
      feedbacks: inject(FeedbacksApi).listar({ usuario_id: id }),
    }).subscribe({
      next: r => {
        this.avaliacoes.set(r.avaliacoes);
        this.feedbacks.set([...r.feedbacks].reverse());
        this.carregando.set(false);
      },
      error: e => { this.carregando.set(false); this.notificacao.erro(e); },
    });
  }

  metodo(valor?: string | null): string {
    return METODOS_AVALIACAO.find(m => m.valor === valor)?.label ?? valor ?? '—';
  }

  /** Pontuação de 0 a 10 -> 0 a 100% */
  percentual(nota?: number | null): number { return Math.max(0, Math.min(100, (nota ?? 0) * 10)); }
  cor(nota?: number | null): string { return (nota ?? 0) < 7 ? 'var(--warning-color)' : 'var(--accent-color)'; }
}
