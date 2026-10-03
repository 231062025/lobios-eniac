import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Meta, StatusMeta } from '../../../core/api/api.models';
import { MetasApi } from '../../../core/api/services';
import { AuthService } from '../../../core/auth.service';
import { NotificacaoService } from '../../../core/notificacao.service';
import { Carregando } from '../../../shared/carregando/carregando';
import { DataBrPipe } from '../../../shared/pipes/data-br.pipe';
import { StatusBadge } from '../../../shared/status/status-badge';

/** O colaborador vê as metas que o gestor criou para ele e atualiza o andamento. */
@Component({
  selector: 'app-minhas-metas',
  imports: [FormsModule, Carregando, DataBrPipe, StatusBadge],
  templateUrl: './metas.html',
})
export class MinhasMetas {
  private readonly api = inject(MetasApi);
  private readonly auth = inject(AuthService);
  private readonly notificacao = inject(NotificacaoService);

  readonly metas = signal<Meta[]>([]);
  readonly carregando = signal(true);
  readonly salvandoId = signal<string | null>(null);

  constructor() { this.carregar(); }

  carregar(): void {
    this.carregando.set(true);
    this.api.listar({ usuario_id: this.auth.usuario()!.id }).subscribe({
      next: lista => { this.metas.set(lista); this.carregando.set(false); },
      error: e => { this.carregando.set(false); this.notificacao.erro(e); },
    });
  }

  mudarStatus(meta: Meta, status: StatusMeta): void {
    this.salvandoId.set(meta.id);
    this.api.atualizar(meta.id, { status }).subscribe({
      next: atualizada => {
        this.metas.update(l => l.map(m => (m.id === meta.id ? atualizada : m)));
        this.salvandoId.set(null);
        this.notificacao.sucesso('Status da meta atualizado.');
      },
      error: e => { this.salvandoId.set(null); this.notificacao.erro(e); },
    });
  }
}
