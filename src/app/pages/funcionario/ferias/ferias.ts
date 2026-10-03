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

const DIAS_POR_ANO = 30;

@Component({
  selector: 'app-minhas-ferias',
  imports: [FormsModule, Carregando, DataBrPipe, StatusBadge],
  templateUrl: './ferias.html',
})
export class MinhasFerias {
  private readonly api = inject(FeriasApi);
  private readonly auth = inject(AuthService);
  private readonly notificacao = inject(NotificacaoService);
  readonly cadastros = inject(CadastrosService);

  readonly lista = signal<Ferias[]>([]);
  readonly carregando = signal(true);
  readonly enviando = signal(false);
  readonly hoje = hojeIso();
  dataInicio = '';
  dataFim = '';

  readonly diasEntre = diasEntre;
  readonly diasAte = diasAte;

  /** Saldo estimado no ano: 30 dias menos o que já foi aprovado ou está aguardando. */
  readonly saldo = computed(() => {
    const ano = new Date().getFullYear().toString();
    const usados = this.lista()
      .filter(f => f.status !== 'negado' && f.data_inicio.startsWith(ano))
      .reduce((soma, f) => soma + diasEntre(f.data_inicio, f.data_fim), 0);
    return Math.max(0, DIAS_POR_ANO - usados);
  });

  /** Lembrete: férias aprovadas que começam nos próximos 30 dias. */
  readonly lembrete = computed(() =>
    this.lista().find(f => f.status === 'aprovado' && diasAte(f.data_inicio) >= 0 && diasAte(f.data_inicio) <= 30),
  );

  constructor() { this.carregar(); }

  carregar(): void {
    this.carregando.set(true);
    this.api.listar({ usuario_id: this.auth.usuario()!.id }).subscribe({
      next: l => {
        this.lista.set(l.sort((a, b) => b.data_inicio.localeCompare(a.data_inicio)));
        this.carregando.set(false);
      },
      error: e => { this.carregando.set(false); this.notificacao.erro(e); },
    });
  }

  solicitar(): void {
    if (!this.dataInicio || !this.dataFim) return this.notificacao.erro('Escolha a data de início e a de fim.');
    if (this.dataFim < this.dataInicio) return this.notificacao.erro('A data de fim precisa ser depois do início.');
    const dias = diasEntre(this.dataInicio, this.dataFim);
    if (dias < 5) return this.notificacao.erro('O período mínimo é de 5 dias.');
    if (dias > this.saldo()) return this.notificacao.erro(`Você tem ${this.saldo()} dias disponíveis.`);

    this.enviando.set(true);
    this.api.criar({
      usuario_id: this.auth.usuario()!.id,
      data_inicio: this.dataInicio,
      data_fim: this.dataFim,
      status: 'solicitado',
    }).subscribe({
      next: nova => {
        this.lista.update(l => [nova, ...l]);
        this.dataInicio = this.dataFim = '';
        this.enviando.set(false);
        this.notificacao.sucesso(`Pedido de ${dias} dias enviado para aprovação.`);
      },
      error: e => { this.enviando.set(false); this.notificacao.erro(e); },
    });
  }

  cancelar(f: Ferias): void {
    if (!confirm('Cancelar este pedido de férias?')) return;
    this.api.excluir(f.id).subscribe({
      next: () => {
        this.lista.update(l => l.filter(x => x.id !== f.id));
        this.notificacao.sucesso('Pedido cancelado.');
      },
      error: e => this.notificacao.erro(e),
    });
  }
}
