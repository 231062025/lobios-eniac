import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Feedback, TipoFeedback } from '../../../core/api/api.models';
import { FeedbacksApi } from '../../../core/api/services';
import { AuthService } from '../../../core/auth.service';
import { CadastrosService } from '../../../core/cadastros.service';
import { NotificacaoService } from '../../../core/notificacao.service';
import { Carregando } from '../../../shared/carregando/carregando';
import { StatusBadge } from '../../../shared/status/status-badge';

@Component({
  selector: 'app-feedbacks-equipe',
  imports: [FormsModule, Carregando, StatusBadge],
  templateUrl: './feedbacks.html',
})
export class FeedbacksEquipe {
  private readonly api = inject(FeedbacksApi);
  private readonly auth = inject(AuthService);
  private readonly notificacao = inject(NotificacaoService);
  readonly cadastros = inject(CadastrosService);

  readonly lista = signal<Feedback[]>([]);
  readonly carregando = signal(true);
  readonly enviando = signal(false);
  readonly equipe = computed(() => this.cadastros.equipeDe(this.auth.usuario()!.id));
  /** Só os feedbacks que este gestor escreveu. */
  readonly meus = computed(() => this.lista().filter(f => f.autor_id === this.auth.usuario()!.id).reverse());

  usuarioId = '';
  tipo: TipoFeedback = 'elogio';
  texto = '';

  constructor() {
    this.api.listar({ limit: 1000 }).subscribe({
      next: l => { this.lista.set(l); this.carregando.set(false); },
      error: e => { this.carregando.set(false); this.notificacao.erro(e); },
    });
  }

  enviar(): void {
    if (!this.usuarioId) return this.notificacao.erro('Escolha para quem é o feedback.');
    if (this.texto.trim().length < 5) return this.notificacao.erro('Escreva o feedback (pelo menos algumas palavras).');

    this.enviando.set(true);
    this.api.criar({ usuario_id: this.usuarioId, autor_id: this.auth.usuario()!.id, tipo: this.tipo, texto: this.texto }).subscribe({
      next: novo => {
        this.lista.update(l => [...l, novo]);
        this.notificacao.sucesso(`Feedback enviado para ${this.cadastros.nomeUsuario(this.usuarioId)}.`);
        this.texto = '';
        this.enviando.set(false);
      },
      error: e => { this.enviando.set(false); this.notificacao.erro(e); },
    });
  }

  excluir(f: Feedback): void {
    if (!confirm('Excluir este feedback?')) return;
    this.api.excluir(f.id).subscribe({
      next: () => { this.lista.update(l => l.filter(x => x.id !== f.id)); this.notificacao.sucesso('Feedback excluído.'); },
      error: e => this.notificacao.erro(e),
    });
  }
}
