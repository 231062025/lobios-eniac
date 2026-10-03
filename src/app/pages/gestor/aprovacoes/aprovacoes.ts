import { Component, computed, inject, signal } from '@angular/core';
import { Ferias } from '../../../core/api/api.models';
import { FeriasApi } from '../../../core/api/services';
import { AuthService } from '../../../core/auth.service';
import { CadastrosService } from '../../../core/cadastros.service';
import { diasAte, diasEntre } from '../../../core/datas';
import { NotificacaoService } from '../../../core/notificacao.service';
import { Carregando } from '../../../shared/carregando/carregando';
import { DataBrPipe } from '../../../shared/pipes/data-br.pipe';
import { StatusBadge } from '../../../shared/status/status-badge';

/** Usa o endpoint específico PUT /ferias/{id}/aprovar?status_novo=...&aprovador_id=... */
@Component({
  selector: 'app-aprovacoes',
  imports: [Carregando, DataBrPipe, StatusBadge],
  templateUrl: './aprovacoes.html',
})
export class Aprovacoes {
  private readonly api = inject(FeriasApi);
  private readonly auth = inject(AuthService);
  private readonly notificacao = inject(NotificacaoService);
  readonly cadastros = inject(CadastrosService);

  readonly todas = signal<Ferias[]>([]);
  readonly carregando = signal(true);
  readonly decidindo = signal<string | null>(null);
  readonly diasEntre = diasEntre;
  readonly diasAte = diasAte;

  private readonly idsEquipe = computed(() => new Set(this.cadastros.equipeDe(this.auth.usuario()!.id).map(u => u.id)));
  private readonly daEquipe = computed(() => this.todas().filter(f => this.idsEquipe().has(f.usuario_id)));

  readonly pendentes = computed(() =>
    this.daEquipe().filter(f => f.status === 'solicitado').sort((a, b) => a.data_inicio.localeCompare(b.data_inicio)),
  );
  readonly decididas = computed(() =>
    this.daEquipe().filter(f => f.status !== 'solicitado').sort((a, b) => b.data_inicio.localeCompare(a.data_inicio)),
  );

  /** Outras férias aprovadas da equipe que se sobrepõem ao pedido (ajuda a decidir). */
  conflitos(f: Ferias): string[] {
    return this.daEquipe()
      .filter(o => o.id !== f.id && o.status === 'aprovado' && o.data_inicio <= f.data_fim && o.data_fim >= f.data_inicio)
      .map(o => this.cadastros.nomeUsuario(o.usuario_id));
  }

  constructor() { this.carregar(); }

  carregar(): void {
    this.carregando.set(true);
    this.api.listar({ limit: 1000 }).subscribe({
      next: l => { this.todas.set(l); this.carregando.set(false); },
      error: e => { this.carregando.set(false); this.notificacao.erro(e); },
    });
  }

  decidir(f: Ferias, status: 'aprovado' | 'negado'): void {
    this.decidindo.set(f.id);
    this.api.decidir(f.id, status, this.auth.usuario()!.id).subscribe({
      next: atualizada => {
        this.todas.update(l => l.map(x => (x.id === f.id ? atualizada : x)));
        this.decidindo.set(null);
        const nome = this.cadastros.nomeUsuario(f.usuario_id);
        this.notificacao.sucesso(status === 'aprovado' ? `Férias de ${nome} aprovadas.` : `Férias de ${nome} negadas.`);
      },
      error: e => { this.decidindo.set(null); this.notificacao.erro(e); },
    });
  }
}
