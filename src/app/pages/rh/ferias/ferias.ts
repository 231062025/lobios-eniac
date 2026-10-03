import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Ferias } from '../../../core/api/api.models';
import { FeriasApi } from '../../../core/api/services';
import { AuthService } from '../../../core/auth.service';
import { CadastrosService } from '../../../core/cadastros.service';
import { diasAte, diasEntre, hojeIso } from '../../../core/datas';
import { NotificacaoService } from '../../../core/notificacao.service';
import { Carregando } from '../../../shared/carregando/carregando';
import { DataBrPipe } from '../../../shared/pipes/data-br.pipe';
import { StatusBadge } from '../../../shared/status/status-badge';

/** Visão geral de férias da empresa + alertas calculados a partir dos dados reais. */
@Component({
  selector: 'app-ferias-empresa',
  imports: [FormsModule, Carregando, DataBrPipe, StatusBadge],
  templateUrl: './ferias.html',
})
export class FeriasEmpresa {
  private readonly api = inject(FeriasApi);
  private readonly auth = inject(AuthService);
  private readonly notificacao = inject(NotificacaoService);
  readonly cadastros = inject(CadastrosService);

  readonly lista = signal<Ferias[]>([]);
  readonly carregando = signal(true);
  readonly filtroStatus = signal('');
  readonly diasEntre = diasEntre;
  readonly diasAte = diasAte;

  readonly visiveis = computed(() => {
    const s = this.filtroStatus();
    return this.lista().filter(f => !s || f.status === s).sort((a, b) => b.data_inicio.localeCompare(a.data_inicio));
  });

  /** Pedidos ainda sem decisão cujo início está a 15 dias ou menos. */
  readonly urgentes = computed(() =>
    this.lista().filter(f => f.status === 'solicitado' && diasAte(f.data_inicio) <= 15),
  );
  /** Quem está de férias hoje. */
  readonly ausentesHoje = computed(() => {
    const h = hojeIso();
    return this.lista().filter(f => f.status === 'aprovado' && f.data_inicio <= h && f.data_fim >= h);
  });
  /** Pessoas sem nenhuma férias aprovada no ano corrente. */
  readonly semFeriasNoAno = computed(() => {
    const ano = hojeIso().slice(0, 4);
    const comFerias = new Set(this.lista().filter(f => f.status === 'aprovado' && f.data_inicio.startsWith(ano)).map(f => f.usuario_id));
    return this.cadastros.usuarios().filter(u => !comFerias.has(u.id));
  });

  readonly nomesSemFerias = computed(() => {
    const l = this.semFeriasNoAno();
    return l.slice(0, 5).map(u => u.nome).join(', ') + (l.length > 5 ? '…' : '');
  });

  constructor() {
    this.api.listar({ limit: 2000 }).subscribe({
      next: l => { this.lista.set(l); this.carregando.set(false); },
      error: e => { this.carregando.set(false); this.notificacao.erro(e); },
    });
  }

  decidir(f: Ferias, status: 'aprovado' | 'negado'): void {
    this.api.decidir(f.id, status, this.auth.usuario()!.id).subscribe({
      next: a => { this.lista.update(l => l.map(x => (x.id === f.id ? a : x))); this.notificacao.sucesso(status === 'aprovado' ? 'Férias aprovadas.' : 'Férias negadas.'); },
      error: e => this.notificacao.erro(e),
    });
  }
}
