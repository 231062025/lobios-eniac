import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Meta, StatusMeta } from '../../../core/api/api.models';
import { MetasApi } from '../../../core/api/services';
import { AuthService } from '../../../core/auth.service';
import { CadastrosService } from '../../../core/cadastros.service';
import { hojeIso } from '../../../core/datas';
import { NotificacaoService } from '../../../core/notificacao.service';
import { Carregando } from '../../../shared/carregando/carregando';
import { DataBrPipe } from '../../../shared/pipes/data-br.pipe';

@Component({
  selector: 'app-metas-equipe',
  imports: [FormsModule, Carregando, DataBrPipe],
  templateUrl: './metas.html',
})
export class MetasEquipe {
  private readonly api = inject(MetasApi);
  private readonly auth = inject(AuthService);
  private readonly notificacao = inject(NotificacaoService);
  readonly cadastros = inject(CadastrosService);

  readonly lista = signal<Meta[]>([]);
  readonly carregando = signal(true);
  readonly salvando = signal(false);
  readonly filtroPessoa = signal('');
  readonly hoje = hojeIso();
  readonly equipe = computed(() => this.cadastros.equipeDe(this.auth.usuario()!.id));

  readonly visiveis = computed(() => {
    const ids = new Set(this.equipe().map(u => u.id));
    const f = this.filtroPessoa();
    return this.lista()
      .filter(m => ids.has(m.usuario_id) && (!f || m.usuario_id === f))
      .sort((a, b) => (a.prazo ?? '9999').localeCompare(b.prazo ?? '9999'));
  });

  nova = { usuario_id: '', titulo: '', descricao: '', prazo: '' };

  constructor() {
    this.api.listar({ limit: 1000 }).subscribe({
      next: l => { this.lista.set(l); this.carregando.set(false); },
      error: e => { this.carregando.set(false); this.notificacao.erro(e); },
    });
  }

  /** Prazo vencido e ainda não concluída. */
  vencida(m: Meta): boolean { return !!m.prazo && m.prazo < this.hoje && m.status !== 'concluida'; }

  criar(): void {
    const n = this.nova;
    if (!n.usuario_id || !n.titulo.trim()) return this.notificacao.erro('Escolha a pessoa e escreva o título da meta.');
    this.salvando.set(true);
    this.api.criar({ ...n, prazo: n.prazo || null, status: 'em_andamento' }).subscribe({
      next: meta => {
        this.lista.update(l => [...l, meta]);
        this.notificacao.sucesso(`Meta criada para ${this.cadastros.nomeUsuario(meta.usuario_id)}.`);
        this.nova = { usuario_id: n.usuario_id, titulo: '', descricao: '', prazo: '' };
        this.salvando.set(false);
      },
      error: e => { this.salvando.set(false); this.notificacao.erro(e); },
    });
  }

  mudarStatus(m: Meta, status: StatusMeta): void {
    this.api.atualizar(m.id, { status }).subscribe({
      next: a => { this.lista.update(l => l.map(x => (x.id === m.id ? a : x))); this.notificacao.sucesso('Status atualizado.'); },
      error: e => this.notificacao.erro(e),
    });
  }

  excluir(m: Meta): void {
    if (!confirm(`Excluir a meta "${m.titulo}"?`)) return;
    this.api.excluir(m.id).subscribe({
      next: () => { this.lista.update(l => l.filter(x => x.id !== m.id)); this.notificacao.sucesso('Meta excluída.'); },
      error: e => this.notificacao.erro(e),
    });
  }
}
